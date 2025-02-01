[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / CacheScope

# Type Alias: CacheScope()

> **CacheScope**: (...`args`) => `unknown`

Defined in: [src/helpers.ts:20](https://github.com/Xunnamius/memoize/blob/283d7337c9ac22bf4837dd729f73aabb00c33795/src/helpers.ts#L20)

A _cache scope_ is used to ensure the generation of unique [CacheKey](CacheKey.md)s
for different memoized functions that accept otherwise-identical parameters.

Any function-looking object—specifically: an object with a `name` property—is
acceptable.

## Parameters

### args

...`never`[]

## Returns

`unknown`
