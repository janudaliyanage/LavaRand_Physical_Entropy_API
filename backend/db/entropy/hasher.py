import hashlib
import os
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import base64
import uuid as uuid_lib

class EntropyHasher:
    """
    Takes raw entropy bytes from the pool and
    derives cryptographic values from them.

    Pipeline:
    Raw entropy → SHA-256 → PBKDF2 → Final value
    """

    PBKDF2_ITERATIONS = 100_000
    PBKDF2_SALT       = b'lavarand_v1_salt_2026'

    def derive_key(self, raw_entropy: bytes, length: int = 32) -> bytes:
        """
        Derive a cryptographic key from raw entropy.

        Args:
            raw_entropy: bytes from pool
            length: output key length in bytes (16=128bit, 24=192bit, 32=256bit)

        Returns:
            bytes of specified length
        """
        # Step 1: SHA-256 hash (normalize input)
        hashed = hashlib.sha256(raw_entropy).digest()

        # Step 2: PBKDF2 key derivation (strengthen output)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=length,
            salt=self.PBKDF2_SALT,
            iterations=self.PBKDF2_ITERATIONS,
            backend=default_backend()
        )
        return kdf.derive(hashed)

    def to_uuid(self, raw_entropy: bytes) -> str:
        """Derive a UUID v4 from entropy"""
        key = self.derive_key(raw_entropy, 16)

        # Format as UUID v4
        # Set version (4) and variant bits per RFC 4122
        b = bytearray(key)
        b[6] = (b[6] & 0x0f) | 0x40  # version 4
        b[8] = (b[8] & 0x3f) | 0x80  # variant

        return str(uuid_lib.UUID(bytes=bytes(b)))

    def to_otp(self, raw_entropy: bytes, digits: int = 6) -> str:
        """Derive a numeric OTP from entropy"""
        key = self.derive_key(raw_entropy, 8)
        # Convert bytes to integer and take modulo
        number = int.from_bytes(key, 'big') % (10 ** digits)
        return str(number).zfill(digits)

    def to_hex_token(self, raw_entropy: bytes) -> str:
        """Derive a 32-byte hex token"""
        return self.derive_key(raw_entropy, 32).hex()

    def to_aes_key(self, raw_entropy: bytes, bits: int = 256) -> str:
        """Derive an AES key (128, 192, or 256 bits) as base64"""
        length = bits // 8
        key = self.derive_key(raw_entropy, length)
        return base64.b64encode(key).decode()

    def to_bytes_b64(self, raw_entropy: bytes, length: int = 32) -> str:
        """Derive random bytes as base64"""
        return base64.b64encode(
            self.derive_key(raw_entropy, length)
        ).decode()

    def to_integer(self, raw_entropy: bytes, min_val: int, max_val: int) -> int:
        """Derive a random integer in range [min, max]"""
        key = self.derive_key(raw_entropy, 8)
        number = int.from_bytes(key, 'big')
        return min_val + (number % (max_val - min_val + 1))