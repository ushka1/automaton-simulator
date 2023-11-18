import './pages';
import './router';

import { DFA } from './dfa/DFA';

const dfa = new DFA(
  new Set(['q1', 'q2', 'q3', 'q4', 'q5']),
  new Set(['a', 'b', 'c']),
  {
    q1: {
      a: 'q2',
      b: 'q1',
    },
    q2: {
      a: 'q3',
      b: 'q2',
    },
    q3: {
      a: 'q1',
      b: 'q4',
    },
    q4: {
      a: 'q5',
      b: 'q4',
    },
    q5: {
      a: 'q1',
      b: 'q4',
    },
  },
  'q1',
  new Set(['q5']),
);

console.log(dfa.toString());

dfa.simulate('abababab');
dfa.simulate('ababababa');
dfa.simulate('ababababab');
dfa.simulate('aaaa');
dfa.simulate('bbbb');
dfa.simulate('abababa');
dfa.simulate('ababababababbb');
dfa.simulate('abababababaaaa');
dfa.simulate('abababababaaaabbbbb');
dfa.simulate('babababa');
dfa.simulate('babacbaba');
