// * These tests ensure the exported interface under test functions as expected.

import { memoize, memoizer } from 'universe';
import { ErrorMessage } from 'universe:error.ts';

beforeEach(() => {
  memoizer.clearAll();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('cache.get and cache.set', () => {
  it('returns undefined when getting non-existent value', async () => {
    expect.hasAssertions();

    const fn = () => true;

    expect(memoizer.get(fn, [])).toBeUndefined();
  });

  it('returns set value when getting existing value even if parameters are identical', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const fn2 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];

    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const parameters2: Parameters<typeof fn1> = [2, 'four', { d: false }];

    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];
    const returnType2: ReturnType<typeof fn1> = [2, 'four', false];

    expect(memoizer.get(fn1, parameters1)).toBeUndefined();
    expect(memoizer.get(fn2, parameters1)).toBeUndefined();

    memoizer.set(fn1, parameters1, returnType1);

    expect(memoizer.get(fn1, parameters1)).toBe(returnType1);
    expect(memoizer.get(fn2, parameters1)).toBeUndefined();

    expect(memoizer.get(fn1, parameters2)).toBeUndefined();
    memoizer.set(fn1, parameters2, returnType2);
    expect(memoizer.get(fn1, parameters2)).toBe(returnType2);

    expect(memoizer.get(fn2, parameters2)).toBeUndefined();
    memoizer.set(fn2, parameters2, returnType2);
    expect(memoizer.get(fn2, parameters2)).toBe(returnType2);
  });

  it('returns overwritten value when setting and then getting existing value', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];
    const returnType2: ReturnType<typeof fn1> = [2, 'four', false];

    expect(memoizer.get(fn1, parameters1)).toBeUndefined();
    memoizer.set(fn1, parameters1, returnType1);
    expect(memoizer.get(fn1, parameters1)).toBe(returnType1);
    memoizer.set(fn1, parameters1, returnType2);
    expect(memoizer.get(fn1, parameters1)).toBe(returnType2);
  });

  it('treats attempts to set "undefined" into the cache as a no-op', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];

    memoizer.set(fn1, parameters1, undefined);
    expect(memoizer.sets).toBe(0);

    expect(memoizer.get(fn1, parameters1)).toBeUndefined();
    expect(memoizer.gets).toBe(1);
    expect(memoizer.getsMisses).toBe(1);
  });

  it('evicts cached values after a given interval if so configured', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const fn2 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];

    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const parameters2: Parameters<typeof fn1> = [2, 'four', { d: false }];

    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];
    const returnType2: ReturnType<typeof fn1> = [2, 'four', false];

    expect(memoizer.get(fn1, parameters1)).toBeUndefined();
    expect(memoizer.get(fn2, parameters2)).toBeUndefined();

    memoizer.set(fn1, parameters1, returnType1, { maxAgeMs: 1000 });
    memoizer.set(fn2, parameters2, returnType2, { maxAgeMs: 10_000 });

    expect(memoizer.get(fn1, parameters2)).toBeUndefined();
    expect(memoizer.get(fn1, parameters1)).toBe(returnType1);
    expect(memoizer.get(fn2, parameters1)).toBeUndefined();
    expect(memoizer.get(fn2, parameters2)).toBe(returnType2);

    expect(memoizer.expirations).toBe(0);
    expect(memoizer.pendingExpirations).toBe(2);

    jest.advanceTimersByTime(500);

    expect(memoizer.get(fn1, parameters1)).toBe(returnType1);
    expect(memoizer.get(fn2, parameters2)).toBe(returnType2);

    expect(memoizer.expirations).toBe(0);
    expect(memoizer.pendingExpirations).toBe(2);

    jest.advanceTimersByTime(500);

    expect(memoizer.get(fn1, parameters1)).toBeUndefined();
    expect(memoizer.get(fn2, parameters2)).toBe(returnType2);

    expect(memoizer.expirations).toBe(1);
    expect(memoizer.pendingExpirations).toBe(1);

    jest.advanceTimersByTime(10_000);

    expect(memoizer.get(fn1, parameters1)).toBeUndefined();
    expect(memoizer.get(fn2, parameters2)).toBeUndefined();

    expect(memoizer.expirations).toBe(2);
    expect(memoizer.pendingExpirations).toBe(0);
  });

  it('returns a promise when wasPromised was enabled during set', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];

    memoizer.set(fn1, parameters1, returnType1, { wasPromised: true });
    await expect(memoizer.get(fn1, parameters1)).resolves.toBe(returnType1);
  });

  it('resets expiration interval when overwriting a cached value with a new maxAgeMs', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const fn2 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];

    memoizer.set(fn1, parameters1, returnType1, { maxAgeMs: 100 });
    memoizer.set(fn2, parameters1, returnType1, { maxAgeMs: 100 });

    expect(memoizer.pendingExpirations).toBe(2);
    expect(memoizer.expirations).toBe(0);

    jest.advanceTimersByTime(50);

    memoizer.set(fn1, parameters1, returnType1, { maxAgeMs: 100 });

    expect(memoizer.pendingExpirations).toBe(2);
    expect(memoizer.expirations).toBe(0);

    jest.advanceTimersByTime(50);

    expect(memoizer.pendingExpirations).toBe(1);
    expect(memoizer.expirations).toBe(1);

    jest.advanceTimersByTime(50);

    expect(memoizer.pendingExpirations).toBe(0);
    expect(memoizer.expirations).toBe(2);
  });

  it('unsets expiration interval when overwriting a cached value with no new maxAgeMs', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];

    memoizer.set(fn1, parameters1, returnType1, { maxAgeMs: 100 });

    expect(memoizer.pendingExpirations).toBe(1);
    expect(memoizer.expirations).toBe(0);

    memoizer.set(fn1, parameters1, returnType1);

    expect(memoizer.pendingExpirations).toBe(0);
    expect(memoizer.expirations).toBe(0);
  });

  it('ignores illegal maxAgeMs', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const fn2 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];

    expect(memoizer.pendingExpirations).toBe(0);
    expect(memoizer.expirations).toBe(0);

    memoizer.set(fn1, parameters1, returnType1, { maxAgeMs: 100 });

    expect(memoizer.pendingExpirations).toBe(1);
    expect(memoizer.expirations).toBe(0);

    memoizer.set(fn1, parameters1, returnType1, { maxAgeMs: 0 });

    expect(memoizer.pendingExpirations).toBe(0);
    expect(memoizer.expirations).toBe(0);

    memoizer.set(fn1, parameters1, returnType1, { maxAgeMs: 100 });

    expect(memoizer.pendingExpirations).toBe(1);
    expect(memoizer.expirations).toBe(0);

    memoizer.set(fn1, parameters1, returnType1, { maxAgeMs: -1 });
    memoizer.set(fn2, parameters1, returnType1, { maxAgeMs: -1 });

    expect(memoizer.pendingExpirations).toBe(0);
    expect(memoizer.expirations).toBe(0);
  });

  it('handles "undefined" id components', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string | undefined, c: { d: boolean }) => [a, b, c.d];
    const parameters1: Parameters<typeof fn1> = [1, undefined, { d: true }];
    const returnType1: ReturnType<typeof fn1> = [1, undefined, true];

    memoizer.set(fn1, parameters1, returnType1);
    expect(memoizer.get(fn1, parameters1)).toBe(returnType1);
  });

  it('properly caches and returns defined-but-falsy results', async () => {
    expect.hasAssertions();

    const fn: (a: number) => number | boolean | null = () => 0;

    memoizer.set(fn, [1], 0);
    memoizer.set(fn, [2], false);
    memoizer.set(fn, [3], null);

    expect(memoizer.get(fn, [1])).toBe(0);
    expect(memoizer.get(fn, [2])).toBeFalse();
    expect(memoizer.get(fn, [3])).toBeNull();
  });

  it('throws if id component is not serializable', async () => {
    expect.hasAssertions();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const fn1 = (a: number, b: string | Function, c: { d: bigint }) => [a, b, c.d];
    const returnType1: ReturnType<typeof fn1> = [1, 'two', BigInt(5)];

    expect(() => memoizer.set(fn1, [1, 'two', { d: BigInt(5) }], returnType1)).toThrow(
      ErrorMessage.NotSerializable()
    );

    expect(() =>
      memoizer.set(fn1, [1, () => undefined, { d: BigInt(5) }], returnType1)
    ).toThrow(ErrorMessage.NotSerializable());
  });
});

