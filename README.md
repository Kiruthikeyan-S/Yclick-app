# YClick — AI Space Redesign Mobile Application

**YClick** is a mobile application built with React Native, Expo, TypeScript, and a Python FastAPI backend. It enables users to photograph or upload an image of a real space, redesign it using AI, compare three design directions (Budget Refresh, Balanced Makeover, Premium Redesign), receive practical prioritized improvement recommendations, browse curated matching products, and explore interactive 3D rooms.

---

## Key Features

1. **Pure Light Theme Design System**: Built with an architectural palette:
   - Primary Forest Green: `#244C3E`
   - Secondary Green: `#557367`
   - Background: `#F7F8F4`
   - Card Background: `#FFFFFF`
   - Text: `#20362C`
   - Subtle Accent: `#EDF4EE`
2. **5 Space Categories & Subcategories**:
   - Home Rooms (Living Room, Bedroom, Kitchen, Bathroom, Study Room)
   - Restaurants & Cafes (Dining Area, Cafe Interior, Counter, Waiting Area)
   - Hotels (Guest Bedroom, Lobby, Reception, Lounge)
   - Offices (Individual Workspace, Meeting Room, Reception, Open Office)
   - Shops & Retail (Retail Floor, Product Display, Checkout Counter, Showroom)
3. **Structured Design Workflow**:
   - Camera & Gallery integration with framing guides and photography tips
   - Interactive Before/After image comparison with slider and toggle modes
   - Tailored category-specific architectural questions
   - 3 distinct generated design tiers: Budget, Balanced, and Premium
4. **Practical Improvement Report**:
   - Step-by-step prioritized tasks with difficulty, materials needed, and cost estimates
5. **Interactive 3D Room Experience**:
   - Smooth 60 FPS Three.js WebGL canvas with touch OrbitControls
   - First-person 3D walkthrough
   - Live customizable wall colors, flooring materials, and furniture toggles
6. **Augmented Reality (AR) Readiness**:
   - Surface plane detection guidance, ARCore setup instructions, and 3D preview fallback
7. **Production Python FastAPI Backend**:
   - Abstract image and product provider interfaces
   - Health checks, input validation, and asynchronous processing endpoints
8. **Security & Data Privacy**:
   - Production Cloud Firestore & Storage security rules
   - Account and project deletion safeguards

---

## Quick Start (Windows PowerShell)

### 1. Install Frontend Dependencies
```powershell
npm install
```

### 2. Start the Expo Development Server
```powershell
npx expo start
```
- Press `a` to launch the Android emulator.
- Scan the displayed QR code with the **Expo Go** app on your physical Android phone (ensure phone and PC are on the same Wi-Fi network).

### 3. Start the Python FastAPI Backend (In a second terminal)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Documentation

- [Firebase Configuration](docs/FIREBASE_SETUP.md)
- [Backend Architecture & AI Providers](docs/BACKEND_SETUP.md)
- [3D Scene & AR Technical Guide](docs/3D_AND_AR_GUIDE.md)

---

## Project Structure

```
├── app/                  # Expo Router Screens (36 Pages)
│   ├── (auth)/           # Welcome, Login, Signup, Forgot Password, Verify
│   ├── (tabs)/           # Home, My Designs, Profile
│   ├── design/           # Redesign workflow, 3D, AR, Report, Products
│   ├── settings/         # Privacy, Delete Account, Help & FAQs
│   └── _layout.tsx       # Root layout & Theme provider
├── src/
│   ├── components/       # Reusable UI widgets (Buttons, Cards, 3D View, Sliders)
│   ├── constants/        # Space categories, design styles, budget tiers
│   ├── contexts/         # AuthContext & DesignProjectContext
│   ├── services/         # Firebase client, FastAPI client, demo fallbacks
│   ├── theme/            # Colors (#F7F8F4 palette), typography, spacing
│   └── types/            # TypeScript interfaces
├── backend/              # Python FastAPI service
│   ├── app/              # Endpoints, AI spatial engines, schemas
│   └── requirements.txt
├── firestore.rules       # Cloud Firestore security rules
└── storage.rules         # Firebase Storage security rules
```
"# Yclick-app" 
