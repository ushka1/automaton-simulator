import { aboutPage, homePage, notFoundPage } from '../pages';
import { Router } from '../router/Router';

export const rootRouter = new Router(
  {
    '/': homePage,
    '/about': aboutPage,
  },
  notFoundPage,
  document.getElementById('root-router')!,
);
