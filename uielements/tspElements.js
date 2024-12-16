const json = [
  {
    "command": "reset()",
    "id": 1728927569824,
    "name": "reset",
    "position": {
      "x": 439,
      "y": 21
    },
    "type": "button"
  },
  {
    "id": 1729270887157,
    "type": "output",
    "name": "ticks",
    "position": {
      "x": 369,
      "y": 22
    },
    "monitor": "model.ticks",
    "fps": "10",
    "command": null
  },
  {
    "id": 1729463191305,
    "type": "range",
    "name": "patchesSize",
    "command": "view.setValue('patchesSize', value)",
    "position": {
      "x": 184,
      "y": 22
    },
    "min": "1",
    "max": "15",
    "step": "1",
    "value": "10"
  },
  {
    "id": 1730141024864,
    "type": "checkbox",
    "name": "run",
    "command": "checked ? anim.start() : anim.stop()",
    "position": {
      "x": 20,
      "y": 21
    },
    "checked": false
  },
  {
    "id": 1733442807622,
    "type": "dropdown",
    "name": "fps",
    "command": "anim.setFps(value)",
    "position": {
      "x": 108,
      "y": 21
    },
    "options": [
      "2",
      "5",
      "10",
      "20",
      "30",
      "60"
    ],
    "selected": "30"
  },
  {
    "id": 1734033577558,
    "type": "plot",
    "name": "Best Tour Length",
    "command": null,
    "position": {
      "x": 78,
      "y": 239
    },
    "width": "450",
    "height": "150",
    "pens": [
      "bestTourLength"
    ],
    "fps": "60"
  }
]
export default json