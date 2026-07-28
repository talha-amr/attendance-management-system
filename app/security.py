from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException,status
from jwt.exceptions import InvalidTokenError,PyJWTError
from app.config import settings
from . import schemas
import hashlib
import secrets


SECURITY_KEY=settings.secret_key
ALGORITHM=settings.algorithm
EXPIRY=settings.access_token_expire_minutes

password_hasher = PasswordHash.recommended()
    
def hash_password(value:str)->str:
    return password_hasher.hash(value)

def verify_password(plain_value:str,hashed_value:str)->bool:
    return password_hasher.verify(plain_value,hashed_value)

def create_access_token(data:dict):
    new_data=data.copy()
    expiry=datetime.now(timezone.utc)+timedelta(minutes=EXPIRY)
    new_data.update({"exp":expiry})
    token = jwt.encode(new_data,SECURITY_KEY,algorithm=ALGORITHM)
    return token

def verify_token(token:str):
    credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},)
    try:
        decoded_data=jwt.decode(token,SECURITY_KEY,algorithms=[ALGORITHM])
        user_id_new=decoded_data.get("sub")
        if user_id_new:
            token_data= schemas.TokenData(user_id=int(user_id_new))
            return token_data
        raise credentials_exception
    except (InvalidTokenError, ValueError, TypeError):
        raise credentials_exception

def generate_reset_token() -> str:
    reset_token=secrets.token_urlsafe(32)
    return reset_token
def hash_reset_token(token: str) -> str:
    token_bytes = token.encode("utf-8")
    token_hash = hashlib.sha256(token_bytes).hexdigest()
    return token_hash