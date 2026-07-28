import cv2
import numpy as np
from deepface import DeepFace
import time

class FaceRecognizer:
    def __init__(self, models_to_load=["Facenet512", "ArcFace", "VGG-Face"]):
        self.models = models_to_load
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        print("FaceRecognizer initialized. Fast Haar Cascade face detector active.")
                
    def extract_embedding(self, image: np.ndarray, model_name: str = "Facenet512"):
        """
        Extracts face embedding vector from an image with L2 normalization.
        Ultra-fast implementation using OpenCV C++ face crop + DeepFace skip detector.
        """
        start_time = time.time()
        if image is None:
            return None, 0.0

        # 1. Speed Optimization: Resize input frame to max width 280px for instant detection
        if image.shape[1] > 280:
            h, w = image.shape[:2]
            target_w = 280
            target_h = int(h * (280 / w))
            image = cv2.resize(image, (target_w, target_h), interpolation=cv2.INTER_AREA)

        # 2. Fast C++ Haar Cascade face detection (~1ms)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=3, minSize=(30, 30))

        if len(faces) > 0:
            # Sort by area and select largest face
            x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])
            margin = int(0.1 * w)
            x1 = max(0, x - margin)
            y1 = max(0, y - margin)
            x2 = min(image.shape[1], x + w + margin)
            y2 = min(image.shape[0], y + h + margin)
            crop_img = image[y1:y2, x1:x2]

            try:
                result = DeepFace.represent(
                    img_path=crop_img,
                    model_name=model_name,
                    enforce_detection=False,
                    detector_backend="skip"
                )
                if result and len(result) > 0 and 'embedding' in result[0]:
                    raw_emb = np.array(result[0]['embedding'], dtype=np.float32)
                    norm = np.linalg.norm(raw_emb)
                    normalized_emb = (raw_emb / norm).tolist() if norm > 0 else raw_emb.tolist()
                    time_taken = (time.time() - start_time) * 1000 # ms
                    return normalized_emb, time_taken
            except Exception:
                pass

        # Fallback if no face detected by Cascade
        try:
            result = DeepFace.represent(
                img_path=image,
                model_name=model_name,
                enforce_detection=False,
                detector_backend="opencv"
            )
            if result and len(result) > 0 and 'embedding' in result[0]:
                raw_emb = np.array(result[0]['embedding'], dtype=np.float32)
                norm = np.linalg.norm(raw_emb)
                normalized_emb = (raw_emb / norm).tolist() if norm > 0 else raw_emb.tolist()
                time_taken = (time.time() - start_time) * 1000 # ms
                return normalized_emb, time_taken
        except Exception:
            pass

        return None, (time.time() - start_time) * 1000

face_recognizer = FaceRecognizer()

