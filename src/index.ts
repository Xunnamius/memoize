/* eslint-disable unicorn/prefer-ternary */
import { createHash } from 'node:crypto';
import { isAsyncFunction, isPromise } from 'node:util/types';

import { createDebugLogger } from 'rejoinder';

import { globalDebuggerNamespace } from 'universe:constant.ts';
import { ErrorMessage } from 'universe:error.ts';

import type { Promisable } from 'type-fest';

import type {
  CacheKey,
  CacheScope,
  DefaultKeysToOmitFromCacheParameters,
  InternalScopedCache,
  InternalScopedCacheEntry,
  ScopeToCacheParameters,
  WithUseCachedOption
} from 'universe:helpers.ts';

const cacheDebug = createDebugLogger({ namespace: globalDebuggerNamespace });
const cacheDebugHit = cacheDebug.extend('hit');

// ? Sidestep the dual package hazard, just in case
const $internalCacheSymbol = Symbol.for('@xunnamius:internal-memoization-cache');

// ? Sidestep the dual package hazard, just in case
const internalCache = ((
  globalThis as typeof globalThis & {
    [$internalCacheSymbol]?: InternalScopedCache;
  }
)[$internalCacheSymbol] ??= new Map<CacheScope, InternalScopedCacheEntry>());

/**
 * The user-facing interface for the memoization cache and related metadata.
 */
const externalCache = {
  /**
   * Place a value into the internal cache.
   *
   * Attempting to "set" `undefined` as a value is a no-op (i.e. the same as
   * having never called this function at all).
   */
  set: setInCache,
  /**
   * The number of times `this.set` has been called.
   */
  sets: 0,
  /**
   * The number of times `this.set` has been called that resulted in a cache
   * miss (adding a new value).
   */
  setsCreated: 0,
  /**
   * The number of times `this.set` has been called that resulted in a cache hit
   * (overwriting an existing value).
   */
  setsOverwrites: 0,
  /**
   * Retrieve a value from the internal cache given one or more `id` components.
   * If no matching value is found, `undefined` is returned.
   *
   * Returns a resolved promise if the `wasPromised: true` option was set after
   * `set` was called with a matching cache scope and id.
   */
  get: getFromCache,
  /**
   * The number of times `this.get` has been called.
   */
  gets: 0,
  /**
   * The number of times `this.get` has been called that resulted in a cache
   * hit.
   */
  getsHits: 0,
  /**
   * The number of times `this.get` has been called that resulted in a cache
   * miss.
   */
  getsMisses: 0,
  /**
   * The total number of memoized function parameters and their corresponding
   * results ("entries") currently in the cache. This number is calculated
   * across all scopes.
   */
  get cachedEntries() {
    return internalCache.values().reduce((count, entry) => count + entry.size, 0);
  },
  /**
   * The total number of known functions ("scopes") currently in the cache. Each
   * cache scope will have 0 or more cache entries associated with it.
   *
   * Note that scopes are created whenever the internal cache is queried. Their
   * existence does not necessarily denote the existence of memoized function
   * results in the cache.
   */
  get cachedScopes() {
    return internalCache.size;
  },
  /**
   * Clear one or more scopes within the internal cache.
   *
   * This function does not reset the cache statistics.
   */
  clear: clearCacheByScope,
  /**
   * Clear all scopes within the internal cache, completely emptying the cache.
   *
   * This function also resets all cache statistics.
   */
  clearAll: clearCache,
  /**
   * The number of times `this.clear` and/or `this.clearAll` have been called.
   */
  clears: 0,
  /**
   * The number of times a cached value reached its `maxAgeMs` and was evicted.
   */
  expirations: 0,
  /**
   * The number of cached values currently in the internal cache with a
   * `maxAgeMs` that has not yet been reached.
   */
  pendingExpirations: 0
};

function getFromCache<
  MemoizationTarget extends CacheScope,
  ShouldUnwrapIds extends boolean = true,
  ShouldUnwrapValue extends boolean = false,
  SecondaryKeysToOmit extends string = DefaultKeysToOmitFromCacheParameters
