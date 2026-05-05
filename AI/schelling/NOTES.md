# Schelling Model — Implementation Notes

Lessons learned from testing this prompt with multiple LLMs.

## Setup: use stochastic per-patch placement with p.sprout()

Use a per-patch probability check and `p.sprout()`. Do not use `turtleBreeds`:

```js
this.patches.ask(p => {
    if (Math.random() * 100 < this.density) {
        p.sprout(1, this.turtles, t => { t.group = Math.random() < 0.5 ? 0 : 1 })
    }
})
```

**Do NOT use `turtleBreeds`** — the spec requires `t.group = 0/1` on the base
`this.turtles` set. Breeds complicate `isHappy` and add no value here.

**Do NOT use `breed.create()` + `t.moveTo(p)`** — create turtles directly on a
patch with `p.sprout()`. Creating at origin then moving can leave the turtle's
patch null during initialization.

**Do NOT use `nOf(count)` or slice a patch list** — this excludes edge patches
and can cause density mismatch.

## percentHappy is a property, not a method

The LLM may generate `percentHappy()` as a function. The prompt specifies it
as a numeric property (`model.percentHappy`) so it can be used directly in
monitors and status displays.

## Done condition

`this.done = true` when no turtles are unhappy. The LLM should check for zero
unhappy turtles at the start of `step()` and set done before returning.

## Empty patch pool — move ALL unhappy turtles

The NetLogo implementation uses a recursive `find-new-spot` — each agent
searches until it finds a free patch, including patches vacated by agents that
already moved this step. This means all unhappy agents move every step. Match
this with shuffle + dynamic recompute:

```js
unhappy.shuffle().ask(t => {
    t.moveTo(this.patches.with(p => p.turtlesHere.length === 0).oneOf())
})
```

**Why shuffle unhappy?** Turtles have ids assigned top-to-bottom. Without
shuffling, sequential processing creates a cascading "bubble" effect that drives
all empty patches to the bottom of the grid after one step.

**Why recompute empty inside the loop?** So patches vacated earlier in the step
are available to subsequent turtles — guaranteeing all unhappy turtles move.

**Do NOT use `Math.min(unhappy.length, empty.length)`** — pre-computing the
empty pool prevents later turtles from using vacated patches, so some unhappy
turtles don't move when the initial empty count is low.
