import firebase from 'https://cdn.skypack.dev/@firebase/app'
import 'https://cdn.skypack.dev/@firebase/database'
import config from './Config.js'

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
