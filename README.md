<!-- symbiote-template-region-start 1 -->

<p align="center" width="100%">
  <img width="300" src="https://raw.githubusercontent.com/Xunnamius/memoize/refs/heads/main/logo.png">
</p>

<p align="center" width="100%">
<!-- symbiote-template-region-end -->
An extensible memoization cache and global singleton used to speed up expensive function calls
<!-- symbiote-template-region-start 2 -->
</p>

<hr />

<div align="center">

[![Black Lives Matter!][x-badge-blm-image]][x-badge-blm-link]
[![Last commit timestamp][x-badge-lastcommit-image]][x-badge-repo-link]
[![Codecov][x-badge-codecov-image]][x-badge-codecov-link]
[![Source license][x-badge-license-image]][x-badge-license-link]
[![Uses Semantic Release!][x-badge-semanticrelease-image]][x-badge-semanticrelease-link]

[![NPM version][x-badge-npm-image]][x-badge-npm-link]
[![Monthly Downloads][x-badge-downloads-image]][x-badge-downloads-link]

</div>

<br />

# memoize (@-xun/memoize)

<!-- symbiote-template-region-end -->

An extremely flexible memoization cache and global singleton used to speed up
expensive function calls.

Provides a simple but powerful API. Supports any number of parameters and/or a
final "options" object parameter, asynchronous and synchronous functions, and
per-function "scoped" caching. Provides nuanced usage statistics and
super-powered TypeScript types for smooth DX.

<!-- symbiote-template-region-start 3 -->

---

