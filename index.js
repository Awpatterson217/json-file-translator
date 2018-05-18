const fs    = require('fs');
const chalk = require('chalk');
const path  = require('path');

const config = require('./config/translate.config');

module.exports = function({ engine = config.engine, key = config.key }) {
  const translatorFactory = require('./lib/translator.factory')(engine, key);

  return function({ input, directory, language, ignore }) {
    const fileName = language + '.json';

    let output = directory
      ? path.join(directory, fileName)
      : `${process.cwd()}${path.sep}${fileName}`;

      if (!path.isAbsolute(output))
        output = path.join(process.cwd(), output);

    const translateFunction = translatorFactory(language);
    const translateObject   = require('./lib/translate-object.factory')(translateFunction);

    const readStream  = fs.createReadStream(input);
    const writeStream = fs.createWriteStream(output)

    readStream.on('readable', () => {
      const data = readStream.read();

      // If data = null, readStream is finished
      // and about to emit 'end'.
      if (data) {
        log(chalk`{green Reading from {green.bold ${input}}...}`);
        log(chalk`{green Translating into {green.bold ${language}}...}`);

        translateObject(JSON.parse(data))
          .then(translatedData => {
            writeStream.write(JSON.stringify(translatedData, null, 2));
          })
          .catch(error => {
            log(chalk.red(error));
          })
          .then(() => {
            log();
            log();
            log(chalk`{green Translation finished for language code {green.bold ${language}}}`);
            log();
            log(chalk`{green Read from file: {green.bold ${input}}}`);
            log(chalk`{green Wrote to file: {green.bold ${output}}}`);
            log();
          });
      }
    });
  }
}
