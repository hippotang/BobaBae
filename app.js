const http = require('http');
const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const serve = require('express-static');

var router = express.Router()
var app = express();

app.use( express.static( "." ) );

// read json data
var dataPath = 'data/users.json'
var data = fs.readFileSync(dataPath);
var users = JSON.parse(data)

app.set('view engine', 'ejs');

// routes
app.get('/', home);
app.get('/createUser', createUser);
app.get('/userCreated', userCreated);
app.get('/login', login)
app.get('/profile', profile)
app.get('/schedule', scheduleBobaRun)
app.get('/scheduleAdded', scheduleAdded)
app.get('*', notFound)

app.listen(3000, () => {console.log("server is running ...")});


function home(req, res) {
    res.render("header", {partial: "partials/home"});
}

function createUser(req, res) {
    res.render("header", {partial: "partials/createUser"});
    //, error: ""
}

function userCreated(req, res) {
    console.log("usercreated function called")
    if (doesUserExist(req.query.username)) {
        router.get("/createUser");
        console.log("error: " + req.query.username + " already created");
        return;
    }
    console.log(req.query.username + " created");

    var state = req.query.state;
    var city = req.query.city;
    var username = req.query.username;
    var name = req.query.name
    var stores = req.query.stores;

    u = {};
    u["state"] = state;
    u["city"] = city;
    u["name"] = name;
    u["fav"] = stores;

    if (users[state] == undefined) {
        users[state] = {};
    }
    if (users[state][city] == undefined) {
        users[state][city] = {};
    }
    users[state][city][username] = u;
    updateJson();
    res.render("header", {partial: "partials/userCreated"});
}

function login(req, res) {
    username = req.query.username;
    if (!doesUserExist(username)) {
        router.get('/login')
        console.log("user " + username + " does not exist - cannot login")
    }
    res.render("header", {partial: "partials/login"})
}

function profile(req, res) {
    var username = req.query.username;
    var u = getUserObject(username);
    console.log("stores: " + JSON.stringify(u.fav));
    res.render("header", {partial: "partials/profile", uname: username, name: u.name, city: u.city, state: u.state, stores: u.fav})
}


function scheduleBobaRun(req, res) {
    var username = req.query.username;
    var u = getUserObject(username);
    res.render("header", {partial: "partials/schedule", uname: username})
}

function scheduleAdded(req, res) {
    var username = req.query.username;
    var u = getUserObject(username);
    console.log('addschedule to ' + username);
    if (!u.hasOwnProperty('plans')) {
        u.plans = []
    }
    u['plans'].push([req.earliestTime, req.latestTime]);
    res.render("header", {partial: "partials/scheduleAdded", uname: username, earliestTime: req.query.earliestTime, latestTime: req.query.latestTime});
}

function notFound(req, res) {
    res.send("error 404");
}


// HELPER FUNCTIONS
function doesUserExist(username) {
    var state;
    var city;

    for(state in users){
        for(city in users[state]){
            if (users[state][city].hasOwnProperty(username)) {
                return true;
            }
        }
    }
    return false;
}

function addUser(state, city, username, name, fav, needsRide){
    if (doesUserExist(username)) {
        return false;
    }
    data[state][city][username] = {
        "name": name,
        "fav": fav,
        "needsRide": needsRide,
        "city": city,
        "state": state
    }
    return true;
}

function getBaes(user){
    var matches = [];
    var nMatches = 0;
    var potMatch;
    for (potMatch in data[user["state"]][user["city"]])
    {
        if(user["fav"] == potMatch["fav"])
        {
            matches[nMatches] = potMatch;
            numOfMatches++;
        }
    }
    return matches;
}

function updateJson() {
    fs.writeFileSync(dataPath,JSON.stringify(users));
}

// returns null if user is not found
function getUserObject(username) {
    var state;
    var city;

    for(state in users){
        for(city in users[state]){
            if (users[state][city].hasOwnProperty(username)) {
                console.log(users[state][city])
                return users[state][city][username];
            }
        }
    }
    return null;
}

