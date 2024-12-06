const json = [
    {
        command: 'reset()',
        id: 1728927569824,
        name: 'reset',
        position: {
            x: 33,
            y: 70,
        },
        type: 'button',
    },
    {
        command: 'anim.setFps(value)',
        id: 1728682054456,
        max: '50',
        min: '0',
        name: 'fps',
        position: {
            x: 177,
            y: 36,
        },
        step: '1',
        type: 'range',
        value: '30',
    },
    {
        id: 1729270887157,
        type: 'output',
        name: 'ticks',
        position: {
            x: 336,
            y: 37,
        },
        monitor: 'model.ticks',
        fps: '10',
        command: null,
    },
    {
        id: 1729463191305,
        type: 'range',
        name: 'patchSize',
        command: "view.setValue('turtlesSize', value)",
        position: {
            x: 191,
            y: 155,
        },
        min: '1',
        max: '15',
        step: '1',
        value: '10',
    },
    {
        id: 1729463877025,
        type: 'button',
        name: 'downloadCanvas',
        command: 'view.downloadCanvas()',
        position: {
            x: 56,
            y: 232,
        },
    },
    {
        id: 1729535684833,
        type: 'button',
        name: 'downloadJson',
        command: "util.downloadJsonModule(json, 'elements.js')",
        position: {
            x: 190,
            y: 231,
        },
    },
    // {
    //   "id": 1729638667060,
    //   "type": "dropdown",
    //   "name": "shape",
    //   "command": "view.drawOptions.turtlesShape = value",
    //   "position": {
    //     "x": 98,
    //     "y": 34
    //   },
    //   "options": [
    //     "circle",
    //     "dart",
    //     "person",
    //     "bug",
    //     "arrow"
    //   ],
    //   "selected": "bug"
    // },
    {
        id: 1730141024864,
        type: 'checkbox',
        name: 'run',
        command: 'checked ? anim.start() : anim.stop()',
        position: {
            x: 33,
            y: 35,
        },
        checked: false,
    },
]
export default json
