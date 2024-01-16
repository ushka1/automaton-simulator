import { RenderOrchestrator } from './RenderOrchestrator';
import { StateView } from './StateView';

export type TransitionViewConfig = {
  inMotion: boolean;
};

const defaultConfig: TransitionViewConfig = {
  inMotion: false,
};

export class TransitionView {
  private orchestrator: RenderOrchestrator;
  private startStateView?: StateView;
  private startMountPointIndex?: number;
  private endStateView?: StateView;
  private endMountPointIndex?: number;
  private config: TransitionViewConfig;

  private group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  private hover = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  );
  private path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  constructor(
    orchestrator: RenderOrchestrator,
    config: Partial<TransitionViewConfig> = {},
  ) {
    this.orchestrator = orchestrator;
    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.initPath();
    this.initHover();
    this.initGroup();
    this.initControls();

    this.group.addEventListener('contextmenu', this.contextMenuListener);
    this.setInMotion(this.config.inMotion);
  }

  private initPath() {
    this.path.style.fill = 'none';
    this.path.style.stroke = 'var(--blue)';
    this.path.style.strokeWidth = '5';
    this.path.style.pointerEvents = 'none';
    this.path.setAttribute('marker-end', 'url(#arrow)');
  }

  private initHover() {
    this.hover.style.fill = 'none';
    this.hover.style.stroke = 'transparent';
    this.hover.style.strokeWidth = '10';
    this.hover.style.pointerEvents = 'none';
  }

  private initGroup() {
    this.group.appendChild(this.hover);
    this.group.appendChild(this.path);
  }

  getSvg(): SVGElement {
    return this.group;
  }

  /* ========================= Listeners ========================= */

  setInMotion(inMotion: boolean) {
    this.config.inMotion = inMotion;

    if (inMotion) {
      this.group.removeEventListener('mouseenter', this.renderControls);
      this.group.removeEventListener('mouseleave', this.removeControls);
    } else {
      this.hover.style.pointerEvents = 'auto';
      this.group.addEventListener('mouseenter', this.renderControls);
      this.group.addEventListener('mouseleave', this.removeControls);
    }
  }

  /**
   * Bring the path to the front when right-clicked.
   */
  private contextMenuListener = (e: MouseEvent) => {
    e.preventDefault();

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
  private curvatureOffset = 0;

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

    // f(x) = ax + b
    const a = (y2 - y1) / (x2 - x1);
    const b = y1 - a * x1;

    // f(x) = ex + f

    // f(x_1) = e*x_1 + f
    // f(x_1) = y_1
    // y_1 = e*x_1 + f
    // f = y_1 - e*x_1
    const e = -1 / a;
    const f = cy - e * cx;

    const E = e;
    const F = -1;
    const G = f;

    // base vector = []

    return { x: cx, y: cy };
  }

  private updatePathData() {
    const { x: x1, y: y1 } = this.startCoords;
    const { x: x2, y: y2 } = this.endCoords;
    const { x: cx, y: cy } = this.getControlCoords();

    const pathData =
      'M' + x1 + ' ' + y1 + ' Q' + cx + ' ' + cy + ' ' + x2 + ' ' + y2;

    this.path.setAttribute('d', pathData);
    this.hover.setAttribute('d', pathData);
  }

  /* ========================= CONTROLS ========================= */

  private startCircle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle',
  );
  private endCircle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle',
  );
  private centerCircle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle',
  );

  private initControls() {
    this.startCircle.setAttribute('r', '5');
    this.startCircle.style.fill = 'var(--bone-dark)';
    this.startCircle.style.pointerEvents = 'auto';
    this.startCircle.style.cursor = 'pointer';

    this.endCircle.setAttribute('r', '5');
    this.endCircle.style.fill = 'var(--bone-dark)';
    this.endCircle.style.pointerEvents = 'auto';
    this.endCircle.style.cursor = 'pointer';

    this.centerCircle.setAttribute('r', '5');
    this.centerCircle.style.fill = 'var(--bone-dark)';
    this.centerCircle.style.pointerEvents = 'auto';
    this.centerCircle.style.cursor = 'pointer';

    this.centerCircle.addEventListener('mousedown', this.onStartCurvature);
  }

  private renderControls = () => {
    this.startCircle.setAttribute('cx', this.startCoords.x + '');
    this.startCircle.setAttribute('cy', this.startCoords.y + '');
    this.group.appendChild(this.startCircle);

    this.endCircle.setAttribute('cx', this.endCoords.x + '');
    this.endCircle.setAttribute('cy', this.endCoords.y + '');
    this.group.appendChild(this.endCircle);

    this.centerCircle.setAttribute('cx', this.getControlCoords().x + '');
    this.centerCircle.setAttribute(
      'cy',
      this.getControlCoords().y + this.curvatureOffset / 2 + '',
    );
    this.group.appendChild(this.centerCircle);
  };

  private removeControls = () => {
    this.startCircle?.remove();
    this.endCircle?.remove();
    this.centerCircle?.remove();
  };

  /* ========================= CONTROLS - CURVATURE ========================= */

  private curvatureInitY: number = 0;

  private onStartCurvature = () => {
    this.hover.style.pointerEvents = 'none';
    this.curvatureInitY = (this.startCoords.y + this.endCoords.y) / 2;

    document.addEventListener('mousemove', this.onChangeCurvature);
    document.addEventListener('mouseup', this.onEndCurvature);
  };

  private onChangeCurvature = (e: MouseEvent) => {
    const point = this.orchestrator.coordsToPoint(e);
    const dy = Math.floor(this.curvatureInitY - point.y) * 2;
    this.curvatureOffset = dy;
    this.updatePathData();
  };

  private onEndCurvature = () => {
    this.hover.style.pointerEvents = 'auto';
    document.removeEventListener('mousemove', this.onChangeCurvature);
    document.removeEventListener('mouseup', this.onEndCurvature);
  };
}
