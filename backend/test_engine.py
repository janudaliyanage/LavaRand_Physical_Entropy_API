from entropy_engine import engine
import time

# Start engine
engine.start()

print("Waiting for entropy pool to fill...")
time.sleep(3)

# Test drawing entropy
print("\n--- Engine Status ---")
status = engine.status()
for k, v in status.items():
    print(f"  {k}: {v}")

# Test hasher
print("\n--- Sample Outputs ---")
raw = engine.get_entropy(32)
print(f"  UUID:  {engine.hasher.to_uuid(raw)}")

raw = engine.get_entropy(32)
print(f"  OTP:   {engine.hasher.to_otp(raw)}")

raw = engine.get_entropy(32)
print(f"  Token: {engine.hasher.to_hex_token(raw)[:32]}...")

raw = engine.get_entropy(32)
print(f"  AES:   {engine.hasher.to_aes_key(raw, 256)[:32]}...")

engine.stop()