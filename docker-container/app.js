var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs');
var routes = require('./routes');
var conf = require('./lib/conf');
var urlify = require('urlify').create({
  addEToUmlauts: true
});

var auth = function auth (key, fn) {
  if ('DBdfGbUW8EEFbERdEG3iEJsYk24ZjccPx4aC8' === key) {
    fn(null, true);
  }
  else {
    fn(null, null);
  }
};


conf.baseDir = __dirname;

if (!fs.existsSync(__dirname + '/uploads')) {
 fs.mkdirSync(__dirname + '/uploads');
}


// middleware

// basic auth
//app.use(require('apikey')(auth, 'private realm'));

app.use(function(req, res, next){

  var form = new formidable.IncomingForm();

  form
    .on('field', function(field, value) {
      if (field === 'title') {
        conf.urlTitle = urlify(value);
        conf.title = urlify(value, {spaces: ' '});
      }
      if (field === 'year') {
        conf.year = value;
      }
    })
    .on('fileBegin', function(name, file){
      file.path = conf.baseDir + '/uploads/' + file.name;

    })
    .on('file', function(field, file) {
      conf.filePath = file.path;
    })
    .on('end', function() {
      next();
    })
    .on('error', function(err){
      res.status(500);
    });
  form.parse(req);

});


// routes

app.post('/api/csv2html', routes.csv2html);
app.post('/api/csv2pdf', routes.csv2pdf);



app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server listening at http://%s:%s', host, port);

});