describe('cache.clear and cache.clearAll', () => {
  it('clears memoized values from cache', async () => {
    expect.hasAssertions();

    {
      const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
      const fn2 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
      const fn3 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];

      const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
      const parameters2: Parameters<typeof fn1> = [2, 'four', { d: false }];
      const parameters3: Parameters<typeof fn1> = [3, 'eight', { d: true }];

      const returnType1: ReturnType<typeof fn1> = [1, 'two', true];
      const returnType2: ReturnType<typeof fn1> = [2, 'four', false];
      const returnType3: ReturnType<typeof fn1> = [3, 'eight', true];

      memoizer.set(fn1, parameters1, returnType1);
      memoizer.set(fn2, parameters2, returnType2);
      memoizer.set(fn3, parameters3, returnType3);

      expect(memoizer.get(fn1, parameters1)).toBeDefined();
      expect(memoizer.get(fn2, parameters2)).toBeDefined();
      expect(memoizer.get(fn3, parameters3)).toBeDefined();

      memoizer.clear([fn3]);

      expect(memoizer.get(fn1, parameters1)).toBeDefined();
      expect(memoizer.get(fn2, parameters2)).toBeDefined();
      expect(memoizer.get(fn3, parameters3)).toBeUndefined();

      memoizer.clear([fn2, fn1]);

      expect(memoizer.get(fn1, parameters1)).toBeUndefined();
      expect(memoizer.get(fn2, parameters2)).toBeUndefined();
      expect(memoizer.get(fn3, parameters3)).toBeUndefined();
    }

    {
      const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
      const fn2 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
      const fn3 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];

      const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
      const parameters2: Parameters<typeof fn1> = [2, 'four', { d: false }];
      const parameters3: Parameters<typeof fn1> = [3, 'eight', { d: true }];

      const returnType1: ReturnType<typeof fn1> = [1, 'two', true];
      const returnType2: ReturnType<typeof fn1> = [2, 'four', false];
      const returnType3: ReturnType<typeof fn1> = [3, 'eight', true];

      memoizer.set(fn1, parameters1, returnType1);
      memoizer.set(fn2, parameters2, returnType2);
      memoizer.set(fn3, parameters3, returnType3);

      expect(memoizer.get(fn1, parameters1)).toBeDefined();
      expect(memoizer.get(fn2, parameters2)).toBeDefined();
      expect(memoizer.get(fn3, parameters3)).toBeDefined();

      memoizer.clearAll();

      expect(memoizer.get(fn1, parameters1)).toBeUndefined();
      expect(memoizer.get(fn2, parameters2)).toBeUndefined();
      expect(memoizer.get(fn3, parameters3)).toBeUndefined();
    }
  });
});

