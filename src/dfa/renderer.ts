import { StateView } from './StateView';

export function render(root: ShadowRoot) {
  const width = 750;
  const height = 750;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width + '');
  svg.setAttribute('height', height + '');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  root.appendChild(svg);

  const q1 = new StateView({
    x: Math.round((width / 3 - 35) / 10) * 10,
    y: Math.round((height / 2 - 35) / 10) * 10,
    name: 'Q1',
  });
  svg.appendChild(q1.getSVG());

  const q2 = new StateView({
    x: Math.round(((2 * width) / 3 - 35) / 10) * 10,
    y: Math.round((height / 2 - 35) / 10) * 10,
    name: 'Q2',
  });

  svg.appendChild(q2.getSVG());
  // renderLine(svg, q1, q2);
}

// function renderLine(svg: SVGSVGElement, q1: StateView, q2: StateView) {
//   const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//   line.style.stroke = 'var(--blue)';
//   line.style.strokeWidth = '5';
//   line.setAttribute('marker-mid', 'url(#arrowhead)');
//   svg.appendChild(line);

//   q1.subscribe('mountpoints', (mountpoints) => {
//     const right = mountpoints[0];
//     line.setAttribute('x1', right.x + '');
//     line.setAttribute('y1', right.y + '');
//   });

//   q2.subscribe('mountpoints', (mountpoints) => {
//     const left = mountpoints[6];
//     line.setAttribute('x2', left.x + '');
//     line.setAttribute('y2', left.y + '');
//   });
// }

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
