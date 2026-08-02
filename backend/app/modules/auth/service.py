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

    async def authenticate_github_user(self, code: str) -> User:
        import httpx
        from app.core.config import settings
        
        # 1. Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GITHUB_REDIRECT_URI,
                },
            )
            
            token_data = token_response.json()
            if "error" in token_data:
                raise SparkAIException(message=f"GitHub OAuth error: {token_data.get('error_description')}", status_code=400)
                
            access_token = token_data["access_token"]
            
            # 2. Get user profile
            user_response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json"
                }
            )
            if user_response.status_code != 200:
                raise SparkAIException(message="Failed to fetch GitHub profile", status_code=400)
                
            github_user = user_response.json()
            github_id = str(github_user["id"])
            email = github_user.get("email")
            
            # If primary email is private, fetch emails
            if not email:
                emails_response = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json"
                    }
                )
                emails = emails_response.json()
                primary_email = next((e["email"] for e in emails if e["primary"]), None)
                email = primary_email
                
            if not email:
                raise SparkAIException(message="GitHub profile missing email", status_code=400)
                
            # 3. Find or create user
            result = await self.db.execute(select(User).where((User.github_id == github_id) | (User.email == email)))
            user = result.scalar_one_or_none()
            
            if user:
                # Link GitHub account if they previously signed up with email only
                if not user.github_id:
                    user.github_id = github_id
                    await self.db.commit()
                return user
                
            # Create new user
            new_user = User(
                email=email,
                github_id=github_id,
                full_name=github_user.get("name"),
            )
            self.db.add(new_user)
            await self.db.commit()
            await self.db.refresh(new_user)
            return new_user
