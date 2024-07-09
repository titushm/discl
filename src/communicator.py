from websockets.sync.client import connect
import time
import json
import requests
import colorama
from utils import utils

config = utils.get_config()

class Communicator():
	def __init__(self, render_port, main_port, initial_request_token):
		self.render_port = render_port
		self.main_port = main_port
		self.render_socket = None
		self.main_socket = None
		self.initial_request_token = initial_request_token
		self.render_socket_url = None

	def connect(self, main_socket_url=None, before_bootloader_path=None):
		try:
			if (not main_socket_url):
				main_socket_url = (requests.get(f"http://localhost:{self.main_port}/json/list")).json()[0]["webSocketDebuggerUrl"]
			self.main_socket = connect(main_socket_url)
			utils.log(f"Connected to main socket at {main_socket_url}", colorama.Fore.GREEN)
			if (before_bootloader_path):
				utils.log("Injecting before bootloader", colorama.Fore.YELLOW)
				success = self.inject_before_bootloader(before_bootloader_path)
				if (not success):
					utils.log("Failed to inject before bootloader", colorama.Fore.RED)
				else:
					utils.log("Injected before bootloader", colorama.Fore.GREEN)
			while True:
				try:
					self.render_socket_url = (requests.get(f"http://localhost:{self.render_port}/json/list?t={str(int(time.time()))}")).json()[0]["webSocketDebuggerUrl"]
					break
				except:
					pass

			self.render_socket = connect(self.render_socket_url)
			utils.log(f"Connected to render socket at {self.render_socket_url}", colorama.Fore.GREEN)
		except Exception as e:
			utils.log_debug(e)
			return False
		return True

	def _run_code(self, socket, code):
		data = json.dumps({
				"id": 1,
				"method": "Runtime.evaluate",
				"params": {
					"contextId": 1,
					"doNotPauseOnExceptionsAndMuteConsole": False,
					"expression": code,
					"generatePreview": False,
					"includeCommandLineAPI": True,
					"objectGroup": "console",
					"returnByValue": False,
					"userGesture": True
				}
			})
		try:
			socket.send(data)
			return socket.recv()
		except Exception as e:
			utils.log_debug(e)
			return False

	def inject_discl_object(self, socket, context):
		if (context == "render"):
			code = f"""
				const discl = {{}};
				discl.context = "{context}";
				discl.config = {json.dumps(config)};
				discl.executed = false;
				discl.request_token = "{self.initial_request_token}";
				discl.webserverFetch = function(endpoint, options = {{}}) {{
					options.headers = options.headers || {{}};
					options.headers["Authorization"] = discl.request_token;
					return fetch(`http://127.0.0.1:${{discl.config.ports.webserver}}${{endpoint}}`, options);
				}};
				discl.log = function(msg, moduleName) {{
					console.log(`%c[Discl] %c[${{moduleName}}] %c${{msg}}`, "color: #5865f2; font-weight: bold;", "color: #249637; font-weight: bold;", "color: #000000");
				}}
				discl.scripts = {{}};
				discl.require = (name) => {{
					if (discl.scripts.hasOwnProperty(name)) {{
						if (discl.scripts[name].export === null) {{
							console.log(discl.scripts[name].export)
							const error = new Error(name + " does not have an export. This may be due to the script not having the correct dependencies.");
							error.name = "EXPORT_NOT_FOUND";
							throw error;
						}}
						return discl.scripts[name].export;
					}}
					const error = new Error("Cannot find module " + name + ". This may be due to differences in the contexts of the two scripts.");
					error.name = "MODULE_NOT_FOUND";
					throw error;
				}};

				discl.resetExport = function() {{
					discl.export = function() {{
						error = new Error("The export function has been called before the bootloader has been loaded.");
						error.name = "BOOTLOADER_NOT_LOADED";
						throw error;
					}}
				}}
				discl.resetExport();

				discl.log("Discl object injected", "Injector");
			"""
		elif (context == "main"):
			code = f"""
				process.chdir(process.resourcesPath);
				const discl = {{}};
				discl.context = "{context}";
				discl.nodeRequire = require;
				discl.config = {json.dumps(config)};
				discl.request_token = "{self.initial_request_token}";
				discl.gateway = {{}};
				discl.webserverFetch = function(endpoint, method, options = {{}}) {{
					const {{ promisify }} = discl.nodeRequire("util");
					const request = promisify(discl.nodeRequire(process.cwd() + "/app.asar/node_modules/request"));
					options.headers = options.headers || {{}};
					options.headers["Authorization"] = discl.request_token;

					const requestOptions = {{
						method: method.toLowerCase(),
						uri: `http://127.0.0.1:${{discl.config.ports.webserver}}${{endpoint}}`,
						headers: options.headers,
						json: true,
						...options
					}};
					return new Promise((resolve, reject) => {{
						request(requestOptions, function (error, response, body) {{
						if (error) {{
							reject(error);
						}} else {{
							resolve({{response, body}});
						}}
						}});
					}});
				}};

				discl.log = function(msg, moduleName) {{
					console.log(`%c[Discl] %c[${{moduleName}}] %c${{msg}}`, "color: #5865f2; font-weight: bold;", "color: #249637; font-weight: bold;", "color: #000000");
				}}
				discl.scripts = {{}};
				discl.require = (name) => {{
					if (discl.scripts.hasOwnProperty(name)) {{
						if (discl.scripts[name].export == null) {{
							const error = new Error(name + " does not have an export. This may be due to the script not having the correct dependencies.");
							error.name = "EXPORT_NOT_FOUND";
							throw error;
						}}
						return discl.scripts[name].export;
					}}
					const error = new Error("Cannot find module " + name + ". This may be due to differences in the contexts of the two scripts.");
					error.name = "MODULE_NOT_FOUND";
					throw error;
				}};

				discl.resetExport = function() {{
					discl.export = function() {{
						error = new Error("The export function can only be called from a script.");
						error.name = "BOOTLOADER_NOT_LOADED";
						throw error;
					}}
				}}
				discl.resetExport();

				discl.log("Discl object injected", "Injector");
			"""
		response = self._run_code(socket, code)
		utils.log_debug("discl object response: " + response)

	def inject_before_bootloader(self, before_bootloader_path):
		before_bootloader = open(before_bootloader_path, "r").read()
		self.inject_discl_object(self.main_socket, "main")
		response = self._run_code(self.main_socket, before_bootloader)
		utils.log_debug("before main response: " + response)
		if (not response):
			return False
		if ("result" not in response):
			return False
		return True

	def inject_bootloader(self, render_bootloader_path, main_bootloader_path):
		self.inject_discl_object(self.main_socket, "main")
		render_bootloader = open(render_bootloader_path, "r").read()
		main_bootloader = open(main_bootloader_path, "r").read()
		main_response = self._run_code(self.main_socket, main_bootloader)
		for i in range(0, config["injectionFailureRetries"]):
			self.inject_discl_object(self.render_socket, "render")
			render_response = self._run_code(self.render_socket, render_bootloader)
			response = requests.get(f"http://localhost:{config['ports']['webserver']}/injection/state", headers={"Authorization": self.initial_request_token})
			state = response.json()
			utils.log("Injection state: " + str(state) + " " + str(response.status_code), colorama.Fore.YELLOW)
			if (state["reason"] == "early_injection"):
				utils.log(f"Discl bootloader injected too early, retrying in {config['injectionFailureTimeout']}", colorama.Fore.YELLOW)
				time.sleep(config['injectionFailureTimeout'])
				try:
					self.render_socket_url = (requests.get(f"http://localhost:{self.render_port}/json/list?t={str(int(time.time()))}")).json()[0]["webSocketDebuggerUrl"] # This takes about 2 seconds
					self.render_socket = connect(self.render_socket_url)
				except:
					utils.log("Failed to connect to render socket", colorama.Fore.RED)
				continue
			break

		if (not render_response or not main_response or response.status_code != 200):
			return False
		utils.log_debug("render response: " + render_response)
		utils.log_debug("main response: " + main_response)
		if ("result" not in render_response or "result" not in main_response):
			return False
		self.render_socket.close()
		return True

	def close(self):
		utils.log("Closing sockets", colorama.Fore.YELLOW)
		self.render_socket.close()
		self.main_socket.close()