FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY ./app/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy entire app directory
COPY ./app .

# For debugging - let's see what files are in the container
RUN ls -la

# This is important - use the PORT env var from Railway
# EXPOSE ${PORT:-8000}
# # Run the application using the correct file
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# This is important - use the PORT env var from Railway
EXPOSE ${PORT:-8000}

# Run the application using the correct file - FIXED
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]