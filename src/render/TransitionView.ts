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
    this.path.setAttribute('marker-end', 'url(#arrow)');
  }

  private initHover() {
    this.hover.style.fill = 'none';
    this.hover.style.stroke = 'transparent';
    this.hover.style.strokeWidth = '10';
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
      this.group.style.pointerEvents = 'auto';
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
  private controlDistance = 50;

  updateStart = (coords: Coords) => {
    this.startCoords = coords;
    this.updatePathData();
  };

  updateEnd = (coords: Coords) => {
    this.endCoords = coords;
    this.updatePathData();
  };

  /*
   * Start from normal plane, then rotate.
   * OR
   * Work on rotated plane (current).
   */
  private getControlCoords() {
    const { x: sx, y: sy } = this.startCoords;
    const { x: ex, y: ey } = this.endCoords;
    const cx = (sx + ex) / 2;
    const cy = (sy + ey) / 2;

    // f(x) = ax + b
    const a = (ey - sy) / (ex - sx);
    // const b = sy - a * sx;
    // const f = (x: number) => a * x + b;

    let gEigenvector;
    if (a == 0) {
      if (sx < ex) {
        gEigenvector = [0, 1];
      } else {
        gEigenvector = [0, -1];
      }
    } else if (!isFinite(a)) {
      if (sy < ey) {
        gEigenvector = [-1, 0];
      } else {
        gEigenvector = [1, 0];
      }
    } else {
      // g(x) = dx + e
      const d = -1 / a;
      // const e = cy - d * cx;
      // const e = b;
      const e = 0; // does not matter in fact
      const g = (x: number) => d * x + e;

      let x1 = 1;
      let x2 = 0;
      if ((sx > ex && sy > ey) || (sx < ex && sy > ey)) {
        [x1, x2] = [x2, x1];
      }

      const y1 = g(x1);
      const y2 = g(x2);

      const gVector = [x2 - x1, y2 - y1];
      const gVectorLength = Math.sqrt(gVector[0] ** 2 + gVector[1] ** 2);
      gEigenvector = gVector.map((x) => x / gVectorLength);
    }

    const moveVector = gEigenvector.map((x) => x * this.controlDistance);

    return {
      pathX: cx + moveVector[0] * 2,
      pathY: cy + moveVector[1] * 2,
      controlX: cx + moveVector[0],
      controlY: cy + moveVector[1],
    };
  }

  private updatePathData() {
    const { x: sx, y: sy } = this.startCoords;
    const { x: ex, y: ey } = this.endCoords;
    const { pathX: cx, pathY: cy } = this.getControlCoords();

    const pathData =
      'M' + sx + ' ' + sy + ' Q' + cx + ' ' + cy + ' ' + ex + ' ' + ey;

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
  private controlCircle = document.createElementNS(
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

    this.controlCircle.setAttribute('r', '5');
    this.controlCircle.style.fill = 'var(--bone-dark)';
    this.controlCircle.style.pointerEvents = 'auto';
    this.controlCircle.style.cursor = 'pointer';

    this.controlCircle.addEventListener('mousedown', this.onStartCurvature);
  }

  private renderControls = () => {
    this.startCircle.setAttribute('cx', this.startCoords.x + '');
    this.startCircle.setAttribute('cy', this.startCoords.y + '');
    this.group.appendChild(this.startCircle);

    this.endCircle.setAttribute('cx', this.endCoords.x + '');
    this.endCircle.setAttribute('cy', this.endCoords.y + '');
    this.group.appendChild(this.endCircle);

    const { controlX: cx, controlY: cy } = this.getControlCoords();
    this.controlCircle.setAttribute('cx', cx + '');
    this.controlCircle.setAttribute('cy', cy + '');
    this.group.appendChild(this.controlCircle);
  };

  private removeControls = () => {
    this.startCircle?.remove();
    this.endCircle?.remove();
    this.controlCircle?.remove();
  };

  /* ========================= CONTROLS - CURVATURE ========================= */

  private onStartCurvature = () => {
    this.group.style.pointerEvents = 'none';
    document.addEventListener('mousemove', this.onChangeCurvature);
    document.addEventListener('mouseup', this.onEndCurvature);
  };

  private onChangeCurvature = (e: MouseEvent) => {
    const { x: mx, y: my } = this.orchestrator.coordsToPoint(e); // mouse x, mouse y
    let { x: sx, y: sy } = this.startCoords; // start x, start y
    let { x: ex, y: ey } = this.endCoords; // end x, end y
    const reversed = sx > ex || (sx == ex && sy > ex); // determine whether line is reversed

    // swap start and end if
    // point order is reversed <=> line is reversed
    if (reversed) {
      [sx, ex] = [ex, sx];
      [sy, ey] = [ey, sy];
    }

    // f(x) = ax + b
    // line between start and end points
    const a = (ey - sy) / (ex - sx);
    const b = sy - a * sx;
    const f = (x: number) => a * x + b;

    let adfl: number; // absolute distance from line
    if (a == 0) {
      adfl = Math.abs(my - sy);
    } else if (!isFinite(a)) {
      adfl = Math.abs(mx - sx);
    } else {
      adfl = Math.abs(a * mx + -1 * my + b) / Math.sqrt(a ** 2 + (-1) ** 2);
    }

    let sign: number;
    if (!isFinite(a)) {
      sign = Math.sign(mx - sx);
    } else {
      sign = Math.sign(f(mx) - my); // determine whether mouse is above or below line
    }
    sign *= -1; // invert sign because y axis is inverted
    sign *= reversed ? -1 : 1; // invert sign if line is reversed

    const rdfl = adfl * sign; // relative distance from line
    this.controlDistance = rdfl;
    this.updatePathData();
  };

  private onEndCurvature = () => {
    this.group.style.pointerEvents = 'auto';
    document.removeEventListener('mousemove', this.onChangeCurvature);
    document.removeEventListener('mouseup', this.onEndCurvature);
  };
}
