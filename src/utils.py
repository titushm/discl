import colorama
import datetime
import ctypes
import os
import json
import re
import random
import ast
import time
import erlpack

colorama.init()
ntdll = ctypes.WinDLL("ntdll")
SCRIPT_CONFIG_PROPERTIES = ["name", "author", "version", "description", {"context": ["before_bootloader", "preload"]}, "dependencies"]
PATTERN = r"@(\w+):\s*([^\\\/\r\n]+)"

class Process():
	def __init__(self, pid):
		self.pid = pid
		self._handle = None
	
	@property
	def handle(self):
		if not self._handle:
			self._handle = ctypes.windll.kernel32.OpenProcess(0x0400 | 0x0010, False, self.pid)
		return self._handle

	def get_process_name(self):
		buffer = ctypes.create_string_buffer(256)
		ctypes.windll.psapi.GetModuleBaseNameA(self.handle, None, ctypes.byref(buffer), ctypes.sizeof(buffer))
		try:
			return buffer.value.decode("utf-8")
		except:
			return ""


	def close_handle(self):
		ctypes.windll.kernel32.CloseHandle(self.handle)
		self._handle = None

class Utils():
	def __init__(self):
		self.debug_state = False

	def serialize_term_value(self, obj):
		if isinstance(obj, erlpack.Atom):
			return str(obj)
		elif isinstance(obj, bytes):
			return obj.decode("utf-8")
		return obj

	def serializable_term_json(self, obj):
		if isinstance(obj, dict):
			return {self.serialize_term_value(k): self.serializable_term_json(v) for k, v in obj.items()}
		elif isinstance(obj, list):
			return [self.serializable_term_json(item) for item in obj]
		else:
			return self.serialize_term_value(obj)

	def log(self, msg, colour=colorama.Fore.WHITE):
		timestamp = datetime.datetime.now().strftime("%H:%M:%S")
		print(colorama.Fore.LIGHTBLACK_EX + f"[{timestamp}] " + colour + msg + colorama.Fore.RESET)

	def log_debug(self, msg):
		if (self.debug_state):
			self.log(str(msg))

	def get_config(self):
		with open(os.path.join(os.path.dirname(__file__), "config.json"), "r") as f:
			try:
				return json.load(f)#
			except Exception as e:
				self.log("Failed to parse config file\n" + str(e), colorama.Fore.RED)

				time.sleep(3)
				os._exit(0)

	def generate_request_token(self):
		return "".join(random.choice("0123456789ABCDEF") for i in range(16))

	def debug(self):
		self.debug_state = True

	def version(self, v):
		return tuple(map(int, (v.split("."))))

	def get_processes(self, filter_name=None):
		process_list = (ctypes.wintypes.DWORD * 1024)()
		process_count = ctypes.wintypes.DWORD()
		success = ctypes.windll.psapi.EnumProcesses(process_list, ctypes.sizeof(process_list), ctypes.byref(process_count))
		if not success:
			raise ctypes.WinError()
		process_count = process_count.value // ctypes.sizeof(ctypes.wintypes.DWORD)
		process_list = process_list[:process_count]
		process_list = map(lambda pid: Process(pid), process_list)
		if (filter_name):
			process_list = filter(lambda proc: proc.get_process_name() == filter_name, process_list)
		return list(process_list)
	
	def get_script_config(self, script_path):
		with open(script_path, "r") as f:
			script_string = f.read()
			try:
				script_config = script_string.split("// ==Discl-Script==")[1].split("// ==/Discl-Script==")[0]
			except:
				return {"success": False, "error": f"Failed to parse script config for {script_path}"}
			json_config = {}
			lines = script_config.split("\n")
			for line in lines:
				if (line.startswith("//")):
					try:
						property_name, property_value = re.findall(PATTERN, line)[0]
						json_config[property_name] = ast.literal_eval(property_value)
					except:
						return {"success": False, "error": f"Failed to parse script config for {script_path}"}
			script_properties = json_config.keys()
			for property in SCRIPT_CONFIG_PROPERTIES:
				if (isinstance(property, dict)):
					for key in property:
						if (key not in json_config):
							return {"success": False, "error": f"Missing property {key} in script config for {script_path}"}
						for sub_property in property[key]:
							if (sub_property not in json_config[key]):
								return {"success": False, "error": f"Missing property {sub_property} in script config for {script_path}"}
				else:
					if (property not in script_properties):
						return {"success": False, "error": f"Missing property {property} in script config for {script_path}"}
			return {"success": True, "config": json_config}

utils = Utils()