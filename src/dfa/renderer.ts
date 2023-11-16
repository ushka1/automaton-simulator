import { StateView } from './StateView';

export function render(root: ShadowRoot) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '500');
  svg.setAttribute('height', '500');
  svg.setAttribute('viewBox', '0 0 500 500');
  svg.style.border = '1px solid black';

  root.appendChild(svg);

  const stateView1 = new StateView(50, 50);
  svg.appendChild(stateView1.getSVG());

  const stateView2 = new StateView(300, 100);
  svg.appendChild(stateView2.getSVG());

  stateView1.subscribe('mountpoints', (mountPoints) => {
    console.log('stateView1', mountPoints[6]);
  });
}
