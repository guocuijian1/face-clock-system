#!/bin/bash
set -e

# Create Python 3.10 virtual environment in current directory
python3.10 -m venv ../.venv

# Activate the virtual environment
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies from requirements.txt
pip install -r ../requirements.txt

echo "Virtual environment created and dependencies installed."

