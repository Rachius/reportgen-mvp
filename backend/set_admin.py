import firebase_admin
from firebase_admin import credentials, auth
import sys

if len(sys.argv) < 2:
    print("Uso: python set_admin.py TU_FIREBASE_UID")
    sys.exit(1)

cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)

uid = sys.argv[1]
auth.set_custom_user_claims(uid, {"admin": True})
print(f"Claim admin asignado a {uid}")
