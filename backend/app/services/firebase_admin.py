import os
import json
import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth as fb_auth

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

FIREBASE_PROJECT_ID = os.getenv("EXPO_PUBLIC_FIREBASE_PROJECT_ID") or os.getenv("FIREBASE_PROJECT_ID") or "yclick-59688"
_firebase_initialized = False

def initialize_firebase_admin() -> bool:
    """Initialize Firebase Admin SDK using service account or environment credentials."""
    global _firebase_initialized
    if _firebase_initialized:
        return True

    # Check if app already initialized
    try:
        if firebase_admin._apps:
            _firebase_initialized = True
            return True
    except Exception:
        pass

    # 1. Check for raw JSON string in environment variable
    sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
    if sa_json:
        try:
            parsed = json.loads(sa_json) if isinstance(sa_json, str) else sa_json
            cred = credentials.Certificate(parsed)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            logger.info("Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT_KEY")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin from service account JSON: {e}")

    # 2. Check for service account file path
    sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if sa_path and os.path.exists(sa_path):
        try:
            cred = credentials.Certificate(sa_path)
            firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            logger.info(f"Firebase Admin initialized from file: {sa_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin from {sa_path}: {e}")

    # 3. Check for Google Application Default Credentials or Project ID
    try:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {"projectId": FIREBASE_PROJECT_ID})
        _firebase_initialized = True
        return True
    except Exception:
        pass

    logger.warning("Firebase Admin credentials not found. Protected endpoints will fail securely unless DEV mode is explicitly allowed.")
    return False

# Initialize on module import
initialize_firebase_admin()


_public_keys_cache: Dict[str, str] = {}
_public_keys_cache_time: float = 0.0

def get_google_public_keys() -> Dict[str, str]:
    """Fetch and cache Google's public x509 certificates for Firebase ID token verification."""
    global _public_keys_cache, _public_keys_cache_time
    import time
    import urllib.request
    now = time.time()
    if _public_keys_cache and (now - _public_keys_cache_time < 3600):
        return _public_keys_cache
    try:
        url = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
        req = urllib.request.Request(url, headers={"User-Agent": "YClick-Backend/1.0"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            _public_keys_cache = json.loads(resp.read().decode())
            _public_keys_cache_time = now
            return _public_keys_cache
    except Exception as e:
        logger.warning(f"Failed to fetch Google public certs: {e}")
        return _public_keys_cache


def verify_via_public_keys(id_token: str) -> Dict[str, Any]:
    """Cryptographically verify Firebase ID token using Google's public certificates."""
    import jwt
    from cryptography.x509 import load_pem_x509_certificate
    header = jwt.get_unverified_header(id_token)
    kid = header.get("kid")
    keys = get_google_public_keys()
    if not kid or kid not in keys:
        raise ValueError("Invalid or unknown certificate key ID (kid)")
    cert_pem = keys[kid]
    cert_obj = load_pem_x509_certificate(cert_pem.encode())
    decoded = jwt.decode(
        id_token,
        cert_obj.public_key(),
        algorithms=["RS256"],
        audience=FIREBASE_PROJECT_ID,
        issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
    )
    if "uid" not in decoded and "user_id" in decoded:
        decoded["uid"] = decoded["user_id"]
    return decoded


def verify_firebase_id_token(id_token: str) -> Dict[str, Any]:
    """
    Verify Firebase Bearer ID token.
    Returns decoded token dictionary containing 'uid', 'email', and custom claims.
    Raises HTTPException 401 on invalid or expired token.
    """
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Allow mock/test tokens in explicit test environments
    is_test_env = os.getenv("ENVIRONMENT") == "test" or os.getenv("PYTEST_CURRENT_TEST") is not None
    if is_test_env and id_token.startswith("test-token-"):
        uid = id_token.replace("test-token-", "")
        return {"uid": uid, "sub": uid, "role": "authenticated", "email": f"{uid}@test.com"}

    try:
        # First attempt Firebase Admin SDK verification if credentials available
        if _firebase_initialized:
            try:
                decoded_token = fb_auth.verify_id_token(id_token, check_revoked=False)
                return decoded_token
            except Exception as e:
                logger.info(f"Firebase Admin SDK verification fallback: {e}")

        # Cryptographically verify using Google's public certs (no service account file required)
        return verify_via_public_keys(id_token)
    except fb_auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has been revoked. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except fb_auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please refresh your session.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.warning(f"Firebase token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """
    FastAPI dependency that enforces a valid Firebase Bearer token and returns the authenticated user UID.
    """
    if not cred or not cred.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header with Bearer token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    decoded = verify_firebase_id_token(cred.credentials)
    uid = decoded.get("uid") or decoded.get("sub")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a valid user identity (uid)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return uid


def delete_firebase_user(uid: str) -> bool:
    """
    Permanently delete a user from Firebase Authentication.
    """
    is_test_env = os.getenv("ENVIRONMENT") == "test" or os.getenv("PYTEST_CURRENT_TEST") is not None
    if is_test_env:
        return True

    if not _firebase_initialized and not initialize_firebase_admin():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Admin SDK is not configured for account deletion.",
        )

    try:
        fb_auth.delete_user(uid)
        logger.info(f"Successfully deleted Firebase user {uid}")
        return True
    except fb_auth.UserNotFoundError:
        return True
    except Exception as e:
        logger.error(f"Failed to delete Firebase user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Firebase account deletion failed: {str(e)}",
        )


def sync_firebase_custom_claim(uid: str, claim_key: str = "role", claim_value: str = "authenticated") -> Dict[str, Any]:
    """
    Ensure the user has the specified custom claim (e.g. role: 'authenticated' for Supabase Postgres RLS)
    while strictly preserving all existing custom claims.
    """
    is_test_env = os.getenv("ENVIRONMENT") == "test" or os.getenv("PYTEST_CURRENT_TEST") is not None
    if is_test_env:
        return {"uid": uid, claim_key: claim_value, "synced": True}

    if not _firebase_initialized and not initialize_firebase_admin():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Admin SDK is not configured for claim synchronization.",
        )

    try:
        user = fb_auth.get_user(uid)
        current_claims = user.custom_claims or {}

        if current_claims.get(claim_key) == claim_value:
            return {"uid": uid, "claims": current_claims, "already_set": True}

        updated_claims = {**current_claims, claim_key: claim_value}
        fb_auth.set_custom_user_claims(uid, updated_claims)
        logger.info(f"Synchronized claim {claim_key}={claim_value} for user {uid}")
        return {"uid": uid, "claims": updated_claims, "synced": True}
    except Exception as e:
        logger.error(f"Failed to set custom claim for user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to synchronize user claims: {str(e)}",
        )
