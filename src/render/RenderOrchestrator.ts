import { Point } from '@/types/types';
import { cloneSVGFromTemplate } from '@/utils/svg';
import { ParentOrchestrator } from './ParentOrchestrator';
import { StateView, StateViewConfig } from './StateView';
import { TransitionView } from './TransitionView';

type RenderOrchestratorConfig = {
  width: number;
  height: number;
};

type Listenable = {
  enableListeners(): void;
  disableListeners(): void;
};

type ListenableFilter = {
  excluded?: Listenable[];
  included?: Listenable[];
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
    transitionView.setStartState(stateView1, 0);
    transitionView.setEndState(stateView2, 6);

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

  startNewTransition = (fromState: StateView, mountPointIndex: number) => {
    this.disableListeners(this.transitions);

    // TODO: Think about this inMotion, is it neccessary if orchestrator controls it?
    const transitionView = new TransitionView(this, { inMotion: true });
    transitionView.setStartState(fromState, mountPointIndex);
    transitionView.updateEnd(
      fromState.getAbsoluteMountPoints()[mountPointIndex],
    );

    this.transitions.push(transitionView);
    this.svgRoot.appendChild(transitionView.getSvg());

    const handleNewTransition = (e: MouseEvent) => {
      const point = this.coordsToPoint(e);

      const strokeWidth = transitionView.getStrokeWidth();
      const x = point.x - strokeWidth / 2;
      const y = point.y - strokeWidth / 2;
      transitionView.updateEnd({ x: x, y: y });

      const root = this.svgRoot.getRootNode();
      if (root instanceof ShadowRoot || root instanceof Document) {
        const elements = root.elementsFromPoint(e.clientX, e.clientY);
        const mountpoint = elements?.find((el) => el.id === 'mountpoint');

        // FIXME: while starting new, automatically assigned to fromStateMountPoint
        if (mountpoint) {
          const stateName = mountpoint.getAttribute('data-state');
          const index = Number(mountpoint.getAttribute('data-index'));

          const state = this.states.find((s) => s.getName() === stateName);
          if (state) {
            transitionView.setEndState(state, index);
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
    listenables: Listenable[],
    { excluded, included }: ListenableFilter = {},
  ) {
    this.switchListeners(true, listenables, { excluded, included });
  }

  private disableListeners(
    listenables: Listenable[],
    { excluded, included }: ListenableFilter = {},
  ) {
    this.switchListeners(false, listenables, { excluded, included });
  }

  private switchListeners(
    enable: boolean,
    listenables: Listenable[],
    { excluded, included }: ListenableFilter = {},
  ) {
    excluded ??= [];
    included ??= [];

    if (included.length > 0) {
      for (const l of included) {
        if (enable) {
          l.enableListeners();
        } else {
          l.disableListeners();
        }
      }
    } else {
      for (const l of listenables) {
        if (!excluded.includes(l)) {
          if (enable) {
            l.enableListeners();
          } else {
            l.disableListeners();
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
