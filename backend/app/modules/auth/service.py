from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.modules.users.models import User
from app.core.security import verify_password, get_password_hash
from app.shared.exceptions import SparkAIException

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate_user(self, email: str, password: str) -> User:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise SparkAIException(message="Incorrect email or password", status_code=401)
        if not user.hashed_password or not verify_password(password, user.hashed_password):
            raise SparkAIException(message="Incorrect email or password", status_code=401)
            
        return user
        
    async def create_user(self, email: str, password: str, full_name: str | None = None) -> User:
        result = await self.db.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            raise SparkAIException(message="Email already registered", status_code=400)
            
        hashed_password = get_password_hash(password)
        db_user = User(email=email, hashed_password=hashed_password, full_name=full_name)
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