describe('cache stats', () => {
  it('returns expected cache stats', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const fn2 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const fn3 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];

    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const parameters2: Parameters<typeof fn1> = [2, 'four', { d: false }];
    const parameters3: Parameters<typeof fn1> = [3, 'eight', { d: true }];

    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];
    const returnType2: ReturnType<typeof fn1> = [2, 'four', false];
    const returnType3: ReturnType<typeof fn1> = [3, 'eight', true];

    memoizer.get(fn1, parameters1);
    memoizer.get(fn2, parameters2);
    memoizer.get(fn3, parameters3);

    memoizer.set(fn1, parameters1, returnType1);
    memoizer.set(fn2, parameters2, returnType2);
    memoizer.set(fn3, parameters3, returnType3);

    memoizer.get(fn1, parameters1);
    memoizer.get(fn2, parameters2);
    memoizer.get(fn3, parameters3);

    memoizer.clear([fn1]);

    memoizer.get(fn1, parameters1);
    memoizer.get(fn2, parameters2);
    memoizer.get(fn3, parameters3);

    memoizer.set(fn1, parameters1, returnType1);
    memoizer.set(fn2, parameters2, returnType2, { maxAgeMs: 100 });
    memoizer.set(fn3, parameters3, returnType3);

    expect(memoizer).toStrictEqual({
      get: expect.any(Function),
      set: expect.any(Function),
      clear: expect.any(Function),
      clearAll: expect.any(Function),
      clears: 1,
      gets: 9,
      getsHits: 5,
      getsMisses: 4,
      sets: 6,
      setsCreated: 4,
      setsOverwrites: 2,
      expirations: 0,
      pendingExpirations: 1,
      cachedScopes: 3,
      cachedEntries: 3
    });

    memoizer.clearAll();

    expect(memoizer).toStrictEqual({
      get: expect.any(Function),
      set: expect.any(Function),
      clear: expect.any(Function),
      clearAll: expect.any(Function),
      clears: 0,
      gets: 0,
      getsHits: 0,
      getsMisses: 0,
      sets: 0,
      setsCreated: 0,
      setsOverwrites: 0,
      expirations: 0,
      pendingExpirations: 0,
      cachedScopes: 0,
      cachedEntries: 0
    });

    memoizer.get(fn1, parameters1);
    memoizer.get(fn2, parameters2);
    memoizer.get(fn3, parameters3);

    expect(memoizer).toStrictEqual({
      get: expect.any(Function),
      set: expect.any(Function),
      clear: expect.any(Function),
      clearAll: expect.any(Function),
      clears: 0,
      gets: 3,
      getsHits: 0,
      getsMisses: 3,
      sets: 0,
      setsCreated: 0,
      setsOverwrites: 0,
      expirations: 0,
      pendingExpirations: 0,
      cachedScopes: 3,
      cachedEntries: 0
    });
  });

  it('metadata remains accurate after expiring cached values that have not yet been evicted are cleared', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const fn2 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const fn3 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const returnType: ReturnType<typeof fn1> = [1, 'two', true];

    expect(memoizer.pendingExpirations).toBe(0);
    expect(memoizer.expirations).toBe(0);

    memoizer.set(fn1, parameters, returnType, { maxAgeMs: 200 });

    expect(memoizer.pendingExpirations).toBe(1);
    expect(memoizer.expirations).toBe(0);

    memoizer.clear([fn2]);

    expect(memoizer.pendingExpirations).toBe(1);
    expect(memoizer.expirations).toBe(0);

    memoizer.clear([fn1]);

    expect(memoizer.pendingExpirations).toBe(0);
    expect(memoizer.expirations).toBe(0);

    memoizer.set(fn2, parameters, returnType, { maxAgeMs: 100 });
    memoizer.set(fn3, parameters, returnType, { maxAgeMs: 200 });

    expect(memoizer.pendingExpirations).toBe(2);
    expect(memoizer.expirations).toBe(0);

    jest.advanceTimersByTime(100);

    expect(memoizer.pendingExpirations).toBe(1);
    expect(memoizer.expirations).toBe(1);

    memoizer.clearAll();

    expect(memoizer.pendingExpirations).toBe(0);
    expect(memoizer.expirations).toBe(0);

    expect(memoizer.get(fn1, parameters)).toBeUndefined();
    expect(memoizer.get(fn2, parameters)).toBeUndefined();
    expect(memoizer.get(fn3, parameters)).toBeUndefined();
  });
});

