import cv2
import numpy as np
from deepface import DeepFace
import time

class FaceRecognizer:
    def __init__(self, models_to_load=["Facenet512", "ArcFace", "VGG-Face"]):
        self.models = models_to_load
        print("FaceRecognizer initialized. AI models ready for requests.")
                
    def extract_embedding(self, image: np.ndarray, model_name: str = "Facenet512"):
        """
        Extracts face embedding vector from an image with L2 normalization.
        Optimized for ultra-fast performance.
        """
        start_time = time.time()
        
        # Speed Optimization: Resize large webcam frame to max width 360px
        if image is not None and image.shape[1] > 360:
            h, w = image.shape[:2]
            target_w = 360
            target_h = int(h * (360 / w))
            image = cv2.resize(image, (target_w, target_h), interpolation=cv2.INTER_AREA)

        backends_to_try = [
            ("opencv", True),
            ("opencv", False)
        ]
        
        for backend, enforce in backends_to_try:
            try:
                result = DeepFace.represent(
                    img_path=image,
                    model_name=model_name,
                    enforce_detection=enforce,
                    detector_backend=backend
                )
                if result and len(result) > 0 and 'embedding' in result[0]:
                    raw_emb = np.array(result[0]['embedding'], dtype=np.float32)
                    norm = np.linalg.norm(raw_emb)
                    if norm > 0:
                        normalized_emb = (raw_emb / norm).tolist()
                    else:
                        normalized_emb = raw_emb.tolist()
                    time_taken = (time.time() - start_time) * 1000 # ms
                    return normalized_emb, time_taken
            except Exception as e:
                continue
                
        return None, (time.time() - start_time) * 1000

face_recognizer = FaceRecognizer()

