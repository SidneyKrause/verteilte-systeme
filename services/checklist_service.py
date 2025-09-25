from fastapi import HTTPException
from pymongo import ReturnDocument
from schemas.checklist_schema import Checklist
from db import client


def save_checklist(checklist_data: Checklist) -> dict:
    """
    Save or update the checklist for a user.

    :param checklist_data: Checklist Pydantic object containing user_id and items
    :return: The saved checklist document
    """
    user_id = checklist_data.user_id
    checklist_dict = checklist_data.model_dump()
    client.db.checklists.create_index("user_id", unique=True)
    result = client.db.checklists.find_one_and_replace(
        {"user_id": user_id},
        checklist_dict,
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    return result


def get_checklist(user_id: str) -> dict:
    checklist = client.db.checklists.find_one({"user_id": user_id})
    if not checklist:
        raise HTTPException(
            status_code=404, detail="Checklist not found for this user."
        )

    checklist["_id"] = str(checklist["_id"])
    return checklist
