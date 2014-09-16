// local includes
var database = require('../models/dbcontroller.js')
var parser = require('../controller/parser.js')

// response_style
function json_reply(res) {
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8'});
}    


// views

// echo
var respond = function (req, res, next) {
      res.send('hello ' + req.params.name);
      return next();
}

// list testdb
var names = function (req, res, next) {
    database.NamesModel.findAll( function(err, names) {
        if (err) {
            return console.error(err)
        }

        console.log(">>> " + names)
        json_reply(res)
        res.write(JSON.stringify(names))
        res.end()
    });
    return next();
}

var sites = function (req, res, next) {
    console.log(req.params);
    console.log(Object.keys(req.params))
    
    // parse query
    query = parser.parseParams(req.params, database.SiteModel)


    //TODO: remove this and stick in parser 
    var site = {};
    site.limit = req.params.limit; // int default 25 (can also be string off) 
    if (site.limit == null) {
        site.limit = 5; // should be 25
    } else if (site.limit == "off") {
        site.limit = 0;
    } 

    site.offset = req.params.offset; // int default 0
    if (site.offset == null) {
        site.offset = 0;
    } 

    //console.log(site)

    query.skip(site.offset).limit(site.limit).exec(
        function(err, sites) {
            if (err) {
                return console.error(err)
            }
            json_reply(res)
            res.write(JSON.stringify(sites))
            res.end()
    });

    return next();
}

// exports
exports.respond = respond
exports.names = names
exports.sites = sites
