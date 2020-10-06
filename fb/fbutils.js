export const config = {
    apiKey: 'AIzaSyAas9GkevhLj3k6PSaGM36hNQQUTmMbzoY',
    projectId: 'firebase-backspaces',
    databaseURL: 'https://backspaces.firebaseio.com',

    // authDomain: 'backspaces.firebaseapp.com',
    // storageBucket: 'firebase-backspaces.appspot.com',
    // messagingSenderId: '175924217435',
    // appId: '1:175924217435:web:60d29eec0872eac3cce17e',
}

export function transformsRef(db, modelName) {
    return db.ref(`agentscript/models/${modelName}/transforms`)
}

export function resultsRef(db, modelName, transformName) {
    return transformsRef(db, modelName).child(transformName + '/result')
}

export function createTransform(db, model, name, fcn) {
    if (typeof fcn !== 'string') fcn = fcn.toString()
    fcn = fcn.replace(/  */g, ' ')
    // const obj = { function: fcn, result: 'null' }
    const obj = { function: fcn }
    transformsRef(db, model).child(name).set(obj)
}

// export function stringToFunction(str) {
//     if (typeof str !== 'string')
//         throw Error('stringToFunction: str not a string')
//     if (!str.includes('=>'))
//         throw Error('stringToFunction: str not an arrow (=>) function')
// }
