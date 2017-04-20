
# repng

React component to PNG converter

![](example/repng.png)

```sh
npm i -g repng
```

```sh
repng Icon.js --width 512 --height 512 --out-dir assets
```

```
  Usage
    $ repng <Root-component>

  Options
    -c --css        CSS file to include

    -p --props      Props in JSON format to pass to the React component

    -w --width      Width of image

    -h --height     Height of image

    -C --crop       Crop image to specified height

    -s --scale      Scale image

    -d --delay      Delay in seconds before rendering image

    -o --out-dir    Directory to save file to

    -f --filename   Name for rendered image

    -F --font       Path to font to include as a webfont

    -D --dev        Runs a webpack-dev-server

    -P --port       Port to run the dev server on (default 8080)
```

## Development mode

To preview the component in a dev server, run repng with the `--dev` flag
and open <http://localhost:8080>

```sh
repng Icon.js --dev
```

Running the dev mode might require that you have both webpack and webpack-dev-server installed locally

```sh
npm i -D webpack webpack-dev-server
```

## Node.js Usage

Repng can also be used as a node module.

```js
const repng = require('repng')
const Component = require('./Component')

const options = {
  props: {
    title: 'hello'
  }
}

const result = repng(Comp, options)

result.then(streams => {
  console.log('rendered component')
})
```

MIT License
