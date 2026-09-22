"""Unit tests for the CacheManager."""

import asyncio
import pytest
from app.core.cache import CacheManager


@pytest.mark.asyncio
async def test_cache_set_and_get():
    cache = CacheManager(default_ttl=5, redis_url=None)
    await cache.set("test_key", {"foo": "bar"}, ttl_seconds=2)

    val = await cache.get("test_key")
    assert val == {"foo": "bar"}

    non_existent = await cache.get("does_not_exist")
    assert non_existent is None


@pytest.mark.asyncio
async def test_cache_expiration():
    cache = CacheManager(default_ttl=1, redis_url=None)
    await cache.set("expiring_key", "temporary_value", ttl_seconds=1)

    assert await cache.get("expiring_key") == "temporary_value"

    # Wait for TTL to expire
    await asyncio.sleep(1.1)

    assert await cache.get("expiring_key") is None


@pytest.mark.asyncio
async def test_cache_delete_and_clear():
    cache = CacheManager(default_ttl=10, redis_url=None)
    await cache.set("k1", 100)
    await cache.set("k2", 200)

    assert await cache.get("k1") == 100
    await cache.delete("k1")
    assert await cache.get("k1") is None
    assert await cache.get("k2") == 200

    await cache.clear()
    assert await cache.get("k2") is None

