export default [
    {
        id: 1729270887157,
        type: 'output',
        name: 'ticks',
        position: {
            x: 342,
            y: 21,
        },
        monitor: 'model.ticks',
        fps: '10',
        command: null,
    },
    {
        id: 1729463191305,
        type: 'range',
        name: 'patchesSize',
        command: "view.setValue('patchesSize', value)",
        position: {
            x: 172,
            y: 21,
        },
        min: '1',
        max: '20',
        step: '1',
        value: '12',
    },
    {
        id: 1730141024864,
        type: 'checkbox',
        name: 'Run',
        command: 'checked ? anim.start() : anim.stop()',
        position: {
            x: 20,
            y: 21,
        },
        checked: false,
    },
    {
        id: 1733442807622,
        type: 'dropdown',
        name: 'fps',
        command: 'anim.setFps(value)',
        position: {
            x: 100,
            y: 21,
        },
        options: ['2', '5', '10', '20', '30', '60'],
        selected: '30',
    },
    {
        id: 1729535684833,
        type: 'button',
        name: 'Save',
        command: 'downloadJson()',
        position: {
            x: 405,
            y: 21,
        },
    },
]
