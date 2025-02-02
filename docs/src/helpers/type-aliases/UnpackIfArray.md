[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / UnpackIfArray

# Type Alias: UnpackIfArray\<T\>

> **UnpackIfArray**\<`T`\>: `T` *extends* infer U[] ? `U` : `T`

Defined in: [src/helpers.ts:67](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/helpers.ts#L67)

If `T` is an array, i.e. `U[]`, return `U`. Otherwise, return `T` as-is.

This is referred to throughout this codebase as "unwrapping" `T`.

## Type Parameters

• **T**
