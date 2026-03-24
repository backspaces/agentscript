# AgentScript FireModel Parameter Sweep

Treat this as a completely new task.
Do not use any assumptions from prior conversation.
Only use information in this prompt.

## AgentScript Models

AgentScript (AS) Models are JavaScript classes located at:

https://agentscript.org/models/

Example: https://agentscript.org/models/FireModel.js

Each model subclasses: https://agentscript.org/src/Model.js

and provides two functions: `setup()` and `step()`.

A model runs by:

1. Constructing the model
2. Calling `setup()`
3. Repeatedly calling `step()` until `model.done === true`

---

## FireModel Data

After a run completes, the following values are available:

| Property             | Typical range     |
| -------------------- | ----------------- |
| `model.burnedTrees`  | 1 → ~60,000       |
| `model.initialTrees` | ~10,000 → ~60,000 |
| `model.ticks`        | 10 → ~300         |
| `model.density`      | 10 → 90 (percent) |

**Important:** `model.density` expects **integer percentage values (10–90)**, not fractions (0.1–0.9).

---

## Task

Create a **single-page browser app** (HTML/CSS/JS only, no frameworks).

The app runs many FireModel simulations across a range of densities and plots the results as they arrive.

---

## UI Controls

### Slider: N densities

- range: 2–40, default: 5
- Density values sweep **evenly from 10 to 90 inclusive**
- e.g. N=5 → densities: 10, 30, 50, 70, 90
- These are the **X axis values**

### Slider: runs per density

- range: 2–20, default: 6
- Each run produces one result point at that density

### Slider: workers

- range: 1–16, default: 4
- Number of parallel Web Workers

### Button: Start / Stop

---

## Simulation Behavior

On **Start**, for each density value, repeat `runs` times:

```
create new model
set model.density = density   // integer, e.g. 50 not 0.5
model.setup()
while (!model.done) model.step()
```

Each run produces: `burnedTrees`, `fraction = burnedTrees / initialTrees`, `steps = model.ticks`.

Plot each result immediately as it completes.

---

## Parallel Execution via Web Workers

Use a **worker pool** where the main thread dispatches tasks to idle workers via `postMessage`.

**Critical:** Since this is a single HTML file, the worker must be defined as an **inline ES module Blob**:

```js
const workerSrc = `
import Model from 'https://agentscript.org/models/FireModel.js'
self.onmessage = ({ data: { density, taskId } }) => {
    const model = new Model()
    model.density = density
    model.setup()
    while (!model.done) model.step()
    self.postMessage({
        density,
        burnedTrees: model.burnedTrees,
        initialTrees: model.initialTrees,
        steps: model.ticks,
        taskId
    })
}
`
const workerUrl = URL.createObjectURL(
    new Blob([workerSrc], { type: 'text/javascript' })
)
new Worker(workerUrl, { type: 'module' })
```

Requirements:

- Each worker runs one simulation at a time
- When a worker finishes, the main thread sends it the next task
- All workers stay busy until the task queue is empty
- **Stop** calls `worker.terminate()` on all active workers immediately

---

## Plot

Use a **single `<canvas>` element**. No charting libraries.

Plot all individual simulation results as they arrive (progressive rendering).

### X Axis

- Density (%), range: 10 → 90

### Left Y Axis — burnedTrees

- Log scale
- Auto-scales to the maximum `burnedTrees` value seen so far
- Label: "Burned Trees (log)" in green

### Right Y Axis — fraction burned

- Linear scale, range: 0 → 1
- Label: "Fraction Burned (linear)" in orange

---

## Scatter Points

Two series plotted simultaneously:

| Series      | Color  | Radius | Y axis         |
| ----------- | ------ | ------ | -------------- |
| burnedTrees | green  | 3px    | left (log)     |
| fraction    | orange | 3px    | right (linear) |

Multiple points appear vertically for each density value (one per run).

---

## Completion

When done or stopped, print all results via:

```js
console.table(
    points.map(p => ({
        x: p.x,
        density: p.x + '%',
        burnedTrees: p.y,
        fraction: +(p.y / p.initialTrees).toFixed(3),
        steps: p.steps,
    }))
)
```

---

## Visual Theme

- Dark background: `#1a1a1a`
- Subtle grid lines at axis tick positions
- Axes labeled, tick marks and values shown
- Status line showing run progress (e.g. "42/100 runs complete")
