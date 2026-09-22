"""Thread-safe in-memory cache manager with TTL and optional Redis support."""

import asyncio
import logging
import time
from typing import Any, Dict, Optional, Tuple
from app.config import settings

logger = logging.getLogger("scraper_service.cache")


class CacheManager:
    """Cache manager supporting memory TTL storage with optional Redis backend."""

    def __init__(self, default_ttl: int = settings.CACHE_TTL_SECONDS, redis_url: Optional[str] = settings.REDIS_URL):
        self.default_ttl = default_ttl
        self.redis_url = redis_url
        self._memory_store: Dict[str, Tuple[Any, float]] = {}  # key -> (value, expire_at)
        self._lock = asyncio.Lock()
        self._redis_client = None
        self._has_redis = False

        if self.redis_url:
            self._init_redis()

    def _init_redis(self) -> None:
        """Attempt to initialize Redis connection."""
        try:
            import redis.asyncio as aioredis
            self._redis_client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=3.0,
            )
            self._has_redis = True
            logger.info("Redis cache backend configured: %s", self.redis_url)
        except ImportError:
            logger.warning("redis library not installed. Falling back to in-memory cache.")
            self._has_redis = False
        except Exception as e:
            logger.warning("Could not connect to Redis (%s). Falling back to memory cache.", e)
            self._has_redis = False

    async def get(self, key: str) -> Optional[Any]:
        """Retrieve a value from cache if it exists and has not expired."""
        if self._has_redis and self._redis_client is not None:
            try:
                import json
                val = await self._redis_client.get(key)
                if val is not None:
                    return json.loads(val)
            except Exception as e:
                logger.error("Redis get failed for key %s: %s. Checking memory cache.", key, e)

        async with self._lock:
            if key in self._memory_store:
                val, expire_at = self._memory_store[key]
                if time.time() < expire_at:
                    return val
                else:
                    del self._memory_store[key]
            return None

    async def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """Store a value in cache with a time-to-live."""
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl

        if self._has_redis and self._redis_client is not None:
            try:
                import json
                serialized = json.dumps(value, default=str)
                await self._redis_client.set(key, serialized, ex=ttl)
            except Exception as e:
                logger.error("Redis set failed for key %s: %s", key, e)

        async with self._lock:
            expire_at = time.time() + ttl
            self._memory_store[key] = (value, expire_at)

    async def delete(self, key: str) -> None:
        """Delete a key from cache."""
        if self._has_redis and self._redis_client is not None:
            try:
                await self._redis_client.delete(key)
            except Exception as e:
                logger.error("Redis delete failed for key %s: %s", key, e)

        async with self._lock:
            self._memory_store.pop(key, None)

    async def clear(self) -> None:
        """Clear all keys in memory cache."""
        if self._has_redis and self._redis_client is not None:
            try:
                await self._redis_client.flushdb()
            except Exception as e:
                logger.error("Redis clear failed: %s", e)

        async with self._lock:
            self._memory_store.clear()

    async def cleanup_expired(self) -> int:
        """Remove expired keys to free memory."""
        now = time.time()
        expired_keys = []
        async with self._lock:
            for k, (_, expire_at) in self._memory_store.items():
                if now >= expire_at:
                    expired_keys.append(k)
            for k in expired_keys:
                del self._memory_store[k]
        return len(expired_keys)


# Singleton cache instance
cache = CacheManager()

