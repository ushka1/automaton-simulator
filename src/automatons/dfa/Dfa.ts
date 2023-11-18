export class Dfa {
  constructor(
    private states: Set<string>,
    private alphabet: Set<string>,
    private transitionTable: {
      [key: string]: {
        [key: string]: string;
      };
    },
    private startState: string,
    private acceptStates: Set<string>,
  ) {
    // Check that the transition table is valid.
    for (const [fromState, transition] of Object.entries(transitionTable)) {
      if (!states.has(fromState)) {
        throw new Error(`State ${fromState} not in states`);
      }

      for (const [symbol, nextState] of Object.entries(transition)) {
        if (!alphabet.has(symbol)) {
          throw new Error(`Symbol ${symbol} not in alphabet`);
        }

        if (!states.has(nextState)) {
          throw new Error(`State ${nextState} not in states`);
        }
      }
    }

    // Check that the start state is valid.
    if (!states.has(startState)) {
      throw new Error(`Start state ${startState} not in states`);
    }

    // Check that the accept states are valid.
    for (const acceptState of acceptStates) {
      if (!states.has(acceptState)) {
        throw new Error(`Accept state ${acceptState} not in states`);
      }
    }
  }

  addState(state: string): void {
    if (this.states.has(state)) {
      throw new Error(`State ${state} already in states`);
    }

    this.states.add(state);
  }

  removeState(state: string): void {
    if (!this.states.has(state)) {
      throw new Error(`State ${state} not in states`);
    }

    if (this.startState === state) {
      throw new Error(`Cannot remove start state`);
    }

    // Fix accept states.
    if (this.acceptStates.has(state)) {
      this.acceptStates.delete(state);
    }

    // Fix transition table.
    for (const [fromState, transition] of Object.entries(
      this.transitionTable,
    )) {
      if (fromState === state) {
        delete this.transitionTable[fromState];
        continue;
      }

      for (const [symbol, nextState] of Object.entries(transition)) {
        if (nextState === state) {
          delete this.transitionTable[fromState][symbol];
        }
      }
    }

    this.states.delete(state);
  }

  addSymbol(symbol: string): void {
    if (this.alphabet.has(symbol)) {
      throw new Error(`Symbol ${symbol} already in alphabet`);
    }

    this.alphabet.add(symbol);
  }

  removeSymbol(symbol: string): void {
    if (!this.alphabet.has(symbol)) {
      throw new Error(`Symbol ${symbol} not in alphabet`);
    }

    // Fix transition table.
    for (const [fromState, transition] of Object.entries(
      this.transitionTable,
    )) {
      for (const [s] of Object.entries(transition)) {
        if (s === symbol) {
          delete this.transitionTable[fromState][s];
        }
      }
    }

    this.alphabet.delete(symbol);
  }

  addTransition(state: string, symbol: string, nextState: string): void {
    if (!this.states.has(state)) {
      throw new Error(`State ${state} not in states`);
    }

    if (!this.alphabet.has(symbol)) {
      throw new Error(`Symbol ${symbol} not in alphabet`);
    }

    if (!this.states.has(nextState)) {
      throw new Error(`State ${nextState} not in states`);
    }

    if (!this.transitionTable[state]) {
      this.transitionTable[state] = {};
    }

    this.transitionTable[state][symbol] = nextState;
  }

  removeTransition(state: string, symbol: string): void {
    if (!this.states.has(state)) {
      throw new Error(`State ${state} not in states`);
    }

    if (!this.alphabet.has(symbol)) {
      throw new Error(`Symbol ${symbol} not in alphabet`);
    }

    if (!this.transitionTable[state]) {
      throw new Error(`No transition for state ${state}`);
    }

    delete this.transitionTable[state][symbol];
  }

  setStartState(state: string): void {
    if (!this.states.has(state)) {
      throw new Error(`State ${state} not in states`);
    }

    this.startState = state;
  }

  addAcceptState(state: string): void {
    if (!this.states.has(state)) {
      throw new Error(`State ${state} not in states`);
    }

    if (this.acceptStates.has(state)) {
      throw new Error(`State ${state} already in accept states`);
    }

    this.acceptStates.add(state);
  }

  removeAcceptState(state: string): void {
    if (!this.states.has(state)) {
      throw new Error(`State ${state} not in states`);
    }

    if (!this.acceptStates.has(state)) {
      throw new Error(`State ${state} not in accept states`);
    }

    this.acceptStates.delete(state);
  }

  simulate(input: string): boolean {
    console.log(`%c >> ${input}`, 'background: dodgerBlue;');

    let currentState = this.startState;
    for (const symbol of input) {
      const nextState = this.transitionTable?.[currentState]?.[symbol];
      console.log(`\t${currentState} --${symbol}--> ${nextState || ''}`);

      if (!nextState) {
        console.log('%c << no transition', 'background: red;');
        return false;
      }

      currentState = nextState;
    }

    if (!this.acceptStates.has(currentState)) {
      console.log('%c << not in accept state', 'background: red;');
      return false;
    }

    console.log('%c << in accept state', 'background: lime;');
    return true;
  }

  toString() {
    return JSON.stringify(
      {
        states: Array.from(this.states),
        alphabet: Array.from(this.alphabet),
        transitionTable: this.transitionTable,
        startState: this.startState,
        acceptStates: Array.from(this.acceptStates),
      },
      null,
      2,
    );
  }
}
