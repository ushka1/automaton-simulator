import { RenderOrchestrator } from '@/render/RenderOrchestrator';
import { homePageSheet, sharedSheet } from '@css/index';

export class HomePage extends HTMLElement {
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
      title.textContent = 'Free Vertices';
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

      const statesCount = 6;
      for (let i = 0; i < statesCount; i++) {
        const angle = (i * Math.PI) / (statesCount / 2);
        const x = containerCenter.x + 300 * Math.cos(angle);
        const y = containerCenter.y + 300 * Math.sin(angle);

        renderOrchestrator.addStateFromConfig({
          name: `Q${i}`,
          x: Math.round((x - 35) / 10) * 10,
          y: Math.round((y - 35) / 10) * 10,
        });
      }
    } else {
      console.error('Could not find svg-container.');
    }
  }
}
