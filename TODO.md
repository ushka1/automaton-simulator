# TODO

## High Priority

## Medium Priority

1. Orchestrator:
    - Selected state, more general interaction handling -> Event Bus?
1. Transition change mount point/state.
1. Transition curvature improvement.
    - alternative calc approach (?)
    - write docs
    - same point connection
    - think about "stable" vector approach, meaning if curvature is downwards, it remains downwards, no matter the states position
1. Transition set label.
1. State set label.

## Low Priority

1. Modularize classes:
    - Orchestrator -> StateManager, TransitionManager, ListenerManager (?)
1. Alternative mount point discovery: while creating new transition, observe state, and use `getClosestMountPoint`.
   1. If same state, protect.
1. Add docstrings.

## Ideas

1. Implement separated architecture (view and behavior).
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
