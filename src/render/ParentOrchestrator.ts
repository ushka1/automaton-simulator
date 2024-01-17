import { Point } from '@/types/types';
import { StateView } from './StateView';

export interface ParentOrchestrator {
  coordsToPoint(coords: Point): Point;

  startStateMoving(stateView: StateView): void;
  endStateMoving(stateView: StateView): void;

  startNewTransition(fromState: StateView, mountPointIndex: number): void;
}
