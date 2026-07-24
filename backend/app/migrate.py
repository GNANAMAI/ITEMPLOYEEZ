"""SQLite column migration for dev databases."""

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def _add_missing_columns(conn, table: str, existing: set[str], additions: dict[str, str]) -> None:
    for column, statement in additions.items():
        if column not in existing:
            conn.execute(text(statement))


def migrate_sqlite_schema(engine: Engine) -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        if "product_details" in tables:
            existing = {col["name"] for col in inspector.get_columns("product_details")}
            _add_missing_columns(
                conn,
                "product_details",
                existing,
                {
                    "subtitle": "ALTER TABLE product_details ADD COLUMN subtitle VARCHAR(500)",
                    "price_paise": "ALTER TABLE product_details ADD COLUMN price_paise INTEGER DEFAULT 9900",
                    "billing_period": "ALTER TABLE product_details ADD COLUMN billing_period VARCHAR(20) DEFAULT 'yearly'",
                    "razorpay_plan_id": "ALTER TABLE product_details ADD COLUMN razorpay_plan_id VARCHAR(100)",
                },
            )

        if "community_posts" in tables:
            existing = {col["name"] for col in inspector.get_columns("community_posts")}
            _add_missing_columns(
                conn,
                "community_posts",
                existing,
                {
                    "status": "ALTER TABLE community_posts ADD COLUMN status VARCHAR(20) DEFAULT 'open'",
                    "company": "ALTER TABLE community_posts ADD COLUMN company VARCHAR(255)",
                    "location": "ALTER TABLE community_posts ADD COLUMN location VARCHAR(255)",
                    "contact_info": "ALTER TABLE community_posts ADD COLUMN contact_info VARCHAR(500)",
                    "resolved_by_user_id": "ALTER TABLE community_posts ADD COLUMN resolved_by_user_id INTEGER",
                    "resolved_at": "ALTER TABLE community_posts ADD COLUMN resolved_at DATETIME",
                },
            )

        if "community_memberships" in tables:
            existing = {col["name"] for col in inspector.get_columns("community_memberships")}
            _add_missing_columns(
                conn,
                "community_memberships",
                existing,
                {
                    "is_expert": "ALTER TABLE community_memberships ADD COLUMN is_expert BOOLEAN DEFAULT 0",
                    "expert_headline": "ALTER TABLE community_memberships ADD COLUMN expert_headline VARCHAR(255)",
                    "expert_bio": "ALTER TABLE community_memberships ADD COLUMN expert_bio TEXT",
                },
            )
