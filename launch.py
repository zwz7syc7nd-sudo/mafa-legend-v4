from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse, functools, socket, webbrowser
p=argparse.ArgumentParser(description='R12 local game server; no installation or public deployment')
p.add_argument('--lan', action='store_true');p.add_argument('--port',type=int,default=8894);p.add_argument('--no-browser',action='store_true');a=p.parse_args()
root=Path(__file__).resolve().parent
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.js':'text/javascript','.glb':'model/gltf-binary','.webmanifest':'application/manifest+json'}
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        super().end_headers()
server=ThreadingHTTPServer(('0.0.0.0' if a.lan else '127.0.0.1',a.port),functools.partial(Handler,directory=str(root)))
url='http://127.0.0.1:'+str(a.port)+'/'
print('R12 local private test: '+url,flush=True)
if a.lan:
    print('Same-Wi-Fi phone URLs (choose your LAN adapter):',flush=True)
    for ip in sorted(set(socket.gethostbyname_ex(socket.gethostname())[2])):
        if not ip.startswith('127.'): print('http://'+ip+':'+str(a.port)+'/',flush=True)
print('Keep this window open. Ctrl+C stops the server. No firewall settings are changed.',flush=True)
if not a.no_browser: webbrowser.open(url)
try: server.serve_forever()
except KeyboardInterrupt: pass
finally: server.server_close()
