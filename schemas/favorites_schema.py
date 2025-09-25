from pydantic import BaseModel, Field
from typing import List


class FavoriteCity(BaseModel):
    class_id: str = Field(
        ...,
        title="City Class ID",
        description="Unique city identifier class",
        alias="class",
    )
    name: str = Field(..., title="City Name", description="Name of the city")
    population: str = Field(
        ..., title="Population", description="Population of the city"
    )
    country: str = Field(..., title="Country", description="Country name")
    flag: str = Field(
        ..., title="Flag URL", description="URL to the country flag image"
    )
    imageUrl: str = Field(
        ..., title="City Image URL", description="URL to the city image"
    )


class FavoriteCities(BaseModel):
    favorites: List[FavoriteCity]
