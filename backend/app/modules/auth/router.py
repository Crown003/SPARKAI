from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from app.core.database import get_db
from app.core.security import create_access_token
from app.modules.auth.schemas import Token, UserCreate, UserResponse
from app.modules.auth.service import AuthService

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """Register a new user."""
    auth_service = AuthService(db)
    user = await auth_service.create_user(
        email=user_in.email, 
        password=user_in.password,
        full_name=user_in.full_name
    )
    return user # type: ignore

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Token:
    """OAuth2 compatible token login, get an access token for future requests."""
    auth_service = AuthService(db)
    user = await auth_service.authenticate_user(email=form_data.username, password=form_data.password)
    
    access_token = create_access_token(subject=str(user.id))
    return Token(access_token=access_token, token_type="bearer")
