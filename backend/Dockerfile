# Use Python 3.11 (Cloud Run compatible)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY astro_api.py .

# Create ephemeris directory and download files
RUN mkdir -p /app/ephemeris && \
    curl -L -o /app/ephemeris/sechiron.se1 https://github.com/aloistr/swisseph/raw/master/ephe/sechiron.se1 && \
    curl -L -o /app/ephemeris/seask10.se1 https://github.com/aloistr/swisseph/raw/master/ephe/seask10.se1 && \
    curl -L -o /app/ephemeris/seas_18.se1 https://github.com/aloistr/swisseph/raw/master/ephe/seas_18.se1

# Set environment variable for ephemeris path
ENV EPHE_PATH=/app/ephemeris

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Run the application
CMD uvicorn astro_api:app --host 0.0.0.0 --port ${PORT:-8080}
