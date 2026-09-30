/** Returns a required DOM element or throws a useful error for the failing test. */
export function getRequiredElement(root: ParentNode, selector: string): Element {
  const element = root.querySelector(selector);

  if (element === null) throw new Error(`Missing element: ${selector}`);

  return element;
}
