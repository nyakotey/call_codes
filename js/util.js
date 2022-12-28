export const $ = (elem) => document.querySelectorAll(elem);

export const render = (elem, data) => elem.innerHTML = data;

export const setElem = (parent, childElem = []) => parent.replaceChildren(...childElem);