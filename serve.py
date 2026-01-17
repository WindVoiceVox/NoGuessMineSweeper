import http.server
import mimetypes
import sys
from typing import Dict


class JSStaticHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map: Dict[str, str] = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".wasm": "application/wasm",
    }

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def run(port: int) -> None:
    mimetypes.add_type("text/javascript", ".js")
    mimetypes.add_type("text/javascript", ".mjs")
    mimetypes.add_type("application/wasm", ".wasm")

    server = http.server.ThreadingHTTPServer(("", port), JSStaticHandler)
    print(f"Serving HTTP on port {port} (http://localhost:{port}/) ...")
    server.serve_forever()


if __name__ == "__main__":
    try:
        port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    except ValueError:
        port = 5173
    run(port)
