from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError
from app.config import settings


password_hasher = PasswordHash.recommended()
    
def hash_password(value:str)->str:
    return password_hasher.hash(value)

def verify_password(plain_value:str,hashed_value:str)->bool:
    return password_hasher.verify(plain_value,hashed_value)

def create_access_token():
    pass