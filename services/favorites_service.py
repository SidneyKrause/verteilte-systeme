from db import client


def save_favorites(user_id: str, favorites: list) -> list:
    client.db.favorites.update_one(
        {"user_id": str(user_id)},
        {"$set": {"favorites": favorites}},
        upsert=True,
    )
    return favorites


def get_favorites(user_id: str) -> list:
    doc = client.db.favorites.find_one({"user_id": user_id})
    return doc.get("favorites", []) if doc else []


def fav_delete(user_id: str, city_class: str):
    client.db.favorites.update_one(
        {"user_id": user_id},
        {"$pull": {"favorites": {"class_id": city_class}}},
    )
