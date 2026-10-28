# Firebase Configuration Guide for YClick

This guide explains how to configure Firebase Authentication, Cloud Firestore, and Firebase Storage for YClick.

---

## 1. Create a Firebase Project

1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `yclick-app` (or any preferred name).
3. Disable or enable Google Analytics according to your preference and click **Create Project**.

---

## 2. Enable Authentication

1. In the Firebase console sidebar, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under **Sign-in method**, enable **Email/Password**.
4. (Optional) Customize the email verification template under **Templates > Email address verification**.

---

## 3. Set Up Cloud Firestore

1. In the sidebar, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your users (e.g., `asia-south1` for India / Mumbai).
4. Start in **Production mode**.
5. Copy the contents of `firestore.rules` from this repository to **Firestore > Rules** and click **Publish**.

---

## 4. Set Up Firebase Storage

1. In the sidebar, navigate to **Build > Storage**.
2. Click **Get Started**.
3. Choose your default storage bucket location.
4. Copy the contents of `storage.rules` from this repository to **Storage > Rules** and click **Publish**.

---

## 5. Register the Mobile Web App

1. In **Project Overview**, click the **Web icon (`</>`)** to register a web app.
2. Enter the app nickname `YClick Mobile`.
3. Copy the configuration credentials into your `.env` file at the root of the project:

```env
EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="yclick-app.firebaseapp.com"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="yclick-app"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="yclick-app.appspot.com"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
EXPO_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef..."
```

---

## 6. Offline / Preview Fallback

If you run the app before configuring Firebase, YClick automatically provides a safe offline preview mode with pre-configured guest credentials so you can test all screens immediately.
