# TODO

## High Priority

1. Change direction of rendering mount points.
1. Add method for absolute mount points.
1. Separate view from model.

## Medium Priority

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
