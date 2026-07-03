import threading
import time
from entropy import LavaLampCamera, EntropyExtractor, EntropyPool, EntropyHasher
from dotenv import load_dotenv
import os

load_dotenv()

class EntropyEngine:
    """
    The main engine that ties camera → extractor → pool together.
    Runs as a background service.
    """

    def __init__(self):
        self.camera    = LavaLampCamera()
        self.extractor = EntropyExtractor(
            threshold=float(os.getenv("ENTROPY_THRESHOLD", 70.0))
        )
        self.pool      = EntropyPool(
            max_size=int(os.getenv("POOL_MAX_SIZE", 1024))
        )
        self.hasher    = EntropyHasher()

        self._running       = False
        self._thread        = None
        self.frames_analyzed = 0
        self.frames_accepted = 0
        self.last_score     = 0.0

    def start(self):
        """Start the entropy engine"""
        self.camera.start()
        self._running = True
        self._thread = threading.Thread(
            target=self._engine_loop,
            daemon=True
        )
        self._thread.start()
        print("[Engine] Entropy engine started")

    def stop(self):
        """Stop the entropy engine"""
        self._running = False
        self.camera.stop()
        print("[Engine] Stopped")

    def get_entropy(self, n: int = 32) -> bytes:
        """Draw n bytes of entropy from the pool"""
        return self.pool.draw(n)

    def status(self) -> dict:
        """Return current engine status"""
        return {
            "running":         self._running,
            "pool_level":      round(self.pool.level, 1),
            "pool_size":       self.pool.size,
            "last_score":      round(self.last_score, 2),
            "frames_analyzed": self.frames_analyzed,
            "frames_accepted": self.frames_accepted,
            "acceptance_rate": round(
                (self.frames_accepted / max(self.frames_analyzed, 1)) * 100, 1
            ),
            "camera_fps":      self.camera.fps,
            "camera_ready":    self.camera.is_ready(),
        }

    def _engine_loop(self):
        """
        Background loop:
        1. Get frame from camera
        2. Extract entropy
        3. Add to pool
        """
        while self._running:
            try:
                # Get latest frame
                frame = self.camera.get_frame()
                if frame is None:
                    time.sleep(0.05)
                    continue

                # Analyze & extract entropy
                result = self.extractor.analyze(frame)
                self.frames_analyzed += 1
                self.last_score = result["score"]

                if result["passed"]:
                    self.pool.add(result["entropy_bytes"])
                    self.frames_accepted += 1

                # Small delay between frames
                time.sleep(1.0 / 24)

            except Exception as e:
                print(f"[Engine] Error: {e}")
                time.sleep(1.0)


# Global singleton — one engine for the whole app
engine = EntropyEngine()