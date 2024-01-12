import { StateView } from './StateView';

export class TransitionView {
  private path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  // private hover = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  private startStateView?: StateView;
  private startMountPointIndex?: number;
  private endStateView?: StateView;
  private endMountPointIndex?: number;
  private inMotion: boolean;

  constructor(inMotion = false) {
    this.path.style.fill = 'none';
    this.path.style.stroke = 'var(--blue)';
    this.path.style.strokeWidth = '5';
    this.path.style.pointerEvents = 'none';
    this.path.setAttribute('marker-end', 'url(#arrow)');

    // this.hover.style.fill = 'none';
    // this.hover.style.stroke = 'var(--blue)';
    // this.hover.style.strokeWidth = '20';

    this.path.addEventListener('contextmenu', this.contextMenuListener);

    this.setInMotion(inMotion);
  }

  /**
   * Bring the path to the front when right-clicked.
   */
  private contextMenuListener = (e: MouseEvent) => {
    e.preventDefault();

    const parent = this.path.parentNode!;
    parent.appendChild(this.path);
  };

  setInMotion(inMotion: boolean) {
    this.inMotion = inMotion;

    if (inMotion) {
      this.path.removeEventListener('mouseover', this.renderControls);
      this.path.removeEventListener('mouseout', this.removeControls);
    } else {
      this.path.style.pointerEvents = 'auto';
      this.path.addEventListener('mouseover', this.renderControls);
      this.path.addEventListener('mouseout', this.removeControls);
    }
  }

  getSvg(): SVGPathElement {
    return this.path;
  }

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
  private curvatureOffset: number = 50;

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

  /* ========================= CONTROLS ========================= */

  private startCircle?: SVGCircleElement;
  private endCircle?: SVGCircleElement;
  private centerCircle?: SVGCircleElement;

  private renderControls = () => {
    const startCircle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    startCircle.setAttribute('r', '5');
    startCircle.style.fill = 'var(--charcoal-dark)';
    startCircle.style.pointerEvents = 'auto';
    startCircle.style.cursor = 'pointer';
    startCircle.setAttribute('cx', this.startCoords.x + '');
    startCircle.setAttribute('cy', this.startCoords.y + '');
    this.startCircle = startCircle;

    const endCircle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    endCircle.setAttribute('r', '5');
    endCircle.style.fill = 'var(--charcoal-dark)';
    endCircle.style.pointerEvents = 'auto';
    endCircle.style.cursor = 'pointer';
    endCircle.setAttribute('cx', this.endCoords.x + '');
    endCircle.setAttribute('cy', this.endCoords.y + '');
    this.endCircle = endCircle;

    const centerCircle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    centerCircle.setAttribute('r', '5');
    centerCircle.style.fill = 'var(--charcoal-dark)';
    centerCircle.style.pointerEvents = 'auto';
    centerCircle.style.cursor = 'pointer';
    centerCircle.setAttribute('cx', this.getControlCoords().x + '');
    centerCircle.setAttribute(
      'cy',
      this.getControlCoords().y + this.curvatureOffset / 2 + '',
    );
    this.centerCircle = centerCircle;

    const parent = this.path.parentNode!;
    parent.appendChild(startCircle);
    parent.appendChild(endCircle);
    parent.appendChild(centerCircle);
  };

  private removeControls = () => {
    this.startCircle?.remove();
    this.endCircle?.remove();
    this.centerCircle?.remove();
  };
}
