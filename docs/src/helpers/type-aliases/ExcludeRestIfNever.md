[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / ExcludeRestIfNever

# Type Alias: ExcludeRestIfNever\<Rest, T\>

> **ExcludeRestIfNever**\<`Rest`, `T`\>: `Rest` *extends* `never`[] ? \[[`UnwrapIfArray`](UnwrapIfArray.md)\<`T`\>\] : \[`...Rest`, [`UnwrapIfArray`](UnwrapIfArray.md)\<`T`\>\]

Defined in: src/helpers.ts:75

If `Rest`, representing one or more elements at the end of an array, is
`never` (i.e. the array has no other elements), return a single-element array
of `T` "unwrapped". Otherwise, return the `Rest` array with `T` concatenated
to the end.

## Type Parameters

• **Rest** *extends* `unknown`[]

• **T**
