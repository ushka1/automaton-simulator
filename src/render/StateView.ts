import { EventPublisher } from '@/shared/EventPublisher';
import {
  createSVGCircle,
  createSVGGroup,
  createSVGText,
} from './utils/helpers';
import {
  ListenerSwitcher,
  ParentOrchestrator,
  Point,
  StateUpdate,
} from './utils/interfaces';

export type StateViewConfig = {
  x: number; // x coordinate
  y: number; // y coordinate
  r: number; // circle radius
  hm: number; // hover margin
  moveStep: number; // move step
  name: string; // state name
};

const defaultConfig: StateViewConfig = {
  x: 0,
  y: 0,
  r: 40,
  hm: 5,
  moveStep: 1,
  name: '',
};

export class StateView implements StateUpdate, ListenerSwitcher {
  private orchestrator: ParentOrchestrator;
  private config: StateViewConfig;

  private group = createSVGGroup();
  private hover = createSVGCircle();
  private circle = createSVGCircle();
  private label = createSVGText();

  constructor(
    orchestrator: ParentOrchestrator,
    config: Partial<StateViewConfig> = {},
  ) {
    this.orchestrator = orchestrator;
    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.initHover();
    this.initCircle();
    this.initLabel();
    this.initGroup();
  }

  private initHover() {
    const { r, hm } = this.config;
    this.hover.setAttribute('cx', r + hm + '');
    this.hover.setAttribute('cy', r + hm + '');
    this.hover.setAttribute('r', r + hm + '');
    this.hover.style.fill = 'var(--blue)';
    this.hover.style.cursor = 'pointer';

    this.hover.id = 'state';
    this.hover.setAttribute('data-state', this.config.name);
    this.hover.addEventListener('mousedown', this.startNewTransition);
  }

  private initLabel() {
    const { r, hm, name } = this.config;
    this.label.setAttribute('x', r + hm + '');
    this.label.setAttribute('y', r + hm + '');
    this.label.style.fill = 'var(--bone)';
    this.label.style.userSelect = 'none';
    this.label.style.textAnchor = 'middle';
    this.label.style.dominantBaseline = 'central';
    this.label.style.fontSize = '1.2rem';
    this.label.textContent = name;
  }

  private initCircle() {
    const { r, hm } = this.config;
    this.circle.setAttribute('cx', r + hm + '');
    this.circle.setAttribute('cy', r + hm + '');
    this.circle.setAttribute('r', r + '');
    this.circle.style.fill = 'var(--charcoal)';
  }

  private initGroup() {
    const { x, y, hm } = this.config;
    this.group.style.cursor = 'move';
    this.group.setAttribute('transform', `translate(${x - hm}, ${y - hm})`);
    this.group.appendChild(this.hover);
    this.group.appendChild(this.circle);
    this.group.appendChild(this.label);

    this.group.addEventListener('mouseenter', () => {
      this.hover.style.fill = 'var(--bone-dark)';
      this.label.style.fill = 'var(--bone-dark)';
    });
    this.group.addEventListener('mouseleave', () => {
      this.hover.style.fill = 'var(--blue)';
      this.label.style.fill = 'var(--bone)';
    });
    this.group.addEventListener('contextmenu', this.bringToTop);
    this.group.addEventListener('mousedown', this.startMoving);
  }

  /* ========================= UTILS ========================= */

  getName() {
    return this.config.name;
  }

  getSvg() {
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

  /* ========================= TRANSITION ========================= */

  private startNewTransition = (e: MouseEvent) => {
    e.stopPropagation();
    this.orchestrator.startNewTransition(this);
  };

  /* ========================= MOVING ========================= */

  private dx = 0; // delta x, for click correction
  private dy = 0; // delta y, for click correction

  private startMoving = (e: MouseEvent) => {
    const { x: cx, y: cy } = e;
    const { x: gx, y: gy } = this.getGroupStartPoint();

    this.dx = cx - gx;
    this.dy = cy - gy;

    this.orchestrator.startStateMoving(this);
    document.addEventListener('mousemove', this.handleMoving);
    document.addEventListener('mouseup', this.endMoving);
  };

  private handleMoving = (e: MouseEvent) => {
    const { r, hm, moveStep } = this.config;

    const { x: cx, y: cy } = e;
    let x = Math.round((cx - this.dx) / moveStep) * moveStep;
    let y = Math.round((cy - this.dy) / moveStep) * moveStep;

    const parent = this.group.parentNode;
    if (parent instanceof SVGSVGElement) {
      const min_x = 0;
      const min_y = 0;
      const max_x = parent.width.baseVal.value;
      const max_y = parent.height.baseVal.value;

      if (x < min_x - hm) x = min_x - hm;
      if (x > max_x - 2 * r - hm) x = max_x - 2 * r - hm;
      if (y < min_y - hm) y = min_y - hm;
      if (y > max_y - 2 * r - hm) y = max_y - 2 * r - hm;
    }

    this.updatePosition({ x, y });
  };

  private endMoving = () => {
    this.orchestrator.endStateMoving(this);
    document.removeEventListener('mousemove', this.handleMoving);
    document.removeEventListener('mouseup', this.endMoving);
  };

  private updatePosition(point: Point) {
    this.group.setAttribute('transform', `translate(${point.x}, ${point.y})`);
    this.publishPositionUpdate();
  }

  /* ========================= EVENTING ========================= */

  private eventPublisher = new EventPublisher<{
    position: [stateUpdate: StateUpdate];
  }>();

  get subscribe() {
    return this.eventPublisher.subscribe;
  }

  get unsubscribe() {
    return this.eventPublisher.unsubscribe;
  }

  private publishPositionUpdate() {
    this.eventPublisher.publish('position', this);
  }

  /* ========================= POINT UTILS ========================= */

  /**
   * Top left point of the group.
   */
  private getGroupStartPoint(): Point {
    const matrix = this.group.getCTM()!;
    const gx = matrix.e; // group x
    const gy = matrix.f; // group y

    return { x: gx, y: gy };
  }

  /**
   * Center point of the group.
   */
  getGroupCenterPoint(): Point {
    const { r, hm } = this.config;
    const { x: gx, y: gy } = this.getGroupStartPoint();

    return {
      x: gx + r + hm,
      y: gy + r + hm,
    };
  }

  getClosestPointOnCircle(point: Point) {
    const { x, y } = point;
    const { r } = this.config;
    const { x: cx, y: cy } = this.getGroupCenterPoint();

    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    const ratio = r / distance;
    const rx = cx + dx * ratio;
    const ry = cy + dy * ratio;

    return { x: rx, y: ry };
  }

  getClosestPointOnHover(point: Point) {
    const { x, y } = point;
    const { r, hm } = this.config;
    const { x: cx, y: cy } = this.getGroupCenterPoint();

    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    const ratio = (r + hm) / distance;
    const rx = cx + dx * ratio;
    const ry = cy + dy * ratio;

    return { x: rx, y: ry };
  }
}
