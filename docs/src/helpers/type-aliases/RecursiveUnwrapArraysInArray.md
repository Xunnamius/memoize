[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / RecursiveUnwrapArraysInArray

# Type Alias: RecursiveUnwrapArraysInArray\<Wrapped, Rest\>

> **RecursiveUnwrapArraysInArray**\<`Wrapped`, `Rest`\>: `Wrapped` *extends* \[infer T, `...(infer U)`\] ? `U` *extends* `never`[] ? [`ExcludeRestIfNever`](ExcludeRestIfNever.md)\<`Rest`, `T`\> : [`RecursiveUnwrapArraysInArray`](RecursiveUnwrapArraysInArray.md)\<`U`, [`ExcludeRestIfNever`](ExcludeRestIfNever.md)\<`Rest`, `T`\>\> : `never`

Defined in: [src/helpers.ts:53](https://github.com/Xunnamius/memoize/blob/283d7337c9ac22bf4837dd729f73aabb00c33795/src/helpers.ts#L53)

Take an array of `unknown` types and, if any of those types extend `T[]`,
replaces said types with `T`, essentially "unwrapping" them.

We use this because we're assuming array parameters represent things like
file paths, which should each be cached under different keys when passed to
the function in one shot.

This is why, in general, all of the functions memoized by `@-xun/memoize`
take real "required" parameters (i.e. "primary options parameters") followed
by a single options object (i.e. "secondary options parameter"), usually
containing "optional" properties, since this pattern makes using a type like
`RecursiveUnwrapArraysInArray` possible and results in improved DX.

## Type Parameters

• **Wrapped** *extends* `unknown`[]

• **Rest** *extends* `unknown`[] = `never`[]
