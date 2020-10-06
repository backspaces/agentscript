import firebase from 'https://cdn.skypack.dev/@firebase/app'
import 'https://cdn.skypack.dev/@firebase/database'
import util from '../src/util.js'

let config = {
    apiKey: 'AIzaSyAas9GkevhLj3k6PSaGM36hNQQUTmMbzoY',
    projectId: 'firebase-backspaces',
    databaseURL: 'https://backspaces.firebaseio.com',
}

export function setConfig(cfg) {
    config = cfg
}
export function getConfig() {
    return config
}

export default class Transforms {
    constructor(modelName, root = '') {
        firebase.initializeApp(config)
        this.database = firebase.database()

        this.transforms = {}
        this.transformsRef = this.database.ref(
            `${root}agentscript/models/${modelName}/transforms`
        )
        this.transformsRef.once('value', ev => {
            const initialDB = util.objectToString(ev.val())
            console.log('Initial Database', initialDB)
        })

        this.transformsRef.on('child_added', ev => {
            console.log('child_added', ev, ev.key, ev.val())
            this.addTransform(ev.key, ev.val().function)
        })
        this.transformsRef.on('child_removed', ev => {
            console.log('child_removed', ev, ev.key, ev.val())
            this.removeTransform(ev.key)
            // delete this.transforms[ev.key]
        })
    }

    addTransform(name, fcnBody) {
        const xfm = {}
        xfm.function = new Function('model, util', fcnBody)
        xfm.resultRef = this.transformsRef.child(name + '/result')
        this.transforms[name] = xfm
    }
    removeTransform(name) {
        this.transformsRef.child(name).remove()
        delete this.transforms[name]
    }

    step(model) {
        util.forLoop(this.transforms, (val, key) => {
            const name = key
            const fcn = this.transforms[name].function
            const ref = this.transforms[name].resultRef
            const result = fcn(model, util)
            // If result is a object, this turns it into a string!
            // Need ref.child() ?
            ref.set(result)
        })
    }
}
