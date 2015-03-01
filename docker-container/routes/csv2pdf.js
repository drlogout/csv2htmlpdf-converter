/*
  Converts CSV -> HTML table -> PDF and uploads the file to a ftp server
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
var wkhtmltopdf = require('wkhtmltopdf');
var ftpClient = require('ftp');

module.exports = function (req, res) {

  magic.detectFile(conf.filePath, function (err, mime) {
    if (err) {
      throw err;
    }

    if (mime !== 'text/plain; charset=utf-8') {
      res.status(400).send({error: 'wrong file type: ' + mime});
    } else {

      var table = fs.readFileSync(conf.baseDir + '/templates/tablePdf.hbs', 'utf8');
      var tmpl = Handlebars.compile(table);

      getLineNumber(conf.filePath, function (lastLine) {

        var count = 0;
        var previousfirstCol;
        var tableBeginIsSet = false;

        var transformer = transform(function (data) {

          // skip first row if it contains 'headerCell1' || ' headerCell2' || 'headerCell3'
          if (count === 0) {
            var firtsRowString = data.reduce(function (prev, cur) {
              return prev + cur;
            }).toLowerCase();

            if (firtsRowString.indexOf('headerCell1') > 0 || firtsRowString.indexOf('headerCell2') > 0 || firtsRowString.indexOf('headerCell3') > 0) {
              count++;
              return null;
            }
          }

          if (!tableBeginIsSet) {
            data.tableBegin = true;
            tableBeginIsSet = true;
          } else if (count === lastLine - 1) {
            data.tableEnd = true;
          }
          count++;

          // leave firstColumn blank if same as before

          if (previousfirstCol !== data[0] + data[3]) {
            previousfirstCol = data[0] + data[3];
          } else {
            data[0] = data[3] = '';
            data.className = ' hide-name';
          }
          return data;

        });


        transformer.on('error', function (err) {
          this.end();
          res.status(500).send({error: 'conversion error'});
        });

        // Read File
        var stream = fs.createReadStream(conf.filePath);
        var htmlFile = fs.createWriteStream(conf.filePath + '.html');

        // Parse CSV as Object
        stream
          .pipe(csv({objectMode: true, columns: false}))
          .pipe(transformer)
          // create HTML with handlebars
          .pipe(es.mapSync(tmpl))
          .pipe(htmlFile);


        htmlFile.on('close', function () {

          var html = fs.readFileSync(conf.filePath + '.html', 'utf8');
          conf.pdfName = 'Catalog' + conf.year + '_' + conf.urlTitle + '.pdf';

          wkhtmltopdf(html, {
            encoding: 'utf8',
            output: conf.baseDir + '/uploads/' + conf.pdfName,
            pageSize: 'A4',
            footerCenter: '[page]/[topage]',
            marginTop: '20mm',
            marginBottom: '15mm',
            headerSpacing: 10,
            headerLeft: 'Catalog ' + conf.year,
            headerCenter: conf.title,
            headerRight: ''
          }, function (err) {
            if (err) {
              res.status(500).json({Error: err.message});
            } else {

              var client = new ftpClient();
              client.connect({
                host: 'ftp-host',
                user: 'ftp-user',
                password: 'ftp-password'
              });

              client.on('ready', function () {
                client.put(conf.baseDir + '/uploads/' + conf.pdfName, conf.pdfName, function (err) {

                  if (err) {
                    res.status(500).send({error: 'connection error'});
                  }
                  client.end();
                  require(conf.baseDir + '/lib/cleanUploads')();
                  res.json({pdfName: conf.pdfName});

                });
              });

              client.on('error', function (err) {
                res.status(500).send({error: 'connection error'});
              });

            }
          });

        });

      });

    }
  });

};