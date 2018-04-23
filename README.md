
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
    $ repng <Root-component>

  Options
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
