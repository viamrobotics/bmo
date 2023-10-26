# `@viamrobotics/sdk-svelte`

## Getting started

The [viam-typescript-sdk](https://github.com/viamrobotics/viam-typescript-sdk) made for [svelte](https://svelte.dev/) applications.

## Installation

Add `sdk-svelte` using your package manager of choice (we use `pnpm`):

```
pnpm add --save-dev @viamrobotics/prime-core
```

## Playground

The playground can be used during development but is not used outside of the package.

```bash
pnpm install
pnpm -C packages/sdk-svelte dev
```

<!-- TODO: Add notes for setting up a robot to test against. -->

## Linting

To lint and typecheck:

```bash
pnpm -C packages/sdk-svelte check        # check svelte and lint
pnpm -C packages/sdk-svelte check-svelte # check svelte only
pnpm -C packages/sdk-svelte check-lint   # check lint only with prettier and eslint
pnpm -C packages/sdk-svelte format       # format with prettier
```

## Testing

To test with [vitest][https://vitest.dev/]:

```bash
pnpm -C packages/sdk-svelte test-unit        # run once
pnpm -C packages/sdk-svelte test-unit:watch  # watch tests
```

To test with [playwright][https://playwright.dev/]:

```bash
pnpm -C packages/sdk-svelte test-integration 
```