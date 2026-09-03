from fastapi import FastAPI, Request
from datetime import datetime, timezone

app = FastAPI()

clicks = []


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