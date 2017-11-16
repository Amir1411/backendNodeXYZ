var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var multer = require('multer');

var configPath = path.join(__dirname, 'config');
var config = require('config');

var connection_sql = require('./routes/connection');
var commonFunc = require('./routes/commonfunction');
constants = require('./routes/constants');
var userlogin = require('./routes/user_panel');
var postPanel = require('./routes/post_panel');
var md5 = require('MD5');

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'view')));
app.use(express.static(path.join(__dirname, 'uploads')));

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        // console.log(file);
        callback(null, './uploads/post');
    },
    filename: function(req, file, callback) {
        // console.log(file);
        var fileUniqueName = md5(Date.now());
        callback(null,  fileUniqueName + path.extname(file.originalname));
    }
});

var user_storage = multer.diskStorage({
    destination: function(req, file, callback) {
        // console.log(file);
        callback(null, './uploads/user');
    },
    filename: function(req, file, callback) {
        // console.log(file);
        var fileUniqueName = md5(Date.now());
        callback(null,  fileUniqueName + path.extname(file.originalname));
    }
});
var upload = multer({ storage: storage });
var uploadUserThumbnail = multer({ storage: user_storage})
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, authorization");
    next();
});

app.post('/userCreate', userlogin.create_account);
app.post('/login', userlogin.login);
app.post('/get_user_details', userlogin.get_user_details);
app.post('/send_friend_request', userlogin.send_friend_request);
app.post('/get_friend_list', userlogin.get_friend_list);
app.post('/upload_user_thumbnail', uploadUserThumbnail.single('user_thumbnail'), userlogin.upload_user_thumbnail);
app.post('/update_profile', userlogin.update_profile);
app.post('/search_user', userlogin.search_user);

// For Post
app.post('/create_post', upload.single('post_image'), postPanel.create_post);
app.post('/get_post', postPanel.get_post);
app.post('/post_like', postPanel.post_like);
app.post('/post_comment', postPanel.post_comment);

// console.log(io.on);
io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3001, function(){
  console.log('listening on *:3001');
});
