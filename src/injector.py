import colorama
from utils import utils
import subprocess
import os
import time
import threading
from communicator import Communicator

class Injector():
	def __init__(self, process_path, render_port, main_port, request_token):
		self.process_path = process_path
		self.render_port = render_port
		self.main_port = main_port
		self.communicator = Communicator(render_port, main_port, request_token)
		self.discord_process = None
		self.hook_thread = None
		self.main_socket_url = None

	def _hook_debug_log(self):
		while (True):
			time.sleep(0.1)
			line = self.discord_process.stdout.readline().decode("utf-8").strip()
			if ("Debugger listening on" in line):
				self.main_socket_url = line.split("Debugger listening on")[1].strip()

			elif ("Waiting for the debugger to disconnect..." in line) or ("webContents.destroyed web2" in line):
				utils.log("Discord process closed", colorama.Fore.YELLOW)
				self.cleanup_discord()
				break
		os._exit(0)

	def cleanup_discord(self):
		try:
			subprocess.call('taskkill /F /IM discord.exe', creationflags=subprocess.CREATE_NO_WINDOW)
		except Exception as e:
			utils.log_debug(e)
			utils.log(f"Failed to kill discord processes", colorama.Fore.RED)

		utils.log(f"Cleaned active discord processes", colorama.Fore.GREEN)

	def open_debug(self):
		utils.log("Cleaning active discord processes", colorama.Fore.YELLOW)
		self.cleanup_discord()
		utils.log("Starting discord in debug mode.", colorama.Fore.YELLOW)
		try:
			self.discord_process = subprocess.Popen([self.process_path, f"--remote-debugging-port={str(self.render_port)}", f"--inspect={str(self.main_port)}"], shell=True, creationflags=subprocess.CREATE_NO_WINDOW|subprocess.DETACHED_PROCESS, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
		except:
			return False
		self.hook_thread = threading.Thread(target=self._hook_debug_log)
		self.hook_thread.start()
		return True
		
	def inject(self):
		utils.log("Injecting into discord", colorama.Fore.YELLOW)
		utils.log("Waiting for main socket url", colorama.Fore.YELLOW)
		start_time = time.time()
		while (not self.main_socket_url):
			time_elapsed = time.time() - start_time
			if (time_elapsed > 10):
				utils.log("Failed to get main socket url within 10s", colorama.Fore.RED)
				return False
		utils.log("Main socket url received", colorama.Fore.GREEN)
		before_bootloader_path = os.path.join(os.path.dirname(__file__), "before.bootloader.js")
		success = self.communicator.connect(main_socket_url=self.main_socket_url, before_bootloader_path=before_bootloader_path)
		if (not success):
			utils.log("Failed to connect to debug websockets", colorama.Fore.RED)
			return False
		utils.log("Connected to debug websockets", colorama.Fore.GREEN)
		utils.log("Sending bootloader injection", colorama.Fore.YELLOW)
		render_bootloader_path = os.path.join(os.path.dirname(__file__), "render.bootloader.js")
		main_bootloader_path = os.path.join(os.path.dirname(__file__), "main.bootloader.js")
		success = self.communicator.inject_bootloader(render_bootloader_path, main_bootloader_path)
		if (not success):
			utils.log("Failed to inject bootloader", colorama.Fore.RED)
			return False
		utils.log("Successfully injected bootloader", colorama.Fore.GREEN)
		return True
		

