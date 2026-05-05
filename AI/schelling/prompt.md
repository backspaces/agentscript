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

Populate by iterating all patches with `this.patches.ask()` and a per-patch
probability check; place each turtle with `p.sprout()`:

```js
this.patches.ask(p => {
    if (Math.random() * 100 < this.density) {
        p.sprout(1, this.turtles, t => {
            t.group = Math.random() < 0.5 ? 0 : 1
        })
    }
})
```

Do **not** use `nOf`, slice a patch list, or use `turtleBreeds` — these break the model.

On each step:

1. Find all unhappy turtles. A turtle is unhappy if it has at least one occupied
   neighbor patch and fewer than `tolerance`% of those neighbors share its group.
   A turtle with no occupied neighbors is happy.
2. Move every unhappy turtle to a randomly chosen empty patch. Shuffle the
   unhappy turtles first (random order), then for each one pick any currently
   empty patch. As each turtle moves it frees its old patch, which immediately
   becomes available to subsequent turtles — so all unhappy turtles move every
   step regardless of how many there are.
3. The model stops when all turtles are happy (converged — no motion this step).

After each step, set `model.percentHappy` (a numeric property, not a method)
to the percentage of turtles that are currently happy, rounded down (`Math.floor`)
so it never shows 100% before `model.done` is true.

---

## View

Display the grid as a colored canvas where:
- Group 0 agents are **blue**
- Group 1 agents are **red**
- Empty patches are **white**

Do not draw the turtles themselves (set `turtlesSize: 0`) — color comes
entirely from the patch based on which turtle is on it.

---

## Controls

Use `GUIDiv` (see AS.md) for controls. Add to the HTML body:

```html
<div id="controlsDiv"></div>
<div id="modelDiv"></div>
```

Create a `GUIDiv` with:

- **title** `'Schelling Segregation Model'`
- **density** slider (range 1–99, default 70); on change update `model.density` and restart
- **tolerance** slider (range 0–100, default 50); on change update `model.tolerance` and restart
- row break (`'---'`)
- **start/stop** button that toggles the animator; if `model.done`, restart first
- **step** button that advances one tick
- **restart** button
- **ticks** monitor showing `model.ticks`
- **percentHappy** monitor showing `model.percentHappy`

The animator should start stopped (`.stop()` after construction). The model stops
automatically when `model.done` is true.
