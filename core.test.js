import { expect, test } from "vitest";
import core from "./core";

test("isObject show returns valid result", () => {
  expect(core.isObject({})).toBe(true);
  expect(core.isObject(new (function () { })())).toBe(true);
  expect(core.isObject([])).toBe(false);
  expect(core.isObject(null)).toBe(false);
  expect(core.isObject(undefined)).toBe(false);
  expect(core.isObject(1)).toBe(false);
  expect(core.isObject("")).toBe(false);
  expect(core.isObject(function () { })).toBe(false);
  expect(core.isObject(new Date())).toBe(false);
  expect(core.isObject(new Error())).toBe(false);
  expect(core.isObject(new Map())).toBe(false);
});

test("expandPropertyKey should return valid result", () => {
  expect(core.expandPropertyKey("key", {})).toEqual([]);
  expect(core.expandPropertyKey("key", { sub: "value" })).toEqual(["key.sub"]);
  expect(
    core.expandPropertyKey("key", { sub: { sub: "value" }, test: "value" })
  ).toEqual(["key.sub.sub", "key.test"]);
});

test("toArray convert node list to array", () => {
  const parent = document.createElement("div");
  parent.innerHTML = "<div></div><div></div><div></div>";
  const nodeList = parent.querySelectorAll("div");
  const array = core.toArray(nodeList);
  expect(array).toHaveLength(3);
});

test("registerComponent should register component", () => {
  const selector = "test-component";
  const component = class TestComponent { };
  core.registerComponent(selector, component);
  expect(window.customElements.get(selector)).toBe(component);
});

test("registerComponent should register class definition", () => {
  class TestComponent {
    static component = {
      selector: "test-class-component",
    };
  }
  core.registerComponent(TestComponent);
  expect(window.customElements.get("test-class-component")).toBe(TestComponent);
});
