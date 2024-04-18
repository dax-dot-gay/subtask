from datetime import timedelta
import json
from typing import Type, TypeVar
from pydantic import BaseModel, Field
from secrets import token_urlsafe
from litestar.stores.base import Store
from beanie import Document


class BaseObject(Document):
    """Base type for all objects stored in MongoDB"""

    id: str = Field(default_factory=lambda: token_urlsafe(32))

    @classmethod
    async def from_query(
        cls: Type["TBase"],
        query: dict = {},
        limit: int | None = None,
        sorting: list[str] | None = None,
    ) -> list["TBase"]:
        """Fetches a list of Objects from a query

        Arguments:
            query (dict, optional): A MongoDB query dictionary to filter by. Defaults to {}.
            limit (int | None): The max number of results to return, or None for no maximum. Defaults to None.
            sorting (list[str] | None): A list of sorting criteria ("+/-<field>" format). Defaults to None.

        Returns:
            list[BaseObject]: List of results
        """
        assembled = cls.find(query, limit=limit, with_children=True)
        if sorting:
            assembled = assembled.sort(*sorting)

        results = [i async for i in assembled]
        return results

    @classmethod
    async def from_id(cls: Type["TBase"], id: str) -> "TBase | None":
        """Gets a single result by ID

        Args:
            id (str): ID to search for

        Returns:
            TBase | None: The located Object, or None if not found.
        """
        result = await cls.get(id, with_children=True)
        return result


class BaseStoredObject(BaseModel):
    """Base type for all objects stored in Redis"""

    id: str = Field(default_factory=lambda: token_urlsafe(32))

    async def to_storage(self, store: Store, expire: int | timedelta | None = None):
        """Serializes the Object and places it in storage

        Args:
            store (Store): Store to place the Object in
            expire (int | timedelta | None, optional): When to expire (seconds). Defaults to None.
        """
        encoded = self.model_dump_json().encode()
        await store.set(self.id, encoded, expires_in=expire)

    @classmethod
    async def from_storage(
        cls: Type["TBaseStored"],
        store: Store,
        id: str,
        renew: int | timedelta | None = None,
    ) -> "TBaseStored | None":
        """Retrieves an Object from storage

        Args:
            cls (Type[&quot;TBaseStored&quot;]): _description_
            store (Store): The Store to search
            id (str): ID to retrieve
            renew (int | timedelta | None, optional): How long to renew the expiry, if at all. Defaults to None.

        Returns:
            TBaseStored | None: The located Object, or None if not found.
        """
        result = await store.get(id, renew_for=renew)
        if result:
            return cls(**json.loads(result.decode()))
        else:
            return None

    async def delete(self, store: Store):
        """Deletes this Object from the specified Store

        Args:
            store (Store): Store to delete from
        """
        await store.delete(self.id)


TBase = TypeVar("TBase", bound=BaseObject)
TBaseStored = TypeVar("TBaseStored", bound=BaseStoredObject)
