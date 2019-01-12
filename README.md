# reason-css-modules-loader

Webpack loader for ReasonML fans who want to use [CSS Modules](https://github.com/css-modules/css-modules) in their projects. 

It's a drop-in replacement for [css-loader](https://github.com/webpack-contrib/css-loader). In other words, when you replace `'css-loader'` in your `webpack.config.js` to `'reason-css-modules-loader'`. It'll work without any problem. 

## Installation

Install via npm `npm install --save-dev reason-css-modules-loader`

## Setup

### Webpack

Just change `'css-loader'` with `'reason-css-modules-loader'`.

Example:
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'reason-css-modules-loader',
            query: {
              sourceMap: !isProduction,
              importLoaders: 1,
              localIdentName: isProduction ? '[hash:base64:5]' : '[local]__[hash:base64:5]'
            }
          },
        ]
      }
    ]
  }
}
```

Then, style definition files will be created under `./src/styles` directory. (You can change this with `dest` option.)

### ReasonML

To include a CSS Module file to a Reason code, write code like below on the top of your ReasonML code: 

```reason
[@bs.module] external styles: Component.definition = "./Component.css"
```

Change the `Component` above with your component name. 

It's a bit long and hard to remember. So, if you use VS Code, it's a good idea to [add a snippet](https://code.visualstudio.com/docs/editor/userdefinedsnippets) like below: 

```json
{
  "Import CSS Modules file": {
    "prefix": "styles",
    "body": [
      "[@bs.module] external styles: $1.definition = \"./$1.css\""
    ],
    "description": "Import CSS Modules file"
  }
}
```

Then, you can call CSS-Module-ized styles in your ReasonReact codes:

```reason
<div className=styles##isRead>
</div>
```

Like original CSS Modules, you can use [re-classnames](https://github.com/minima-app/re-classnames).

```reason
<div className=Cn.make([styles##isRead, styles##blue])>
</div>
```

Some of you are wondering why `##` is used instead of `.` or `#`. It's because the compiled type is `Js.t(object)`. [Check this doc to learn more about this syntax.](https://bucklescript.github.io/docs/en/object-2)


## Options

You can just set options like any other loaders. 

### css-loader options

If it is an option that [css-loader](https://github.com/webpack-contrib/css-loader) supports, you can use it. 

NOTE: Unlike the default css-loader settings, `modules` and `camelCase` are forced to `true`. And you cannot change them to `false`. 

It's not a bad decision because you don't need to use this loader if you don't want to use CSS Modules. And camel case is the naming convention of ReasonML. 

### `destDir` option

By default, CSS Modules type definition files are created under `./src/styles` folder. 

However, for some reason, you might want to change this location. Then, you can change it with `destDir` option. 

Example 1: Change it to `./src/css` folder.
```js
{
  loader: 'reason-css-modules-loader',
  query: {
    destDir: './src/css',
  }
}
```

Example 2: Add `Styles.re` file right next to `.css` file. 
```js
{
  loader: 'reason-css-modules-loader',
  query: {
    destDir: 'current',
  }
}
```

As ReasonML creates a compiled JavaScript version of each `.re` file, I personally don't recommend creating `Styles.re` files next to `.css`. File tree becomes too cluttered. 

```
Component.bs.js
Component.css
Component.re
ComponentStyles.bs.js
ComponentStyles.re
```

Don't you think it's too much? 

## Acknowlegement

If there wasn't [typings-for-css-modules-loader](https://github.com/Jimdo/typings-for-css-modules-loader), I couldn't make reason-css-modules-loader. 

This module inspired and guided me. 