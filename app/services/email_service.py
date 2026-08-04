import smtplib
import ssl
from email.message import EmailMessage
from app.config import settings

def send_email(recipient_email:str,subject:str,body:str)->None:
    message=EmailMessage()
    message["From"]=settings.from_email
    message["To"]=recipient_email
    message["Subject"]=subject
    message.set_content(body)
    context=ssl.create_default_context()
    with smtplib.SMTP(settings.smtp_host,settings.smtp_port,timeout=10) as server:
        server.starttls(context=context)
        server.login(settings.smtp_username,settings.smtp_password)
        server.send_message(message)


def send_password_reset_email(recipient_email:str,reset_token:str)->None:
    reset_link=f"{settings.frontend_url}/reset-password?token={reset_token}"
    subject="Reset your password"
    body=f"""A password reset was requested for your account.

    Use this link to reset your password:
    {reset_link}

    This link will expire in {settings.forgot_token_expire_minutes} minutes.

    If you did not request this, ignore this email."""
    send_email(recipient_email,subject,body)