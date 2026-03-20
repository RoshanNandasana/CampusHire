from pydantic import BaseModel


class LoginRequest(BaseModel):

    email: str
    password: str


class TokenResponse(BaseModel):

    access_token: str
    refresh_token: str
    user_id: str
    email: str
    role: str
    student_id: str | None = None
    department_id: str | None = None


class RefreshRequest(BaseModel):

    refresh_token: str


class ChangePasswordRequest(BaseModel):

    old_password: str
    new_password: str