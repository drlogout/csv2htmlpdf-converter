var fs = require('fs');
var conf = require('./conf');

module.exports = function () {

  fs.readdirSync(conf.baseDir + '/uploads').forEach(function (file) {
    fs.unlinkSync(conf.baseDir + '/uploads/' + file);
  });

};