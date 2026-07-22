"""FastAPI dependencies for authenticated routes."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import is_token_valid

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    email = is_token_valid(credentials.credentials, expected_type="access")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None

    email = is_token_valid(credentials.credentials, expected_type="access")
    if not email:
        return None

    return db.query(User).filter(User.email == email).first()


def require_sub_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "sub_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sub-admin access required")
    return user
