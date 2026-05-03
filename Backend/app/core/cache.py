"""
LRU Cache utilities for reducing database load.
Provides decorators and utility functions for caching frequently accessed data.
Uses Python's functools.lru_cache for synchronous operations and custom TTL cache for async operations.
"""

from functools import lru_cache, wraps
from typing import Any, Callable, TypeVar, cast, Dict, Tuple
import time
import asyncio
from collections import OrderedDict

# Type variable for generic decorator
F = TypeVar('F', bound=Callable[..., Any])

class CacheStats:
    """Tracks cache hits, misses, and evictions."""
    def __init__(self):
        self.hits = 0
        self.misses = 0
        self.evictions = 0
    
    def __repr__(self):
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return f"Hits: {self.hits}, Misses: {self.misses}, Hit Rate: {hit_rate:.1f}%"


# Global cache stats tracker
_cache_stats = CacheStats()


class AsyncLRUCache:
    """Thread-safe async-compatible LRU cache with TTL support."""
    
    def __init__(self, maxsize: int = 128, ttl_seconds: int = 3600):
        self.maxsize = maxsize
        self.ttl_seconds = ttl_seconds
        self.cache: OrderedDict = OrderedDict()
        self.lock = asyncio.Lock()
    
    async def get(self, key: Any) -> Tuple[bool, Any]:
        """Get value from cache. Returns (found, value) tuple."""
        async with self.lock:
            if key not in self.cache:
                _cache_stats.misses += 1
                return False, None
            
            value, timestamp = self.cache[key]
            if time.time() - timestamp > self.ttl_seconds:
                # Expired
                del self.cache[key]
                _cache_stats.evictions += 1
                _cache_stats.misses += 1
                return False, None
            
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            _cache_stats.hits += 1
            return True, value
    
    async def set(self, key: Any, value: Any) -> None:
        """Set value in cache."""
        async with self.lock:
            if key in self.cache:
                self.cache.move_to_end(key)
            self.cache[key] = (value, time.time())
            
            # Remove oldest if exceeds maxsize
            while len(self.cache) > self.maxsize:
                oldest_key, _ = self.cache.popitem(last=False)
                _cache_stats.evictions += 1
    
    async def clear(self) -> None:
        """Clear all cache entries."""
        async with self.lock:
            self.cache.clear()


# Global async cache instances for different data types
_jobs_cache = AsyncLRUCache(maxsize=256, ttl_seconds=1800)  # 30 min for jobs
_profile_cache = AsyncLRUCache(maxsize=512, ttl_seconds=3600)  # 1 hour for profiles
_dashboard_cache = AsyncLRUCache(maxsize=256, ttl_seconds=900)  # 15 min for dashboard
_departments_cache = AsyncLRUCache(maxsize=64, ttl_seconds=7200)  # 2 hours for static data
_companies_cache = AsyncLRUCache(maxsize=64, ttl_seconds=7200)  # 2 hours for static data


def timed_lru_cache(maxsize: int = 128, ttl_seconds: int = 3600):
    """
    LRU Cache decorator with TTL (Time To Live) for synchronous functions.
    
    Args:
        maxsize: Maximum number of cached items (default: 128)
        ttl_seconds: Time to live for cached items in seconds (default: 1 hour)
    
    Example:
        @timed_lru_cache(maxsize=256, ttl_seconds=1800)
        def get_departments():
            return db.query()
    """
    def decorator(func: F) -> F:
        cache_with_time: Dict[Any, Tuple[Any, float]] = {}
        cache_order = []
        
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Create a hashable key from arguments
            try:
                key = (args, tuple(sorted(kwargs.items())))
            except TypeError:
                key = str((args, kwargs))
            
            current_time = time.time()
            
            # Check if key exists and is not expired
            if key in cache_with_time:
                cached_value, cached_time = cache_with_time[key]
                if current_time - cached_time < ttl_seconds:
                    _cache_stats.hits += 1
                    return cached_value
                else:
                    # Expired, remove it
                    del cache_with_time[key]
                    if key in cache_order:
                        cache_order.remove(key)
                    _cache_stats.evictions += 1
            
            # Cache miss - call the function
            _cache_stats.misses += 1
            result = func(*args, **kwargs)
            
            # Store result with current timestamp
            cache_with_time[key] = (result, current_time)
            cache_order.append(key)
            
            # Implement LRU: Remove oldest if exceeds maxsize
            if len(cache_order) > maxsize:
                oldest_key = cache_order.pop(0)
                if oldest_key in cache_with_time:
                    del cache_with_time[oldest_key]
                    _cache_stats.evictions += 1
            
            return result
        
        # Attach cache control functions
        wrapper.cache_clear = lambda: (cache_with_time.clear(), cache_order.clear())  # type: ignore
        wrapper.get_stats = lambda: f"{func.__name__}: {len(cache_with_time)} items cached"  # type: ignore
        
        return cast(F, wrapper)
    
    return decorator


def simple_lru_cache(maxsize: int = 128):
    """
    Simple LRU cache without TTL using Python's built-in functools.lru_cache.
    Best for static data that rarely changes.
    
    Args:
        maxsize: Maximum number of cached items (default: 128)
    """
    def decorator(func: F) -> F:
        cached_func = lru_cache(maxsize=maxsize)(func)
        
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            result = cached_func(*args, **kwargs)
            return result
        
        wrapper.cache_clear = cached_func.cache_clear  # type: ignore
        wrapper.cache_info = cached_func.cache_info  # type: ignore
        
        return cast(F, wrapper)
    
    return decorator


def get_cache_stats() -> Dict[str, Any]:
    """Get global cache statistics."""
    return {
        "total_hits": _cache_stats.hits,
        "total_misses": _cache_stats.misses,
        "total_evictions": _cache_stats.evictions,
        "overall_hit_rate": _cache_stats.hits / (_cache_stats.hits + _cache_stats.misses) 
                           if (_cache_stats.hits + _cache_stats.misses) > 0 else 0,
    }


def reset_cache_stats() -> None:
    """Reset cache statistics."""
    global _cache_stats
    _cache_stats = CacheStats()


async def clear_all_caches() -> None:
    """Clear all async caches and optionally reset stats."""
    await _jobs_cache.clear()
    await _profile_cache.clear()
    await _dashboard_cache.clear()
    await _departments_cache.clear()
    await _companies_cache.clear()


def get_async_cache(cache_type: str) -> AsyncLRUCache:
    """Get a specific async cache by type."""
    caches = {
        "jobs": _jobs_cache,
        "profile": _profile_cache,
        "dashboard": _dashboard_cache,
        "departments": _departments_cache,
        "companies": _companies_cache,
    }
    return caches.get(cache_type, _jobs_cache)
