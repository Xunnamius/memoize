[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / InternalScopedCacheEntry

# Type Alias: InternalScopedCacheEntry

> **InternalScopedCacheEntry**: `Map`\<[`CacheKey`](CacheKey.md), \{ `timer`: `ReturnType`\<*typeof* `setTimeout`\> \| `undefined`; `value`: `unknown`; `wasPromised`: `boolean`; \}\>

Defined in: src/helpers.ts:30

The shape of the internal memoization cache entry.