describe('memoize', () => {
  it('returns a memoized version of a function', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d] as const;
    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const returnType1: ReturnType<typeof fn1> = [1, 'two', true];

    const memoized1 = memoize(fn1);
    const returnValue = memoized1(...parameters1);

    expect(returnValue).toStrictEqual(returnType1);
    expect(memoized1(...parameters1)).toBe(returnValue);
  });

  it('returns a memoized version of a function that supports a "useCached" option', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const returnType: ReturnType<typeof fn1> = [1, 'two', true];

    const memoized = memoize(fn1, { addUseCachedOption: true });
    const returnValue1 = memoized(...parameters, { useCached: true });

    expect(returnValue1).toStrictEqual(returnType);
    expect(memoized(...parameters, { useCached: true })).toBe(returnValue1);

    const returnValue2 = memoized(...parameters, { useCached: false });

    expect(returnValue2).toStrictEqual(returnValue1);
    expect(returnValue2).not.toBe(returnValue1);
  });

  it('returns a memoized version of a function that has its cached value evicted after maxAgeMs', async () => {
    expect.hasAssertions();

    const fn1 = (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const parameters1: Parameters<typeof fn1> = [1, 'two', { d: true }];
    const parameters2: Parameters<typeof fn1> = [2, 'four', { d: false }];

    const memoized = memoize(fn1, { maxAgeMs: 1000 });

    const returnValue1 = memoized(...parameters1);
    expect(returnValue1).toBeDefined();

    jest.advanceTimersByTime(500);

    expect(memoized(...parameters1)).toBe(returnValue1);

    const returnValue2 = memoized(...parameters2);
    expect(returnValue2).toBeDefined();

    jest.advanceTimersByTime(500);

    expect(memoized(...parameters2)).toBe(returnValue2);

    const returnValue12 = memoized(...parameters1);
    expect(returnValue12).not.toBe(returnValue1);
    expect(returnValue12).toStrictEqual(returnValue1);

    jest.advanceTimersByTime(500);

    const returnValue22 = memoized(...parameters2);
    expect(returnValue22).not.toBe(returnValue2);
    expect(returnValue22).toStrictEqual(returnValue2);
  });

  it('can memoize async functions and promise-returning functions', async () => {
    expect.hasAssertions();

    const parameters: Parameters<typeof asyncFn> = [1, 'two', { d: true }];
    const result: Awaited<ReturnType<typeof asyncFn>> = [1, 'two', true];

    const asyncFn = async (a: number, b: string, c: { d: boolean }) => [a, b, c.d];
    const promiseReturningFn = (a: number, b: string, c: { d: boolean }) =>
      Promise.resolve([a, b, c.d]);

    const memoizedAsync = memoize(asyncFn);
    const memoizedPromise = memoize(promiseReturningFn);

    await expect(memoizedAsync(...parameters)).resolves.toStrictEqual(result);
    await expect(memoizedPromise(...parameters)).resolves.toStrictEqual(result);

    // * When cache returns undefined (which is never wrapped in a promise), the
    // * result final should still be a promise if it would have been anyway
    await expect(memoizedAsync(2, 'four', { d: false })).resolves.toBeArray();
    await expect(memoizedPromise(2, 'four', { d: false })).resolves.toBeArray();
  });

  it('properly caches and returns defined-but-falsy results', async () => {
    expect.hasAssertions();

    let count = 0;
    const fn: (a: number) => number | null | boolean = () =>
      [0, null, false, count][count++]!;

    const memoizedFn = memoize(fn);

    expect(memoizedFn(1)).toBe(0);
    expect(memoizedFn(1)).toBe(0);
    expect(memoizedFn(1)).toBe(0);

    expect(memoizedFn(2)).toBeNull();
    expect(memoizedFn(2)).toBeNull();
    expect(memoizedFn(2)).toBeNull();

    expect(memoizedFn(3)).toBeFalse();
    expect(memoizedFn(3)).toBeFalse();
    expect(memoizedFn(3)).toBeFalse();

    expect(memoizedFn(4)).toBe(3);
    expect(memoizedFn(4)).toBe(3);
    expect(memoizedFn(4)).toBe(3);
  });
});
