# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt \
    && useradd -m -u 10001 appuser \
    && mkdir -p /app \
    && chown -R appuser:appuser /app

# Copy the rest of the application's code into the container at /app
COPY ./app /app
RUN chown -R appuser:appuser /app

# Run as non-root user
USER appuser

# Run uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
