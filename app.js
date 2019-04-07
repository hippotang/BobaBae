var http = require('http');
var express = require('express');
var ejs = require("ejs");
var app = express();

app.set('view engine', 'ejs');

// routes
app.get('/', home);
function home(req, res) {
   res.render("header", {partial: "partials/home"});
}

app.get('/createUser', createUser);
function createUser(req, res) {
   res.render("header", {partial: "partials/createUser"});
}

app.get('*', notFound)
function notFound(res, res) {
    res.send("error 404");
}
app.listen(3000, () => {console.log("server is running ...")});




