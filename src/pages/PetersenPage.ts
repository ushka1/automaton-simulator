import { RenderOrchestrator } from '@/render/RenderOrchestrator';
import { homePageSheet, sharedSheet } from '@css/index';

export class PetersenPage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sharedSheet, homePageSheet];

    const template = document.getElementById(
      'as-svg-board-container',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);

    const title = shadowRoot.getElementById('title');
    if (title) {
      title.textContent = 'Petersen Graph';
    }

    this.setupRenderOrchestrator();
  }

  setupRenderOrchestrator() {
    const width = 750;
    const height = 750;
    const container = this.shadowRoot!.getElementById('svg-container');

    if (container) {
      const renderOrchestrator = new RenderOrchestrator({
        width,
        height,
      });
      container.appendChild(renderOrchestrator.getSvg());

      const containerCenter = {
        x: width / 2,
        y: height / 2,
      };

      const states = [];

      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const x = containerCenter.x + 300 * Math.cos(angle);
        const y = containerCenter.y + 300 * Math.sin(angle);

        const state = renderOrchestrator.addStateFromConfig({
          name: `Q${i}`,
          x: Math.round((x - 35) / 10) * 10,
          y: Math.round((y - 35) / 10) * 10,
        });
        states.push(state);
      }

      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const x = containerCenter.x + 150 * Math.cos(angle);
        const y = containerCenter.y + 150 * Math.sin(angle);

        const state = renderOrchestrator.addStateFromConfig({
          name: `Q${i + 5}`,
          x: Math.round((x - 35) / 10) * 10,
          y: Math.round((y - 35) / 10) * 10,
        });
        states.push(state);
      }

      for (let i = 0; i < 5; i++) {
        const state1 = states[i];
        const state2 = states[(i + 1) % 5];
        renderOrchestrator.addTransition(state1, state2);
      }

      for (let i = 0; i < 5; i++) {
        const state1 = states[i];
        const state2 = states[i + 5];
        renderOrchestrator.addTransition(state1, state2);
      }

      for (let i = 0; i < 5; i++) {
        const state1 = states[i + 5];
        const state2 = states[((i + 2) % 5) + 5];
        renderOrchestrator.addTransition(state1, state2);
      }
    } else {
      console.error('Could not find svg-container.');
    }
  }
}
