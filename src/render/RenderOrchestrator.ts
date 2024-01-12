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
    const transitionView = new TransitionView(this);
    transitionView.setStartStateView(stateView1, 0);
    transitionView.setEndStateView(stateView2, 6);

    this.svg.appendChild(transitionView.getSvg());
  }

  /* ========================= TRANSITIONS ========================= */

  coordsToPoint = (coords: Coords): Coords => {
    return {
      x: coords.x - this.svg.getBoundingClientRect().left,
      y: coords.y - this.svg.getBoundingClientRect().top,
    };
  };

  startNewTransition = (fromState: StateView, mountPointIndex: number) => {
    const transitionView = new TransitionView(this, { inMotion: true });
    transitionView.setStartStateView(fromState, mountPointIndex);
    transitionView.updateEnd(
      fromState.getAbsoluteMountPoints()[mountPointIndex],
    );

    this.svg.appendChild(transitionView.getSvg());

    const startNewTransitionMousemove = (e: MouseEvent) => {
      const point = this.coordsToPoint(e);
      const x = point.x - 2.5; // TODO: parametrize 2.5
      const y = point.y - 2.5; // TODO: parametrize 2.5
      transitionView.updateEnd({ x, y });

      const root = this.svg.getRootNode();
      if (root instanceof ShadowRoot || root instanceof Document) {
        const elements = root.elementsFromPoint(e.clientX, e.clientY);
        const mountpoint = elements?.find((el) => el.id === 'mountpoint');

        // FIXME: while starting new, automatically assigned to fromStateMountPoint
        if (mountpoint) {
          const stateName = mountpoint.getAttribute('data-state');
          const index = Number(mountpoint.getAttribute('data-index'));

          const state = this.states.find((s) => s.getName() === stateName);
          if (state) {
            transitionView.setEndStateView(state, index);
          }
        }
      }
    };

    const startNewTransitionMouseup = () => {
      transitionView.setInMotion(false);
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
