[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / WithUseCachedOption

# Type Alias: WithUseCachedOption()\<T\>

> **WithUseCachedOption**\<`T`\>: (...`args`) => `ReturnType`\<`T`\>

Defined in: [src/helpers.ts:83](https://github.com/Xunnamius/memoize/blob/283d7337c9ac22bf4837dd729f73aabb00c33795/src/helpers.ts#L83)

Return a function `T` that accepts `frameworkOptions` via an additional final
parameter.

## Type Parameters

• **T** *extends* [`CacheScope`](CacheScope.md)

## Parameters

### args

...\[`...Parameters<T>`, `object`\]

## Returns

`ReturnType`\<`T`\>
