import os
from google.cloud import aiplatform

# Initialize using the variables you just set
project = os.getenv("GCP_PROJECT_ID", "evolution-engine")
location = os.getenv("GCP_REGION", "us-central1")

print(f"Checking Vertex connection for project: {project}...")

try:
    aiplatform.init(project=project, location=location)
    # List models just to verify the handshake
    models = aiplatform.Model.list()
    print("✅ Success! Vertex AI SDK is connected.")
    print(f"Found {len(models)} models in your project.")
except Exception as e:
    print(f"❌ Connection failed: {e}")
