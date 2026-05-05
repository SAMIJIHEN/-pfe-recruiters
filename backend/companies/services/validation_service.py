# backend/companies/services/validation_service.py

def is_invalid_clerk_id(clerk_user_id):
    if not clerk_user_id:
        return True
    clerk_user_id = str(clerk_user_id).strip()
    invalid_values = {"", "null", "undefined", "temp_id"}
    return clerk_user_id in invalid_values or clerk_user_id.startswith("temp_")


def get_request_identity(request):
    headers = request.headers
    data = request.data

    clerk_user_id = headers.get("X-Clerk-User-Id") or data.get("clerk_user_id")
    email = headers.get("X-User-Email") or data.get("email")
    first_name = (
        headers.get("X-User-Firstname")
        or data.get("first_name")
        or data.get("firstName")
    )
    last_name = (
        headers.get("X-User-Lastname")
        or data.get("last_name")
        or data.get("lastName")
    )

    if is_invalid_clerk_id(clerk_user_id):
        clerk_user_id = None

    return {
        "clerk_user_id": clerk_user_id,
        "email": email,
        "first_name": first_name or "",
        "last_name": last_name or "",
    }


def get_value(data, snake_key, camel_key=None, default=""):
    if snake_key in data:
        return data.get(snake_key, default)
    if camel_key and camel_key in data:
        return data.get(camel_key, default)
    return default


def to_bool(value):
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in {"true", "1", "yes", "oui"}