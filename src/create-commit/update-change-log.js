// Node modules
const path = require('path');

// 3rd party modules
const changelog = require('generate-changelog');
const when = require('when');

// Modules
const fs = require('../lib/fs');

// Public
module.exports = updateChangeLog;

// Implementation
function updateChangeLog(options) {
  return when.promise((resolve, reject) => {
    const config = {
      exclude: ['chore', 'style']
    };
    const readFile = path.join(options.directory, 'CHANGELOG.md');
    const writeFile = path.join(options.directory, '.CHANGELOG.md');
    const writeStream = fs.createWriteStream(writeFile);

    writeStream.on('finish', onWriteEnd);

    config[options.type || 'patch'] = true;

    changelog
      .generate(config)
      .then(writeChanges)
      .then(readRest);

    function writeChanges(chunk) {
      writeStream.write(chunk);
    }

    function readRest() {
      fs.createReadStream(readFile).pipe(writeStream);
    }

    function onWriteEnd(err) {
      if (err) {
        reject(err);
      } else {
        fs.unlink(readFile, onUnlink);
      }
    }

    function onUnlink(err) {
      if (err) {
        reject(err);
      } else {
        fs.rename(writeFile, readFile, finish);
      }
    }

    function finish(err) {
      if (err) {
        reject(err);
      } else {
        resolve(options);
      }
    }
  });
}
