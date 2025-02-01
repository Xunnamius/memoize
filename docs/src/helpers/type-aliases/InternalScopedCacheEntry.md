[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / InternalScopedCacheEntry

# Type Alias: InternalScopedCacheEntry

> **InternalScopedCacheEntry**: `Map`\<[`CacheKey`](CacheKey.md), \{ `timer`: `ReturnType`\<*typeof* `setTimeout`\> \| `undefined`; `value`: `unknown`; `wasPromised`: `boolean`; \}\>

Defined in: [src/helpers.ts:30](https://github.com/Xunnamius/memoize/blob/283d7337c9ac22bf4837dd729f73aabb00c33795/src/helpers.ts#L30)

The shape of the internal memoization cache entry.
