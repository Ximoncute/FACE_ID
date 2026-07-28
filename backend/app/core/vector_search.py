import faiss
import numpy as np

class VectorSearchEngine:
    def __init__(self, dimension: int = 512):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.id_map = {} # Maps faiss index to database user_id
        self.current_count = 0

    def reset(self):
        self.index.reset()
        self.id_map.clear()
        self.current_count = 0

    def add_embedding(self, embedding: list, user_id: int):
        vector = np.array([embedding], dtype=np.float32)
        norm = np.linalg.norm(vector, axis=1, keepdims=True)
        if norm[0][0] > 0:
            vector = vector / norm

        if vector.shape[1] != self.dimension:
            if self.current_count == 0 or self.index.ntotal == 0:
                self.dimension = vector.shape[1]
                self.index = faiss.IndexFlatL2(self.dimension)
            else:
                raise ValueError(f"Expected dimension {self.dimension}, got {vector.shape[1]}")

        self.index.add(vector)
        self.id_map[self.current_count] = user_id
        self.current_count += 1

    def search(self, query_embedding: list, k: int = 1):
        if self.current_count == 0 or self.index.ntotal == 0:
            return None, None
            
        vector = np.array([query_embedding], dtype=np.float32)
        norm = np.linalg.norm(vector, axis=1, keepdims=True)
        if norm[0][0] > 0:
            vector = vector / norm

        if vector.shape[1] != self.dimension:
            return None, None

        distances, indices = self.index.search(vector, k)
        
        if len(indices) > 0 and indices[0][0] != -1:
            best_idx = indices[0][0]
            best_distance = float(distances[0][0])
            user_id = self.id_map.get(best_idx)
            return user_id, best_distance
            
        return None, None

# Dictionaries to hold search engines for different models
vector_engines = {
    "Facenet512": VectorSearchEngine(dimension=512),
    "ArcFace": VectorSearchEngine(dimension=512),
    "VGG-Face": VectorSearchEngine(dimension=4096)
}

