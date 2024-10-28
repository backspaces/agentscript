[
  {
    "command": "ui.anim.stop()",
    "id": 1728927362120,
    "name": "stop",
    "position": {
      "x": 97,
      "y": 33
    },
    "type": "button"
  },
  {
    "command": "ui.reset()",
    "id": 1728927569824,
    "name": "reset",
    "position": {
      "x": 59,
      "y": 68
    },
    "type": "button"
  },
  {
    "command": "ui.anim.setFps(value)",
    "id": 1728682054456,
    "max": "60",
    "min": "0",
    "name": "fps",
    "position": {
      "x": 164,
      "y": 38
    },
    "step": "1",
    "type": "range",
    "value": "30"
  },
  {
    "id": 1729270887157,
    "type": "output",
    "name": "ticks",
    "position": {
      "x": 330,
      "y": 37
    },
    "monitor": "ui.model.ticks",
    "fps": "10"
  },
  {
    "id": 1729463191305,
    "type": "range",
    "name": "patchSize",
    "command": "ui.view.reset(value)",
    "position": {
      "x": 19,
      "y": 143
    },
    "min": "1",
    "max": "15",
    "step": "1",
    "value": "10"
  },
  {
    "id": 1729463877025,
    "type": "button",
    "name": "downloadCanvas",
    "command": "ui.view.downloadCanvas()",
    "position": {
      "x": 27,
      "y": 217
    }
  },
  {
    "id": 1729464380401,
    "type": "range",
    "name": "turtleSize",
    "command": "ui.view.drawOptions.turtlesSize = value",
    "position": {
      "x": 304,
      "y": 144
    },
    "min": "1",
    "max": "10",
    "step": "1",
    "value": "3"
  },
  {
    "id": 1729535684833,
    "type": "button",
    "name": "downloadJson",
    "command": "ui.util.downloadJson(ui.json)",
    "position": {
      "x": 27,
      "y": 251
    }
  },
  {
    "id": 1729637941009,
    "type": "button",
    "name": "start",
    "command": "ui.anim.start()",
    "position": {
      "x": 30,
      "y": 35
    }
  },
  {
    "id": 1729638667060,
    "type": "dropdown",
    "name": "shape",
    "command": "ui.view.drawOptions.turtlesShape = value",
    "position": {
      "x": 196,
      "y": 146
    },
    "options": [
      "circle",
      "dart",
      "person",
      "bug"
    ],
    "selected": "bug"
  }
]