"""Emergency report API.  Run:  uvicorn main:app --reload --port 8000"""
import json
import os
from contextlib import contextmanager
from typing import Any, Optional

import psycopg2
from psycopg2.extras import Json, RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()
DATABASE_URL = os.environ["DATABASE_URL"]
ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]

pool = SimpleConnectionPool(1, 10, DATABASE_URL)


@contextmanager
def db():
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)


def init_schema():
    with open(os.path.join(os.path.dirname(__file__), "schema.sql")) as f:
        with db() as cur:
            cur.execute(f.read())


app = FastAPI(title="Evacuation Twin Reports")
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def _startup():
    init_schema()


class ReportIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    emergency_type: str = Field(min_length=1, max_length=100)
    severity: str = Field(default="medium", pattern="^(low|medium|high|critical)$")
    reporter_name: str = Field(default="", max_length=120)
    location: str = Field(default="", max_length=200)
    summary: str = ""
    actions_taken: str = ""
    recommendations: str = ""
    total_people: int = 0
    evacuated: int = 0
    casualties: int = 0
    evacuation_secs: Optional[float] = None
    metrics: dict[str, Any] = Field(default_factory=dict)


LIST_COLS = ("id, title, emergency_type, severity, location, total_people, "
             "evacuated, casualties, evacuation_secs, created_at")


@app.post("/api/reports", status_code=201)
def create_report(r: ReportIn):
    with db() as cur:
        cur.execute(
            """INSERT INTO emergency_reports
               (title, emergency_type, severity, reporter_name, location, summary,
                actions_taken, recommendations, total_people, evacuated, casualties,
                evacuation_secs, metrics)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               RETURNING *""",
            (r.title, r.emergency_type, r.severity, r.reporter_name, r.location, r.summary,
             r.actions_taken, r.recommendations, r.total_people, r.evacuated, r.casualties,
             r.evacuation_secs, Json(r.metrics)),
        )
        return _ser(cur.fetchone())


@app.get("/api/reports")
def list_reports(limit: int = 100, offset: int = 0):
    with db() as cur:
        cur.execute(f"SELECT {LIST_COLS} FROM emergency_reports "
                    "ORDER BY created_at DESC LIMIT %s OFFSET %s", (limit, offset))
        return [_ser(r) for r in cur.fetchall()]


@app.get("/api/reports/{report_id}")
def get_report(report_id: int):
    with db() as cur:
        cur.execute("SELECT * FROM emergency_reports WHERE id=%s", (report_id,))
        row = cur.fetchone()
    if not row:
        raise HTTPException(404, "Report not found")
    return _ser(row)


@app.delete("/api/reports/{report_id}", status_code=204)
def delete_report(report_id: int):
    with db() as cur:
        cur.execute("DELETE FROM emergency_reports WHERE id=%s", (report_id,))
        if cur.rowcount == 0:
            raise HTTPException(404, "Report not found")


def _ser(row):
    row = dict(row)
    if row.get("created_at"):
        row["created_at"] = row["created_at"].isoformat()
    return row