<!-- remark-ignore-start -->
<!-- symbiote-template-region-end -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Usage](#usage)
  - [`memoize`](#memoize)
  - [`memoizer`](#memoizer)
  - [Other Considerations](#other-considerations)
- [Appendix](#appendix)
  - [Published Package Details](#published-package-details)
  - [License](#license)
- [Contributing and Support](#contributing-and-support)
  - [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- symbiote-template-region-start 4 -->
<!-- remark-ignore-end -->

<br />

## Install

<!-- symbiote-template-region-end -->

To install:

```shell
npm install @-xun/memoize
```

## Usage

> Full API documentation is available [here][x-repo-docs].

<br />

Original function without memoization:

```typescript
function doExpensiveAnalysisOfFile(
  filePath: string,
  options: { activateFunctionality?: boolean } = {}
) {
  const { activateFunctionality } = options;
  const complexResult = expensiveAnalysis(filePath, activateFunctionality);

  return complexResult;
}

doExpensiveAnalysisOfFile('/repos/project/some-file.js', {
  activateFunctionality: true
});
```

<br />

<!-- remark-ignore-start -->

### [`memoize`](./docs/src/functions/memoize.md)

<!-- remark-ignore-end -->

Simple memoization:

```typescript
import { memoize } from '@-xun/memoize';

const memoizedDoExpensiveAnalysisOfFile = memoize(doExpensiveAnalysisOfFile);

memoizedDoExpensiveAnalysisOfFile('/repos/project/some-file.js');
```

<br />

Expiring memoization, where cache entries are evicted after a certain amount of
time:

```typescript
import { memoize } from '@-xun/memoize';

const memoizedDoExpensiveAnalysisOfFile = memoize(doExpensiveAnalysisOfFile, {
  maxAgeMs: 10_000
});

memoizedDoExpensiveAnalysisOfFile('/repos/project/some-file.js');
```

<br />

Memoization of an async function, optionally allowing the caller to explicitly
recompute the cached value when desired:

```typescript
import { memoize } from '@-xun/memoize';

// Suppose "asyncDoExpensiveAnalysisOfFile" is defined as an async version of
// "doExpensiveAnalysisOfFile"

const memoizedDoExpensiveAnalysisOfFile = memoize(
  asyncDoExpensiveAnalysisOfFile,
  { addUseCachedOption: true }
);

await memoizedDoExpensiveAnalysisOfFile('/repos/project/some-file.js', {
  // Will look in the cache for a result first (wrt the given filePath).
  useCached: true
});

await memoizedDoExpensiveAnalysisOfFile('/repos/project/some-file.js', {
  // Will bypass the cache and force recomputation, then cache the result.
  useCached: false
});
```

<br />

<!-- remark-ignore-start -->

### [`memoizer`](./docs/src/variables/memoizer.md)

<!-- remark-ignore-end -->

Basic memoization:

```typescript
import { memoizer } from '@-xun/memoize';

function doExpensiveAnalysisOfFile(
  filePath: string,
  options: { activateFunctionality: boolean }
) {
  const { activateFunctionality } = options;
  let complexResult = memoizer.get(doExpensiveAnalysisOfFile, [
    filePath,
    options
  ]);

  if (!complexResult) {
    complexResult = expensiveAnalysis(filePath, activateFunctionality);
    memoizer.set(doExpensiveAnalysisOfFile, [filePath, options], complexResult);
  }

  return complexResult;
}

doExpensiveAnalysisOfFile('/repos/project/some-file.js');
```

<br />

Optional memoization, allowing the caller to explicitly recompute the cached
value when desired:

```typescript
import { memoizer } from '@-xun/memoize';

// It is usually ideal to force the caller to acknowledge that they're dealing
// with a memoized function, which can prevent bad surprises. Still, we could
// have made useCached optional if we wanted to.

function doExpensiveAnalysisOfFile(
  filePath: string,
  {
    useCached,
    ...cacheIdComponents
  }: { activateFunctionality?: boolean; useCached: boolean }
) {
  const { activateFunctionality } = cacheIdComponents;
  let complexResult;

  if (options.useCached) {
    complexResult = memoizer.get(doExpensiveAnalysisOfFile, [
      filePath,
      cacheIdComponents
    ]);
  }

  if (!complexResult) {
    complexResult = expensiveAnalysis(filePath, activateFunctionality);

    memoizer.set(
      doExpensiveAnalysisOfFile,
      [filePath, cacheIdComponents],
      complexResult
    );
  }

  return complexResult;
}

doExpensiveAnalysisOfFile('/repos/project/some-file.js', {
  // Will look in the cache for a result first (wrt the given filePath).
  useCached: true
});

doExpensiveAnalysisOfFile('/repos/project/some-file.js', {
  // Will bypass the cache and force recomputation, then cache the result.
  useCached: false
});
```

<br />

More complex memoization, where we accept an array of paths with all, some, or
none have been cached already. Our goal here is to do as little work as
possible:

```typescript
import { memoizer } from '@-xun/memoize';

function doExpensiveAnalysisOfFiles(
  filePaths: string[],
  {
    useCached = true,
    ...cacheIdComponents
  }: { activateFunctionality?: boolean; useCached?: boolean } = {}
) {
  const { activateFunctionality } = cacheIdComponents;
  const complexResults = [];

  for (const filePath of filePaths) {
    let complexResult;

    if (options.useCached) {
      // Both the `filePaths` parameter and the return type of
      // doExpensiveAnalysisOfFiles are "unwrapped" (T[] => T) automatically.
      // This can be disabled (see next example).
      complexResult = memoizer.get(doExpensiveAnalysisOfFiles, [
        filePath,
        cacheIdComponents
      ]);
    }

    if (!complexResult) {
      complexResult = expensiveAnalysis(filePath, activateFunctionality);

      memoizer.set(
        doExpensiveAnalysisOfFiles,
        [filePath, cacheIdComponents],
        complexResult
      );
    }

    complexResults.push(complexResult);
  }

  return complexResults;
}

doExpensiveAnalysisOfFiles([
  '/repos/project/some-file-1.js',
  '/repos/project/some-file-2.js',
  '/repos/project/some-file-3.js'
]);

// Even though the parameters are different, we can still take advantage of the
// memoized result of the previous invocation! No extra work is done by the
// following:
doExpensiveAnalysisOfFiles(['/repos/project/some-file-2.js']);
```

<br />

More complex memoization, where we accept and memoize an array of paths in one
shot:

```typescript
import { memoizer } from '@-xun/memoize';

function doExpensiveAnalysisOfFiles(
  filePaths: string[],
  {
    useCached = true,
    ...cacheIdComponents
  }: { activateFunctionality?: boolean; useCached: boolean } = {}
) {
  const { activateFunctionality } = cacheIdComponents;
  let complexResults;

  if (options.useCached) {
    complexResults = memoizer.get<
      typeof doExpensiveAnalysisOfFiles,
      // Do not "unwrap" the `filePaths` parameter (if it is an array).
      false,
      // Do not "unwrap" the return value (if it is an array).
      false
    >(doExpensiveAnalysisOfFiles, [filePaths, cacheIdComponents]);
  }

  if (!complexResults) {
    complexResults = expensiveAnalysis(filePaths, activateFunctionality);

    memoizer.set<typeof doExpensiveAnalysisOfFiles, false, false>(
      doExpensiveAnalysisOfFiles,
      [filePaths, cacheIdComponents],
      complexResults
    );
  }

  return complexResults;
}

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
);

doExpensiveAnalysisOfFiles(
  [
    '/repos/project/some-file-1.js',
    '/repos/project/some-file-2.js',
    '/repos/project/some-file-3.js'
  ],
  {
    // This being false means a different cache key is generated and the
    // previous results are not reused, even though filePaths is the same!
    activateFunctionality: false,
    useCached: true
  }
);
```

<br />

Memoization of an async function using object-style parameters:

```typescript
import { memoizer } from '@-xun/memoize';

async function doExpensiveAnalysisOfFile({
  useCached,
  ...cacheIdComponents
}: {
  filePath: string;
  activateFunctionality?: boolean;
  useCached: boolean;
}) {
  const { filePath, activateFunctionality } = cacheIdComponents;
  let complexResult;

  if (options.useCached) {
    // doExpensiveAnalysisOfFile's return type (not the actual value) is always
    // Awaited<...> if it returns a promise.
    complexResult = memoizer.get(doExpensiveAnalysisOfFile, [
      cacheIdComponents
    ]);
  }

  if (!complexResult) {
    complexResult = await expensiveAnalysis(filePath, activateFunctionality);
    memoizer.set(doExpensiveAnalysisOfFile, [cacheIdComponents], complexResult);
  }

  return complexResult;
}

await doExpensiveAnalysisOfFile({
  filePath: '/repos/project/some-file.js',
  useCached: true
});

await doExpensiveAnalysisOfFile({
  filePath: '/repos/project/some-file.js',
  useCached: false
});
```

<br />

Customizing which parameters are considered as components of the cache key when
memoizing a function:

```typescript
import { memoizer } from '@-xun/memoize';

function doExpensiveAnalysisOfFile({
  useCached,
  activateFunctionality = true,
  // We only want to use a subset options when calculating the cache "id".
  ...cacheIdComponents
}: {
  filePath: string;
  activateFunctionality: boolean;
  activateOtherFunctionality?: boolean;
  somethingElse: number;
  useCached: boolean;
}) {
  // These three properties will be used as components for our cache "id". If
  // one of them changes, the cache will miss. The other properties are ignored.
  const { filePath, activateOtherFunctionality, somethingElse } =
    cacheIdComponents;

  let complexResult;

  if (options.useCached) {
    complexResult = memoizer.get(doExpensiveAnalysisOfFile, [
      cacheIdComponents
    ]);
  }

  if (!complexResult) {
    complexResult = expensiveAnalysis(
      filePath,
      activateFunctionality,
      activateOtherFunctionality
    );

    memoizer.set(doExpensiveAnalysisOfFile, [cacheIdComponents], complexResult);
  }

  doSomethingElse(somethingElse);
  return complexResult;
}

doExpensiveAnalysisOfFile({
  filePath: '/repos/project/some-file.js',
  useCached: true,
  activateFunctionality: true,
  somethingElse: 5
});

// Cache miss
doExpensiveAnalysisOfFile({
  filePath: '/repos/project/some-file.js',
  useCached: true,
  activateFunctionality: true,
  somethingElse: 6
});

// Cache hit
doExpensiveAnalysisOfFile({
  filePath: '/repos/project/some-file.js',
  useCached: true,
  activateFunctionality: false,
  somethingElse: 5
});
```

<br />

Expiring cache entries (in this example: 10 seconds after being set unless set
again), clearing the cache on a per-scope basis, and accessing cache usage
metadata:

```typescript
import { memoizer } from '@-xun/memoize';

async function doExpensiveAnalysisOfFile({
  useCached,
  ...cacheIdComponents
}: {
  filePath: string;
  activateFunctionality?: boolean;
  useCached: boolean;
}) {
  const { filePath, activateFunctionality } = cacheIdComponents;
  let complexResult;

  if (options.useCached) {
    complexResult = memoizer.get(doExpensiveAnalysisOfFile, [
      cacheIdComponents
    ]);
  }

  if (!complexResult) {
    complexResult = await expensiveAnalysis(filePath, activateFunctionality);
    memoizer.set(
      doExpensiveAnalysisOfFile,
      [cacheIdComponents],
      complexResult,
      { maxAgeMs: 10_000 }
    );
  }

  return complexResult;
}

await doExpensiveAnalysisOfFile({
  filePath: '/repos/project/some-file.js',
  useCached: true
});

// Hits the cache
await doExpensiveAnalysisOfFile({
  filePath: '/repos/project/some-file.js',
  useCached: true
});

// Clears the cache but only for the specified function
memoizer.clear([doExpensiveAnalysisOfFile]);

// Misses the cache
await doExpensiveAnalysisOfFile({
  filePath: '/repos/project/some-file.js',
  useCached: true
});

console.log(memoizer);

// {
//   set: [Function: setInCache],
//   sets: 3,
//   setsOverwrites: 1,
//   setsCreated: 2,
//   get: [Function: getFromCache],
//   gets: 3,
//   getsHits: 1,
//   getsMisses: 2,
//   clear: [Function: clearCacheByScope],
//   clearAll: [Function: clearCache],
//   clears: 1,
//   expirations: 0,
//   pendingExpirations: 1,
//   cachedScopes: 1,
//   cachedEntries: 1,
// }
```

### Other Considerations

- The internal cache is implemented as a global singleton that will persist
  across the entire runtime, even when imported from different packages. No need
  to worry about any of the usual package hazards.

- The `useCached` property, if used as part of an "options" object, is omitted
  from the type of the secondary optional parameter. The name of this property
  can be customized, and additional properties can be similarly omitted, using
  the `SecondaryKeysToOmit` generic parameter on `memoizer.get` and
  `memoizer.set`.

- All parameters of memoized functions must be [serializable][1] via
  `JSON.stringify` or explicitly `undefined`. If they are defined but not
  serializable, create a wrapper function that transforms any unserializable
  parameters into some serializable representation before passing them to the
  memoizer functions.

> [!CAUTION]
>
> `JSON.stringify` will not consistently throw when it encounters unserializable
> or semi-serializable parameters!
>
> If used carelessly, this can lead to arbitrary cache key collisions where the
> memoizer functions return the same result for obviously different sets of
> parameters when it clearly shouldn't.
>
> To prevent this, ensure your function's memoized parameters are serializable.

<!-- symbiote-template-region-start 5 -->

## Appendix

<!-- symbiote-template-region-end -->

Further documentation can be found under [`docs/`][x-repo-docs].

<!-- TODO: additional appendix sections here -->
<!-- symbiote-template-region-start 6 -->

### Published Package Details

This is a [CJS2 package][x-pkg-cjs-mojito] with statically-analyzable exports
built by Babel for use in Node.js versions that are not end-of-life. For
TypeScript users, this package supports both `"Node10"` and `"Node16"` module
resolution strategies.

<!-- symbiote-template-region-end -->
<!-- TODO: additional package details here -->
<!-- symbiote-template-region-start 7 -->

<details><summary>Expand details</summary>

That means both CJS2 (via `require(...)`) and ESM (via `import { ... } from ...`
or `await import(...)`) source will load this package from the same entry points
when using Node. This has several benefits, the foremost being: less code
shipped/smaller package size, avoiding [dual package
hazard][x-pkg-dual-package-hazard] entirely, distributables are not
packed/bundled/uglified, a drastically less complex build process, and CJS
consumers aren't shafted.

Each entry point (i.e. `ENTRY`) in [`package.json`'s
`exports[ENTRY]`][x-repo-package-json] object includes one or more [export
conditions][x-pkg-exports-conditions]. These entries may or may not include: an
[`exports[ENTRY].types`][x-pkg-exports-types-key] condition pointing to a type
declaration file for TypeScript and IDEs, a
[`exports[ENTRY].module`][x-pkg-exports-module-key] condition pointing to
(usually ESM) source for Webpack/Rollup, a `exports[ENTRY].node` and/or
`exports[ENTRY].default` condition pointing to (usually CJS2) source for Node.js
`require`/`import` and for browsers and other environments, and [other
conditions][x-pkg-exports-conditions] not enumerated here. Check the
[package.json][x-repo-package-json] file to see which export conditions are
supported.

Note that, regardless of the [`{ "type": "..." }`][x-pkg-type] specified in
[`package.json`][x-repo-package-json], any JavaScript files written in ESM
syntax (including distributables) will always have the `.mjs` extension. Note
also that [`package.json`][x-repo-package-json] may include the
[`sideEffects`][x-pkg-side-effects-key] key, which is almost always `false` for
optimal [tree shaking][x-pkg-tree-shaking] where appropriate.

<!-- symbiote-template-region-end -->
<!-- TODO: additional package details here -->
<!-- symbiote-template-region-start 8 -->

</details>

### License

<!-- symbiote-template-region-end -->

See [LICENSE][x-repo-license].

<!-- TODO: additional license information and/or sections here -->
<!-- symbiote-template-region-start 9 -->

## Contributing and Support

**[New issues][x-repo-choose-new-issue] and [pull requests][x-repo-pr-compare]
are always welcome and greatly appreciated! 🤩** Just as well, you can [star 🌟
this project][x-badge-repo-link] to let me know you found it useful! ✊🏿 Or [buy
me a beer][x-repo-sponsor], I'd appreciate it. Thank you!

See [CONTRIBUTING.md][x-repo-contributing] and [SUPPORT.md][x-repo-support] for
more information.

<!-- symbiote-template-region-end -->
<!-- TODO: additional contribution/support sections here -->
<!-- symbiote-template-region-start 10 -->

### Contributors

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start root-package-only -->
<!-- remark-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- remark-ignore-end -->

Thanks goes to these wonderful people ([emoji
key][x-repo-all-contributors-emojis]):

<!-- remark-ignore-start -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://xunn.io/"><img src="https://avatars.githubusercontent.com/u/656017?v=4?s=100" width="100px;" alt="Bernard"/><br /><sub><b>Bernard</b></sub></a><br /><a href="#infra-Xunnamius" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/Xunnamius/memoize/commits?author=Xunnamius" title="Code">💻</a> <a href="https://github.com/Xunnamius/memoize/commits?author=Xunnamius" title="Documentation">📖</a> <a href="#maintenance-Xunnamius" title="Maintenance">🚧</a> <a href="https://github.com/Xunnamius/memoize/commits?author=Xunnamius" title="Tests">⚠️</a> <a href="https://github.com/Xunnamius/memoize/pulls?q=is%3Apr+reviewed-by%3AXunnamius" title="Reviewed Pull Requests">👀</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- remark-ignore-end -->

This project follows the [all-contributors][x-repo-all-contributors]
specification. Contributions of any kind welcome!

<!-- symbiote-template-region-end -->
<!-- symbiote-template-region-start workspace-package-only -->
<!-- (section elided by symbiote) -->
<!-- symbiote-template-region-end -->

[x-badge-blm-image]: https://xunn.at/badge-blm 'Join the movement!'
[x-badge-blm-link]: https://xunn.at/donate-blm
[x-badge-codecov-image]:
  https://img.shields.io/codecov/c/github/Xunnamius/memoize/main?style=flat-square&token=HWRIOBAAPW&flag=package.main_root
  'Is this package well-tested?'
[x-badge-codecov-link]: https://codecov.io/gh/Xunnamius/memoize
[x-badge-downloads-image]:
  https://img.shields.io/npm/dm/@-xun/memoize?style=flat-square
  'Number of times this package has been downloaded per month'
[x-badge-downloads-link]: https://npmtrends.com/@-xun/memoize
[x-badge-lastcommit-image]:
  https://img.shields.io/github/last-commit/Xunnamius/memoize?style=flat-square
  'Latest commit timestamp'
[x-badge-license-image]:
  https://img.shields.io/npm/l/@-xun/memoize?style=flat-square
  "This package's source license"
[x-badge-license-link]: https://github.com/Xunnamius/memoize/blob/main/LICENSE
[x-badge-npm-image]:
  https://xunn.at/npm-pkg-version/@-xun/memoize
  'Install this package using npm or yarn!'
[x-badge-npm-link]: https://npm.im/@-xun/memoize
[x-badge-repo-link]: https://github.com/Xunnamius/memoize
[x-badge-semanticrelease-image]:
  https://xunn.at/badge-semantic-release
  'This repo practices continuous integration and deployment!'
[x-badge-semanticrelease-link]:
  https://github.com/semantic-release/semantic-release
[x-pkg-cjs-mojito]:
  https://dev.to/jakobjingleheimer/configuring-commonjs-es-modules-for-nodejs-12ed#publish-only-a-cjs-distribution-with-property-exports
[x-pkg-dual-package-hazard]:
  https://nodejs.org/api/packages.html#dual-package-hazard
[x-pkg-exports-conditions]:
  https://webpack.js.org/guides/package-exports#reference-syntax
[x-pkg-exports-module-key]:
  https://webpack.js.org/guides/package-exports#providing-commonjs-and-esm-version-stateless
[x-pkg-exports-types-key]:
  https://devblogs.microsoft.com/typescript/announcing-typescript-4-5-beta#packagejson-exports-imports-and-self-referencing
[x-pkg-side-effects-key]:
  https://webpack.js.org/guides/tree-shaking#mark-the-file-as-side-effect-free
[x-pkg-tree-shaking]: https://webpack.js.org/guides/tree-shaking
[x-pkg-type]:
  https://github.com/nodejs/node/blob/8d8e06a345043bec787e904edc9a2f5c5e9c275f/doc/api/packages.md#type
[x-repo-all-contributors]: https://github.com/all-contributors/all-contributors
[x-repo-all-contributors-emojis]: https://allcontributors.org/docs/en/emoji-key
[x-repo-choose-new-issue]:
  https://github.com/Xunnamius/memoize/issues/new/choose
[x-repo-contributing]: /CONTRIBUTING.md
[x-repo-docs]: docs
[x-repo-license]: ./LICENSE
[x-repo-package-json]: package.json
[x-repo-pr-compare]: https://github.com/Xunnamius/memoize/compare
[x-repo-sponsor]: https://github.com/sponsors/Xunnamius
[x-repo-support]: /.github/SUPPORT.md
[1]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description
