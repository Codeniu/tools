#!/bin/bash

echo "========================================"
echo "  MP4 to GIF Tool - HTTP Server"
echo "========================================"
echo ""
echo "Starting HTTP server on port 8000..."
echo ""

# Get the directory where this script is located
cd "$(dirname "$0")"

# Start the server
python3 -m http.server 8000
