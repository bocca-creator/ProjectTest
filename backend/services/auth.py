import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
import os
from models.user import User, UserCreate

class AuthService:
    def __init__(self):
        self.jwt_secret = os.environ.get('JWT_SECRET')
        self.jwt_expire = self._parse_time_string(os.environ.get('JWT_EXPIRE', '15m'))
        self.jwt_refresh_secret = os.environ.get('JWT_REFRESH_SECRET')
        self.jwt_refresh_expire = self._parse_time_string(os.environ.get('JWT_REFRESH_EXPIRE', '7d'))
        self.bcrypt_rounds = int(os.environ.get('BCRYPT_ROUNDS', 12))
        
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"AuthService initialized - JWT_SECRET: {'SET' if self.jwt_secret else 'NOT SET'}")
        logger.info(f"JWT_REFRESH_SECRET: {'SET' if self.jwt_refresh_secret else 'NOT SET'}")

    def _parse_time_string(self, time_str: str) -> timedelta:
        """Parse time strings like '15m', '7d', '1h' into timedelta objects"""
        if time_str.endswith('m'):
            return timedelta(minutes=int(time_str[:-1]))
        elif time_str.endswith('h'):
            return timedelta(hours=int(time_str[:-1]))
        elif time_str.endswith('d'):
            return timedelta(days=int(time_str[:-1]))
        else:
            return timedelta(minutes=15)  # Default to 15 minutes

    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt(rounds=self.bcrypt_rounds)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    def create_access_token(self, user_id: str, username: str, role) -> str:
        """Create a JWT access token"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Ensure role is a string
            role_str = role.value if hasattr(role, 'value') else str(role)
            logger.info(f"Creating access token - user_id: {user_id}, username: {username}, role: {role}, role_str: {role_str}")
            
            # Create timestamps as integers (Unix timestamps)
            now = datetime.now(timezone.utc)
            exp_time = now + self.jwt_expire
            
            payload = {
                'user_id': str(user_id),
                'username': str(username),
                'role': str(role_str),
                'type': 'access',
                'exp': int(exp_time.timestamp()),
                'iat': int(now.timestamp())
            }
            
            logger.info(f"JWT payload created: {payload}")
            logger.info(f"JWT secret available: {'YES' if self.jwt_secret else 'NO'}")
            token = jwt.encode(payload, self.jwt_secret, algorithm='HS256')
            logger.info(f"JWT token created successfully")
            return token
            
        except Exception as e:
            logger.error(f"Error creating access token: {e}")
            raise

    def create_refresh_token(self, user_id: str) -> str:
        """Create a JWT refresh token"""
        # Create timestamps as integers (Unix timestamps)
        now = datetime.now(timezone.utc)
        exp_time = now + self.jwt_refresh_expire
        
        payload = {
            'user_id': str(user_id),
            'type': 'refresh',
            'exp': int(exp_time.timestamp()),
            'iat': int(now.timestamp())
        }
        return jwt.encode(payload, self.jwt_refresh_secret, algorithm='HS256')

    def verify_access_token(self, token: str) -> Optional[dict]:
        """Verify and decode an access token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            if payload.get('type') != 'access':
                return None
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def verify_refresh_token(self, token: str) -> Optional[dict]:
        """Verify and decode a refresh token"""
        try:
            payload = jwt.decode(token, self.jwt_refresh_secret, algorithms=['HS256'])
            if payload.get('type') != 'refresh':
                return None
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

# Global auth service instance
auth_service = AuthService()