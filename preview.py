#!/usr/bin/env python3
"""Serve the built site locally with enough queued connections for cold loads."""

import argparse
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewServer(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True


def main():
    parser = argparse.ArgumentParser(description="Preview the built microeconomics atlas")
    parser.add_argument("--port", type=int, default=8799)
    parser.add_argument("--directory", type=Path, default=Path(__file__).resolve().parent / "dist")
    args = parser.parse_args()
    directory = args.directory.resolve()
    if not (directory / "index.html").is_file():
        parser.error(f"No built index.html in {directory}; run node build.cjs first")
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(directory))
    with PreviewServer(("127.0.0.1", args.port), handler) as server:
        print(f"Preview: http://127.0.0.1:{args.port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
