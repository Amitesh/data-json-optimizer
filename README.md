# data-json-optimizer

A small utility to merge all data.json files from the webpack application

DataJsonOptimizer is a small utility to merge all data.json files from the webpack application
and create following final data json file.

* game-data.json => It has all keys in hyphenated.
* game-data-in-camel-case.json => It has all keys in camelcase to access in js.

## Why this?
Application has too many data.json files which is carrying the all game properties and
keys are in hyphenated. In implementation, we are using camelcase keys. For this, if we
start converting the all keys on the fly on client side then it slows down the whole application.
So we are creating the final json files on application compile/build time only.
 
## Installation

  `npm install -D data-json-optimizer`

## Usage

```js
    const OpenerForWebpack = require('data-json-optimizer');
    module.exports = {
      entry: "./app.js",
      output: {
      },
      plugins: [
        new DataJsonOptimizer()
      ]
    };
```

### With webpack-multi-configurator plugin with angularity

```js
var webpack           = require('webpack');
var angularity        = require('webpack-angularity-solution');
var dataJsonOptimizer = require('data-json-optimizer');

const PORT = '3000';

module.exports = angularity(process.env, {port: PORT})
  .append(addDataJsonOptimizer)
  .otherwise('app+test')
  .resolve();


function addDataJsonOptimizer(configurator, options) {
  return configurator
    .merge({
        plugins: [
          new dataJsonOptimizer(),
          new webpack.WatchIgnorePlugin([/game-data.*\.json$/])
        ]
      }
    );
}
```


## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

[npm-badge]: https://img.shields.io/npm/v/opener-for-webpack.svg?style=flat-square
[npm]: https://www.npmjs.com/package/data-json-optimizer
