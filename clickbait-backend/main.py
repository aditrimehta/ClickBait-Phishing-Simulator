from fastapi import FastAPI, Request, HTTPException
from datetime import datetime, timezone
from database import get_connection
from pydantic import BaseModel
from pwdlib import PasswordHash
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

clicks = []

password_hash = PasswordHash.recommended()
@app.get("/employees")
def get_employees():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                e.employee_id,
                e.employee_number,
                e.name,
                e.email,
                e.dept_id,
                d.name AS department
            FROM employee e
            JOIN departments d
                ON e.dept_id = d.dept_id
            ORDER BY e.employee_number;
            """
        )

        rows = cursor.fetchall()

        employees = [
            {
                "id": str(row[0]),
                "employee_number": (
                    f"{row[1]:03d}"
                    if row[1] is not None
                    else None
                ),
                "name": row[2],
                "email": row[3],
                "dept_id": str(row[4]),
                "department": row[5],
                "status": "Pending",
                "phishOutcome": None
            }
            for row in rows
        ]

        return employees

    finally:
        cursor.close()
        conn.close()

class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/admin/login")
def admin_login(data: LoginRequest):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT admin_id, name, email, password_hashed
        FROM admin
        WHERE email = %s
        """,
        (data.email,)
    )

    admin = cursor.fetchone()

    cursor.close()
    conn.close()

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    admin_id, name, email, password_hashed = admin

    if not password_hash.verify(data.password, password_hashed):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "admin": {
            "admin_id": str(admin_id),
            "name": name,
            "email": email
        }
    }

@app.get("/test-db")
def test_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return {"database_time": result[0]}

@app.get("/track/{campaign_id}/{employee_id}")
async def track_click(
    campaign_id: str,
    employee_id: str,
    request: Request
):
    click = {
        "campaign_id": campaign_id,
        "employee_id": employee_id,
        "clicked": True,
        "time": datetime.now(timezone.utc).isoformat(),
        "user_agent": request.headers.get("user-agent")
    }

    clicks.append(click)

    return {
        "message": "Training activity recorded."
    }


@app.get("/dashboard")
def dashboard():
    return {
        "total_clicks": len(clicks),
        "clicks": clicks
    }