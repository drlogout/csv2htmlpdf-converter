/*
  Converts CSV -> HTML table and responds HTML to the client
 */

var transform = require('stream-transform');
var fs = require("fs");
var csv = require("csv-streamify");
var Handlebars = require('handlebars');
var es = require("event-stream");
var mmm = require('mmmagic');
var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE | mmm.MAGIC_MIME_ENCODING);
var getLineNumber = require('../lib/getLineNumber');
var conf = require('../lib/conf');

module.exports = function (req, res) {

  magic.detectFile(conf.filePath, function (err, mime) {
    if (err) throw err;

    if (mime !== 'text/plain; charset=utf-8') {

      res.status(400).send({error: 'wrong file type: ' + mime});

    } else {

      var table = fs.readFileSync(conf.baseDir + '/templates/tableHTML.hbs', 'utf8');
      var tmpl = Handlebars.compile(table);

      getLineNumber(conf.filePath, function (lastLine) {

        var count = 0;
        var previousfirstCol;
        var tableBeginIsSet = false;

        var transformer = transform(function (data) {

          // skip first row if it contains 'headerCell1' || 'headerCell2' || 'headerCell3'
          if (count === 0) {
            var firstRowString = data.reduce(function (prev, cur) {
              return prev + cur;
            }).toLowerCase();

            if (firstRowString.indexOf('headerCell1') > 0 || firstRowString.indexOf('headerCell2') > 0 || firstRowString.indexOf('headerCell3') > 0) {
              count++;
              return null;
            }
          }

          if (!tableBeginIsSet) {
            tableBeginIsSet = true;
            data.tableBegin = true;
          } else if (count === lastLine - 1) {
            data.tableEnd = true;
          }
          count++;

          // leave firstColumn blank if same as before

          if (previousfirstCol !== data[0] + data[3]) {
            previousfirstCol = data[0] + data[3];
          } else {
            data.className = ' hide-name'
          }
          return data;

        });

        transformer.on('error', function (err) {
          this.end();
          res.status(500).send({error: 'conversion error'});
        });

        // Read File
        var stream = fs.createReadStream(conf.filePath);
        // Parse CSV as Object
        stream
          .pipe(csv({objectMode: true, columns: false}))
          .pipe(transformer)
          // create HTML with handlebars
          .pipe(es.mapSync(tmpl))
          .pipe(res);

        stream.on('error', function (err) {
          res.status(500).send({error: 'conversion error'});
        });

        stream.on('end', function () {
          require('../lib/cleanUploads')();
        })
      });

    }
  });

};