import cv2
import numpy as np
import threading
import time
from dotenv import load_dotenv
import os

load_dotenv()

class LavaLampCamera:
    """
    Captures frames from webcam pointing at lava lamp.
    Runs in background thread continuously.
    """

    def __init__(self):
        self.stream_url    = os.getenv("CAMERA_STREAM_URL", "").strip()
        self.camera_index  = int(os.getenv("CAMERA_INDEX", 0))
        self.fps_target    = int(os.getenv("FPS_TARGET", 24))
        self.cap           = None
        self.latest_frame  = None
        self.running       = False
        self._lock         = threading.Lock()
        self._thread       = None

    def start(self):
        """Start capturing frames in background"""
        source = self.stream_url if self.stream_url else self.camera_index
        self.cap = cv2.VideoCapture(source)

        if not self.cap.isOpened():
            raise RuntimeError(
                f"Cannot open camera source '{source}'. "
                "Make sure IP Webcam is running on your phone and reachable, "
                "or that a local webcam is connected."
            )

        self.cap.set(cv2.CAP_PROP_FPS, self.fps_target)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        self.running = True
        self._thread = threading.Thread(
            target=self._capture_loop,
            daemon=True
        )
        self._thread.start()
        print(f"[Camera] Started on source '{source}' @ {self.fps_target}fps")

    def stop(self):
        """Stop capturing"""
        self.running = False
        if self.cap:
            self.cap.release()
        print("[Camera] Stopped")

    def get_frame(self):
        with self._lock:
            if self.latest_frame is None:
                return None
            return self.latest_frame.copy()

    def is_ready(self):
        with self._lock:
            return self.latest_frame is not None

    def _capture_loop(self):
        delay = 1.0 / self.fps_target

        while self.running:
            ret, frame = self.cap.read()

            if ret:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                with self._lock:
                    self.latest_frame = frame_rgb
            else:
                print("[Camera] Failed to read frame, retrying...")
                time.sleep(0.5)

            time.sleep(delay)

    @property
    def fps(self):
        if self.cap:
            return self.cap.get(cv2.CAP_PROP_FPS)
        return 0