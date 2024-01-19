import { RenderOrchestrator } from '@/render/RenderOrchestrator';
import { homePageSheet, sharedSheet } from '@css/index';

class HomePage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sharedSheet, homePageSheet];

    const template = document.getElementById(
      'as-svg-board-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);

    const title = shadowRoot.getElementById('title');
    if (title) {
      title.textContent = 'Cycle Graph';
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

      const statesCount = 8;
      const states = [];
      for (let i = 0; i < statesCount; i++) {
        const angle = (i * Math.PI) / (statesCount / 2);
        const x = containerCenter.x + 300 * Math.cos(angle);
        const y = containerCenter.y + 300 * Math.sin(angle);

        const state = renderOrchestrator.addStateFromConfig({
          name: `Q${i}`,
          x: Math.round((x - 35) / 10) * 10,
          y: Math.round((y - 35) / 10) * 10,
        });
        states.push(state);
      }

      for (let i = 0; i < states.length; i++) {
        const state1 = states[i];
        const state2 = states[(i + 1) % states.length];
        renderOrchestrator.addTransition(state1, state2);
      }
    } else {
      console.error('Could not find svg-container.');
    }
  }
}

customElements.define('as-cycle-page', HomePage);
