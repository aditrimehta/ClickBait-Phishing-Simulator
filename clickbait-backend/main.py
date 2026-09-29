from fastapi import FastAPI, Request, HTTPException
from datetime import datetime, timezone
from database import get_connection
from pydantic import BaseModel
from pwdlib import PasswordHash
from fastapi.middleware.cors import CORSMiddleware
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

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

BASE_URL = "http://127.0.0.1:8000"
COMPANY_NAME = "Acme Corp"

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

        # Latest simulation_log status per employee, pulled from the DB
        # (persists across restarts, unlike the old in-memory lists).
        cursor.execute(
            """
            SELECT DISTINCT ON (employee_id)
                employee_id, status
            FROM simulation_log
            ORDER BY employee_id, sent_at DESC;
            """
        )
        latest_status_rows = cursor.fetchall()
        latest_status_by_employee = {
            str(r[0]): r[1] for r in latest_status_rows
        }

        employees = []
        for row in rows:
            employee_id = str(row[0])
            log_status = latest_status_by_employee.get(employee_id)

            if log_status == "clicked":
                status = "Clicked"
                phish_outcome = "Clicked"
            elif log_status == "sent":
                status = "Sent"
                phish_outcome = None
            elif log_status == "failed":
                status = "Pending"  # failed send — treat as not yet sent
                phish_outcome = None
            else:
                status = "Pending"
                phish_outcome = None

            employees.append({
                "id": employee_id,
                "employee_number": (
                    f"{row[1]:03d}"
                    if row[1] is not None
                    else None
                ),
                "name": row[2],
                "email": row[3],
                "dept_id": str(row[4]),
                "department": row[5],
                "status": status,
                "phishOutcome": phish_outcome
            })

        return employees

    finally:
        cursor.close()
        conn.close()


@app.get("/templates")
def get_templates():
    """
    Returns the list of email templates available to pick from
    when sending a simulation. `subject` doubles as the display
    name since there's no separate `name` column on the table.
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT template_id, dept_id, subject
            FROM email_template
            ORDER BY template_id;
            """
        )

        rows = cursor.fetchall()

        templates = [
            {
                "id": str(row[0]),
                "dept_id": str(row[1]),
                "name": row[2],
            }
            for row in rows
        ]

        return templates

    finally:
        cursor.close()
        conn.close()


class SendSimulationRequest(BaseModel):
    type: str  # 'individual' or 'department'
    employee_number: str | None = None
    department: str | None = None
    template_id: str


