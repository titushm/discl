from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict, deque
from utils import utils
import colorama
import uvicorn
import threading
from pathlib import Path
import os

app = FastAPI()
injection_state = {"injected": False, "reason": None}
app.add_middleware(
	CORSMiddleware,
	allow_origins=["https://discord.com", "http://discord.com"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

config = utils.get_config()
SCRIPT_PATH = Path(os.path.join(os.path.dirname(__file__), "..\\scripts"))

def get_script(script_name):
	with open(os.path.join(SCRIPT_PATH, script_name), "r") as f:
		return f.read()

def get_dependencies(script_config):
	return script_config.get("dependencies", [])

def topological_sort(scripts):
	in_degree = defaultdict(int)
	graph = defaultdict(list)

	for script_name, script_config in scripts.items():
		in_degree[script_name] = 0
		for dependency in get_dependencies(script_config):
			graph[dependency].append(script_name)
			in_degree[script_name] += 1

	queue = deque(script_name for script_name, indeg in in_degree.items() if indeg == 0)
	result = []

	while queue:
		current_script = queue.popleft()
		result.append(current_script)

		for neighbor in graph[current_script]:
			in_degree[neighbor] -= 1
			if in_degree[neighbor] == 0:
				queue.append(neighbor)

	if len(result) != len(scripts):
		utils.log("Circular import detected for " + script_name, colorama.Fore.RED)

	return result

@app.middleware("http")
async def intercept_request(request: Request, call_next):
	utils.log(f"{request.method} {request.url.path}", colorama.Fore.CYAN)
	if request.method != "OPTIONS" and request.headers.get("Authorization") != app.request_token:
		utils.log("Invalid request token", colorama.Fore.RED)
		return Response(status_code=401)
	
	response = await call_next(request)
	return response

@app.get("/scripts/{context}", status_code=200)
async def get_scripts(context: str):
	scripts = {}
	script_filenames = list(SCRIPT_PATH.glob("*.js"))
	for script_name in script_filenames:
		response = utils.get_script_config(script_name)
		if (not response["success"]):
			utils.log(response["error"], colorama.Fore.RED)
			continue
		if (response["config"]["context"] == context or response["config"]["context"] == "common"):
			scripts[script_name.name] = response["config"]
			scripts[script_name.name]["code"] = get_script(script_name.name)

	sorted_script_names = topological_sort(scripts)
	sorted_scripts = {script_name: scripts[script_name] for script_name in sorted_script_names}
	return JSONResponse(content=sorted_scripts, status_code=200)

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

