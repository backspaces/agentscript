# Schelling Segregation Model

This model implements the classic Schelling Segregation model described at:
http://nifty.stanford.edu/2014/mccown-schelling-model-segregation/

It shows how individual preferences for neighbors can produce large-scale
clustering, even when each agent's tolerance is moderate.

---

## Parameters

- **density** — percent of patches occupied by agents (default 70, range 1–99)
- **tolerance** — minimum percent of same-group neighbors required to be happy (default 50, range 0–100)

---

## Model Behavior

A grid of patches is populated with turtles (one per patch at most). Each
turtle belongs to one of two groups, assigned randomly with roughly equal
numbers in each group. The remaining patches are empty.

On each step:

1. Find all unhappy turtles. A turtle is unhappy if it has at least one occupied
   neighbor patch and fewer than `tolerance`% of those neighbors share its group.
   A turtle with no occupied neighbors is happy.
2. Each unhappy turtle moves to a randomly chosen empty patch.
3. The model stops when all turtles are happy (converged — no motion this step).

After each step, set `model.percentHappy` (a numeric property, not a method)
to the percentage of turtles that are currently happy.

---

## View

Display the grid as a colored canvas where:
- Group 0 agents are **blue**
- Group 1 agents are **red**
- Empty patches are **white**

Do not draw the turtles themselves (set `turtlesSize: 0`) — color comes
entirely from the patch based on which turtle is on it.

Below the canvas, show a live status line:
`Tick: {ticks}  Happy: {percent happy}%`
