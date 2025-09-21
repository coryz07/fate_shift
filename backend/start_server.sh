#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Start the FastAPI server
echo "Starting Astrological Calculation API server..."
echo "API will be available at: http://localhost:8000"
echo "API docs will be available at: http://localhost:8000/docs"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload