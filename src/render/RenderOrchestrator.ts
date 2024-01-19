import { StateView, StateViewConfig } from './StateView';
import { TransitionView } from './TransitionView';
import { cloneSVGFromTemplate } from './utils/helpers';
import {
  ListenerSwitcher,
  ListenerSwitcherFilter,
  ParentOrchestrator,
  Point,
} from './utils/interfaces';

type RenderOrchestratorConfig = {
  width: number;
  height: number;
};

export class RenderOrchestrator implements ParentOrchestrator {
  private states: StateView[] = [];
  private transitions: TransitionView[] = [];

  private svgRoot: SVGSVGElement = cloneSVGFromTemplate('as-svg-root');

  constructor(config: RenderOrchestratorConfig) {
    const { width, height } = config;
    this.svgRoot.setAttribute('width', width + '');
    this.svgRoot.setAttribute('height', height + '');
    this.svgRoot.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  /* ========================= CONTROLS - STATE ========================= */

  addState(state: StateView) {
    this.states.push(state);
    this.svgRoot.appendChild(state.getSvg());
  }

  addStateFromConfig(config: Partial<StateViewConfig> = {}): StateView {
    const state = new StateView(this, config);
    this.addState(state);

    return state;
  }

  removeState(state: StateView) {
    // TODO: remove all transitions connected to this state

    const index = this.states.indexOf(state);
    if (index !== -1) {
      this.states.splice(index, 1);
      this.svgRoot.removeChild(state.getSvg());
    }
  }

  /* ========================= CONTROLS - TRANSITION ========================= */

  addTransition(stateView1: StateView, stateView2: StateView): TransitionView {
    // TODO: check if transition already exists

    const transitionView = new TransitionView(this);
    transitionView.setStartState(stateView1);
    transitionView.setEndState(stateView2);

    this.transitions.push(transitionView);
    this.svgRoot.appendChild(transitionView.getSvg());
    return transitionView;
  }

  removeTransition(transition: TransitionView) {
    const index = this.transitions.indexOf(transition);
    if (index !== -1) {
      this.transitions.splice(index, 1);
      this.svgRoot.removeChild(transition.getSvg());
    }
  }

  /* ========================= TRANSITIONS ========================= */

  startStateMoving(stateView: StateView): void {
    this.disableListeners(this.states, { excluded: [stateView] });
    this.disableListeners(this.transitions);
  }

  endStateMoving(): void {
    this.enableListeners(this.states);
    this.enableListeners(this.transitions);
  }

  startTransitionCurving(): void {
    this.disableListeners(this.transitions);
    this.disableListeners(this.states);
  }

  endTransitionCurving(): void {
    this.enableListeners(this.transitions);
    this.enableListeners(this.states);
  }

  startNewTransition = (fromState: StateView) => {
    this.disableListeners(this.transitions);

    // TODO: Think about this inMotion, is it neccessary if orchestrator controls it?
    const transitionView = new TransitionView(this, { inMotion: true });
    transitionView.setStartState(fromState);

    this.transitions.push(transitionView);
    this.svgRoot.appendChild(transitionView.getSvg());

    const handleNewTransition = (e: MouseEvent) => {
      const point = this.coordsToPoint(e);

      const strokeWidth = transitionView.getStrokeWidth();
      const x = point.x - strokeWidth / 2;
      const y = point.y - strokeWidth / 2;
      transitionView.updateEnd({ x, y });

      const root = this.svgRoot.getRootNode();
      if (root instanceof ShadowRoot || root instanceof Document) {
        const elements = root.elementsFromPoint(e.clientX, e.clientY);
        const mountpoint = elements?.find((el) => el.id === 'mountpoint');

        // FIXME: while starting new, automatically assigned to fromStateMountPoint
        if (mountpoint) {
          const stateName = mountpoint.getAttribute('data-state');
          const state = this.states.find((s) => s.getName() === stateName);
          if (state) {
            transitionView.setEndState(state);
          }
        }
      }
    };

    const endNewTransition = () => {
      transitionView.setInMotion(false);
      this.enableListeners(this.transitions);

      document.removeEventListener('mousemove', handleNewTransition);
      document.removeEventListener('mouseup', endNewTransition);
    };

    document.addEventListener('mousemove', handleNewTransition);
    document.addEventListener('mouseup', endNewTransition);
  };

  /* ========================= LISTENERS ========================= */

  private enableListeners(
    elements: ListenerSwitcher[],
    { excluded, included }: ListenerSwitcherFilter = {},
  ) {
    this.switchListeners(true, elements, { excluded, included });
  }

  private disableListeners(
    elements: ListenerSwitcher[],
    { excluded, included }: ListenerSwitcherFilter = {},
  ) {
    this.switchListeners(false, elements, { excluded, included });
  }

  private switchListeners(
    enable: boolean,
    elements: ListenerSwitcher[],
    { excluded, included }: ListenerSwitcherFilter = {},
  ) {
    excluded ??= [];
    included ??= [];

    if (included.length > 0) {
      for (const elm of included) {
        if (enable) {
          elm.enableListeners();
        } else {
          elm.disableListeners();
        }
      }
    } else {
      for (const elm of elements) {
        if (!excluded.includes(elm)) {
          if (enable) {
            elm.enableListeners();
          } else {
            elm.disableListeners();
          }
        }
      }
    }
  }
  /* ========================= UTILS ========================= */

  coordsToPoint = (coords: Point): Point => {
    return {
      x: coords.x - this.svgRoot.getBoundingClientRect().left,
      y: coords.y - this.svgRoot.getBoundingClientRect().top,
    };
  };

  getSvg(): SVGSVGElement {
    return this.svgRoot;
  }
}
