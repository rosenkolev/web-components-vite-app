import { beforeAll, expect, test } from "vitest";

import template from './output-color.component.html?raw';
import TemplateTestSuit from '../component-test-suit.js';
import './output-color.component.js';

const outputColorTestSuit = new TemplateTestSuit({ template, tagName: 'output-color' });

beforeAll(() => {
  outputColorTestSuit.attach();
  return () => { outputColorTestSuit.detach(); };
});

test("OutputColorComponent should render", () => {
  outputColorTestSuit.render(`<output-color color="RED"></output-color>`);;
  const outputColor = outputColorTestSuit.query('b').innerText;
  expect(outputColor).toBe('RED');
});
