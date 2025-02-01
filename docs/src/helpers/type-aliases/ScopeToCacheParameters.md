[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / ScopeToCacheParameters

# Type Alias: ScopeToCacheParameters\<Fn, ReturnTarget, ShouldUnwrapIds, ShouldUnwrapValue, SecondaryKeysToOmit\>

> **ScopeToCacheParameters**\<`Fn`, `ReturnTarget`, `ShouldUnwrapIds`, `ShouldUnwrapValue`, `SecondaryKeysToOmit`\>: `Fn` *extends* (...`_args`) => infer Value ? `OptionsParameters` *extends* `object` ? `ReturnTarget` *extends* `"id"` ? `never`[] : `ShouldUnwrapValue` *extends* `true` ? [`UnwrapIfArray`](UnwrapIfArray.md)\<`Awaited`\<`Value`\>\> : `Awaited`\<`Value`\> : `OptionsParameters` *extends* \[`...(infer PrimaryOptionsParameters)`, infer SecondaryOptionsParameter\] ? `ReturnTarget` *extends* `"id"` ? `PrimaryOptionsParameters` *extends* `never`[] ? \[`SecondaryOptionsParameter` *extends* `Record`\<`string`, `unknown`\> ? `Omit`\<`SecondaryOptionsParameter`, `SecondaryKeysToOmit`\> : `ShouldUnwrapIds` *extends* `true` ? [`UnwrapIfArray`](UnwrapIfArray.md)\<`SecondaryOptionsParameter`\> : `SecondaryOptionsParameter`\] : `ShouldUnwrapIds` *extends* `true` ? \[`...RecursiveUnwrapArraysInArray<PrimaryOptionsParameters>`, `SecondaryOptionsParameter` *extends* `Record`\<`string`, `unknown`\> ? `Omit`\<`SecondaryOptionsParameter`, `SecondaryKeysToOmit`\> : [`UnwrapIfArray`](UnwrapIfArray.md)\<`SecondaryOptionsParameter`\>\] : \[`...PrimaryOptionsParameters`, `SecondaryOptionsParameter` *extends* `Record`\<`string`, `unknown`\> ? `Omit`\<`SecondaryOptionsParameter`, `SecondaryKeysToOmit`\> : `SecondaryOptionsParameter`\] : `ShouldUnwrapValue` *extends* `true` ? [`UnwrapIfArray`](UnwrapIfArray.md)\<`Awaited`\<`Value`\>\> : `Awaited`\<`Value`\> : `never` : `never`

Defined in: [src/helpers.ts:96](https://github.com/Xunnamius/memoize/blob/283d7337c9ac22bf4837dd729f73aabb00c33795/src/helpers.ts#L96)

Take a function `Fn` with a compliant primary-secondary parameter signature
and return a 2-element tuple (depending on the value of `ReturnTarget`).

The first "id" element, when combined with a [CacheScope](CacheScope.md), represents
the array of function parameters used to derive a unique [CacheKey](CacheKey.md).
The second "value" element represents the memoized (cached) value mapped to
the aforesaid derived [CacheKey](CacheKey.md).

## Type Parameters

• **Fn** *extends* [`CacheScope`](CacheScope.md)

• **ReturnTarget** *extends* `"id"` \| `"value"`

• **ShouldUnwrapIds** *extends* `boolean` = `true`

• **ShouldUnwrapValue** *extends* `boolean` = `false`

• **SecondaryKeysToOmit** *extends* `string` = [`DefaultKeysToOmitFromCacheParameters`](DefaultKeysToOmitFromCacheParameters.md)
