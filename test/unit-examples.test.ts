// * These tests ensure the examples in the readme function as expected.

import { memoize, memoizer } from 'universe';

jest.useFakeTimers();

// eslint-disable-next-line jest/require-hook
let counter = 0;
const expensiveAnalysis = (..._args: unknown[]) => counter++;

beforeEach(() => {
  counter = 0;
  memoizer.clearAll();
});

describe('memoize', () => {
  function doExpensiveAnalysisOfFile(
    filePath: string,
    options: { activateFunctionality?: boolean } = {}
  ) {
    const { activateFunctionality } = options;
    const complexResult = expensiveAnalysis(filePath, activateFunctionality);

    return complexResult;
  }

  async function asyncDoExpensiveAnalysisOfFile(
    filePath: string,
    options: { activateFunctionality?: boolean } = {}
  ) {
    const { activateFunctionality } = options;
    const complexResult = expensiveAnalysis(filePath, activateFunctionality);

    return complexResult;
  }

  it('simple memoization', async () => {
    expect.hasAssertions();

    const memoizedDoExpensiveAnalysisOfFile = memoize(doExpensiveAnalysisOfFile);
    const previousResult = memoizedDoExpensiveAnalysisOfFile(
      '/repos/project/some-file.js'
    );

    expect(memoizedDoExpensiveAnalysisOfFile('/repos/project/some-file.js')).toBe(
      previousResult
    );
  });

  it('expiring memoization', async () => {
    expect.hasAssertions();

    const memoizedDoExpensiveAnalysisOfFile = memoize(doExpensiveAnalysisOfFile, {
      maxAgeMs: 10_000
    });

    const previousResult = memoizedDoExpensiveAnalysisOfFile(
      '/repos/project/some-file.js'
    );

    expect(memoizedDoExpensiveAnalysisOfFile('/repos/project/some-file.js')).toBe(
      previousResult
    );

    jest.advanceTimersByTime(10_000);

    expect(memoizedDoExpensiveAnalysisOfFile('/repos/project/some-file.js')).toBe(
      previousResult + 1
    );
  });

  it('async memoization', async () => {
    expect.hasAssertions();

    const memoizedDoExpensiveAnalysisOfFile = memoize(asyncDoExpensiveAnalysisOfFile);

    const previousResult = await memoizedDoExpensiveAnalysisOfFile(
      '/repos/project/some-file.js'
    );

    await expect(
      memoizedDoExpensiveAnalysisOfFile('/repos/project/some-file.js')
    ).resolves.toBe(previousResult);
  });
});

