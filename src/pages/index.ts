import { AboutPage } from './AboutPage';
import { CyclePage } from './CyclePage';
import { HomePage } from './HomePage';
import { NotFoundPage } from './NotFoundPage';
import { PetersenPage } from './PetersenPage';

export function defineCustomElements() {
  customElements.define('as-about-page', AboutPage);
  customElements.define('as-cycle-page', CyclePage);
  customElements.define('as-home-page', HomePage);
  customElements.define('as-not-found-page', NotFoundPage);
  customElements.define('as-petersen-page', PetersenPage);
}
