class TransitionView {
  // TBD
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
