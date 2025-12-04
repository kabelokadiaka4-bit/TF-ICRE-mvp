# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install pip and setuptools (if not already present in slim image)
RUN pip install --no-cache-dir pip setuptools

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY ingest_transform.py .

# Entrypoint for the Flex Template
ENTRYPOINT ["/usr/local/bin/python", "-m", "ingest_transform"]