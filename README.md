
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

    -p --props      Props to pass to the React component

    -w --width      Width of image

    -h --height     Height of image

    --crop          Crop image to specified height

    -s --scale      Scale image

    -d --delay      Delay in seconds before rendering image

    -o --out-dir    Directory to save file to

    -f --filename   Name for rendered image

    -D --dev        Runs a webpack dev server
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

MIT License
