/* ---- Router ---- */
var yaml    = require('js-yaml');
var fs      = require('fs');
var md      = require('markdown').markdown;
var log     = require('./log.js');

var routers = [
  'index',
  'news',
  'business',
  'honor',
  'fleet',
    'ship',
  'about',
];

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function merge(obj1, obj2){
  for(var key in obj2)
    obj1[key] = obj2[key];
  return obj1;
}

function formatDate(date) {
  var month = ['January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return month[date.getUTCMonth()] + ' '
               + date.getUTCDate() + ', '
               + date.getUTCFullYear();
}

function readYAML(yamlfile) {
  try {
    return yaml.safeLoad(fs.readFileSync('contents/' + yamlfile + '.yml', 'utf8'));
  } catch (e) {
    log.warn('yaml: ' + yamlfile + ' was not found');
    return {};
  }
}

function router(req, res) {
  var r = req.params.router;
  if(contains(routers, r)) {
    var params = merge(readYAML('common'), readYAML(r));
    params = merge(params, {urlParams: req.query});
    res.render(r, params);
  } else {
    res.sendStatus(404);
  }
}

exports.DoBoom = function(app) {
  app.get( '/' , function(req, res) {
    req.params.router = 'index';
    router(req, res);
  });
  app.get( '/:router' , router);
};
