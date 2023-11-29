import { StateView, StateViewConfig } from './StateView';

type RenderOrchestratorConfig = {
  width: number;
  height: number;
};

export class RenderOrchestrator {
  private svg: SVGSVGElement;
  private states: StateView[] = [];

  constructor(config: RenderOrchestratorConfig) {
    const { width, height } = config;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width + '');
    svg.setAttribute('height', height + '');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg = svg;
  }

  addState(state: StateView) {
    this.states.push(state);
    this.svg.appendChild(state.getSvg());
  }

  addStateFromConfig(config: Partial<StateViewConfig> = {}): StateView {
    const state = new StateView(config);
    this.addState(state);

    return state;
  }

  removeState(state: StateView): void {
    const index = this.states.indexOf(state);
    if (index !== -1) {
      this.states.splice(index, 1);
      this.svg.removeChild(state.getSvg());
    }
  }

  getSvg(): SVGSVGElement {
    return this.svg;
  }
}
