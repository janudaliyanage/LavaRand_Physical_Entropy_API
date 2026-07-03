import numpy as np
from PIL import Image
import hashlib
import os

class EntropyExtractor:
    """
    Extracts entropy from a lava lamp camera frame.

    How it works:
    1. Convert frame to grayscale
    2. Build pixel value histogram (256 buckets)
    3. Calculate Shannon entropy from histogram
    4. If quality passes threshold → extract entropy bytes
    """

    def __init__(self, threshold: float = 70.0):
        self.threshold = threshold  # minimum entropy quality (0-100)

    def analyze(self, frame: np.ndarray) -> dict:
        """
        Analyze a frame and extract entropy if quality is sufficient.

        Args:
            frame: numpy array (H, W, 3) RGB image

        Returns:
            dict with:
                - score: float (0-100) entropy quality
                - passed: bool (above threshold?)
                - entropy_bytes: bytes (32 bytes of entropy)
                - reason: str (why it passed/failed)
        """
        # Step 1: Convert to grayscale for analysis
        gray = self._to_grayscale(frame)

        # Step 2: Calculate Shannon entropy score
        score = self._shannon_entropy(gray)

        # Step 3: Check quality threshold
        if score < self.threshold:
            return {
                "score": round(score, 2),
                "passed": False,
                "entropy_bytes": None,
                "reason": f"Score {score:.1f}% below threshold {self.threshold}%"
            }

        # Step 4: Extract entropy bytes from frame
        entropy_bytes = self._extract_bytes(frame)

        return {
            "score": round(score, 2),
            "passed": True,
            "entropy_bytes": entropy_bytes,
            "reason": f"Score {score:.1f}% passed threshold {self.threshold}%"
        }

    def _to_grayscale(self, frame: np.ndarray) -> np.ndarray:
        """Convert RGB frame to grayscale"""
        # Standard luminance formula
        return (
            0.299 * frame[:, :, 0] +
            0.587 * frame[:, :, 1] +
            0.114 * frame[:, :, 2]
        ).astype(np.uint8)

    def _shannon_entropy(self, gray: np.ndarray) -> float:
        """
        Calculate Shannon entropy of pixel distribution.

        High entropy = pixels are spread across many values = good randomness
        Low entropy  = pixels are clustered = bad randomness (dark/blank frame)

        Returns value 0-100 (percentage of max possible entropy for 8-bit image)
        """
        # Count occurrences of each pixel value (0-255)
        histogram, _ = np.histogram(gray, bins=256, range=(0, 256))

        # Remove zero counts
        histogram = histogram[histogram > 0]

        # Total pixels
        total = gray.size

        # Calculate probabilities
        probabilities = histogram / total

        # Shannon entropy formula: H = -sum(p * log2(p))
        entropy = -np.sum(probabilities * np.log2(probabilities))

        # Max possible entropy for 8-bit = log2(256) = 8 bits
        max_entropy = np.log2(256)

        # Convert to percentage
        score = (entropy / max_entropy) * 100

        return float(score)

    def _extract_bytes(self, frame: np.ndarray) -> bytes:
        """
        Extract entropy bytes from a frame.

        Strategy:
        - Sample pixels from multiple regions of the frame
        - XOR with system entropy for additional security
        - Hash to produce uniform 32 bytes
        """
        # Sample pixels from 8 regions across the frame
        h, w = frame.shape[:2]
        regions = []

        for i in range(4):
            for j in range(4):
                y = int(h * (i + 0.5) / 4)
                x = int(w * (j + 0.5) / 4)
                pixel = frame[y, x]        # RGB values
                regions.append(pixel)

        # Flatten sampled pixels to bytes
        pixel_bytes = np.array(regions, dtype=np.uint8).tobytes()

        # XOR with system entropy (os.urandom) for extra security
        sys_entropy = os.urandom(len(pixel_bytes))
        mixed = bytes(a ^ b for a, b in zip(pixel_bytes, sys_entropy))

        # Hash to get uniform 32 bytes
        return hashlib.sha256(mixed).digest()