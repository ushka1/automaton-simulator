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

    path.addEventListener('contextmenu', this.contextMenuListener);
  }

  getSvg(): SVGPathElement {
    return this.path;
  }

  /**
   * Bring the path to the front when right-clicked.
   */
  private contextMenuListener = (e: MouseEvent) => {
    // TODO: after transition is connected, pointer events should be enabled
    e.preventDefault();

    console.log('OK');

    const parent = this.path.parentNode!;
    parent.appendChild(this.path);
  };

  /* ========================= STATES CONNECTION ========================= */

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

  private updateStartListener = (mountPoints: Coords[]) => {
    const coords = mountPoints[this.startMountPointIndex!];
    this.updateStart(coords);
  };

  private updateEndListener = (mountPoints: Coords[]) => {
    const coords = mountPoints[this.endMountPointIndex!];
    this.updateEnd(coords);
  };

  /* ========================= UPDATE PATH ========================= */

  private startCoords: Coords = { x: 0, y: 0 };
  private endCoords: Coords = { x: 0, y: 0 };
  private curvatureOffset: number = 0;

  updateStart = (coords: Coords) => {
    this.startCoords = coords;
    this.updatePathData();
  };

  updateEnd = (coords: Coords) => {
    this.endCoords = coords;
    this.updatePathData();
  };

  private getControlCoords(): Coords {
    const { x: x1, y: y1 } = this.startCoords;
    const { x: x2, y: y2 } = this.endCoords;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 - this.curvatureOffset;

    return { x: cx, y: cy };
  }

  private updatePathData() {
    const { x: x1, y: y1 } = this.startCoords;
    const { x: x2, y: y2 } = this.endCoords;
    const { x: cx, y: cy } = this.getControlCoords();

    const pathData =
      'M' + x1 + ' ' + y1 + ' Q' + cx + ' ' + cy + ' ' + x2 + ' ' + y2;

    this.path.setAttribute('d', pathData);
  }
}
