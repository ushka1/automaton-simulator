import { StateView } from '../StateView';
import { TransitionView } from '../TransitionView';

export interface Point {
  x: number;
  y: number;
}

export interface ListenerSwitcher {
  enableListeners(): void;
  disableListeners(): void;
}

export interface ListenerSwitcherFilter {
  excluded?: ListenerSwitcher[];
  included?: ListenerSwitcher[];
}

export interface ParentOrchestrator {
  coordsToPoint(coords: Point): Point;

  startStateMoving(stateView: StateView): void;
  endStateMoving(stateView: StateView): void;

  startNewTransition(fromState: StateView, mountPointIndex: number): void;

  startTransitionCurving(transitionView: TransitionView): void;
  endTransitionCurving(transitionView: TransitionView): void;
}

export interface StateUpdate {}
