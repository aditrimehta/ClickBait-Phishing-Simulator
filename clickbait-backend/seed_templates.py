"""
Wipes email_template and re-inserts all 7 templates fresh:
2 generic (IT dept) + 5 department-specific (one per dept).

Run from inside clickbait-backend/:
    python seed_all_templates.py
"""

from database import get_connection

# dept_id values from your departments table
DEPT_IDS = {
    "HR": "12f798f7-f66f-411c-9920-30416e64a397",
    "Marketing": "1753a1f5-dca4-41b6-95c1-a04386a79b66",
    "IT": "4e253146-609b-4a87-85b9-6bfa0f629711",
    "Finance": "91e1c1d2-e589-4648-add7-5aef56272eca",
    "Sales": "99bec8e5-f854-4d1e-a10e-71b6bd5d5826",
}

# All paths are flat inside clickbait-frontend/src/email-templates/
TEMPLATES_DIR = "../clickbait-frontend/src/email-templates"

TEMPLATES = [
    {
        "dept": "IT",
        "subject": "Action Required: Your password expires in 24 hours",
        "file": "password-expiry.html",
    },
    {
        "dept": "IT",
        "subject": "You've been nominated — Employee Recognition Program",
        "file": "employee-recognition.html",
    },
    {
        "dept": "HR",
        "subject": "Action Required: Benefits Enrollment Closes Friday",
        "file": "HR.html",
    },
    {
        "dept": "IT",
        "subject": "Your VPN Access Has Been Suspended",
        "file": "IT.html",
    },
    {
        "dept": "Marketing",
        "subject": "A file has been shared with you: Q4 Campaign Assets",
        "file": "marketing.html",
    },
    {
        "dept": "Finance",
        "subject": "Urgent: Invoice Approval Needed Before EOD",
        "file": "finance.html",
    },
    {
        "dept": "Sales",
        "subject": "New High-Priority Lead Assigned to You",
        "file": "sales.html",
    },
]


def wipe_and_seed(conn):
    cur = conn.cursor()

    cur.execute("DELETE FROM email_template;")
    print(f"Cleared existing rows from email_template.")

    rows = []
    for t in TEMPLATES:
        file_path = f"{TEMPLATES_DIR}/{t['file']}"
        with open(file_path, "r", encoding="utf-8") as f:
            html_body = f.read()
        rows.append((DEPT_IDS[t["dept"]], t["subject"], html_body))

    cur.executemany(
        """
        INSERT INTO email_template (dept_id, subject, html_body)
        VALUES (%s, %s, %s);
        """,
        rows
    )

    conn.commit()
    print(f"Inserted {len(rows)} templates fresh.")
    cur.close()


if __name__ == "__main__":
    conn = get_connection()
    wipe_and_seed(conn)
    conn.close()