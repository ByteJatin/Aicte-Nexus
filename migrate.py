"""Apply versioned schema upgrades before deploying the API."""

from pathlib import Path

from alembic import command
from alembic.config import Config


def main():
    root = Path(__file__).resolve().parent
    command.upgrade(Config(str(root / "backend" / "alembic.ini")), "head")
    print("Database migrations completed.")


if __name__ == "__main__":
    main()
