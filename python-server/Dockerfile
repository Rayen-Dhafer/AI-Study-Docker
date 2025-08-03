FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU only and sentence-transformers
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch==2.3.1+cpu sentence-transformers==2.7.0

# Install chromadb version 1.0.15
RUN pip install --no-cache-dir chromadb==1.0.15 flask==3.0.2 uuid==1.30 numpy==1.26.4

# Copy your requirements.txt if you have it
# COPY requirements.txt .
# RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "chromadb_server.py"]
