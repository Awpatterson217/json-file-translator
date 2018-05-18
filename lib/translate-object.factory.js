const chalk = require('chalk');

const {
  isString,
  isObject,
  isArray,
  log
} = require('../lib/methods');

module.exports = function(translateFunction) {
  return async function translateObject(obj) {
    const returnObj = {};
  
    for(let i in obj){
      if (isObject(obj[i])){
        returnObj[i] = await translateObject(JSON.parse(JSON.stringify(obj[i])));
      }
  
      if (isString(obj[i])){
        let translatedStr;
  
        try {
          translatedStr = await translateFunction(obj[i]);
        } catch(e) {
          throw new Error('Could not translate', e);
        }
  
        log(chalk`{yellow.bold > } {gray ${obj[i]}} {yellow.bold : } {yellow ${translatedStr}}`);
  
        returnObj[i] = translatedStr;
      }
  
      // Should never happen
      if (isArray(obj[i]))
        log('isArray')
    }
  
    return returnObj;
  }
}
