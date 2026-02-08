from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware to allow requests from the Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Both development ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/service-status")
async def service_status():
    return {"status": "operational", "timestamp": time.time()}

@app.post("/hello")
async def hello_world(file: UploadFile = File(...)):
    try:
        logger.info(f"Receiving file: {file.filename}")
        
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        # Read file in chunks to avoid memory issues with large files
        file_size = 0
        file_path = f"uploads/{file.filename}"
        
        with open(file_path, "wb") as buffer:
            # Read and write in chunks of 1MB
            chunk_size = 1024 * 1024  # 1MB
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                buffer.write(chunk)
                file_size += len(chunk)
                
        logger.info(f"File saved successfully: {file.filename}, size: {file_size} bytes at {file_path}")
        
        # Here you could process the file as needed
        
        return {
            "message": "File uploaded successfully", 
            "filename": file.filename,
            "size": file_size,
            "path": file_path
        }
        
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting FastAPI server on port 3000")
    uvicorn.run("server:app", host="0.0.0.0", port=3000, reload=True)
