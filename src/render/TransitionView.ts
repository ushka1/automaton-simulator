export class TransitionView {
  private line: SVGLineElement;
  private startCoords: { x: number; y: number } = { x: 0, y: 0 };
  private endCoords: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.style.stroke = 'var(--blue)';
    line.style.strokeWidth = '5';
    this.line = line;
  }

  setStartCoords(coords: { x: number; y: number }) {
    this.startCoords = coords;
    this.updateLine();
  }

  setEndCoords(coords: { x: number; y: number }) {
    this.endCoords = coords;
    this.updateLine();
  }

  private updateLine() {
    const { x: x1, y: y1 } = this.startCoords;
    const { x: x2, y: y2 } = this.endCoords;
    this.line.setAttribute('x1', x1 + '');
    this.line.setAttribute('y1', y1 + '');
    this.line.setAttribute('x2', x2 + '');
    this.line.setAttribute('y2', y2 + '');
  }

  getSvg(): SVGLineElement {
    return this.line;
  }
}

// <svg width="200" height="100">
//   <defs>
//     <defs>
//       <marker
//         id="circle"
//         markerWidth="8"
//         markerHeight="8"
//         refX="4"
//         refY="4"
//         overflow="visible"
//       >
//         <text x="0" y="0" font-size="8px">1</text>
//       </marker>
//     </defs>
//   </defs>

//   <line
//     x1="30"
//     y1="50"
//     x2="170"
//     y2="50"
//     stroke="black"
//     stroke-width="2"
//     marker-start="url(#circle)"
//     marker-end="url(#circle)"
//     marker-mid="url(#circle)"
//   />
// </svg>
