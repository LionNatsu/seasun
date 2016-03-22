var express = require('express');
var app = express();
var log = require('./controllers/log.js');
var routes = require('./controllers/router.js');
var jade = require('jade');
app.engine('jade', function(path, options, fn) {
    if(options.compileDebug == undefined && process.env.NODE_ENV === 'production') {
      options.compileDebug = false;
    }
    options.pretty = true;
    jade.renderFile(path, options, fn);
  });
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static('static'));
routes.DoBoom(app);
var child_process = require('child_process');
child_process.fork('./controllers/watcher.js');
log.debug('server: Fork watcher');
var server = app.listen(3000, function () {
  log.debug('server: Listening at port ' + server.address().port);
});
