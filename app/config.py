from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key:str
    algorithm:str
    access_token_expire_minutes:int    
    forgot_token_expire_minutes:int
    smtp_host:str
    smtp_port:int
    smtp_username:str
    smtp_password:str
    from_email:str
    frontend_url:str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()