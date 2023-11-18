import { StateView } from '../../render/StateView';

export class DfaRenderer {
  static render(root: HTMLElement | ShadowRoot) {
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
  }
}
