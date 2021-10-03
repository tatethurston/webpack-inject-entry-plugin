# Webpack Inject Entry Plugin

<blockquote>A webpack plugin to inject code into the bundle</blockquote>

<br />

<a href="https://www.npmjs.com/package/webpack-inject-entry-plugin">
  <img src="https://img.shields.io/npm/v/webpack-inject-entry-plugin.svg">
</a>
<a href="https://github.com/tatethurston/webpack-inject-entry-plugin/blob/master/LICENSE">
  <img src="https://img.shields.io/npm/l/webpack-inject-entry-plugin.svg">
</a>
<a href="https://www.npmjs.com/package/webpack-inject-entry-plugin">
  <img src="https://img.shields.io/npm/dy/webpack-inject-entry-plugin.svg">
</a>
<a href="https://github.com/tatethurston/webpack-inject-entry-plugin/actions/workflows/ci.yml">
  <img src="https://github.com/tatethurston/webpack-inject-entry-plugin/actions/workflows/ci.yml/badge.svg">
</a>

## What is this? 🧐

A webpack plugin to inject a filepath into a [webpack entry](https://webpack.js.org/concepts/entry-points/). This can be used to build webpack plugins that inject code into the bundle.

Compatible with both Webpack 4 and 5.

## Examples 🚀

Usage in a webpack plugin:

```js
import InjectEntryPlugin from "webpack-inject-entry-plugin";

export class MyPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    new InjectEntryPlugin({
      entry: "main",
      filepath: "./path/to/my/entry/file.js",
    }).apply(compiler);
  }
}
```

Usage in `webpack.config.js`:

```js
const InjectEntryPlugin = require("webpack-inject-entry-plugin").default;

module.exports = {
  plugins: [
    new InjectEntryPlugin({
      entry: "main",
      filepath: "./service-worker.js",
    }),
  ],
};
```

## Installation & Usage 📦

1. Add this package to your project:
   - `yarn add webpack-inject-entry-plugin`

## API Overview 🛠

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
<td>entry</td>
<td>
The name of the <a href="https://webpack.js.org/concepts/entry-points/">webpack entry</a>.
</td>
<td>string</td>
</tr>
<tr>
  <td>filepath</td>
<td>
The filepath to the source code to inject.
</td>
  <td>string</td>
</tr>
</tbody>
</table>

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/webpack-inject-entry-plugin/blob/master/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/webpack-inject-entry-plugin/blob/master/LICENSE).
