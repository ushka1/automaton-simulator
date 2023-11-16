import { EventPublisher } from '@/utils/EventPublisher';

const R = 30;
const MOUNT_POINTS_COUNT = 12;
const MIN_X = 0;
const MIN_Y = 0;
const MAX_X = 500;
const MAX_Y = 500;

export class StateView {
  private group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  private circle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle',
  );
  private text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  constructor(x: number, y: number) {
    const r = R;

    // Set the circle attributes
    this.circle.setAttribute('cx', r + '');
    this.circle.setAttribute('cy', r + '');
    this.circle.setAttribute('r', r + '');
    this.circle.style.fill = 'lightblue';
    this.circle.style.stroke = 'black';
    this.circle.style.strokeWidth = '3';

    // Set the text attributes
    this.text.setAttribute('x', r + '');
    this.text.setAttribute('y', r + '');
    this.text.style.fill = 'black';
    this.text.style.userSelect = 'none';
    this.text.style.textAnchor = 'middle';
    this.text.style.dominantBaseline = 'central';
    this.text.textContent = 'Q1';

    // Set the group attributes
    this.group.style.cursor = 'move';

    // Append the circle and text elements to the group
    this.group.appendChild(this.circle);
    this.group.appendChild(this.text);
    this.group.setAttribute('transform', `translate(${x}, ${y})`);

    this.renderMountPoints();

    this.group.addEventListener('mousedown', this.mouseDownListener);
  }

  getSVG() {
    return this.group;
  }

  /* ========================= MOVEMENT ========================= */

  private dx = 0;
  private dy = 0;

  private mouseDownListener = (e: MouseEvent) => {
    const { clientX: cx, clientY: cy } = e;

    const matrix = this.group.getCTM()!;
    const gx = matrix.e;
    const gy = matrix.f;

    this.dx = cx - gx;
    this.dy = cy - gy;

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  };

  private mouseMoveListener = (e: MouseEvent) => {
    const { clientX: cx, clientY: cy } = e;
    let x = cx - this.dx - ((cx - this.dx) % 10);
    let y = cy - this.dy - ((cy - this.dy) % 10);

    if (x < MIN_X) x = MIN_X;
    if (x > MAX_X - 2 * R) x = MAX_X - 2 * R;
    if (y < MIN_Y) y = MIN_Y;
    if (y > MAX_Y - 2 * R) y = MAX_Y - 2 * R;

    this.updatePosition(x, y);
  };

  private mouseUpListener = () => {
    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('mouseup', this.mouseUpListener);
  };

  private updatePosition(x: number, y: number) {
    this.group.setAttribute('transform', `translate(${x}, ${y})`);
    this.publishMountPointsUpdate();
  }

  /* ========================= MOUNT POINTS ========================= */

  private eventPublisher = new EventPublisher<{
    mountpoints: [mountPoints: { x: number; y: number }[]];
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
  private getRelativeMountPoints(): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    const r = R;
    const mountPointsCount = MOUNT_POINTS_COUNT;

    const cx = this.circle.cx.baseVal.value;
    const cy = this.circle.cy.baseVal.value;
    const angleStep = 360 / mountPointsCount;

    for (let i = 0; i < mountPointsCount; i++) {
      const angle = angleStep * i;
      const radians = (angle * Math.PI) / 180;
      const x = cx + Math.round(r * Math.cos(radians));
      const y = cy + Math.round(r * Math.sin(radians));

      points.push({ x, y });
    }

    return points;
  }

  /**
   * Use parametric equations for a circle to get the absolute mount points coordinates.
   */
  private getAbsoluteMountPoints(): { x: number; y: number }[] {
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

  private renderMountPoints() {
    if (this.mountPointsCircles.length > 0) return;

    const mountPoints = this.getRelativeMountPoints();
    for (const { x, y } of mountPoints) {
      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle',
      );

      circle.setAttribute('cx', x + '');
      circle.setAttribute('cy', y + '');
      circle.setAttribute('r', '5');
      circle.style.fill = 'blue';
      circle.style.opacity = '0';
      this.group.appendChild(circle);

      this.mountPointsCircles.push(circle);
    }

    this.group.addEventListener('mouseenter', () => this.showMountPoints());
    this.group.addEventListener('mouseleave', () => this.hideMountPoints());
  }

  private showMountPoints() {
    for (const circle of this.mountPointsCircles) {
      circle.style.opacity = '1';
    }
  }

  private hideMountPoints() {
    for (const circle of this.mountPointsCircles) {
      circle.style.opacity = '0';
    }
  }
}
