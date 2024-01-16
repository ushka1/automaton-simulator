import { RenderOrchestrator } from '@/render/RenderOrchestrator';
import { homePageSheet, sharedSheet } from '@css/index';

class HomePage extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [sharedSheet, homePageSheet];

    const template = document.getElementById(
      'as-home-page',
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true);
    shadowRoot.appendChild(content);

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

      const q1 = renderOrchestrator.addStateFromConfig({
        name: 'Q1',
        x: Math.round((width / 3 - 35) / 10) * 10,
        y: Math.round((height / 2 - 35) / 10) * 10,
      });
      const q2 = renderOrchestrator.addStateFromConfig({
        name: 'Q2',
        x: Math.round(((2 * width) / 3 - 35) / 10) * 10,
        // y: Math.round((height / 2 - 35) / 10) * 10,
        y: Math.round(((1.5 * height) / 2 - 35) / 10) * 10,
      });

      renderOrchestrator.addTransition(q1, q2);
    } else {
      console.error('Could not find svg-container.');
    }
  }
}

customElements.define('as-home-page', HomePage);
