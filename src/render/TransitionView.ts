import { StateView } from './StateView';

export class TransitionView {
  private path: SVGPathElement;
  private startStateView?: StateView;
  private startMountPointIndex?: number;
  private endStateView?: StateView;
  private endMountPointIndex?: number;

  constructor() {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.style.stroke = 'var(--blue)';
    path.style.strokeWidth = '5';
    path.style.pointerEvents = 'none';
    path.style.fill = 'none';
    path.setAttribute('marker-end', 'url(#arrow)');
    this.path = path;
  }

  // ========================= OBSERVE STATES =========================

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

  /* ========================= UPDATE PATH ========================= */

  updateStart = (coords: { x: number; y: number }) => {
    const endCoords = this.getEndCoords();
    const pathData = this.getPathData(coords, endCoords);
    this.path.setAttribute('d', pathData);
  };

  updateEnd = (coords: { x: number; y: number }) => {
    const startCoords = this.getStartCoords();
    const pathData = this.getPathData(startCoords, coords);
    this.path.setAttribute('d', pathData);
  };

  private getStartCoords(): { x: number; y: number } {
    const pathSegments = this.path.getAttribute('d')?.split(' ') || [];
    const x = parseFloat(pathSegments[0].substring(1));
    const y = parseFloat(pathSegments[1]);

    if (!isNaN(x) && !isNaN(y)) {
      return { x, y };
    } else {
      return { x: 0, y: 0 };
    }
  }

  private getEndCoords(): { x: number; y: number } {
    const pathSegments = this.path.getAttribute('d')?.split(' ') || [];
    const x = parseFloat(pathSegments[4]);
    const y = parseFloat(pathSegments[5]);

    if (!isNaN(x) && !isNaN(y)) {
      return { x, y };
    } else {
      return { x: 0, y: 0 };
    }
  }

  private getPathData(
    startCoords: { x: number; y: number },
    endCoords: { x: number; y: number },
  ): string {
    const curvatureOffset = 0;
    const controlX = (startCoords.x + endCoords.x) / 2;
    const controlY = (startCoords.y + endCoords.y) / 2 - curvatureOffset;

    return (
      'M' +
      startCoords.x +
      ' ' +
      startCoords.y +
      ' Q' +
      controlX +
      ' ' +
      controlY +
      ' ' +
      endCoords.x +
      ' ' +
      endCoords.y
    );
  }

  /* ========================= UTILS ========================= */

  getSvg(): SVGPathElement {
    return this.path;
  }
}
