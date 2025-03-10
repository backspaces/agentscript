export default [
    {
        "id": 1729270887157,
        "type": "output",
        "name": "ticks",
        "position": {
            "x": 342,
            "y": 21
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
            "x": 172,
            "y": 21
        },
        "min": "1",
        "max": "30",
        "step": "1",
        "value": "20"
    },
    {
        "id": 1730141024864,
        "type": "checkbox",
        "name": "Run",
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
            "x": 100,
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
        "id": 1729535684833,
        "type": "button",
        "name": "Save",
        "command": "downloadJson()",
        "position": {
            "x": 405,
            "y": 21
        }
    },
    {
        "id": 1740081151576,
        "type": "button",
        "name": "Reset",
        "command": "reset()",
        "position": {
            "x": 472,
            "y": 20
        }
    },
    {
        "id": 1740082006239,
        "type": "range",
        "name": "LEOHeight",
        "command": "model.setLEOHeight(value)",
        "position": {
            "x": 23,
            "y": 130
        },
        "min": "0",
        "max": "0.1",
        "step": "0.01",
        "value": "0.03"
    },
    {
        "id": 1740092781037,
        "type": "range",
        "name": "earthRadius",
        "command": "model.setEarthRadius(value)",
        "position": {
            "x": 228,
            "y": 130
        },
        "min": "0.1",
        "max": "0.9",
        "step": "0.05",
        "value": "0.2"
    },
    {
        "id": 1740331647865,
        "type": "range",
        "name": "gravity",
        "command": "model.setGravity(value)",
        "position": {
            "x": 417,
            "y": 129
        },
        "min": "0.005",
        "max": "0.02",
        "step": "0.001",
        "value": "0.01"
    }
]