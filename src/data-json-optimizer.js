/**
 * DataJsonOptimizer is a small utility to merge all data.json files from the webpack application
 * and create following final data json file.
 *
 * a) game-data.json => It has all keys in hyphenated.
 * b) game-data-in-camel-case.json => It has all keys in camelcase to access in js.
 *
 * Why this?
 * Application has too many data.json files which is carrying the all game properties and
 * keys are in hyphenated. In implementation, we are using camelcase keys. For this, if we
 * start converting the all keys on the fly on client side then it slows down the whole application.
 * So we are creating the final json files on application compile/build time only.
 *
 * @author Amitesh Kumar
 * @module DataJsonOptimizer
 *
 */

const _    = require('lodash');
const glob = require('glob');
const path = require('path');
const fs   = require('fs');

/**
 * Sort the all file paths as per the deep nesting
 * @param {Array.<string>} files List of file paths
 *
 * @return {Array.<string>} Sorted list of file paths
 *
 * @example ['a/b/c', 'a/b', 'a/b/c/d'] => ['a/b', 'a/b/c', 'a/b/c/d']
 */
function sortFiles(files) {
  let sorted = _.sortBy(files, (o) => {
      return (o.match(/\//g) || []).length;
  });
  return sorted;
}

/**
 * Method to merge all data.json files and create the final game data json file
 * @param appPath
 *
 * Steps:
 * - Get all data.json files
 * - Sort all files as per the deep nesting
 * - Merge the properties in way that child values should not change
 * - Convert all hyphenated keys to camelcase
 * - Create/write game-data.json and game-data-in-camel-case.json file
 */
function createFinalDataJsonFiles(appPath) {
  console.log("[Start] Creating game data json files");
  console.time("game data json");
  try {
    let gameData, gameDataInCamelCase;
    let dataFiles = glob.sync(path.join(appPath, "components/**/data.json"));

    let files = sortFiles(dataFiles);

    _.forEach(files, (file) => {
      gameData = _.merge({}, gameData, require(file));
    });

    gameDataInCamelCase = formatKeyAsCamelCase(_.cloneDeep(gameData));

    writeFile(path.join(appPath, 'data', 'game-data.json'),
      JSON.stringify(gameData, null, '\t'));
    writeFile(path.join(appPath, 'data', 'game-data-in-camel-case.json'),
      JSON.stringify(gameDataInCamelCase, null, '\t'));
  } catch (e) {
    console.error(e);
  }

  console.log("[End] Created game data json files");
  console.timeEnd("game data json");
}

/**
 * Write the content to the given file path
 * @param outputFile
 * @param content
 */
function writeFile(outputFile, content) {
  fs.writeFile(path.resolve(outputFile), content, 'utf8');
}

/**
 * Set key to only hyphenated key and value. But it will be a problem
 * with array type and retrieval of values through chaining
 *
 * @param  {[type]} collection [description]
 * @return {[type]}            [description]
 */
function formatKeyAsCamelCase(collection) {
  return _.each(collection, (o, key) => {
      var ccKey = _.isNumber(key) ? key : _.camelCase(key || '');
    let oldValue = collection[ccKey];

    if (_.isObject(o)) {
      let formattedValue = formatKeyAsCamelCase(o);
      delete collection[key];
      collection[ccKey] = oldValue ? formatKeyAsCamelCase(oldValue) : formattedValue;
    } else {
      delete collection[key];
      collection[ccKey] = oldValue ? oldValue : o;
    }
  });
}

/**
 * A module to optimize the data.json files
 */
export default class DataJsonOptimizer {
  /**
   * Create new instance of DataJsonOptimizer
   * @param options
   * @constructor
   */
  constructor(options = {}) {
  }

  /**
   * Register the plugin with webpack event hooks
   * @param compiler
   */
  apply(compiler) {
    /**
     * On compile event of webpack build process,
     * Convert the data.json files to final file.
     */
    compiler.plugin('compile', (params) => {
      let appPath = compiler.context;
      createFinalDataJsonFiles(appPath);
    });
  }
}
