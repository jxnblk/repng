
# repng

React component to PNG converter

![](examples/repng.png)

```sh
npm i -g repng
```

```sh
repng Icon.js --width 512 --height 512 --out-dir assets
```

```
Usage
  $ repng <ReactComponent>

Options
  -d --out-dir    Directory to save file to
  -f --filename   Specify a custom output filename
  -w --width      Width of image
  -h --height     Height of image
  -s --scale      Scale image
  -d --delay      Delay in seconds before rendering image
  -p --props      Props in JSON format to pass to the React component
  --css           Path to CSS file to include
  --webfont       Path to custom webfont for rendering
```

## Node.js API

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
