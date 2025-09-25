from pydantic import BaseModel, Field
from typing import List


class ChecklistItem(BaseModel):
    label: str = Field(
        ...,
        title="Checklist Label",
        description="The label or name of the checklist item",
    )
    checked: bool = Field(
        False, title="Checked", description="Whether the item is checked or not"
    )


class Checklist(BaseModel):
    user_id: str = Field(
        ..., title="User ID", description="Unique identifier for the user"
    )
    items: List[ChecklistItem] = Field(
        ..., title="Checklist Items", description="A list of checklist items"
    )
