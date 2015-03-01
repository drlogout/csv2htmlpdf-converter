var transform = require('stream-transform');
var fs = require("fs");
var csv = require("csv-streamify");

module.exports = function (path, callback) {

  var lineNumber = 0;
  var transformer = transform(function (data) {
    lineNumber++;
    return null;
  });

  var stream = fs.createReadStream(path);
  stream
    .pipe(csv({objectMode: true, columns: false}))
    .pipe(transformer);

  stream.on('end', function () {
    callback(lineNumber);
  });

  stream.on('error', function () {
    callback();
  });

};