>(
  scope: MemoizationTarget,
  id: ScopeToCacheParameters<
    MemoizationTarget,
    'id',
    ShouldUnwrapIds,
    ShouldUnwrapValue,
    SecondaryKeysToOmit
  >
): Promisable<
  | ScopeToCacheParameters<
      MemoizationTarget,
      'value',
      ShouldUnwrapIds,
      ShouldUnwrapValue,
      SecondaryKeysToOmit
    >
  | undefined
> {
  const [cache, cacheKey] = deriveCacheKeyFromIdentifiers(scope, id);

  if (cache.has(cacheKey)) {
    cacheDebugHit('hit for key %O:%O', scope.name, cacheKey);
    externalCache.getsHits += 1;
  } else {
    cacheDebug('miss for key %O:%O', scope.name, cacheKey);
    externalCache.getsMisses += 1;
  }

  externalCache.gets += 1;

  const { value: value_, wasPromised } = cache.get(cacheKey) || {};
  const value = value_ as
    | ScopeToCacheParameters<
        MemoizationTarget,
        'value',
        ShouldUnwrapIds,
        ShouldUnwrapValue,
        SecondaryKeysToOmit
      >
    | undefined;

  if (wasPromised) {
    cacheDebug('key %O:%O was promised', scope.name, cacheKey);
    return Promise.resolve(value);
  } else {
    return value;
  }
}

function setInCache<
  MemoizationTarget extends CacheScope,
  ShouldUnwrapIds extends boolean = true,
  ShouldUnwrapValue extends boolean = false,
  SecondaryKeysToOmit extends string = DefaultKeysToOmitFromCacheParameters
>(
  scope: MemoizationTarget,
  id: ScopeToCacheParameters<
    MemoizationTarget,
    'id',
    ShouldUnwrapIds,
    ShouldUnwrapValue,
    SecondaryKeysToOmit
  >,
  value:
    | ScopeToCacheParameters<
        MemoizationTarget,
        'value',
        ShouldUnwrapIds,
        ShouldUnwrapValue,
        SecondaryKeysToOmit
      >
    | undefined,
  {
    maxAgeMs,
    wasPromised = false
  }: {
    /**
     * Use `maxAgeMs` to evict values from the cache after a certain amount of
     * time.
     *
     * Overwriting a cached value will also reset its old `maxAgeMs` with the
     * newly provided `maxAgeMs` if it has not yet been evicted. If the
     * overwrite is performed but no `maxAgeMs` is provided, then the value will
     * no longer expire (and vice-versa).
     *
     * Note that providing a `maxAgeMs <= 0` is the same as not providing
     * `maxAgeMs`.
     */
    maxAgeMs?: number;

    /**
     * Use `wasPromised: true` to return a resolved promise when `get` is called
     * with a matching cache scope and id.
     *
     * It is unnecessary to set this option if the caller is already an
     * asynchronous function, since anything it returns will already be wrapped
     * in a promise. This is useful for synchronous functions that might return
     * a promise or might not depending on their input, such as {@link memoize}.
     */
    wasPromised?: boolean;
  } = {}
): void {
  if (value === undefined) {
    cacheDebug.warn(
      'attempt to set undefined value for scope %O was a no-op',
      scope.name
    );
  } else {
    const hasInvalidMaxAgeMs = maxAgeMs === undefined || maxAgeMs <= 0;
    const [cache, cacheKey] = deriveCacheKeyFromIdentifiers(scope, id);

    if (cache.has(cacheKey)) {
      externalCache.setsOverwrites += 1;

      const { timer } = cache.get(cacheKey)!;

      if (timer) {
        externalCache.pendingExpirations -= 1;
        clearTimeout(timer);

        cacheDebugHit(
          `update existing key %O:%O (maxAgeMs unset${
            hasInvalidMaxAgeMs ? '' : ' but may be reset'
          })`,
          scope.name,
          cacheKey
        );
      } else {
        cacheDebugHit('update existing key %O:%O', scope.name, cacheKey);
      }
    } else {
      externalCache.setsCreated += 1;
      cacheDebug(
        `create new key %O:%O${
          hasInvalidMaxAgeMs ? '' : ` (with maxAgeMs = ${maxAgeMs})`
        }`,
        scope.name,
        cacheKey
      );
    }

    externalCache.sets += 1;

    if (wasPromised) {
      cacheDebug('key %O:%O will be returned as a promise', scope.name, cacheKey);
    }

    if (maxAgeMs !== undefined) {
      if (maxAgeMs > 0) {
        externalCache.pendingExpirations += 1;

        cacheDebug(
          'key %O:%O will be evicted from the cache after ~%Oms',
          scope.name,
          cacheKey,
          maxAgeMs
        );

        cache.set(cacheKey, {
          value,
          timer: setTimeout(() => {
            externalCache.pendingExpirations -= 1;
            externalCache.expirations += 1;

            cacheDebug.message(
              'key %O:%O was evicted from the cache after ~%Oms',
              scope.name,
              cacheKey,
              maxAgeMs
            );

            cache.delete(cacheKey);
          }, maxAgeMs),
          wasPromised
        });
      } else {
        cacheDebug.warn(
          'attempt to set illegal maxAgeMs for key %O:%O was ignored: %O',
          scope.name,
          cacheKey,
          maxAgeMs
        );
      }
    }

    if (hasInvalidMaxAgeMs) {
      cache.set(cacheKey, { value, timer: undefined, wasPromised });
    }
  }
}

