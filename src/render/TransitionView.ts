import { StateView } from './StateView';

export class TransitionView {
  private line: SVGLineElement;
  private startStateView?: StateView;
  private startMountPointIndex?: number;
  private endStateView?: StateView;
  private endMountPointIndex?: number;

  constructor() {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.style.stroke = 'var(--blue)';
    line.style.strokeWidth = '5';
    line.setAttribute('marker-end', 'url(#arrow)');
    this.line = line;
  }

  setStartStateView(stateView: StateView, mountPointIndex: number) {
    this.unsetStartStateView();

    this.startStateView = stateView;
    this.startMountPointIndex = mountPointIndex;

    this.updateStartListener(stateView.getAbsoluteMountPoints());
    stateView.subscribe('mountpoints', this.updateStartListener);
  }

  unsetStartStateView() {
    if (this.startStateView) {
      this.startStateView.unsubscribe('mountpoints', this.updateStartListener);
    }

    this.startStateView = undefined;
    this.startMountPointIndex = undefined;
  }

  setEndStateView(stateView: StateView, mountPointIndex: number) {
    this.unsetEndStateView();

    this.endStateView = stateView;
    this.endMountPointIndex = mountPointIndex;

    this.updateEndListener(stateView.getAbsoluteMountPoints());
    stateView.subscribe('mountpoints', this.updateEndListener);
  }

  unsetEndStateView() {
    if (this.endStateView) {
      this.endStateView.unsubscribe('mountpoints', this.updateEndListener);
    }

    this.endStateView = undefined;
    this.endMountPointIndex = undefined;
  }

  private updateStartListener = (mountPoints: { x: number; y: number }[]) => {
    const coords = mountPoints[this.startMountPointIndex!];
    this.updateStart(coords);
  };

  private updateEndListener = (mountPoints: { x: number; y: number }[]) => {
    const coords = mountPoints[this.endMountPointIndex!];
    this.updateEnd(coords);
  };

  updateStart = (coords: { x: number; y: number }) => {
    this.line.setAttribute('x1', `${coords.x}`);
    this.line.setAttribute('y1', `${coords.y}`);
  };

  updateEnd = (coords: { x: number; y: number }) => {
    this.line.setAttribute('x2', `${coords.x}`);
    this.line.setAttribute('y2', `${coords.y}`);
  };

  getSvg(): SVGLineElement {
    return this.line;
  }
}
