# TODO

## High Priority

1. Transition:
   - change mountPoints
   - change state
   - change curvature
   - add label
   - change label
1. Alternative mount point discovery: while creating new transition, observe state, and use `getClosestMountPoint`.
   1. If same state, protect.

1. Why orchestrator?
Selected, Reaction between selected <-> other, State

## Medium Priority

1. Implement separated architecture (view and behavior).
1. Refactor StateView.
1. Add docstrings.

## Low Priority

## Ideas

1. Add matchers for the router.
1. Think about another `Route`-like custom element, that is a `<div>` containing `<template>` listening to `PathPublisher` path changes and accordingly rendering/removing its content.

```js
class State {
  transitions: {
    'eps': [
      {
        'transition': REF
        'mountPoint': 3
      },
      ...
    ]
    'a':
  }
}
```
