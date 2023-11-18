# TODO

## High Priority

1. Implement line connecting states (transition).

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
