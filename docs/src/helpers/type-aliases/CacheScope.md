[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / CacheScope

# Type Alias: CacheScope()

> **CacheScope**: (...`args`) => `unknown`

Defined in: [src/helpers.ts:20](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/helpers.ts#L20)

A _cache scope_ is used to ensure the generation of unique [CacheKey](CacheKey.md)s
for different memoized functions that accept otherwise-identical parameters.

Any function-looking object—specifically: an object with a `name` property—is
acceptable.

## Parameters

### args

...`never`[]

## Returns

`unknown`