describe('memoizer', () => {
  it('basic memoization', async () => {
    expect.hasAssertions();

    function doExpensiveAnalysisOfFile(
      filePath: string,
      options: { activateFunctionality: boolean }
    ): number {
      const { activateFunctionality } = options;
      let complexResult = memoizer.get(doExpensiveAnalysisOfFile, [filePath, options]);

      if (complexResult === undefined) {
        complexResult = expensiveAnalysis(filePath, activateFunctionality);
        memoizer.set(doExpensiveAnalysisOfFile, [filePath, options], complexResult);
      }

      return complexResult;
    }

    const previousResult = doExpensiveAnalysisOfFile('/repos/project/some-file.js', {
      activateFunctionality: true
    });

    expect(
      doExpensiveAnalysisOfFile('/repos/project/some-file.js', {
        activateFunctionality: true
      })
    ).toBe(previousResult);
  });

  it('optional memoization', async () => {
    expect.hasAssertions();

    function doExpensiveAnalysisOfFile(
      filePath: string,
      {
        useCached,
        ...cacheIdComponents
      }: { activateFunctionality?: boolean; useCached: boolean }
    ): number {
      const { activateFunctionality } = cacheIdComponents;
      let complexResult;

      if (useCached) {
        complexResult = memoizer.get(doExpensiveAnalysisOfFile, [
          filePath,
          cacheIdComponents
        ]);
      }

      if (complexResult === undefined) {
        complexResult = expensiveAnalysis(filePath, activateFunctionality);

        memoizer.set(
          doExpensiveAnalysisOfFile,
          [filePath, cacheIdComponents],
          complexResult
        );
      }

      return complexResult;
    }

    const previousResult = doExpensiveAnalysisOfFile('/repos/project/some-file.js', {
      useCached: true
    });

    expect(
      doExpensiveAnalysisOfFile('/repos/project/some-file.js', {
        useCached: true
      })
    ).toBe(previousResult);

    expect(
      doExpensiveAnalysisOfFile('/repos/project/some-file.js', {
        useCached: false
      })
    ).toBe(previousResult + 1);
  });

  it('complex memoization #1', async () => {
    expect.hasAssertions();

    function doExpensiveAnalysisOfFiles(
      filePaths: string[],
      {
        useCached = true,
        ...cacheIdComponents
      }: { activateFunctionality?: boolean; useCached?: boolean } = {}
    ): number[] {
      const { activateFunctionality } = cacheIdComponents;
      const complexResults = [];

      for (const filePath of filePaths) {
        let complexResult;

        if (useCached) {
          complexResult = memoizer.get<
            typeof doExpensiveAnalysisOfFiles,
            'expect unpacked ids',
            'expect unpacked value'
          >(doExpensiveAnalysisOfFiles, [filePath, cacheIdComponents]);
        }

        if (complexResult === undefined) {
          complexResult = expensiveAnalysis(filePath, activateFunctionality);

          memoizer.set<
            typeof doExpensiveAnalysisOfFiles,
            'expect unpacked ids',
            'expect unpacked value'
          >(doExpensiveAnalysisOfFiles, [filePath, cacheIdComponents], complexResult);
        }

        complexResults.push(complexResult);
      }

      return complexResults;
    }

    const previousResult = doExpensiveAnalysisOfFiles([
      '/repos/project/some-file-1.js',
      '/repos/project/some-file-2.js',
      '/repos/project/some-file-3.js'
    ]);

    expect(doExpensiveAnalysisOfFiles(['/repos/project/some-file-2.js'])[0]).toBe(
      previousResult[1]
    );
  });

  it('complex memoization #2', async () => {
    expect.hasAssertions();

    function doExpensiveAnalysisOfFiles(
      filePaths: string[],
      {
        useCached,
        ...cacheIdComponents
      }: { activateFunctionality?: boolean; useCached: boolean }
    ): number[] {
      const { activateFunctionality } = cacheIdComponents;
      let complexResults;

      if (useCached) {
        complexResults = memoizer.get<
          typeof doExpensiveAnalysisOfFiles,
          'expect ids as-is'
        >(doExpensiveAnalysisOfFiles, [filePaths, cacheIdComponents]);
      }

      if (complexResults === undefined) {
        complexResults = [expensiveAnalysis(filePaths, activateFunctionality)];

        memoizer.set<typeof doExpensiveAnalysisOfFiles, 'expect ids as-is'>(
          doExpensiveAnalysisOfFiles,
          [filePaths, cacheIdComponents],
          complexResults
        );
      }

      return complexResults;
    }

    const previousResult = doExpensiveAnalysisOfFiles(
      [
        '/repos/project/some-file-1.js',
        '/repos/project/some-file-2.js',
        '/repos/project/some-file-3.js'
      ],
      {
        activateFunctionality: true,
        useCached: true
      }
    );

    expect(
      doExpensiveAnalysisOfFiles(
        [
          '/repos/project/some-file-1.js',
          '/repos/project/some-file-2.js',
          '/repos/project/some-file-3.js'
        ],
        {
          activateFunctionality: true,
          useCached: true
        }
      )
    ).toBe(previousResult);

    const nextResult = doExpensiveAnalysisOfFiles(
      [
        '/repos/project/some-file-1.js',
        '/repos/project/some-file-2.js',
        '/repos/project/some-file-3.js'
      ],
      {
        activateFunctionality: false,
        useCached: true
      }
    );

    expect(nextResult).not.toBe(previousResult);
  });

  it('async memoization', async () => {
    expect.hasAssertions();

    async function doExpensiveAnalysisOfFile({
      useCached,
      ...cacheIdComponents
    }: {
      filePath: string;
      activateFunctionality?: boolean;
      useCached: boolean;
    }): Promise<number> {
      const { filePath, activateFunctionality } = cacheIdComponents;
      let complexResult: number | undefined;

      if (useCached) {
        complexResult = await memoizer.get(doExpensiveAnalysisOfFile, [
          cacheIdComponents
        ]);
      }

      if (complexResult === undefined) {
        complexResult = expensiveAnalysis(filePath, activateFunctionality);
        memoizer.set(doExpensiveAnalysisOfFile, [cacheIdComponents], complexResult);
      }

      return complexResult;
    }

    const previousResult = await doExpensiveAnalysisOfFile({
      filePath: '/repos/project/some-file.js',
      useCached: true
    });

    await expect(
      doExpensiveAnalysisOfFile({
        filePath: '/repos/project/some-file.js',
        useCached: true
      })
    ).resolves.toBe(previousResult);

    await expect(
      doExpensiveAnalysisOfFile({
        filePath: '/repos/project/some-file.js',
        useCached: false
      })
    ).resolves.toBe(previousResult + 1);

    await expect(
      doExpensiveAnalysisOfFile({
        filePath: '/repos/project/some-file-2.js',
        useCached: true
      })
    ).resolves.toBe(previousResult + 2);
  });

  it('piecemeal memoization', async () => {
    expect.hasAssertions();

    function doExpensiveAnalysisOfFile({
      useCached,
      activateFunctionality = true,
      ...cacheIdComponents
    }: {
      filePath: string;
      activateFunctionality: boolean;
      activateOtherFunctionality?: boolean;
      somethingElse: number;
      useCached: boolean;
    }): number {
      type MemoizedDoExpensiveAnalysisOfFile = (
        ...args: [typeof cacheIdComponents]
      ) => ReturnType<typeof doExpensiveAnalysisOfFile>;

      const { filePath, activateOtherFunctionality, somethingElse } = cacheIdComponents;

      let complexResult;

      if (useCached) {
        complexResult = memoizer.get<MemoizedDoExpensiveAnalysisOfFile>(
          doExpensiveAnalysisOfFile as MemoizedDoExpensiveAnalysisOfFile,
          [cacheIdComponents]
        );
      }

      if (complexResult === undefined) {
        complexResult = expensiveAnalysis(
          filePath,
          activateFunctionality,
          activateOtherFunctionality
        );

        memoizer.set<MemoizedDoExpensiveAnalysisOfFile>(
          doExpensiveAnalysisOfFile as MemoizedDoExpensiveAnalysisOfFile,
          [cacheIdComponents],
          complexResult
        );
      }

      void somethingElse;
      return complexResult;
    }

    const previousResult = doExpensiveAnalysisOfFile({
      filePath: '/repos/project/some-file.js',
      useCached: true,
      activateFunctionality: true,
      somethingElse: 5
    });

    expect(
      doExpensiveAnalysisOfFile({
        filePath: '/repos/project/some-file.js',
        useCached: true,
        activateFunctionality: false,
        somethingElse: 5
      })
    ).toBe(previousResult);

    expect(
      doExpensiveAnalysisOfFile({
        filePath: '/repos/project/some-file.js',
        useCached: true,
        activateFunctionality: true,
        somethingElse: 6
      })
    ).toBe(previousResult + 1);
  });

  it('expiring memoization', async () => {
    expect.hasAssertions();

    async function doExpensiveAnalysisOfFile({
      useCached,
      ...cacheIdComponents
    }: {
      filePath: string;
      activateFunctionality?: boolean;
      useCached: boolean;
    }): Promise<number> {
      const { filePath, activateFunctionality } = cacheIdComponents;
      let complexResult: number | undefined;

      if (useCached) {
        complexResult = await memoizer.get(doExpensiveAnalysisOfFile, [
          cacheIdComponents
        ]);
      }

      if (complexResult === undefined) {
        complexResult = expensiveAnalysis(filePath, activateFunctionality);
        memoizer.set(doExpensiveAnalysisOfFile, [cacheIdComponents], complexResult, {
          maxAgeMs: 10_000
        });
      }

      return complexResult;
    }

    const previousResult = await doExpensiveAnalysisOfFile({
      filePath: '/repos/project/some-file.js',
      useCached: true
    });

    await expect(
      doExpensiveAnalysisOfFile({
        filePath: '/repos/project/some-file.js',
        useCached: true
      })
    ).resolves.toBe(previousResult);

    memoizer.clear([doExpensiveAnalysisOfFile]);

    await expect(
      doExpensiveAnalysisOfFile({
        filePath: '/repos/project/some-file.js',
        useCached: true
      })
    ).resolves.toBe(previousResult + 1);
  });
});
