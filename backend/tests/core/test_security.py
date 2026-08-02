from app.core.security import verify_password, get_password_hash, create_access_token
import jwt
from app.core.config import settings

def test_password_hashing() -> None:
    password = "supersecretpassword123"
    hashed = get_password_hash(password)
    
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)

def test_create_access_token() -> None:
    subject = "123"
    token = create_access_token(subject)
    
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert decoded["sub"] == subject
    assert "exp" in decoded
