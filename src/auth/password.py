import bcrypt

def hash_password(password: str) -> str:
    """
    Securely hashes a plaintext password using bcrypt with standard work factor.
    Returns the decoded UTF-8 hash string for storage.
    Plaintext passwords are never stored or logged.
    """
    if not isinstance(password, str) or not password:
        raise ValueError("Password must be a non-empty string.")
    
    salt = bcrypt.gensalt(rounds=12)
    hashed_bytes = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_bytes.decode("utf-8")

def verify_password(password: str, password_hash: str) -> bool:
    """
    Verifies a plaintext password against a stored bcrypt hash.
    Returns True if valid, False otherwise.
    """
    if not password or not password_hash:
        return False
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8")
        )
    except Exception:
        return False
