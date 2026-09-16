from io import BytesIO
import os
import time

from fastapi import FastAPI, File, UploadFile
from PIL import Image

from app.model import WasteModel

app = FastAPI(title="Waste ML Worker", version="0.1.0")
worker_id = os.getenv("WORKER_ID", "worker-local")
model = WasteModel()


@app.get("/health")
def health():
    return {
        "status": "UP",
        "workerId": worker_id,
        "modelLoaded": model.loaded,
        "device": str(model.device),
    }


@app.post("/predict/batch")
async def predict_batch(files: list[UploadFile] = File(...)):
    start = time.perf_counter()
    predictions = []

    for file in files:
        content = await file.read()
        try:
            image = Image.open(BytesIO(content))
            result = model.predict(image)
            if result is None:
                predictions.append({
                    "filename": file.filename,
                    "status": "MODEL_NOT_LOADED",
                    "label": None,
                    "confidence": None,
                })
            else:
                label, confidence = result
                predictions.append({
                    "filename": file.filename,
                    "status": "OK",
                    "label": label,
                    "confidence": confidence,
                })
        except Exception:
            predictions.append({
                "filename": file.filename,
                "status": "INVALID_IMAGE",
                "label": None,
                "confidence": None,
            })

    elapsed_ms = (time.perf_counter() - start) * 1000
    return {
        "workerId": worker_id,
        "modelLoaded": model.loaded,
        "elapsedMs": elapsed_ms,
        "predictions": predictions,
    }
