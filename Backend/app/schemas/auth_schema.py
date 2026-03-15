from pydantic import BaseModel


class LoginRequest(BaseModel):

    email: str
    password: str


class TokenResponse(BaseModel):

    access_token: str
    refresh_token: str


class RefreshRequest(BaseModel):

    refresh_token: str


class ChangePasswordRequest(BaseModel):

    old_password: str
    new_password: str