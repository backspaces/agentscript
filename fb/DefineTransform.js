import firebase from 'https://cdn.skypack.dev/@firebase/app'
import 'https://cdn.skypack.dev/@firebase/database'

const key = 'AIzaSyAas9GkevhLj' + '3k6PSaGM36hNQQUTmMbzoY'
let config = {
    apiKey: key,
    projectId: 'firebase-backspaces',
    databaseURL: 'https://backspaces.firebaseio.com',

    // authDomain: 'backspaces.firebaseapp.com',
    // storageBucket: 'firebase-backspaces.appspot.com',
    // messagingSenderId: '175924217435',
    // appId: '1:175924217435:web:60d29eec0872eac3cce17e',
}

export function setConfig(cfg) {
    config = cfg
}
export function getConfig() {
    return config
}

export default class DefineTransform {
    constructor(root = '') {
        firebase.initializeApp(config)
        this.database = firebase.database()
        this.modelsRoot = `${root}/agentscript/models`
    }

    transformsRef(modelName) {
        return this.database.ref(`${this.modelsRoot}/${modelName}/transforms`)
    }

    defineTransform(modelName, transformName, fcn) {
        fcn = fcn.replace(/  */g, ' ')
        const xfm = { function: fcn }

        this.transformsRef(modelName).child(transformName).set(xfm)

        // Used by onValue() below
        const resultsRef = this.transformsRef(modelName).child(
            transformName + '/result'
        )

        function onValue(fcn) {
            resultsRef.on('value', ev => {
                const val = ev.val()
                if (val) fcn(val)
            })
        }
        return onValue
    }
}
