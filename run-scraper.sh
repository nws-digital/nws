#!/bin/bash

# Run the RSS scraper
# This script activates the virtual environment and runs the scraper

set -e  # Exit on error

cd "$(dirname "$0")/scraper"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Run setup-scraper.sh first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Copy .env.example to .env and fill in your credentials."
    exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Run the scraper
python3 main.py

# Deactivate virtual environment
deactivate
