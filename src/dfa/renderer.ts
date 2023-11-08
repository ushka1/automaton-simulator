export function render(root: ShadowRoot) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '500');
  svg.setAttribute('height', '500');
  svg.setAttribute('viewBox', '0 0 500 500');

  root.appendChild(svg);

  const q1 = new State('q0', 50, 50, svg);
  const q2 = new State('q1', 150, 150, svg);
  svg.appendChild(q1.getSVG());
  svg.appendChild(q2.getSVG());
}

// CIRCLE CX CY - CENTER X CENTER Y !!!
class State {
  private readonly circle: SVGCircleElement;

  constructor(
    public readonly id: string,
    public readonly x: number,
    public readonly y: number,
    private readonly svg: SVGSVGElement,
  ) {
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    circle.setAttribute('cx', this.x.toString());
    circle.setAttribute('cy', this.y.toString());
    circle.setAttribute('r', '30');
    circle.setAttribute('fill', 'currentColor');
    circle.setAttribute('stroke', 'currentColor');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('stroke-linecap', 'round');
    circle.setAttribute('stroke-linejoin', 'round');
    circle.classList.add('state');
    this.circle = circle;

    this.addListenerForControllingPositionOfCircle();
  }

  addListenerForControllingPositionOfCircle() {
    this.circle.addEventListener('mousedown', (event) => {
      const { x, y } = event;
      const cx = this.circle.cx.baseVal.value;
      const cy = this.circle.cy.baseVal.value;
      const dx = x - cx; // offset + inset
      const dy = y - cy; // offset + inset

      const onMouseMove = (event: MouseEvent) => {
        const { x, y } = event;
        this.changePosition(x - dx, y - dy);
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  getSVG() {
    return this.circle;
  }

  changePosition(x: number, y: number) {
    this.circle.setAttribute('cx', x.toString());
    this.circle.setAttribute('cy', y.toString());
  }
}

// class Transition {
//   private readonly line: SVGLineElement;

//   constructor(
//     public readonly from: State,
//     public readonly to: State,
//     public readonly label: string,
//   ) {
//     const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//     line.setAttribute('x1', from.x.toString());
//     line.setAttribute('y1', from.y.toString());
//     line.setAttribute('x2', to.x.toString());
//     line.setAttribute('y2', to.y.toString());
//     line.setAttribute('stroke', 'currentColor');
//     line.setAttribute('stroke-width', '2');
//     line.setAttribute('stroke-linecap', 'round');
//     line.setAttribute('stroke-linejoin', 'round');
//     line.classList.add('transition');
//     this.line = line;
//   }

//   getSvgElement() {
//     return this.line;
//   }
// }
