export const createSVG = () =>
  document.createElementNS('http://www.w3.org/2000/svg', 'svg');

export const cloneSVGFromTemplate = (templateId: string) => {
  const template = document.getElementById(templateId) as HTMLTemplateElement;

  return document
    .importNode(template.content, true)
    .querySelector('svg') as SVGSVGElement;
};

export const createSVGCircle = () =>
  document.createElementNS('http://www.w3.org/2000/svg', 'circle');

export const createSVGPath = () =>
  document.createElementNS('http://www.w3.org/2000/svg', 'path');

export const createSVGText = () =>
  document.createElementNS('http://www.w3.org/2000/svg', 'text');

export const createSVGGroup = () =>
  document.createElementNS('http://www.w3.org/2000/svg', 'g');

export const createSVGMarker = () =>
  document.createElementNS('http://www.w3.org/2000/svg', 'marker');

export const createSVGDefs = () =>
  document.createElementNS('http://www.w3.org/2000/svg', 'defs');
