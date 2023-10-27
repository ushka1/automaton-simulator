import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found.');
}

rootElement.replaceChildren(new App());
