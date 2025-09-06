#!/bin/bash

# 1. Check if Python 3.10 is installed
if ! command -v python3.10 &> /dev/null; then
  echo "Python 3.10 is not installed. Please install it first."
  echo "You can install it using Homebrew: brew install python@3.10"
  exit 1
fi

# 2. Create virtual environment in backend folder if not exists
cd "$(dirname "$0")/backend"
if [ ! -d "venv" ]; then
  python3.10 -m venv venv
fi

# 3. Activate virtual environment
source venv/bin/activate

# 4. Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Start backend app on available port
DEFAULT_PORT=5000
MAX_TRIES=10
PORT=$DEFAULT_PORT
TRIES=0
while [ $TRIES -lt $MAX_TRIES ]; do
  if ! lsof -i :$PORT &> /dev/null; then
    echo "Starting backend on port $PORT..."
    # Start backend in background
    (FLASK_RUN_PORT=$PORT python app.py &)
    BACKEND_PORT=$PORT
    break
  else
    echo "Port $PORT is in use, trying next port..."
    PORT=$((PORT+1))
    TRIES=$((TRIES+1))
  fi
done
if [ $TRIES -eq $MAX_TRIES ]; then
  echo "Could not find a free port for backend after $MAX_TRIES attempts."
  deactivate
  exit 1
fi
cd ..

# 6. Check if Node.js 22 or later is installed
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//')
if [ -z "$NODE_VERSION" ]; then
  echo "Node.js is not installed. Please install Node.js 22 or later."
  exit 1
fi
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Node.js version 22 or later is required. Current version: $NODE_VERSION"
  exit 1
fi

# 7. Install frontend node packages
cd frontend
npm install

# 8. Run frontend app
npm start

# End of script

