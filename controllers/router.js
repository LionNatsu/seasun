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
  for(var key in obj2) {
    if(obj1[key] !== undefined && typeof obj1[key] == 'object') {
      obj1[key] = merge(obj1[key], obj2[key]);
    } else {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

function formatDate(date) {
  var month = ['January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return month[date.getUTCMonth()] + ' '
               + date.getUTCDate() + ', '
               + date.getUTCFullYear();
}

function readYAML(yamlfile, dir) {
  dir = dir ? dir + '/' : '' ;
  try {
    return yaml.safeLoad(fs.readFileSync('contents/' + dir + yamlfile + '.yml', 'utf8'));
  } catch (e) {
    log.warn('yaml: ' + dir + yamlfile + ' was not found');
    return {};
  }
}

exports.DoBoom = function(express, app) {
  var router = express.Router();

  router.get( '/' , function(req, res, next) {req.m_router = 'index'; next();});
  router.get( '/:router' , function(req, res, next) {req.m_router = req.params.router; next();});
  router.get( '*' , function (req, res) {
    var r = req.m_router;
    if(contains(routers, r)) {
      var params;
      params = merge(readYAML('common'), readYAML('common', req.lang));
      params = merge(params, readYAML(r, req.lang));
      params = merge(params, {urlParams: req.query, domain: req.headers.host, lang: req.lang});
      res.render(r, params);
    } else {
      res.sendStatus(404);
    }
  });

  app.use( '/set-lang' , function(req, res, next) {
    var languages = readYAML('common').languages;
    if(req.query.lang == undefined) {
      res.redirect('/' + languages[0].code + '/');
      return;
    }
    for (var i = 0; i < languages.length; i++) {
      if(languages[i].code == req.query.lang) {
        req.lang = req.query.lang;
        res.cookie('lang', req.lang);
        res.redirect('/' + languages[i].code + '/');
        return;
      }
    }
    res.redirect('/' + languages[0].code + '/');
  });

  app.get( '/' , function(req, res) {
    var l = readYAML('common').languages[0].code;
    if(req.cookies.lang) l = req.cookies.lang;
    res.redirect('/' + l + '/');
  });

  app.use( '/:lang/' , function(req, res, next) {
    var languages = readYAML('common').languages;
    for (var i = 0; i < languages.length; i++) {
      if(languages[i].code == req.params.lang) {
        req.lang = req.params.lang;
        next();
        return;
      }
    }
    res.sendStatus(404);
  });
  app.use( '/:lang/' , router);
};
