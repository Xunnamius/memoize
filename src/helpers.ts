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
 * replaces said types with `T`, essentially "unwrapping" them.
 *
 * We use this because we're assuming array parameters represent things like
 * file paths, which should each be cached under different keys when passed to
 * the function in one shot.
 *
 * This is why, in general, all of the functions memoized by `@-xun/memoize`
 * take real "required" parameters (i.e. "primary options parameters") followed
 * by a single options object (i.e. "secondary options parameter"), usually
 * containing "optional" properties, since this pattern makes using a type like
 * `RecursiveUnwrapArraysInArray` possible and results in improved DX.
 */
export type RecursiveUnwrapArraysInArray<
  Wrapped extends unknown[],
  Rest extends unknown[] = never[]
> = Wrapped extends [infer T, ...infer U]
  ? U extends never[]
    ? ExcludeRestIfNever<Rest, T>
    : RecursiveUnwrapArraysInArray<U, ExcludeRestIfNever<Rest, T>>
  : never;

/**
 * If `T` is an array, i.e. `U[]`, return `U`. Otherwise, return `T` as-is.
 *
 * This is referred to throughout this codebase as "unwrapping" `T`.
 */
export type UnwrapIfArray<T> = T extends (infer U)[] ? U : T;

/**
 * If `Rest`, representing one or more elements at the end of an array, is
 * `never` (i.e. the array has no other elements), return a single-element array
 * of `T` "unwrapped". Otherwise, return the `Rest` array with `T` concatenated
 * to the end.
 */
export type ExcludeRestIfNever<Rest extends unknown[], T> = Rest extends never[]
  ? [UnwrapIfArray<T>]
  : [...Rest, UnwrapIfArray<T>];

/**
 * Return a function `T` that accepts `frameworkOptions` via an additional final
 * parameter.
 */
export type WithUseCachedOption<T extends CacheScope> = (
  ...args: [...Parameters<T>, frameworkOptions: { useCached: boolean }]
) => ReturnType<T>;

/**
 * Take a function `Fn` with a compliant primary-secondary parameter signature
 * and return a 2-element tuple (depending on the value of `ReturnTarget`).
 *
 * The first "id" element, when combined with a {@link CacheScope}, represents
 * the array of function parameters used to derive a unique {@link CacheKey}.
 * The second "value" element represents the memoized (cached) value mapped to
 * the aforesaid derived {@link CacheKey}.
 */
export type ScopeToCacheParameters<
  Fn extends CacheScope,
  ReturnTarget extends 'id' | 'value',
  ShouldUnwrapIds extends boolean = true,
  ShouldUnwrapValue extends boolean = false,
  SecondaryKeysToOmit extends string = DefaultKeysToOmitFromCacheParameters
> = Fn extends (..._args: infer OptionsParameters) => infer Value
  ? OptionsParameters extends { length: 0 }
    ? ReturnTarget extends 'id'
      ? never[]
      : ShouldUnwrapValue extends true
        ? UnwrapIfArray<Awaited<Value>>
        : Awaited<Value>
    : OptionsParameters extends [
          ...infer PrimaryOptionsParameters,
          infer SecondaryOptionsParameter
        ]
      ? ReturnTarget extends 'id'
        ? PrimaryOptionsParameters extends never[]
          ? [
              SecondaryOptionsParameter extends Record<string, unknown>
                ? Omit<SecondaryOptionsParameter, SecondaryKeysToOmit>
                : ShouldUnwrapIds extends true
                  ? UnwrapIfArray<SecondaryOptionsParameter>
                  : SecondaryOptionsParameter
            ]
          : ShouldUnwrapIds extends true
            ? [
                ...RecursiveUnwrapArraysInArray<PrimaryOptionsParameters>,
                SecondaryOptionsParameter extends Record<string, unknown>
                  ? Omit<SecondaryOptionsParameter, SecondaryKeysToOmit>
                  : UnwrapIfArray<SecondaryOptionsParameter>
              ]
            : [
                ...PrimaryOptionsParameters,
                SecondaryOptionsParameter extends Record<string, unknown>
                  ? Omit<SecondaryOptionsParameter, SecondaryKeysToOmit>
                  : SecondaryOptionsParameter
              ]
        : ShouldUnwrapValue extends true
          ? UnwrapIfArray<Awaited<Value>>
          : Awaited<Value>
      : never
  : never;
