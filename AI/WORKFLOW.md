# AgentScript Prompt Workflow

This folder contains prompts for generating AgentScript models using any LLM
(Claude, ChatGPT, Gemini, etc.).

## How to use

1. Open a **fresh chat** with no prior context
2. Paste the contents of `AS.md` followed by the model's `prompt.md`
3. Ask: **"Create `ModelName.js` and `model.html` from the above."**
4. Save the generated files into the model's folder
5. Open `model.html` with a local server (e.g. VS Code Go Live) to test

To copy both files to clipboard at once (Mac):
```bash
cat AI/AS.md AI/schelling/prompt.md | pbcopy
```

## What AS.md covers

`AS.md` is the shared AgentScript API reference. It covers imports, Model
structure, Patches, Turtles, Links, AgentArray methods, util.js, the views2
HTML pattern, and GUIDiv controls. Do not repeat any of this in `prompt.md`.

## Writing a good prompt.md

- Write in plain English — no JS code in `prompt.md`
- Say **turtles**, not "agents" or "cells" — the LLM must use AS Turtles
- Describe model properties as **properties**, not methods:
  `"set model.percentHappy to ..."` not `"a percentHappy() function"`
- Describe what the model does, not how to implement it
- The Controls section should reference GUIDiv (see AS.md) and describe
  behavior in English (sliders, buttons, monitors) without HTML/CSS

## Common LLM pitfalls

- Using patches instead of turtles for agents → say "turtles" explicitly
- Inventing methods that don't exist (`view.reset()`, `model.restart()`) →
  AS.md documents the correct reinitialize pattern
- Making computed values into methods instead of properties → be explicit
- Using absolute import paths → always use `./ModelName.js` for local files
