[**@-xun/memoize**](../../README.md)

***

[@-xun/memoize](../../README.md) / [src](../README.md) / memoize

# Function: memoize()

## Call Signature

> **memoize**\<`T`\>(`memoizationTarget`, `options`): [`WithUseCachedOption`](../helpers/type-aliases/WithUseCachedOption.md)\<`T`\>

Defined in: [src/index.ts:430](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/index.ts#L430)

Optimize the execution of a synchronous or asynchronous function by caching
its return value conditioned on its inputs, and serving that cached value
(rather than recomputing the value) whenever those same inputs are
encountered later.

Provide `maxAgeMs` to automatically evict the memoized function result from
the cache after a given amount of time has passed. Providing a `maxAgeMs <=
0` is the same as leaving `maxAgeMs` undefined.

Provide `addUseCachedOption` to control whether a third "useCached" options
object is appended to the list of parameters accepted by the memoized
function.

Note that this function does not recognize `useCached` as an option unless
(1) it is passed as the property of an object that is the final argument and
(2) `addUseCachedOption: true` was provided to `memoize`. Either way, all
arguments are passed through as-is to the underlying function when invoked.

### Type Parameters

• **T** *extends* [`CacheScope`](../helpers/type-aliases/CacheScope.md)

### Parameters

#### memoizationTarget

`T`

#### options

##### addUseCachedOption

`true`

##### maxAgeMs

`number`

### Returns

[`WithUseCachedOption`](../helpers/type-aliases/WithUseCachedOption.md)\<`T`\>

## Call Signature

> **memoize**\<`T`\>(`memoizationTarget`, `options`?): `T`

Defined in: [src/index.ts:434](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/index.ts#L434)

Optimize the execution of a synchronous or asynchronous function by caching
its return value conditioned on its inputs, and serving that cached value
(rather than recomputing the value) whenever those same inputs are
encountered later.

Provide `maxAgeMs` to automatically evict the memoized function result from
the cache after a given amount of time has passed. Providing a `maxAgeMs <=
0` is the same as leaving `maxAgeMs` undefined.

Provide `addUseCachedOption` to control whether a third "useCached" options
object is appended to the list of parameters accepted by the memoized
function.

Note that this function does not recognize `useCached` as an option unless
(1) it is passed as the property of an object that is the final argument and
(2) `addUseCachedOption: true` was provided to `memoize`. Either way, all
arguments are passed through as-is to the underlying function when invoked.

### Type Parameters

• **T** *extends* [`CacheScope`](../helpers/type-aliases/CacheScope.md)

### Parameters

#### memoizationTarget

`T`

#### options?

##### addUseCachedOption

`false`

##### maxAgeMs

`number`

### Returns

`T`

## Call Signature

> **memoize**\<`T`\>(`memoizationTarget`, `options`?): `Promisable`\<`T` \| [`WithUseCachedOption`](../helpers/type-aliases/WithUseCachedOption.md)\<`T`\>\>

Defined in: [src/index.ts:438](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/index.ts#L438)

Optimize the execution of a synchronous or asynchronous function by caching
its return value conditioned on its inputs, and serving that cached value
(rather than recomputing the value) whenever those same inputs are
encountered later.

Provide `maxAgeMs` to automatically evict the memoized function result from
the cache after a given amount of time has passed. Providing a `maxAgeMs <=
0` is the same as leaving `maxAgeMs` undefined.

Provide `addUseCachedOption` to control whether a third "useCached" options
object is appended to the list of parameters accepted by the memoized
function.

Note that this function does not recognize `useCached` as an option unless
(1) it is passed as the property of an object that is the final argument and
(2) `addUseCachedOption: true` was provided to `memoize`. Either way, all
arguments are passed through as-is to the underlying function when invoked.

### Type Parameters

• **T** *extends* [`CacheScope`](../helpers/type-aliases/CacheScope.md)

### Parameters

#### memoizationTarget

`T`

#### options?

##### addUseCachedOption

`boolean`

##### maxAgeMs

`number`

### Returns

`Promisable`\<`T` \| [`WithUseCachedOption`](../helpers/type-aliases/WithUseCachedOption.md)\<`T`\>\>
