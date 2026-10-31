#!/usr/bin/env python3
"""
CLI script to synchronize Firebase custom claims with role: authenticated for Supabase RLS.
Usage:
    python backend/scripts/sync_firebase_claims.py <user_uid_or_email>
"""
import sys
import os

# Ensure backend package is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from dotenv import load_dotenv
load_dotenv()

from backend.app.services.firebase_admin import initialize_firebase_admin, sync_firebase_custom_claim
from firebase_admin import auth as fb_auth

def main():
    if len(sys.argv) < 2:
        print("Usage: python backend/scripts/sync_firebase_claims.py <user_uid_or_email>")
        sys.exit(1)

    target = sys.argv[1].strip()
    if not initialize_firebase_admin():
        print("Error: Could not initialize Firebase Admin SDK. Please check FIREBASE_SERVICE_ACCOUNT_PATH or credentials.")
        sys.exit(1)

    try:
        if "@" in target:
            user = fb_auth.get_user_by_email(target)
            uid = user.uid
        else:
            user = fb_auth.get_user(target)
            uid = target

        result = sync_firebase_custom_claim(uid, "role", "authenticated")
        print(f"Success! Claims updated for {uid}: {result}")
    except Exception as e:
        print(f"Error syncing claims for {target}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
