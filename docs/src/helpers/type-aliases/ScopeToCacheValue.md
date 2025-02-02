[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / ScopeToCacheValue

# Type Alias: ScopeToCacheValue\<Fn, Config\>

> **ScopeToCacheValue**\<`Fn`, `Config`\>: `Fn` *extends* (...`args`) => infer Value ? `Config` *extends* `"expect unpacked value"` ? [`UnpackIfArray`](UnpackIfArray.md)\<`Awaited`\<`Value`\>\> : `Awaited`\<`Value`\> : `never`

Defined in: [src/helpers.ts:137](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/helpers.ts#L137)

Take a function `Fn` and return the "value" type representing the memoized
value mapped to a [CacheKey](CacheKey.md). This is the "cached" value returned by a
memoized function with matching inputs (i.e. "id components").

## Type Parameters

• **Fn** *extends* [`CacheScope`](CacheScope.md)

• **Config** *extends* `"expect value as-is"` \| `"expect unpacked value"`

## See

[ScopeToCacheIds](ScopeToCacheIds.md)
