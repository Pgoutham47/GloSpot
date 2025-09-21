#!/usr/bin/env python3
"""
Simple HTTP server for testing PWA functionality
Run with: python3 server.py
Then visit: http://localhost:8000
"""

import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse

class PWAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add PWA headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def guess_type(self, path):
        mimetype = super().guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.json'):
            return 'application/json'
        return mimetype

def main():
    PORT = 8080
    
    # Change to the directory containing the files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), PWAHandler) as httpd:
        print(f"🚀 GloSpot PWA Server running at http://localhost:{PORT}")
        print("📱 Open this URL on your mobile device to test PWA installation")
        print("🔧 Press Ctrl+C to stop the server")
        
        # Try to open in browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
            
        httpd.serve_forever()

if __name__ == "__main__":
    main()
