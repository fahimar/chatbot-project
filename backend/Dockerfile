FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY ./app/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy entire app directory
COPY ./app .

# For debugging - let's see what files are in the container
RUN ls -la

# Run the application using the correct file
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]