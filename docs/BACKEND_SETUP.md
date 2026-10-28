# YClick Python FastAPI Backend Setup

YClick uses a Python FastAPI backend for:
- Spatial image analysis
- Image-to-image AI redesign generation (supporting OpenAI, Stability AI, Replicate, or mock providers)
- Practical improvement recommendations
- Curated interior product retrieval

---

## 1. Prerequisites

- Python 3.10+ (Tested with Python 3.14 on Windows)
- `pip` package manager

---

## 2. Installation Steps (Windows PowerShell)

Open a new PowerShell terminal and navigate to the project directory:

```powershell
cd "f:\New folder\backend"
```

Create and activate a virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

---

## 3. Configure Environment Variables

Create `.env` from the example:

```powershell
cp .env.example .env
```

Edit `.env` to configure your preferred AI provider:

```env
PORT=8000
HOST=0.0.0.0
AI_IMAGE_PROVIDER=mock   # Options: mock, openai, stability, replicate
OPENAI_API_KEY=your_key_here
```

---

## 4. Running the Development Server

Start the FastAPI server:

```powershell
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Test that the backend is live:

- Health check: `http://localhost:8000/health`
- Interactive Swagger docs: `http://localhost:8000/docs`

---

## 5. Android Emulator vs Physical Device IP

- **Android Emulator**: In the Expo app `.env`, set:
  ```env
  EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
  ```
  *(10.0.2.2 is the special Android loopback address that maps to your Windows PC's localhost)*

- **Physical Android Phone**: Find your Windows PC's local Wi-Fi IP address:
  ```powershell
  ipconfig
  ```
  Look for `IPv4 Address` (e.g. `192.168.1.150`). In `.env`, set:
  ```env
  EXPO_PUBLIC_API_URL=http://192.168.1.150:8000
  ```
  Ensure your phone and computer are connected to the same Wi-Fi network.