function clearCacheByScope(scopesToClear: CacheScope[]) {
  externalCache.clears += 1;

  for (const scope of scopesToClear) {
    const internalScopedCacheEntry = internalCache.get(scope);

    if (internalScopedCacheEntry?.size) {
      cacheDebug(
        'internal %O cache cleared (%O entries deleted)',
        scope.name,
        internalScopedCacheEntry.size
      );
    } else {
      cacheDebug(
        'internal %O cache vacuously cleared (function was never memoized)',
        scope.name
      );
    }

    clearInternalScopedCacheEntry(internalScopedCacheEntry);
  }
}

function clearCache() {
  const deletedScopesCount = internalCache.size;
  let deletedEntriesCount = 0;

  externalCache.clears += 1;

  internalCache.forEach(
    (internalScopedCacheEntry) =>
      (deletedEntriesCount += clearInternalScopedCacheEntry(internalScopedCacheEntry))
  );

  internalCache.clear();

  externalCache.clears = 0;
  externalCache.gets = 0;
  externalCache.getsHits = 0;
  externalCache.getsMisses = 0;
  externalCache.sets = 0;
  externalCache.setsCreated = 0;
  externalCache.setsOverwrites = 0;
  externalCache.expirations = 0;

  cacheDebug(
    'entire internal cache cleared (%O scopes, %O entries deleted)',
    deletedScopesCount,
    deletedEntriesCount
  );
}

/**
 * @internal
 */
function clearInternalScopedCacheEntry(
  internalScopedCacheEntry?: InternalScopedCacheEntry
) {
  let deletedCount = 0;

  internalScopedCacheEntry?.forEach(({ timer }) => {
    deletedCount += 1;

    if (timer !== undefined) {
      externalCache.pendingExpirations -= 1;
      clearTimeout(timer);
    }
  });

  internalScopedCacheEntry?.clear();

  return deletedCount;
}

/**
 * Takes an array of data objects that are either serializable as JSON and
 * derives a MD5 key that, along with `scope`, can be used to memoize
 * potentially expensive analysis functions.
 *
 * @internal
 */
