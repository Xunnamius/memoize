[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / RecursiveUnpackArraysInArray

# Type Alias: RecursiveUnpackArraysInArray\<MaybePackedArray, Rest\>

> **RecursiveUnpackArraysInArray**\<`MaybePackedArray`, `Rest`\>: `MaybePackedArray` *extends* \[infer T, `...(infer U)`\] ? `U` *extends* `never`[] ? [`ExcludeRestIfNever`](ExcludeRestIfNever.md)\<`Rest`, `T`\> : [`RecursiveUnpackArraysInArray`](RecursiveUnpackArraysInArray.md)\<`U`, [`ExcludeRestIfNever`](ExcludeRestIfNever.md)\<`Rest`, `T`\>\> : `never`

Defined in: [src/helpers.ts:53](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/helpers.ts#L53)

Take an array of `unknown` types and, if any of those types extend `T[]`,
replaces said types with `T`, essentially "unpacking" them.

We use this because we're assuming array parameters represent things like
file paths, which should each be cached under different keys when passed to
the function in one shot.

This is why, in general, all of the functions memoized by `@-xun/memoize`
take real "required" parameters (i.e. "primary options parameters") followed
by a single options object (i.e. "secondary options parameter"), usually
containing "optional" properties, since this pattern makes using a type like
`RecursiveUnpackArraysInArray` possible and results in improved DX.

## Type Parameters

• **MaybePackedArray** *extends* `unknown`[]

• **Rest** *extends* `unknown`[] = `never`[]
