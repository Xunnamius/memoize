[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / UnwrapIfArray

# Type Alias: UnwrapIfArray\<T\>

> **UnwrapIfArray**\<`T`\>: `T` *extends* infer U[] ? `U` : `T`

Defined in: [src/helpers.ts:67](https://github.com/Xunnamius/memoize/blob/283d7337c9ac22bf4837dd729f73aabb00c33795/src/helpers.ts#L67)

If `T` is an array, i.e. `U[]`, return `U`. Otherwise, return `T` as-is.

This is referred to throughout this codebase as "unwrapping" `T`.

## Type Parameters

• **T**