@app.post("/send-simulation")
def send_simulation(payload: SendSimulationRequest):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 1. look up the chosen template
        cursor.execute(
            "SELECT subject, html_body FROM email_template WHERE template_id = %s;",
            (payload.template_id,)
        )
        template_row = cursor.fetchone()

        if not template_row:
            raise HTTPException(status_code=404, detail="Template not found")

        subject, html_body = template_row

        # 2. look up the target employee(s)
        if payload.type == "individual":
            if not payload.employee_number:
                raise HTTPException(status_code=400, detail="employee_number is required")

            # employee_number is an integer column in Postgres, but the
            # frontend sends a padded string like "001" — cast it here
            # instead of letting a raw int-vs-text comparison blow up.
            try:
                employee_number_int = int(payload.employee_number)
            except ValueError:
                raise HTTPException(status_code=400, detail="employee_number must be numeric")

            cursor.execute(
                """
                SELECT e.employee_id, e.employee_number, e.name, e.email, d.name
                FROM employee e
                JOIN departments d ON e.dept_id = d.dept_id
                WHERE e.employee_number = %s;
                """,
                (employee_number_int,)
            )
            rows = cursor.fetchall()

        elif payload.type == "department":
            if not payload.department:
                raise HTTPException(status_code=400, detail="department is required")

            cursor.execute(
                """
                SELECT e.employee_id, e.employee_number, e.name, e.email, d.name
                FROM employee e
                JOIN departments d ON e.dept_id = d.dept_id
                WHERE d.name = %s;
                """,
                (payload.department,)
            )
            rows = cursor.fetchall()

        else:
            raise HTTPException(status_code=400, detail="type must be 'individual' or 'department'")

        if not rows:
            raise HTTPException(status_code=404, detail="No matching employee(s) found")

        # 3. render + send for each recipient
        recipients = []

        for row in rows:
            employee = {
                "employee_id": str(row[0]),
                "employee_number": row[1],
                "name": row[2],
                "email": row[3],
                "department": row[4],
            }

            rendered_html = render_template(
                html_body, employee, COMPANY_NAME, BASE_URL,
                campaign_id=payload.template_id
            )

            record = {
                "template_id": payload.template_id,
                "subject": subject,
                "employee_id": employee["employee_id"],
                "employee_name": employee["name"],
                "employee_email": employee["email"],
                "department": employee["department"],
                "sent_at": datetime.now(timezone.utc).isoformat(),
            }

            try:
                send_email(employee["email"], subject, rendered_html)
                record["status"] = "sent"
            except Exception as e:
                record["status"] = "failed"
                record["error"] = str(e)
                # print full detail server-side so you can see exactly
                # why the send failed (auth error, missing .env, etc.)
                print(f"[SEND FAILED] {employee['email']}: {e}")

            # persist to the DB instead of an in-memory list, so it
            # survives a backend restart
            cursor.execute(
                """
                INSERT INTO simulation_log (employee_id, template_id, status)
                VALUES (%s, %s, %s);
                """,
                (employee["employee_id"], payload.template_id, record["status"])
            )

            recipients.append(record)

        conn.commit()

        failures = [r for r in recipients if r["status"] == "failed"]

        return {
            "message": f"Sent {len(recipients) - len(failures)}/{len(recipients)} email(s).",
            "recipients": recipients,
        }

    except HTTPException:
        raise
    except Exception as e:
        # Any unexpected error still gets converted into a proper HTTP
        # response here, instead of bubbling up unhandled — an unhandled
        # exception skips CORSMiddleware entirely and shows up in the
        # browser as a misleading "CORS policy" error instead of the
        # real 500.
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

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

    try:
        cursor.execute(
            """
            SELECT admin_id, name, email, password_hashed
            FROM admin
            WHERE email = %s
            """,
            (data.email,)
        )

        admin = cursor.fetchone()

        if not admin:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        admin_id, name, email, password_hashed = admin

        try:
            valid = password_hash.verify(data.password, password_hashed)
        except Exception as e:
            # e.g. UnknownHashError if the stored hash isn't in a format
            # pwdlib recognizes — treat it as a real 500, not a silent crash
            raise HTTPException(
                status_code=500,
                detail=f"Password verification failed: {e}"
            )

        if not valid:
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

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    finally:
        cursor.close()
        conn.close()

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
def track_click(
    campaign_id: str,
    employee_id: str,
    request: Request
):
    """
    campaign_id here is actually the template_id (see render_template).
    Flips the most recent matching simulation_log row to 'clicked'.
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE simulation_log
            SET status = 'clicked', clicked_at = NOW()
            WHERE log_id = (
                SELECT log_id FROM simulation_log
                WHERE employee_id = %s AND template_id = %s
                ORDER BY sent_at DESC
                LIMIT 1
            );
            """,
            (employee_id, campaign_id)
        )
        conn.commit()

        return {
            "message": "Training activity recorded."
        }
    finally:
        cursor.close()
        conn.close()


@app.get("/dashboard")
def dashboard():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT COUNT(*) FROM simulation_log WHERE status = 'clicked';")
        total_clicks = cursor.fetchone()[0]

        cursor.execute(
            """
            SELECT employee_id, template_id, status, sent_at, clicked_at
            FROM simulation_log
            WHERE status = 'clicked'
            ORDER BY clicked_at DESC;
            """
        )
        rows = cursor.fetchall()
        clicks = [
            {
                "employee_id": str(r[0]),
                "template_id": str(r[1]),
                "status": r[2],
                "sent_at": r[3].isoformat() if r[3] else None,
                "clicked_at": r[4].isoformat() if r[4] else None,
            }
            for r in rows
        ]

        return {
            "total_clicks": total_clicks,
            "clicks": clicks
        }
    finally:
        cursor.close()
        conn.close()

def render_template(html_body, employee, company_name, base_url, campaign_id):
    # Reuses your existing /track/{campaign_id}/{employee_id} endpoint,
    # which already logs into `clicks`. template_id doubles as the
    # campaign_id since there's no separate campaigns table yet.
    tracking_link = f"{base_url}/track/{campaign_id}/{employee['employee_id']}"

    html = html_body
    html = html.replace("{{name}}", employee["name"])
    html = html.replace("{{employee_email}}", employee["email"])
    html = html.replace("{{company_name}}", company_name)
    html = html.replace("{{tracking_link}}", tracking_link)
    return html


def send_email(to_email, subject, html_body):
    """
    Sends a real email via Gmail SMTP. Raises on failure so the
    caller can decide how to record/report it per recipient.
    """
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        raise RuntimeError(
            "GMAIL_USER / GMAIL_APP_PASSWORD not set in .env"
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = GMAIL_USER
    msg["To"] = to_email

    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())