This is an example of using HelloModel.js within an HTML file.

### The hello.html file:

Here is an html file that imports HelloModel.js, runs it for 500 steps, then prints out a sample
```html
<html>
    <head>
        <title>Hello</title>
    </head>
    <body>
        <script type="module">
            // An html file for running the ./HelloModel.js.  Run any other
            // model by changing the import's path (i.e. ./MyModel.js)
            import util from 'https://agentscript.org/src/util.js'
            import Model from './HelloModel.js'

            // Run the model 500 steps.
            // Async used for startup() and timeoutLoop().
            // Startup not needed by out HelloModel.js but others will need it.
            async function run() {
                // Avoid a white screen puzzling the user!
                util.printToPage(`Running for 500 steps. Takes a while!`)

                // Now create, init and run the model 500 steps
                const model = new Model()
                await model.startup()
                model.setup()

                await util.timeoutLoop(() => {
                    model.step()
                }, 500)
                // That's it!

                // When done, print out a sample of the model's variables.
                // It will be different each run of the model
                const sample = util.sampleModel(model)
                util.printToPage(sample)
            }
            run()
        </script>
    </body>
</html>
```
Lets break this down into its component parts.

### The HTML:

This is a very minimal html wrapper for a script running HelloModel.js
```html
<html>
    <head>
        <title>Hello</title>
    </head>
    <body>
        <script type="module">
          ...
        </script>
    </body>
</html>
```

The thing to note is `<script type="module">` which declare the contents of the script is an es6 module.

### The script architecture

The script has imports at the top as required by modules. Thee HelloModel.js import uses a relative path, i.e. beginning with ./ and ending with ".js" signifying the html and model are in the same folder.

Note that "bare" imports do not work. I.e. This will fail!
```javascript
    import Model from 'HelloModel'
```

The Model import can be changed to be any model we want to test so if we have a new `./FooModel.js`, we simply change that import. The rest of the will be the same for any model.

Finally note we use an async function, run(), which we immediately run. This is to allow what's in the function to use `await`
```javascript
    // An html file for running the ./HelloModel.js.  Run any other
    // model by changing the import's path (i.e. ./MyModel.js)
    import util from 'https://agentscript.org/src/util.js'
    import Model from './HelloModel.js'

    // Run the model 500 steps.
    // Async used for startup() and timeoutLoop().
    // Startup not needed by out HelloModel.js but others will need it.
    async function run() {
       ...
    }
    run()
```

### The run() contents

Because Models are separated from their View in a Model/View/Controller (MVC) architecture, the page will be blank while the model runs. So we print a message to the page to be patient!
```javascript
    // Avoid a white screen puzzling the user!
    util.printToPage(`Running for 500 steps. Takes a while!`)

    // Now create, init and run the model 500 steps
    const model = new Model()
    await model.startup()
    model.setup()

    await util.timeoutLoop(() => {
        model.step()
    }, 500)
    // That's it!

    // When done, print out a sample of the model's variables.
    // It will be different each run of the model
    const sample = util.sampleModel(model)
    util.printToPage(sample)
```
The next three lines instantiate the Model, call it's startup() if present, and then the setup(). At this point the Model is initialized and ready to be run by calling step()

To do this we use an async timeoutLoop Promise with it's number of calls set to 500. We do this rather than a simple for-loop to avoid freezing the browser.

When done, after the await, we print out a sample of the Model's variables.

Next, {@tutorial LocalServer}: creating a local "dev server" to run our html file
