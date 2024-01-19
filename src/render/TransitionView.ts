import { StateView } from './StateView';
import {
  createSVGCircle,
  createSVGGroup,
  createSVGPath,
} from './utils/helpers';
import {
  ListenerSwitcher,
  ParentOrchestrator,
  Point,
  StateUpdate,
} from './utils/interfaces';

export type TransitionViewConfig = {
  inMotion: boolean;
};

const defaultConfig: TransitionViewConfig = {
  inMotion: false,
};

export class TransitionView implements ListenerSwitcher {
  private orchestrator: ParentOrchestrator;
  private config: TransitionViewConfig;

  private group = createSVGGroup();
  private hover = createSVGPath();
  private path = createSVGPath();

  constructor(
    orchestrator: ParentOrchestrator,
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
    this.group.addEventListener('mouseenter', this.showControls);
    this.group.addEventListener('mouseleave', this.hideControls);
    this.group.addEventListener('contextmenu', this.bringToTop);
  }

  /* ========================= UTILS ========================= */

  getStrokeWidth() {
    return +this.path.style.strokeWidth;
  }

  setInMotion(inMotion: boolean) {
    inMotion ? this.disableListeners() : this.enableListeners();
    this.config.inMotion = inMotion;
  }

  getSvg(): SVGElement {
    return this.group;
  }

  /* ========================= LISTENERS ========================= */

  disableListeners() {
    this.group.style.pointerEvents = 'none';
  }

  enableListeners() {
    this.group.style.pointerEvents = 'auto';
  }

  private bringToTop = (e: MouseEvent) => {
    e.preventDefault();

    const parent = this.group.parentNode!;
    parent.appendChild(this.group);
  };

  /* ========================= STATES CONNECTION ========================= */

  private startStateView?: StateView;
  private endStateView?: StateView;

  setStartState(stateView: StateView) {
    this.unsetStartState();
    this.startStateView = stateView;

    this.updateConnections();
    stateView.subscribe('update', this.updateStartSubscriber);
  }

  unsetStartState() {
    if (this.startStateView) {
      this.startStateView.unsubscribe('update', this.updateStartSubscriber);
    }
    this.startStateView = undefined;
  }

  setEndState(stateView: StateView) {
    this.unsetEndState();
    this.endStateView = stateView;

    this.updateConnections();
    stateView.subscribe('update', this.updateEndSubscriber);
  }

  unsetEndState() {
    if (this.endStateView) {
      this.endStateView.unsubscribe('update', this.updateEndSubscriber);
    }
    this.endStateView = undefined;
  }

  // TODO: do it just better
  private updateConnections() {
    if (this.startStateView && this.endStateView) {
      this.startCoords = this.startStateView.getGroupCenterPoint();
      this.endCoords = this.endStateView.getGroupCenterPoint();

      this.updateStartSubscriber(this.startStateView);
      this.updateEndSubscriber(this.endStateView);
    }
  }

  private updateStartSubscriber = (stateUpdate: StateUpdate) => {
    const point = stateUpdate.getClosestPointOnStroke({
      x: this.getControlCoords().controlX,
      y: this.getControlCoords().controlY,
    });
    this.updateStart(point);
  };

  private updateEndSubscriber = (stateUpdate: StateUpdate) => {
    const point = stateUpdate.getClosestPointOnStroke({
      x: this.getControlCoords().controlX,
      y: this.getControlCoords().controlY,
    });
    this.updateEnd(point);
  };

  /* ========================= UPDATE PATH ========================= */

  private startCoords: Point = { x: 0, y: 0 };
  private endCoords: Point = { x: 0, y: 0 };
  private controlDistance = 0;

  updateStart = (coords: Point) => {
    this.startCoords = coords;
    this.updatePathData();
  };

  updateEnd = (coords: Point) => {
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

  private startCircle = createSVGCircle();
  private endCircle = createSVGCircle();
  private controlCircle = createSVGCircle();

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

  private showControls = () => {
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

  private hideControls = () => {
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

    this.updateConnections();
    this.updatePathData();
  };

  private onEndCurvature = () => {
    this.group.style.pointerEvents = 'auto';
    document.removeEventListener('mousemove', this.onChangeCurvature);
    document.removeEventListener('mouseup', this.onEndCurvature);
  };
}
