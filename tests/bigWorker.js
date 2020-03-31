import run from './bigRunner'

onmessage = e => {
    if (e.data.cmd === 'init') {
        run(e.data.params)
    } else {
        console.log('Oops, unknown message: ', e)
    }
}
