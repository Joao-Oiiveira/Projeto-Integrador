from app.core.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text('ALTER TABLE eventos ADD COLUMN cor VARCHAR(7) DEFAULT "#3B82F6"'))
    conn.commit()
