import { getStarsFromScore } from "./gameHelpers";

test("a score of 50 earns one star", () => {
  expect(getStarsFromScore(50)).toBe(1);
});

test("a score of 75 earns two stars", () => {
  expect(getStarsFromScore(75)).toBe(2);
});

test("a score of 100 earns three stars", () => {
  expect(getStarsFromScore(100)).toBe(3);
});