"""Create or refresh the default security training email template.

Run from clickbait-backend/ with the project's database configuration loaded:
    python seed_training_template.py
"""

from pathlib import Path

from database import get_connection


SUBJECT = "Complete your security awareness training"
TEMPLATE_PATH = (
    Path(__file__).resolve().parent.parent
    / "clickbait-frontend"
    / "src"
    / "email-templates"
    / "security-training.html"
)


def seed_training_template():
    html_body = TEMPLATE_PATH.read_text(encoding="utf-8")
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                UPDATE training_template
                SET html_body = %s
                WHERE subject = %s;
                """,
                (html_body, SUBJECT),
            )
            updated_count = cursor.rowcount
            if not updated_count:
                cursor.execute(
                    """
                    INSERT INTO training_template (subject, html_body)
                    VALUES (%s, %s);
                    """,
                    (SUBJECT, html_body),
                )
        conn.commit()
        action = "Updated" if updated_count else "Inserted"
        print(f"{action} the default security training email template.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    seed_training_template()