function deriveCacheKeyFromIdentifiers(
  scope: CacheScope,
  idComponents: unknown[]
): [InternalScopedCacheEntry, CacheKey] {
  const cacheKey = createHash('md5');
  const internalCacheEntry =
    internalCache.get(scope) || internalCache.set(scope, new Map()).get(scope)!;

  for (const idComponent of idComponents) {
    if (idComponent === undefined) {
      cacheKey.update('undefined');
      continue;
    }

    const serialized = (() => {
      try {
        return JSON.stringify(idComponent);
      } catch {
        return undefined;
      }
    })();

    if (serialized === undefined) {
      throw new TypeError(ErrorMessage.NotSerializable(), {
        cause: { unserializableIdComponent: idComponent }
      });
    }

    cacheKey.update(serialized);
  }

  return [internalCacheEntry, cacheKey.digest('hex')];
}

/**
 * Optimize the execution of a synchronous or asynchronous function by caching
 * its return value conditioned on its inputs, and serving that cached value
 * (rather than recomputing the value) whenever those same inputs are
 * encountered later.
 *
 * Provide `maxAgeMs` to automatically evict the memoized function result from
 * the cache after a given amount of time has passed. Providing a `maxAgeMs <=
 * 0` is the same as leaving `maxAgeMs` undefined.
 *
 * Provide `addUseCachedOption` to control whether a third "useCached" options
 * object is appended to the list of parameters accepted by the memoized
 * function.
 *
 * Note that this function does not recognize `useCached` as an option unless
 * (1) it is passed as the property of an object that is the final argument and
 * (2) `addUseCachedOption: true` was provided to `memoize`. Either way, all
 * arguments are passed through as-is to the underlying function when invoked.
 */
function memoize<T extends CacheScope>(
  memoizationTarget: T,
  options: { maxAgeMs?: number; addUseCachedOption: true }
): WithUseCachedOption<T>;
function memoize<T extends CacheScope>(
  memoizationTarget: T,
  options?: { maxAgeMs?: number; addUseCachedOption?: false }
): T;
function memoize<T extends CacheScope>(
  memoizationTarget: T,
  options?: { maxAgeMs?: number; addUseCachedOption?: boolean }
): Promisable<T | WithUseCachedOption<T>>;
function memoize<T extends CacheScope>(
  memoizationTarget: T,
  {
    maxAgeMs,
    addUseCachedOption = false
  }: { maxAgeMs?: number; addUseCachedOption?: boolean } = {}
): Promisable<T | WithUseCachedOption<T>> {
  if (addUseCachedOption) {
    return function (...args) {
      const incomingArgs = args.slice(0, -1) as Parameters<T>;
      const frameworkOptions = args.at(-1)!;

      return memoizeActual(incomingArgs, frameworkOptions.useCached);
    } as WithUseCachedOption<T>;
  } else {
    return function (...args: Parameters<T>) {
      return memoizeActual(args, true);
    } as T;
  }

  function memoizeActual(incomingArgs: Parameters<T>, useCached: boolean) {
    const cacheParameters = incomingArgs as ScopeToCacheParameters<T, 'id'>;
    let initialResult: Promisable<ScopeToCacheParameters<T, 'value'> | undefined> =
      undefined;

    if (useCached) {
      initialResult = getFromCache(memoizationTarget, cacheParameters);
    }

    const shouldReturnPromise =
      isPromise(initialResult) || isAsyncFunction(memoizationTarget);

    if (shouldReturnPromise) {
      return Promise.resolve(initialResult).then((resultActual) =>
        makeResult(resultActual)
      );
    } else {
      return makeResult(initialResult as Awaited<typeof initialResult>);
    }

    function makeResult(result: Awaited<typeof initialResult>) {
      if (result === undefined) {
        result = memoizationTarget(...incomingArgs) as ScopeToCacheParameters<
          T,
          'value'
        >;

        if (isPromise(result)) {
          return (result as Promise<typeof result>).then((resultActual) => {
            setInCache(memoizationTarget, cacheParameters, resultActual, {
              maxAgeMs,
              wasPromised: true
            });
            return resultActual;
          });
        } else {
          setInCache(memoizationTarget, cacheParameters, result, {
            maxAgeMs,
            wasPromised: false
          });
        }
      }

      return result;
    }
  }
}

export {
  externalCache as memoizer,
  memoize,
  type DefaultKeysToOmitFromCacheParameters,
  type ScopeToCacheParameters
};
