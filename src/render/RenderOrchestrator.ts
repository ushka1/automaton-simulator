import { StateView, StateViewConfig } from './StateView';
import { TransitionView } from './TransitionView';

type RenderOrchestratorConfig = {
  width: number;
  height: number;
};

export class RenderOrchestrator {
  private svg: SVGSVGElement;
  private states: StateView[] = [];

  constructor(config: RenderOrchestratorConfig) {
    const { width, height } = config;

    const template = document.getElementById(
      'as-svg-board',
    ) as HTMLTemplateElement;
    const svg = document
      .importNode(template.content, true)
      .querySelector('svg') as SVGSVGElement;

    svg.setAttribute('width', width + '');
    svg.setAttribute('height', height + '');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg = svg;
  }

  /* ========================= CONTROLS ========================= */

  addState(state: StateView) {
    this.states.push(state);
    this.svg.appendChild(state.getSvg());
  }

  addStateFromConfig(config: Partial<StateViewConfig> = {}): StateView {
    const state = new StateView(this, config);
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

  addTransition(stateView1: StateView, stateView2: StateView): void {
    const transitionView = new TransitionView();
    transitionView.setStartStateView(stateView1, 0);
    transitionView.setEndStateView(stateView2, 6);

    this.svg.appendChild(transitionView.getSvg());
  }

  /* ========================= TRANSITIONS ========================= */

  startNewTransition = (fromState: StateView, mountPointIndex: number) => {
    const transitionView = new TransitionView();

    transitionView.setStartStateView(fromState, mountPointIndex);
    transitionView.updateEnd(
      fromState.getAbsoluteMountPoints()[mountPointIndex],
    );

    this.svg.appendChild(transitionView.getSvg());

    const startNewTransitionMousemove = (e: MouseEvent) => {
      const x = e.clientX - this.svg.getBoundingClientRect().left;
      const y = e.clientY - this.svg.getBoundingClientRect().top;
      transitionView.updateEnd({ x, y });
    };
    const startNewTransitionMouseup = () => {
      document.removeEventListener('mousemove', startNewTransitionMousemove);
      document.removeEventListener('mouseup', startNewTransitionMouseup);
    };

    document.addEventListener('mousemove', startNewTransitionMousemove);
    document.addEventListener('mouseup', startNewTransitionMouseup);
  };

  getSvg(): SVGSVGElement {
    return this.svg;
  }
}
