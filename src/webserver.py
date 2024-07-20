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
import zstandard
import erlpack
from urllib.parse import urlparse, parse_qs
import ctypes

app = FastAPI()
app.add_middleware(
	CORSMiddleware,
	allow_origins=["https://discord.com", "http://discord.com"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.relay_connections = []
app.gateway = {"encoding": None, "compression": None, "cache": bytearray(), "decompressor": None}
app.injection_state = {"injected": False, "reason": None}
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

def get_scripts(context, before_bootloader, onRenderLoad):
	scripts = {}
	script_filenames = list(SCRIPT_PATH.glob("*.js"))
	for script_name in script_filenames:
		response = utils.get_script_config(script_name)
		if (not response["success"]):
			utils.log(response["error"], colorama.Fore.RED)
			continue
		if ((response["config"]["context"]["context"] == context or response["config"]["context"]["context"] == "common") and (response["config"]["context"]["before_bootloader"] == before_bootloader or context == "render") and (response["config"]["context"]["on_render_load"] == onRenderLoad or context == "render")):
			scripts[script_name.name] = response["config"]
			scripts[script_name.name]["code"] = get_script(script_name.name)
	return scripts

script_dependencies_cache = {"render": get_scripts("render", False, False), "main": get_scripts("main", False, False)}

@app.middleware("http")
async def intercept_request(request: Request, call_next):
	utils.log(f"{request.method} {request.url.path}", colorama.Fore.CYAN)
	if request.method != "OPTIONS" and request.headers.get("Authorization") != app.request_token:
		utils.log("Invalid request token", colorama.Fore.RED)
		return Response(status_code=401)
	
	response = await call_next(request)
	return response

@app.websocket("/relay/ws")
async def relay(websocket: WebSocket):
	await websocket.accept()
	app.relay_connections.append(websocket)

	while True:
		try:
			data = await websocket.receive_text()
		except WebSocketDisconnect:
			break
		json_data = json.loads(data)
		top_opcode = json_data["opcode"]
		match top_opcode:
			case 1:
				opcode = json_data["data"]["opcode"]
				match opcode:
					case 0:
						url = json_data["data"]["data"]["url"]
						parsed_url = urlparse(url)
						query = parse_qs(parsed_url.query)
						app.gateway["encoding"] = query["encoding"][0]
						app.gateway["compression"] = query["compress"][0]
						if (app.gateway["compression"] == "zlib-stream"):
							app.gateway["decompressor"] = zlib.decompressobj()
						elif (app.gateway["compression"] == "zstd-stream"):
							decompressor  = zstandard.ZstdDecompressor()
							app.gateway["decompressor"] = decompressor.decompressobj()
						continue
					
					case 1:
						payload = base64.b64decode(json_data["data"]["data"]["response"]["payloadData"])
						app.gateway["cache"].extend(payload)
						if (app.gateway["compression"] == "zlib-stream" and (payload.endswith(b"\x00\x00\xff\xff") and len(app.gateway["cache"]) > 4)) or (app.gateway["compression"] == "zstd-stream"):
							try:
								payload = app.gateway["decompressor"].decompress(app.gateway["cache"])
							except zlib.error as e:
								utils.log("Failed to decompress payload: " + str(e), colorama.Fore.RED)
								app.gateway["cache"].clear()
								continue

							app.gateway["cache"].clear()
							if (app.gateway["encoding"] == "etf"):
								payload = erlpack.unpack(payload)
							for listener in app.relay_connections:
								if (listener.client_state == WebSocketState.CONNECTED and listener != websocket):
									serialized_payload = {"opcode": top_opcode, "data": {"opcode": opcode, "payload": utils.serializable_term_json(payload)}}
									await listener.send_text(json.dumps(serialized_payload))
								else:
									app.relay_connections.remove(listener)
						continue
					
					case 2:
						payload = base64.b64decode(json_data["data"]["data"]["response"]["payloadData"])
						if (app.gateway["encoding"] == "etf"):
							payload = erlpack.unpack(payload)
						for listener in app.relay_connections:
							if (listener.client_state == WebSocketState.CONNECTED and listener != websocket):
								serialized_payload = {"opcode": top_opcode, "data": {"opcode": opcode, "payload": utils.serializable_term_json(payload)}}
								await listener.send_text(json.dumps(serialized_payload))
							else:
								app.relay_connections.remove(listener)
						continue

				for relay in app.relay_connections:
					if (relay.client_state == WebSocketState.CONNECTED and relay != websocket):
						await relay.send_text(data)
					else:
						app.relay_connections.remove(relay)

@app.get("/scripts/{context}", status_code=200)
async def return_scripts(context: str, before_bootloader: bool = False, on_render_load: bool = False):
	scripts = get_scripts(context, before_bootloader, on_render_load)
	sorted_scripts = order_scripts(scripts, context)
	return JSONResponse(content=sorted_scripts, status_code=200)

@app.get("/injection/state", status_code=200)
async def get_injection_state():
	if (not app.injection_state["injected"]):
		return JSONResponse(content=app.injection_state, status_code=500)
	else:
		return JSONResponse(content=app.injection_state, status_code=200)
	
@app.post("/injection/success", status_code=200)
async def post_injection_success():
	utils.log("Injection success received", colorama.Fore.CYAN)
	app.injection_state["injected"] = True
	return Response(status_code=200)

@app.post("/injection/failure", status_code=200)
async def post_injection_failure(request: Request):
	reason = (await request.json())["reason"]
	utils.log("Bootloader failed to inject: " + reason, colorama.Fore.CYAN)
	app.injection_state["reason"] = reason
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