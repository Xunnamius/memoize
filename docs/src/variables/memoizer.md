[**@-xun/memoize**](../../README.md)

***

[@-xun/memoize](../../README.md) / [src](../README.md) / memoizer

# Variable: memoizer

> `const` **memoizer**: `object`

Defined in: [src/index.ts:40](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/index.ts#L40)

The user-facing interface for the memoization cache and related metadata.

## Type declaration

### clear()

> **clear**: (`scopesToClear`) => `void` = `clearCacheByScope`

Clear one or more scopes within the internal cache.

This function does not reset the cache statistics.

#### Parameters

##### scopesToClear

[`CacheScope`](../helpers/type-aliases/CacheScope.md)[]

#### Returns

`void`

### clearAll()

> **clearAll**: () => `void` = `clearCache`

Clear all scopes within the internal cache, completely emptying the cache.

This function also resets all cache statistics.

#### Returns

`void`

### clears

> **clears**: `number` = `0`

The number of times `this.clear` and/or `this.clearAll` have been called.

### expirations

> **expirations**: `number` = `0`

The number of times a cached value reached its `maxAgeMs` and was evicted.

### get()

> **get**: \<`MemoizationTarget`, `IdConfig`, `ValueConfig`, `SecondaryKeysToOmit`\>(`scope`, `id`) => `ReturnType`\<`MemoizationTarget`\> *extends* `Promise`\<`any`\> ? `Promise`\<[`ScopeToCacheValue`](../helpers/type-aliases/ScopeToCacheValue.md)\<`MemoizationTarget`, `ValueConfig`\> \| `undefined`\> : [`ScopeToCacheValue`](../helpers/type-aliases/ScopeToCacheValue.md)\<`MemoizationTarget`, `ValueConfig`\> \| `undefined` = `getFromCache`

Retrieve a value from the internal cache given one or more `id` components.
If no matching value is found, `undefined` is returned.

Returns a resolved promise if the `wasPromised: true` option was set after
`set` was called with a matching cache scope and id.

#### Type Parameters

• **MemoizationTarget** *extends* [`CacheScope`](../helpers/type-aliases/CacheScope.md)

• **IdConfig** *extends* `"expect ids as-is"` \| `"expect unpacked ids"` = `"expect unpacked ids"`

• **ValueConfig** *extends* `"expect value as-is"` \| `"expect unpacked value"` = `"expect value as-is"`

• **SecondaryKeysToOmit** *extends* `string` = `"useCached"`

#### Parameters

##### scope

`MemoizationTarget`

##### id

[`ScopeToCacheIds`](../helpers/type-aliases/ScopeToCacheIds.md)\<`MemoizationTarget`, `IdConfig`, `SecondaryKeysToOmit`\>

#### Returns

`ReturnType`\<`MemoizationTarget`\> *extends* `Promise`\<`any`\> ? `Promise`\<[`ScopeToCacheValue`](../helpers/type-aliases/ScopeToCacheValue.md)\<`MemoizationTarget`, `ValueConfig`\> \| `undefined`\> : [`ScopeToCacheValue`](../helpers/type-aliases/ScopeToCacheValue.md)\<`MemoizationTarget`, `ValueConfig`\> \| `undefined`

### gets

> **gets**: `number` = `0`

The number of times `this.get` has been called.

### getsHits

> **getsHits**: `number` = `0`

The number of times `this.get` has been called that resulted in a cache
hit.

### getsMisses

> **getsMisses**: `number` = `0`

The number of times `this.get` has been called that resulted in a cache
miss.

### pendingExpirations

> **pendingExpirations**: `number` = `0`

The number of cached values currently in the internal cache with a
`maxAgeMs` that has not yet been reached.

### set()

> **set**: \<`MemoizationTarget`, `IdConfig`, `ValueConfig`, `SecondaryKeysToOmit`\>(`scope`, `id`, `value`, `__namedParameters`) => `void` = `setInCache`

Place a value into the internal cache.

Attempting to "set" `undefined` as a value is a no-op (i.e. the same as
having never called this function at all).

#### Type Parameters

• **MemoizationTarget** *extends* [`CacheScope`](../helpers/type-aliases/CacheScope.md)

• **IdConfig** *extends* `"expect ids as-is"` \| `"expect unpacked ids"` = `"expect unpacked ids"`

• **ValueConfig** *extends* `"expect value as-is"` \| `"expect unpacked value"` = `"expect value as-is"`

• **SecondaryKeysToOmit** *extends* `string` = `"useCached"`

#### Parameters

##### scope

`MemoizationTarget`

##### id

[`ScopeToCacheIds`](../helpers/type-aliases/ScopeToCacheIds.md)\<`MemoizationTarget`, `IdConfig`, `SecondaryKeysToOmit`\>

##### value

`undefined` | [`ScopeToCacheValue`](../helpers/type-aliases/ScopeToCacheValue.md)\<`MemoizationTarget`, `ValueConfig`\>

##### \_\_namedParameters

###### maxAgeMs

`number`

Use `maxAgeMs` to evict values from the cache after a certain amount of
time.

Overwriting a cached value will also reset its old `maxAgeMs` with the
newly provided `maxAgeMs` if it has not yet been evicted. If the
overwrite is performed but no `maxAgeMs` is provided, then the value will
no longer expire (and vice-versa).

Note that providing a `maxAgeMs <= 0` is the same as not providing
`maxAgeMs`.

###### wasPromised

`boolean` = `false`

Use `wasPromised: true` to return a resolved promise when `get` is called
with a matching cache scope and id.

It is unnecessary to set this option if the caller is already an
asynchronous function, since anything it returns will already be wrapped
in a promise. This is useful for synchronous functions that might return
a promise or might not depending on their input, such as [memoize](../functions/memoize.md).

#### Returns

`void`

### sets

> **sets**: `number` = `0`

The number of times `this.set` has been called.

### setsCreated

> **setsCreated**: `number` = `0`

The number of times `this.set` has been called that resulted in a cache
miss (adding a new value).

### setsOverwrites

> **setsOverwrites**: `number` = `0`

The number of times `this.set` has been called that resulted in a cache hit
(overwriting an existing value).

### cachedEntries

#### Get Signature

> **get** **cachedEntries**(): `number`

The total number of memoized function parameters and their corresponding
results ("entries") currently in the cache. This number is calculated
across all scopes.

##### Returns

`number`

### cachedScopes

#### Get Signature

> **get** **cachedScopes**(): `number`

The total number of known functions ("scopes") currently in the cache. Each
cache scope will have 0 or more cache entries associated with it.

Note that scopes are created whenever the internal cache is queried. Their
existence does not necessarily denote the existence of memoized function
results in the cache.

##### Returns

`number`
