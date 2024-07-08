from fastapi import FastAPI, Request, Response, WebSocket
from starlette.websockets import WebSocketState, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from utils import utils
import colorama
import uvicorn
import threading
from pathlib import Path
import os
import graphlib
import json
import base64
import zlib
import erlpack
from urllib.parse import urlparse
from urllib.parse import parse_qs

app = FastAPI()
injection_state = {"injected": False, "reason": None}
app.add_middleware(
	CORSMiddleware,
	allow_origins=["https://discord.com", "http://discord.com"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.gateway_connections = {"host": None, "listeners": []}
app.gateway_cache = bytearray()
app.decompressor = zlib.decompressobj()
app.gateway_encoding = None
config = utils.get_config()
SCRIPT_PATH = Path(os.path.join(os.path.dirname(__file__), "..\\scripts"))
SCRIPT_STORAGE_PATH = Path(os.path.join(os.path.dirname(__file__), "..\\storage"))

def get_script(script_name):
	with open(os.path.join(SCRIPT_PATH, script_name), "r") as f:
		return f.read()

def get_dependencies(script_config):
	return script_config.get("dependencies", [])

def order_scripts(scripts, context):
	scripts_dependencies = {script: get_dependencies(scripts[script]) for script in scripts}
	script_dependencies_cache[context] = scripts_dependencies
	ts = graphlib.TopologicalSorter(scripts_dependencies)
	sorted_script_names = list(ts.static_order())
	sorted_scripts = {}
	for script_name in sorted_script_names:
		if script_name in scripts:
			sorted_scripts[script_name] = scripts[script_name]
		else:
			found = False
			for key in script_dependencies_cache:
				if (script_name in script_dependencies_cache[key]):
					found = True
					
			if (not found):
				utils.log(f"Circular dependency detected for script {script_name}", colorama.Fore.RED)
				return
			utils.log(f"Script {script_name} not found in scripts for the current context. Ignoring", colorama.Fore.YELLOW)
	return sorted_scripts

def get_scripts(context, before_bootloader = False):
	scripts = {}
	script_filenames = list(SCRIPT_PATH.glob("*.js"))
	for script_name in script_filenames:
		response = utils.get_script_config(script_name)
		if (not response["success"]):
			utils.log(response["error"], colorama.Fore.RED)
			continue
		if ((response["config"]["context"]["context"] == context or response["config"]["context"]["context"] == "common") and (response["config"]["context"]["before_bootloader"] == before_bootloader or context == "render")):
			scripts[script_name.name] = response["config"]
			scripts[script_name.name]["code"] = get_script(script_name.name)
	return scripts

script_dependencies_cache = {"render": get_scripts("render"), "main": get_scripts("main")}

@app.middleware("http")
async def intercept_request(request: Request, call_next):
	utils.log(f"{request.method} {request.url.path}", colorama.Fore.CYAN)
	if request.method != "OPTIONS" and request.headers.get("Authorization") != app.request_token:
		utils.log("Invalid request token", colorama.Fore.RED)
		return Response(status_code=401)
	
	response = await call_next(request)
	return response

@app.websocket("/gateway/relay/{client_type}")
async def gateway_relay(websocket: WebSocket, client_type: str):
	await websocket.accept()
	if (client_type == "host"):
		app.gateway_connections["host"] = websocket
		utils.log("Host connected", colorama.Fore.CYAN)
	elif (client_type == "listener"):
		app.gateway_connections["listeners"].append(websocket)
		utils.log("Listener connected", colorama.Fore.CYAN)

	else:
		await websocket.close()
	
	while True:
		data = await websocket.receive_text()
		json_data = json.loads(data)
		opcode = json_data["op"]
		match opcode:
			case 0:
				url = json_data["data"]["url"]
				parsed_url = urlparse(url)
				query = parse_qs(parsed_url.query)
				app.gateway_encoding = query["encoding"][0]
				app.gateway_compression = query["compress"][0]

			case 1:
				payload = base64.b64decode(json_data["data"]["response"]["payloadData"])
				app.gateway_cache.extend(payload)
				if (payload.endswith(b"\x00\x00\xff\xff") and len(app.gateway_cache) > 4): #TODO: Test that this still works when no compression or json encoding.
					if (app.gateway_compression == "zlib-stream"):
						try:
							payload = app.decompressor.decompress(app.gateway_cache)
						except zlib.error as e:
							utils.log("Failed to decompress payload: " + str(e) , colorama.Fore.RED)
							app.gateway_cache.clear()
							continue
					app.gateway_cache.clear()
					if (app.gateway_encoding == "etf"):
						payload = erlpack.unpack(payload)

					for listener in app.gateway_connections["listeners"]:
						if (listener.client_state == WebSocketState.CONNECTED):
							serialized_payload = {"op": opcode,"payload": utils.serializable_term_json(payload)}
							await listener.send_json(serialized_payload)
						else:
							app.gateway_connections["listeners"].remove(listener)
			
			case 2:
				payload = base64.b64decode(json_data["data"]["response"]["payloadData"])
				if (app.gateway_encoding == "etf"):
						payload = erlpack.unpack(payload)

				for listener in app.gateway_connections["listeners"]:
					if (listener.client_state == WebSocketState.CONNECTED):
						serialized_payload = {"op": opcode,"payload": utils.serializable_term_json(payload)}
						await listener.send_json(serialized_payload)
					else:
						app.gateway_connections["listeners"].remove(listener)


@app.get("/scripts/{context}", status_code=200)
async def return_scripts(context: str, before_bootloader: bool = False):
	scripts = get_scripts(context, before_bootloader)
	sorted_scripts = order_scripts(scripts, context)
	return JSONResponse(content=sorted_scripts, status_code=200)

@app.get("/storage/{context}/{script}", status_code=200)
async def get_script_storage(context: str, script: str):
	if (not SCRIPT_STORAGE_PATH.joinpath(context + script).exists()):
		config = open(SCRIPT_STORAGE_PATH.joinpath(context + script), "w")
		config.write("{}")
		config.close()
		with open(SCRIPT_STORAGE_PATH.joinpath(context + script), "r") as f:
			return JSONResponse(content=f.read(), status_code=200)

@app.post("/storage/{context}/{script}", status_code=200)
async def set_script_storage(context: str, script: str, request: Request):
	content = await request.body()
	with open(SCRIPT_STORAGE_PATH.joinpath(context + script), "w") as f:
		f.write(content.decode())
	return Response(status_code=200)

@app.get("/injection/state", status_code=200)
async def get_injection_state():
	global injection_state
	old_state = injection_state.copy()
	injection_state["injected"] = False
	injection_state["reason"] = None
	if (old_state["injected"]):
		return JSONResponse(content=old_state, status_code=200)
	
	return JSONResponse(content=old_state, status_code=500)

@app.post("/injection/success", status_code=200)
async def post_injection_success():
	global injection_state
	utils.log("Injection success received", colorama.Fore.CYAN)
	injection_state["injected"] = True
	return Response(status_code=200)

@app.post("/injection/failure", status_code=200)
async def post_injection_failure(request: Request):
	global injection_state
	reason = (await request.json())["reason"]
	utils.log("Bootloader failed to inject: " + reason, colorama.Fore.CYAN)
	injection_state["reason"] = reason
	return Response(status_code=200)

class WebServer():
	def __init__(self, port, request_token):
		self.port = port
		self.webserver_thread = None
		app.request_token = request_token

	def start(self):
		self.webserver_thread = threading.Thread(target=uvicorn.run, args=(app,), kwargs={"host": "0.0.0.0", "port": self.port, "log_level": "error"})
		self.webserver_thread.daemon = True
		self.webserver_thread.start()
		utils.log(f"Started webserver on port {self.port}", colorama.Fore.CYAN)

