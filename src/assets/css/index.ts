import aboutPageStyles from './about-page.css?inline';
import homePageStyles from './home-page.css?inline';
import notFoundPageStyles from './not-found-page.css?inline';
import sharedStyles from './shared.css?inline';

export const aboutPageSheet = new CSSStyleSheet();
aboutPageSheet.replaceSync(aboutPageStyles);

export const homePageSheet = new CSSStyleSheet();
homePageSheet.replaceSync(homePageStyles);

export const notFoundPageSheet = new CSSStyleSheet();
notFoundPageSheet.replaceSync(notFoundPageStyles);

export const sharedSheet = new CSSStyleSheet();
sharedSheet.replaceSync(sharedStyles);
