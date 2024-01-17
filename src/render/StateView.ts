import { EventPublisher } from '@/utils/EventPublisher';
import { RenderOrchestrator } from './RenderOrchestrator';

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
  private orchestrator: RenderOrchestrator;
  private config: StateViewConfig;

  private group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  private hover = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle',
  );
  private circle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle',
  );
  private text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  constructor(
    orchestrator: RenderOrchestrator,
    config: Partial<StateViewConfig> = {},
  ) {
    this.orchestrator = orchestrator;
    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.initHover();
    this.initCircle();
    this.initText();
    this.initGroup();
    this.renderMountPoints();

    this.group.addEventListener('mousedown', this.mouseDownListener);
    this.group.addEventListener('contextmenu', this.contextMenuListener);
  }

  private initHover() {
    const { r, hm } = this.config;

    this.hover.setAttribute('cx', r + hm + '');
    this.hover.setAttribute('cy', r + hm + '');
    this.hover.setAttribute('r', r + hm + '');
    this.hover.style.fill = 'transparent';
  }

  private initText() {
    const { r, hm, name } = this.config;

    this.text.setAttribute('x', r + hm + '');
    this.text.setAttribute('y', r + hm + '');
    this.text.style.fill = 'var(--bone)';
    this.text.style.userSelect = 'none';
    this.text.style.textAnchor = 'middle';
    this.text.style.dominantBaseline = 'central';
    this.text.style.fontSize = '1.2rem';
    this.text.textContent = name;
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
    this.group.appendChild(this.text);
  }

  getName() {
    return this.config.name;
  }

  getSvg() {
    return this.group;
  }

  /* ========================= MOVEMENT ========================= */

  private dx = 0;
  private dy = 0;

  /**
   * Top left corner coordinates of the whole group.
   */
  private getGroupCoords() {
    const matrix = this.group.getCTM()!;
    const gx = matrix.e; // group x
    const gy = matrix.f; // group y

    return { gx, gy };
  }

  private mouseDownListener = (e: MouseEvent) => {
    const { clientX: cx, clientY: cy } = e;
    const { gx, gy } = this.getGroupCoords();

    this.dx = cx - gx; // delta x
    this.dy = cy - gy; // delta y

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  };

  private mouseMoveListener = (e: MouseEvent) => {
    const { r, hm, moveStep } = this.config;

    const { clientX: cx, clientY: cy } = e;
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

    this.updatePosition({ x: x, y: y });
  };

  private mouseUpListener = () => {
    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('mouseup', this.mouseUpListener);
  };

  private updatePosition(coords: Coords) {
    this.group.setAttribute('transform', `translate(${coords.x}, ${coords.y})`);
    this.publishMountPointsUpdate();
  }

  /**
   * Bring the group to the front when right-clicked.
   */
  private contextMenuListener = (e: MouseEvent) => {
    e.preventDefault();

    const parent = this.group.parentNode!;
    parent.appendChild(this.group);
  };

  /* ========================= MOUNT POINTS ========================= */

  private eventPublisher = new EventPublisher<{
    mountpoints: [mountPoints: Coords[]];
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
  private getRelativeMountPoints(): Coords[] {
    const { r, mountPointsNumber } = this.config;

    const points: Coords[] = [];

    const cx = this.circle.cx.baseVal.value;
    const cy = this.circle.cy.baseVal.value;
    const angleStep = 360 / mountPointsNumber;

    for (let i = 0; i < mountPointsNumber; i++) {
      const angle = angleStep * i;
      const radians = (angle * Math.PI) / 180;
      const x = Math.round(cx + r * Math.cos(radians));
      const y = Math.round(cy + r * Math.sin(radians));

      points.push({ x: x, y: y });
    }

    return points;
  }

  /**
   * Use parametric equations for a circle to get the absolute mount points coordinates.
   */
  getAbsoluteMountPoints(): Coords[] {
    const matrix = this.group.getCTM()!;
    const gx = matrix.e;
    const gy = matrix.f;

    return this.getRelativeMountPoints().map(({ x: x, y: y }) => ({
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

  private renderMountPoints() {
    if (this.mountPointsCircles.length > 0) return;

    const mountPoints = this.getRelativeMountPoints();
    for (const [i, { x: x, y: y }] of mountPoints.entries()) {
      const mountPointElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle',
      );

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

  /* ========================= MOUNT POINTS UTILS ========================= */

  getCenterCoords(): Coords {
    const { r, hm } = this.config;
    const { gx, gy } = this.getGroupCoords();

    return {
      x: gx + r + hm,
      y: gy + r + hm,
    };
  }

  getClosestMountPointIndex(coords: Coords) {
    const { x: x, y: y } = coords;
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
