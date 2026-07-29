from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from ..schemas import TokenResponse,ForgotPasswordRequest,ResetPasswordRequest
from fastapi import APIRouter,Depends,HTTPException,status
from ..database import get_db
from sqlalchemy.orm import Session
from .. import models,security
from datetime import datetime,timedelta,timezone
from ..config import settings
from app.services.email_service import send_password_reset_email


router=APIRouter(prefix='/auth')

@router.post('/login', response_model=TokenResponse)
def login(db:Session=Depends(get_db),payload:OAuth2PasswordRequestForm=Depends()):
    user_check=db.query(models.User).filter(models.User.email==payload.username).first()
    if user_check:
        password_verify=security.verify_password(payload.password,user_check.password)
        if password_verify:
            token= security.create_access_token({"sub": str(user_check.id)})
            return {"access_token": token, "token_type": "Bearer"}
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="password doesn't match")

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Email is not Registered")


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest,db: Session = Depends(get_db),):
    response = {
        "message":  "If an account exists with that email,password reset instructions have been generated."
    }

    user = (
        db.query(models.User)
        .filter(models.User.email == payload.email)
        .first()
    )

    if user is None:
        return response

    raw_token = security.generate_reset_token()
    token_hash = security.hash_reset_token(raw_token)

    current_time = datetime.now(timezone.utc)
    expiry_time = current_time + timedelta(minutes=settings.forgot_token_expire_minutes)

    reset_record = (
        db.query(models.PasswordResetToken)
        .filter(models.PasswordResetToken.user_id == user.id)
        .first()
    )

    if reset_record is None:
        new_token = models.PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expiry_time,
            used_at=None,
            issued_at=current_time,
        )

        db.add(new_token)

    else:
        reset_record.token_hash = token_hash
        reset_record.expires_at = expiry_time
        reset_record.used_at = None
        reset_record.issued_at = current_time

    db.commit()

    send_password_reset_email(user.email,raw_token)

    return response


@router.post('/reset-password')
def reset_password(payload:ResetPasswordRequest,db:Session=Depends(get_db)):
    hashed_token=security.hash_reset_token(payload.token)
    current_time=datetime.now(timezone.utc)

    record=db.query(models.PasswordResetToken).filter(models.PasswordResetToken.token_hash==hashed_token,models.PasswordResetToken.used_at.is_(None),models.PasswordResetToken.expires_at>current_time).with_for_update().first()
    if record is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Invalid or expired reset token")
    
    user=db.query(models.User).filter(models.User.id==record.user_id).first()

    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Invalid User")
    if security.verify_password(payload.new_password,user.password):
        raise   HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Cant add the same Password")
    user.password=security.hash_password(payload.new_password)
    record.used_at=current_time

    db.commit()

    return {"message":"Password reset successfully"}