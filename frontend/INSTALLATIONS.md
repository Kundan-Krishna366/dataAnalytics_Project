##  Prerequisites

Before starting, ensure you have the following installed:
* **Python 3.10+** (Check with `python --version`)
* **Node.js 18+** (Check with `node -v`)
* **Git**
* A **Groq API Key** — [Get it here](https://console.groq.com/keys)

---

##  1. Backend Setup (FastAPI)

1. **Navigate to the backend folder:**
   ```bash
   cd backend

    Create and activate a virtual environment:

        Linux/macOS:
        Bash

python -m venv venv
source venv/bin/activate

Windows:
Bash

        python -m venv venv
        .\venv\Scripts\activate

    Install Python dependencies:

Bash

   pip install -r requirements.txt

    Configure Environment Variables:
    Create a file named .env in the backend/ directory:
    Code snippet

GROQ_API_KEY=your_actual_api_key_here

Start the server:
Bash

    uvicorn main:app --reload --port 8000

        Backend will be running at: http://localhost:8000

 2. Frontend Setup (Next.js)

    Open a new terminal tab and navigate to the folder:
    Bash

cd frontend

Install Node dependencies:
Bash

npm install

Configure Environment Variables:
Create a file named .env.local in the frontend/ directory:
Code snippet

NEXT_PUBLIC_API_URL=http://localhost:8000

Start the development server:
Bash

    npm run dev

        Frontend will be running at: http://localhost:3000

 3. Verification

    Open your browser to http://localhost:3000.

    Ensure the top status bar says SYSTEM_READY // LOCALHOST.

    Try uploading a sample PDF and asking: "Summarize this document."

 Common Issues

    CORS Error: Verify that main.py allows http://localhost:3000.

    Port Conflict: If port 8000 is taken, use uvicorn main:app --port 8001 and update .env.local.