const translate = require('translate');

module.exports = function(engine, key) {
  translate.engine = engine;
  translate.key = key;

  return (function(translate) {
    return function translatorFactory(languageCode) {
      return async function(str) {
        let translation;
      
        try {
          translation = await translate(str, languageCode);
        } catch (e) {
          throw e;
        }
      
        return translation;
      }
    }
  })(translate);
}
