import { LiteralUnion, Tagged } from 'type-fest';

/**
 * Options object keys that are always omitted from consideration when receiving
 * the parameters of memoized functions.
 */
export type DefaultKeysToOmitFromCacheParameters = 'useCached';

/**
 * A _cache key_ is a unique MD5-generated string used to store and fetch the
 * memoized result of a function call.
 */
export type CacheKey = string;

/**
 * A _cache scope_ is used to ensure the generation of unique {@link CacheKey}s
 * for different memoized functions that accept otherwise-identical parameters.
 *
 * Any function-looking object—specifically: an object with a `name` property—is
 * acceptable.
 */
export type CacheScope = (...args: never[]) => unknown;

/**
 * The shape of the internal memoization cache.
 */
export type InternalScopedCache = Map<CacheScope, InternalScopedCacheEntry>;

/**
 * The shape of the internal memoization cache entry.
 */
export type InternalScopedCacheEntry = Map<
  CacheKey,
  {
    value: unknown;
    timer: ReturnType<typeof setTimeout> | undefined;
    wasPromised: boolean;
  }
>;

/**
 * Take an array of `unknown` types and, if any of those types extend `T[]`,
 * replaces said types with `T`, essentially "unpacking" them.
 *
 * We use this because we're assuming array parameters represent things like
 * file paths, which should each be cached under different keys when passed to
 * the function in one shot.
 *
 * This is why, in general, all of the functions memoized by `@-xun/memoize`
 * take real "required" parameters (i.e. "primary options parameters") followed
 * by a single options object (i.e. "secondary options parameter"), usually
 * containing "optional" properties, since this pattern makes using a type like
 * `RecursiveUnpackArraysInArray` possible and results in improved DX.
 */
export type RecursiveUnpackArraysInArray<
  MaybePackedArray extends unknown[],
  Rest extends unknown[] = never[]
> = MaybePackedArray extends [infer T, ...infer U]
  ? U extends never[]
    ? ExcludeRestIfNever<Rest, T>
    : RecursiveUnpackArraysInArray<U, ExcludeRestIfNever<Rest, T>>
  : never;

/**
 * If `T` is an array, i.e. `U[]`, return `U`. Otherwise, return `T` as-is.
 *
 * This is referred to throughout this codebase as "unwrapping" `T`.
 */
export type UnpackIfArray<T> = T extends (infer U)[] ? U : T;

/**
 * If `Rest`, representing one or more elements at the end of an array, is
 * `never` (i.e. the array has no other elements), return a single-element array
 * of `T` "unwrapped". Otherwise, return the `Rest` array with `T` concatenated
 * to the end.
 */
export type ExcludeRestIfNever<Rest extends unknown[], T> = Rest extends never[]
  ? [UnpackIfArray<T>]
  : [...Rest, UnpackIfArray<T>];

/**
 * Return a function `T` that accepts `frameworkOptions` via an additional final
 * parameter.
 */
export type WithUseCachedOption<T extends CacheScope> = (
  ...args: [...Parameters<T>, frameworkOptions: { useCached: boolean }]
) => ReturnType<T>;

/**
 * Take a function `Fn` with a compliant primary-secondary parameter signature
 * and return an array of "id components". When combined with a
 * {@link CacheScope}, these components are used to derive a unique
 * {@link CacheKey}.
 *
 * @see {@link ScopeToCacheValue}
 */
export type ScopeToCacheIds<
  Fn extends CacheScope,
  Config extends 'expect ids as-is' | 'expect unpacked ids',
  SecondaryKeysToOmit extends string = DefaultKeysToOmitFromCacheParameters
> = Fn extends (...args: infer OptionsParameters) => unknown
  ? OptionsParameters extends { length: 0 }
    ? never[]
    : ExtractPrimaryAndSecondaryOptions<OptionsParameters> extends [
          infer PrimaryOptionsParameters extends unknown[],
          infer SecondaryOptionsParameter
        ]
      ? PrimaryOptionsParameters extends never[]
        ? [
            SecondaryOptionsParameter extends Record<string, unknown>
              ? Omit<SecondaryOptionsParameter, SecondaryKeysToOmit>
              : Config extends 'expect unpacked ids'
                ? UnpackIfArray<SecondaryOptionsParameter>
                : SecondaryOptionsParameter
          ]
        : Config extends 'expect unpacked ids'
          ? [
              ...RecursiveUnpackArraysInArray<PrimaryOptionsParameters>,
              SecondaryOptionsParameter extends Record<string, unknown>
                ? Omit<SecondaryOptionsParameter, SecondaryKeysToOmit>
                : UnpackIfArray<SecondaryOptionsParameter>
            ]
          : [
              ...PrimaryOptionsParameters,
              SecondaryOptionsParameter extends Record<string, unknown>
                ? Omit<SecondaryOptionsParameter, SecondaryKeysToOmit>
                : SecondaryOptionsParameter
            ]
      : never
  : never;

/**
 * Take a function `Fn` and return the "value" type representing the memoized
 * value mapped to a {@link CacheKey}. This is the "cached" value returned by a
 * memoized function with matching inputs (i.e. "id components").
 *
 * @see {@link ScopeToCacheIds}
 */
export type ScopeToCacheValue<
  Fn extends CacheScope,
  Config extends 'expect value as-is' | 'expect unpacked value'
> = Fn extends (...args: never[]) => infer Value
  ? Config extends 'expect unpacked value'
    ? UnpackIfArray<Awaited<Value>>
    : Awaited<Value>
  : never;

// * Thank you to the clever engineer @ https://stackoverflow.com/a/79406351/1367414
export type ExtractPrimaryAndSecondaryOptions<T extends unknown[]> = [
  ...T,
  unknown
] extends [...infer A, infer B, unknown]
  ? [A, B]
  : never;
