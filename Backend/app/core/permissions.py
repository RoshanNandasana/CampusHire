from fastapi import Depends, HTTPException, status
from app.core.dependencies import get_current_user


def require_roles(*allowed_roles: str):
    def role_checker(current_user=Depends(get_current_user)):
        role_name = current_user.role.name if current_user.role else None
        if role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker


def require_super_admin():
    return require_roles("SUPER_ADMIN")


def require_tpo():
    return require_roles("TPO")


def require_company():
    return require_roles("COMPANY")


def require_student():
    return require_roles("STUDENT")