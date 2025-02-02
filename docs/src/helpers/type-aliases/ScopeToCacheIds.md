[**@-xun/memoize**](../../../README.md)

***

[@-xun/memoize](../../../README.md) / [src/helpers](../README.md) / ScopeToCacheIds

# Type Alias: ScopeToCacheIds\<Fn, Config, SecondaryKeysToOmit\>

> **ScopeToCacheIds**\<`Fn`, `Config`, `SecondaryKeysToOmit`\>: `Fn` *extends* (...`args`) => `unknown` ? `OptionsParameters` *extends* `object` ? `never`[] : [`ExtractPrimaryAndSecondaryOptions`](ExtractPrimaryAndSecondaryOptions.md)\<`OptionsParameters`\> *extends* \[infer PrimaryOptionsParameters, infer SecondaryOptionsParameter\] ? `PrimaryOptionsParameters` *extends* `never`[] ? \[`SecondaryOptionsParameter` *extends* `Record`\<`string`, `unknown`\> ? `Omit`\<`SecondaryOptionsParameter`, `SecondaryKeysToOmit`\> : `Config` *extends* `"expect unpacked ids"` ? [`UnpackIfArray`](UnpackIfArray.md)\<`SecondaryOptionsParameter`\> : `SecondaryOptionsParameter`\] : `Config` *extends* `"expect unpacked ids"` ? \[`...RecursiveUnpackArraysInArray<PrimaryOptionsParameters>`, `SecondaryOptionsParameter` *extends* `Record`\<`string`, `unknown`\> ? `Omit`\<`SecondaryOptionsParameter`, `SecondaryKeysToOmit`\> : [`UnpackIfArray`](UnpackIfArray.md)\<`SecondaryOptionsParameter`\>\] : \[`...PrimaryOptionsParameters`, `SecondaryOptionsParameter` *extends* `Record`\<`string`, `unknown`\> ? `Omit`\<`SecondaryOptionsParameter`, `SecondaryKeysToOmit`\> : `SecondaryOptionsParameter`\] : `never` : `never`

Defined in: [src/helpers.ts:95](https://github.com/Xunnamius/memoize/blob/b613141c2f7a96de00eb98581585a2d2f68dc2ab/src/helpers.ts#L95)

Take a function `Fn` with a compliant primary-secondary parameter signature
and return an array of "id components". When combined with a
[CacheScope](CacheScope.md), these components are used to derive a unique
[CacheKey](CacheKey.md).

## Type Parameters

• **Fn** *extends* [`CacheScope`](CacheScope.md)

• **Config** *extends* `"expect ids as-is"` \| `"expect unpacked ids"`

• **SecondaryKeysToOmit** *extends* `string` = [`DefaultKeysToOmitFromCacheParameters`](DefaultKeysToOmitFromCacheParameters.md)

## See

[ScopeToCacheValue](ScopeToCacheValue.md)
