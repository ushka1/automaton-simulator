import { StateView } from './StateView';

export function render(root: ShadowRoot) {
  const width = 750;
  const height = 750;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width + '');
  svg.setAttribute('height', height + '');
  svg.setAttribute('viewBox', `'0 0 ${width} ${height}`);
  root.appendChild(svg);

  const stateView1 = new StateView({
    x: width / 3 - 35,
    y: height / 2 - 35,
    name: 'Q1',
  });
  svg.appendChild(stateView1.getSVG());

  const stateView2 = new StateView({
    x: (2 * width) / 3 - 35,
    y: height / 2 - 35,
    name: 'Q2',
  });
  svg.appendChild(stateView2.getSVG());

  stateView1.subscribe('mountpoints', (mountPoints) => {
    console.log('stateView left', mountPoints[6]);
    console.log('stateView top', mountPoints[9]);
  });
}
