import firebase from 'https://cdn.skypack.dev/@firebase/app'
import 'https://cdn.skypack.dev/@firebase/database'
import * as util from '../src/utils.js'
import config from './Config.js'

export default class Transforms {
    constructor(modelName, root = '') {
        firebase.initializeApp(config)
        this.database = firebase.database()
        const modelsRoot = `${root}/agentscript/models`

        this.transforms = {}
        this.transformsRef = this.database.ref(
            `${modelsRoot}/${modelName}/transforms`
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
            try {
                ref.set(result)
            } catch (error) {
                console.log(name, fcn, ref, result)
                throw Error('ref.set error')
            }
        })
    }
}
