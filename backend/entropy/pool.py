import threading
import time
import os
from collections import deque

class EntropyPool:
    """
    A thread-safe buffer of entropy bytes.

    Continuously fills from the lava lamp camera.
    API calls draw from this pool.

    Think of it like a water tank:
    - Camera keeps filling it up
    - API calls drain it
    - If it gets too low, wait for refill
    """

    def __init__(self, max_size: int = 1024):
        self.max_size    = max_size        # max bytes to store
        self._pool       = deque()         # stores entropy bytes
        self._lock       = threading.Lock()
        self._not_empty  = threading.Event()
        self.total_added = 0               # lifetime bytes added
        self.total_drawn = 0               # lifetime bytes drawn

    def add(self, entropy_bytes: bytes):
        """Add entropy bytes to the pool (called by camera loop)"""
        with self._lock:
            for byte in entropy_bytes:
                if len(self._pool) < self.max_size:
                    self._pool.append(byte)
                # If full, drop oldest and add newest
                else:
                    self._pool.popleft()
                    self._pool.append(byte)

            self.total_added += len(entropy_bytes)
            self._not_empty.set()

    def draw(self, n: int = 32, timeout: float = 5.0) -> bytes:
        """
        Draw n bytes from the pool.
        Waits up to timeout seconds if pool is low.

        Args:
            n: number of bytes to draw
            timeout: max wait time in seconds

        Returns:
            bytes of length n
        """
        deadline = time.time() + timeout

        while True:
            with self._lock:
                if len(self._pool) >= n:
                    result = bytes([self._pool.popleft() for _ in range(n)])
                    self.total_drawn += n
                    return result

            # Pool too low — wait for refill
            remaining = deadline - time.time()
            if remaining <= 0:
                # Fallback to system entropy if pool exhausted
                print("[Pool] Warning: pool exhausted, falling back to os.urandom")
                return os.urandom(n)

            self._not_empty.wait(timeout=min(remaining, 0.1))
            self._not_empty.clear()

    @property
    def level(self) -> float:
        """Pool fill level as percentage (0-100)"""
        with self._lock:
            return (len(self._pool) / self.max_size) * 100

    @property
    def size(self) -> int:
        """Current number of bytes in pool"""
        with self._lock:
            return len(self._pool)

    def is_healthy(self) -> bool:
        """Pool is healthy if above 10% full"""
        return self.level > 10.0