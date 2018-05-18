#! /usr/bin/env node

const program = require('commander');
const co      = require('co');
const prompt  = require('co-prompt');
const chalk   = require('chalk');
const fs      = require('fs');
const path    = require('path');

const log = console.log;

const config = path.resolve(
  path.dirname(__filename),
  '../config/translate.config.json'
);

program
  .version('1.0.0', '-v, --version')

program
  .command('configure')
  .alias('config')
  .description('Configure translation engine')
  .action(function() {
    const writeStream = fs.createWriteStream(config);

    log(chalk.green.bold('json-file-translator'));
    log();

    co(function* () {
      const engine = yield prompt('Engine (google or yandex): ');

      if (engine.toLowerCase() !== 'yandex' && engine.toLowerCase() !== 'google') {
        process.stdin.pause();
        throw new Error('Engine does not exist!');
      }

      const key = yield prompt('API Key: ');

      process.stdin.pause();

      return ({
        engine,
        key
      });
    })
    .then(configObj => {
      if(configObj) {
        writeStream.write(JSON.stringify(configObj, null, 2));
      }
    })
    .catch(error => {
      throw new Error(error);
    })
    .then(() => {
      log();
      log(chalk`{green Translation engine instantiated! }`);
      log();
    });
  });

program
  .command('translate')
  .alias('t')
  .description('Translate')
  .option("-i, --input <file-path>", "JSON file to translate")
  .option("-d, --directory <directory-path>", "Directory to place generated JSON file")
  .option("-l, --language <ISO-639>", "ISO 639 (1 or 2)")
  .option("-i, --ignore <file-path>", "A JSON file containing words that should not be translated")
  .action(function({ input, directory, language, ignore }){

    const data = fs.readFileSync('../config/translate.config.json', 'utf8');

    const { engine, key } = JSON.parse(data);

    if (directory) {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory)
      }
    }

    if (!input) {
      throw new Error('No Input File Specified!');
    }

    if (!language) {
      throw new Error('No Language Specified!');
    }

    const fileName = language + '.json';
    let output     = directory
      ? path.join(directory, fileName)
      : `${process.cwd()}${path.sep}${fileName}`;

    if (!path.isAbsolute(output))
      output = path.join(process.cwd(), output);

    if (!path.isAbsolute(input))
      input = path.join(process.cwd(), input);

    const translatorFactory = require('../lib/translator.factory')(engine, key);
    const translateFunction = translatorFactory(language);
    const translateObject   = require('../lib/translate-object.factory')(translateFunction);
    const readStream        = fs.createReadStream(input);
    const writeStream       = fs.createWriteStream(output)

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
  });

program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv);
