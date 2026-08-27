"""Small shared validators (comma-list <-> Python list helpers, etc.)."""


def csv_to_list(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def list_to_csv(values: list[str] | None) -> str | None:
    if not values:
        return None
    return ",".join(v.strip() for v in values if v.strip())
