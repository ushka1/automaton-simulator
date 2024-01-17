import { Point } from '@/types/types';
import { EventPublisher } from '@/utils/EventPublisher';
import { createSVGCircle, createSVGGroup, createSVGText } from '@/utils/svg';
import { ParentOrchestrator } from './ParentOrchestrator';

export type StateViewConfig = {
  x: number; // x coordinate
  y: number; // y coordinate
  r: number; // circle radius
  hm: number; // hover margin
  mountPointsNumber: number; // number of mount points
  moveStep: number; // move step
  name: string; // state name
};

const defaultConfig: StateViewConfig = {
  x: 0,
  y: 0,
  r: 40,
  hm: 10,
  mountPointsNumber: 12,
  moveStep: 10,
  name: '',
};

export class StateView {
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
    this.initMountPoints();
  }

  private initHover() {
    const { r, hm } = this.config;
    this.hover.setAttribute('cx', r + hm + '');
    this.hover.setAttribute('cy', r + hm + '');
    this.hover.setAttribute('r', r + hm + '');
    this.hover.style.fill = 'transparent';
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
    this.circle.style.stroke = 'var(--blue)';
    this.circle.style.strokeWidth = '5';
  }

  private initGroup() {
    const { x, y, hm } = this.config;
    this.group.style.cursor = 'move';
    this.group.setAttribute('transform', `translate(${x - hm}, ${y - hm})`);
    this.group.appendChild(this.hover);
    this.group.appendChild(this.circle);
    this.group.appendChild(this.label);

    this.group.addEventListener('mousedown', this.startMoving);
    this.group.addEventListener('contextmenu', this.bringToTop);
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
    this.publishMountPointsUpdate();
  }

  /* ========================= MOUNT POINTS ========================= */

  private eventPublisher = new EventPublisher<{
    mountpoints: [mountPoints: Point[]];
  }>();

  get subscribe() {
    return this.eventPublisher.subscribe;
  }

  get unsubscribe() {
    return this.eventPublisher.unsubscribe;
  }

  /**
   * Use parametric equations for a circle to get the relative mount points coordinates.
   */
  private getRelativeMountPoints(): Point[] {
    const { r, mountPointsNumber } = this.config;
    const points: Point[] = [];

    const cx = this.circle.cx.baseVal.value;
    const cy = this.circle.cy.baseVal.value;
    const angleStep = 360 / mountPointsNumber;

    for (let i = 0; i < mountPointsNumber; i++) {
      const angle = angleStep * i;
      const radians = (angle * Math.PI) / 180;
      const x = Math.round(cx + r * Math.cos(radians));
      const y = Math.round(cy + r * Math.sin(radians));

      points.push({ x, y });
    }

    return points;
  }

  /**
   * Use parametric equations for a circle to get the absolute mount points coordinates.
   */
  getAbsoluteMountPoints(): Point[] {
    const matrix = this.group.getCTM()!;
    const gx = matrix.e;
    const gy = matrix.f;

    return this.getRelativeMountPoints().map(({ x, y }) => ({
      x: gx + x,
      y: gy + y,
    }));
  }

  private publishMountPointsUpdate() {
    const mountPoints = this.getAbsoluteMountPoints();
    this.eventPublisher.publish('mountpoints', mountPoints);
  }

  /* ========================= MOUNT POINTS DISPLAY ========================= */

  /*
    WARNING: In SVG, the coordinate system starts from the top-left corner,
    unlike in the conventional coordinate systems where it starts from the bottom-left.
  */

  private mountPointsCircles: SVGCircleElement[] = [];

  private initMountPoints() {
    if (this.mountPointsCircles.length > 0) return;

    const mountPoints = this.getRelativeMountPoints();
    for (const [i, { x, y }] of mountPoints.entries()) {
      const mountPointElement = createSVGCircle();

      mountPointElement.setAttribute('cx', x + '');
      mountPointElement.setAttribute('cy', y + '');
      mountPointElement.setAttribute('r', '5');
      mountPointElement.style.fill = 'var(--bone-dark)';
      mountPointElement.style.opacity = '0';
      mountPointElement.style.transition = 'opacity 0.025s linear';
      mountPointElement.style.cursor = 'pointer';

      mountPointElement.id = 'mountpoint';
      mountPointElement.setAttribute('data-state', this.config.name);
      mountPointElement.setAttribute('data-index', i.toString());

      this.group.appendChild(mountPointElement);
      this.mountPointsCircles.push(mountPointElement);

      mountPointElement.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.orchestrator.startNewTransition(this, i);
      });
    }

    this.group.addEventListener('mouseenter', this.showMountPoints);
    this.group.addEventListener('mouseleave', this.hideMountPoints);
  }

  private showMountPoints = () => {
    for (const circle of this.mountPointsCircles) {
      circle.style.opacity = '1';
    }
  };

  private hideMountPoints = () => {
    for (const circle of this.mountPointsCircles) {
      circle.style.opacity = '0';
    }
  };

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

  /**
   * Get the closest mount point index to a given point.
   */
  getClosestMountPointIndex(point: Point) {
    const { x, y } = point;
    const mountPoints = this.getAbsoluteMountPoints();

    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < mountPoints.length; i++) {
      const { x: mx, y: my } = mountPoints[i];
      const distance = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);

      if (distance < closestDistance) {
        closestIndex = i;
        closestDistance = distance;
      }
    }

    return closestIndex;
  }
}
