const http = require('http');
const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const serve = require('express-static');

const port = process.env.PORT || 1337;

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
app.get('/editProfile', editUser) 
app.get('/profile', profile)
app.get('/schedule', scheduleBobaRun)
app.get('/scheduleAdded', scheduleAdded)
app.get('/about', about)
app.get('*', notFound)

app.listen(port, () => {console.log("server is running ...")});


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
    u["plans"] = [];
    u["potential_matches"] = [];
    u["requested_matches"] = [];
    u["confirmed_matches"] = [];

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
    // username = req.query.username;
    // if (!doesUserExist(username)) {
    //     router.get('/login')
    //     console.log("user " + username + " does not exist - cannot login")
    // }
    res.render("header", {partial: "partials/login"})
}

function profile(req, res) {
    var username = req.query.username;
    getBaes(username);
    if (!doesUserExist(username)) {
        router.get('/login')
        console.log("user " + username + " does not exist - cannot login")
    } else {
        var u = getUserObject(username);
        console.log("stores: " + JSON.stringify(u.fav));
        res.render("header", {partial: "partials/profile", uname: username, name: u.name, city: u.city, state: u.state, 
        stores: u.fav, potential_matches: u.potential_matches, requested_matches: u.requested_matches, confirmed_matches: u.confirmed_matches})
    }
}

function scheduleBobaRun(req, res) {
    var username = req.query.username;
    var u = getUserObject(username);
    res.render("header", {partial: "partials/schedule", uname: username})
}

function scheduleAdded(req, res) {
    var username = req.query.username;
    getBaes(username);
    var u = getUserObject(username);
    console.log('addschedule to ' + username);
    if (!u.hasOwnProperty('plans')) {
        u.plans = [];
        u.plans.push(formatTime(req.query.earliestTime));
        u.plans.push(formatTime(req.query.latestTime));
    } else {
        u.plans[0] = formatTime(req.query.earliestTime);
        u.plans[1] = formatTime(req.query.latestTime);
    }
    updateJson();
    res.render("header", {partial: "partials/profile", uname: username, name: u.name, city: u.city, state: u.state, 
                            stores: u.fav, potential_matches: u.potential_matches, requested_matches: u.requested_matches, confirmed_matches: u.confirmed_matches})
}

function editUser(req, res) {
    var username = req.query.username;
    getBaes(username);
    var requested
    if (typeof(req.query.requested) === 'string') {
        requested = [req.query.requested];
    }
    else { 
        requested = req.query.requested;
    }
    var u = getUserObject(username);
    for (var u2 in requested) {
        console.log("u2: " + u2);
        users[u.state][u.city][requested[u2]]["requested_matches"].push(username);
    }
    console.log(requested);
    res.render("header", {partial: "partials/profile", uname: username, name: u.name, city: u.city, state: u.state, 
                            stores: u.fav, potential_matches: u.potential_matches, requested_matches: u.requested_matches, confirmed_matches: u.confirmed_matches})
    updateJson();
}

function notFound(req, res) {
    res.send("error 404");
}

function about(req, res) {
    res.render("header", {partial: "partials/about"});
}
// HELPER FUNCTIONS
function formatTime(timeString) {
    return parseInt(timeString.substring(0,2) + timeString.substring(3,5));
}

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

function getBaes(username){
    // var users
    // var u = getUserObject(username);
    // if (u.plans.length < 2) {
    //     return;
    // }
    // for (var person in users[u.state]["Los Angeles"]) {
    //   console.log(person)
    //     if (users[u.state][u.city][person]["plans"].length == 2) {
    //         var a = u.plans[0], b = u.plans[1], c = users[u.state][u.city][person]["plans"][0], d = users[u.state][u.city][person]["plans"][1];
    //         if (!(c>b || d < a)) {
    //           users[u.state][u.city][username]["potential_matches"].push(person);
    //           break;
    //         }
    //     }
    // }
    // console.log(users[u.state][u.city][username]["potential_matches"])

    var u = getUserObject(username);
    var pm = []
    for (var u2 in users[u.state][u.city]) {
        if (u2 != username) {
            pm.push(u2);
        }
    }
    console.log(pm);
    users[u.state][u.city][username]["potential_matches"] = pm;
    updateJson();
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
                return users[state][city][username];
            }
        }
    }
    return null;
}

// assumes a & b are allready 
function aRequestsb(usera, userb){
    userb[requested_matches]+= "usera";
}

function bClicksOna(userb, usera){
    usera[confirmed_matches]+= "userb";
    userb[confirmed_matches]+= "usera";
}
