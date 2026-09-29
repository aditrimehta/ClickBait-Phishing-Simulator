"""
Creates the simulation_log table, which persists every simulated send
and every recorded click — replacing the in-memory `clicks` /
`sent_simulations` lists in main.py.

Run once from clickbait-backend/:
    python create_simulation_log_table.py
"""

from database import get_connection

def create_table(conn):
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS simulation_log (
            log_id SERIAL PRIMARY KEY,
            employee_id UUID NOT NULL REFERENCES employee(employee_id),
            template_id UUID NOT NULL REFERENCES email_template(template_id),
            status TEXT NOT NULL DEFAULT 'sent',  -- 'sent', 'failed', 'clicked'
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            clicked_at TIMESTAMP
        );
    """)
    conn.commit()
    cur.close()
    print("simulation_log table ready.")


if __name__ == "__main__":
    conn = get_connection()
    create_table(conn)
    conn.close()