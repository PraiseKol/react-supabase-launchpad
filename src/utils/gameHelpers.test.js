import { getCurrentPhaseIndex, getStarsFromScore } from "./gameHelpers";

test("a score of 50 earns one star", () => {
  expect(getStarsFromScore(50)).toBe(1);
});

test("a score of 75 earns two stars", () => {
  expect(getStarsFromScore(75)).toBe(2);
});

test("a score of 100 earns three stars", () => {
  expect(getStarsFromScore(100)).toBe(3);
});

const samplePhases = [
  { levels: [{ id: "P1-L1" }, { id: "P1-L2" }] },
  { levels: [{ id: "P2-L1" }, { id: "P2-L2" }] },
];

test("a new player opens the first world", () => {
  expect(getCurrentPhaseIndex([], samplePhases, [0])).toBe(0);
});

test("the map opens the world containing the first incomplete level", () => {
  expect(getCurrentPhaseIndex(["P1-L1", "P1-L2", "P2-L1"], samplePhases, [0, 1])).toBe(1);
});

test("the map returns to the highest unlocked world after all levels are complete", () => {
  expect(getCurrentPhaseIndex(["P1-L1", "P1-L2", "P2-L1", "P2-L2"], samplePhases, [0, 1])).toBe(1);
});