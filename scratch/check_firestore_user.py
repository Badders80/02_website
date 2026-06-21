import os
import firebase_admin
from firebase_admin import auth, credentials
from google.cloud import firestore

# Initialize Firestore
db = firestore.Client(project='evolution-engine')

def check_user(user_id):
    print(f"Checking Firestore document for user: {user_id}")
    doc_ref = db.collection('users').document(user_id)
    doc = doc_ref.get()
    
    if doc.exists:
        data = doc.to_dict()
        print("Firestore data:")
        for k, v in data.items():
            print(f"  {k}: {v}")
    else:
        print("❌ User document does not exist in Firestore!")

    print(f"\nChecking Firebase Auth custom claims for user: {user_id}")
    try:
        # Lazy init firebase admin
        try:
            app = firebase_admin.get_app()
        except ValueError:
            app = firebase_admin.initialize_app(
                credentials.ApplicationDefault(),
                {"projectId": "evolution-engine"},
            )
        user = auth.get_user(user_id)
        print(f"Firebase Auth details:")
        print(f"  Email: {user.email}")
        print(f"  Custom Claims: {user.custom_claims}")
    except Exception as e:
        print(f"❌ Failed to fetch auth details: {e}")

check_user("2C5zXVd5gQU95jeQcwCG4DOiCfu2")
