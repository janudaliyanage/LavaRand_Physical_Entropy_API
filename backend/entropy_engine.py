import threading
import time
import os
from entropy import LavaLampCamera, EntropyExtractor, EntropyPool, EntropyHasher
from dotenv import load_dotenv

load_dotenv()

class EntropyEngine:
    def __init__(self):
        self.camera    = LavaLampCamera()
        self.extractor = EntropyExtractor(
            threshold=float(os.getenv("ENTROPY_THRESHOLD", 70.0))
        )
        self.pool      = EntropyPool(
            max_size=int(os.getenv("POOL_MAX_SIZE", 1024))
        )
        self.hasher    = EntropyHasher()

        self._running        = False
        self._thread         = None
        self.frames_analyzed = 0
        self.frames_accepted = 0
        self.last_score      = 0.0
        self.mode            = "system"  # default to system

    def start(self):
        """Start entropy engine — tries camera first, falls back to system"""
        try:
            self.camera.start()
            self.mode = "lava_lamp"
            self._running = True
            self._thread = threading.Thread(
                target=self._engine_loop,
                daemon=True
            )
            self._thread.start()
            print("[Engine] Mode: LAVA LAMP entropy")
        except RuntimeError:
            self.mode = "system"
            self._running = True
            print("[Engine] Mode: SYSTEM entropy (no camera found)")
            print("[Engine] Using os.urandom — cryptographically secure")

    def stop(self):
        self._running = False
        if self.mode == "lava_lamp":
            self.camera.stop()
        print("[Engine] Stopped")

    def get_entropy(self, n: int = 32) -> bytes:
        """Get entropy bytes from lava lamp or system"""
        if self.mode == "lava_lamp":
            return self.pool.draw(n)
        else:
            # os.urandom is cryptographically secure
            return os.urandom(n)

    def status(self) -> dict:
        return {
            "running":         self._running,
            "mode":            self.mode,
            "pool_level":      round(self.pool.level, 1) if self.mode == "lava_lamp" else 100.0,
            "pool_size":       self.pool.size if self.mode == "lava_lamp" else 1024,
            "last_score":      round(self.last_score, 2) if self.mode == "lava_lamp" else 100.0,
            "frames_analyzed": self.frames_analyzed,
            "frames_accepted": self.frames_accepted,
            "acceptance_rate": round(
                (self.frames_accepted / max(self.frames_analyzed, 1)) * 100, 1
            ),
            "camera_fps":      self.camera.fps if self.mode == "lava_lamp" else 0,
            "camera_ready":    self.camera.is_ready() if self.mode == "lava_lamp" else False,
        }

    def _engine_loop(self):
        while self._running:
            try:
                frame = self.camera.get_frame()
                if frame is None:
                    time.sleep(0.05)
                    continue

                result = self.extractor.analyze(frame)
                self.frames_analyzed += 1
                self.last_score = result["score"]

                if result["passed"]:
                    self.pool.add(result["entropy_bytes"])
                    self.frames_accepted += 1

                time.sleep(1.0 / 24)

            except Exception as e:
                print(f"[Engine] Error: {e}")
                time.sleep(1.0)

# Global singleton
engine = EntropyEngine()