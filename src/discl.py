import os
from sys import platform
from utils import utils
from injector import Injector
from webserver import WebServer
from pathlib import Path
import colorama
import time
import signal


if platform != "win32":
	raise NotImplementedError("Discl is not yet supported on non-windows platforms. Please visit the GitHub page for more information.")

DISCORD_APPDATA_PATH = Path(os.getenv("LOCALAPPDATA") + "\\Discord")
if not DISCORD_APPDATA_PATH.exists():
	raise FileNotFoundError("Discord must be installed to use Discl.")

config = utils.get_config()
RENDER_PORT = config["ports"]["render"]
MAIN_PORT = config["ports"]["main"]
WEBSERVER_PORT = config["ports"]["webserver"]
BACKOFF_TIME = config["backoffTime"]
RETRIES = config["retries"]
REQUEST_TOKEN = utils.generate_request_token()
APP_DIRS = [f for f in DISCORD_APPDATA_PATH.glob("app-*") if f.is_dir()]
LATEST_APP_PATH = max(APP_DIRS, key=lambda f: utils.version(f.name[4:]))
python_processes = utils.get_processes("python.exe")[::-1]
discord_processes = utils.get_processes("Discord.exe")[::-1]
for proc in python_processes:
	if (os.getpid() != proc.pid and __file__.casefold() == proc.get_cmd_args()[-1].casefold()):
		if (discord_processes):
			utils.log("Discl is already running. Opening window...", colorama.Fore.GREEN)
			os.startfile(str(LATEST_APP_PATH) + "\\Discord.exe")
			os._exit(0)
		else:
			utils.log("Discl is running, however no discord processes are active. Closing discl ghost process", colorama.Fore.YELLOW)
			os.kill(proc.pid, signal.SIGTERM)
			proc.close_handle()

server = WebServer(WEBSERVER_PORT, REQUEST_TOKEN)
server.start()

for i in range(0, RETRIES):
	discord_injector = Injector(str(LATEST_APP_PATH) + "\\Discord.exe", RENDER_PORT, MAIN_PORT, REQUEST_TOKEN)
	success = discord_injector.open_debug()
	if (not success):
		utils.log("Failed to open discord in debug mode", colorama.Fore.RED)
	success = discord_injector.inject()
	if (success):
		utils.log("Discl successfully injected into Discord", colorama.Fore.GREEN)
		break
	discord_injector.cleanup_discord()
	if (i+1 == RETRIES):
		utils.log(f"Discl failed to inject into Discord after {RETRIES} attempts. Exiting...", colorama.Fore.RED)
		time.sleep(3)
		os._exit(0)

	utils.log("Discl failed to inject into Discord", colorama.Fore.RED)
	utils.log(f"Retrying in {BACKOFF_TIME}s", colorama.Fore.YELLOW)
	BACKOFF_TIME *= 2
