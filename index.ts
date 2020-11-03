import express from 'express';
import serveIndex from 'serve-index';
import path from 'path';
import cors from 'cors';
import { createServer } from 'http';
import { Server, RelayRoom } from 'colyseus';
import { monitor } from '@colyseus/monitor';

// Import demo room handlers
import { ChatRoom } from "./rooms/01-chat-room";
import { StateHandlerRoom } from "./rooms/02-state-handler";
import { AuthRoom } from "./rooms/03-auth";
import { ReconnectionRoom } from './rooms/04-reconnection';
import { LoggerheadsRoom } from "./rooms/07-loggerheads";
import { ReactionGameRoom } from "./rooms/reactiongame";
import { PPathsRoom } from "./rooms/ppaths";
import { LobbyRoom } from "./rooms/lobbyroom";
import { ChromashiftRoom } from "./rooms/chromashift";

// Custom Javascript Modules
import { get_name } from './name_mng/name_mng';

// const name_files = get_name_files;
// console.log(typeof())

const port = Number(process.env.PORT || 3553) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

app.use(cors());
app.use(express.json());

var cookieparser = require('cookie-parser');
app.use(cookieparser());
// const name_mng = require("./name_mng/name_mng");
// app.locals.name_mng_get_set = name_mng.get_set_name

var mysql = require('mysql');

// Attach WebSocket Server on HTTP Server.
const gameServer = new Server({
  server: createServer(app),
  express: app,
  pingInterval: 0,
});

// Define "lobby" room
gameServer.define("lobby", LobbyRoom)
    .enableRealtimeListing();

// Define "relay" room
gameServer.define("relay", RelayRoom, { maxClients: 4 })
    .enableRealtimeListing();

// Define "chat" room
gameServer.define("chat", ChatRoom)
    .enableRealtimeListing();

// Register ChatRoom with initial options, as "chat_with_options"
// onInit(options) will receive client join options + options registered here.
gameServer.define("chat_with_options", ChatRoom, {
    custom_options: "you can use me on Room#onCreate"
});

// Define "state_handler" room
gameServer.define("state_handler", StateHandlerRoom)
    .enableRealtimeListing();

// Define "loggerheads" room
gameServer.define("loggerheads", LoggerheadsRoom)
    .enableRealtimeListing();

// Define "auth" room
gameServer.define("auth", AuthRoom)
    .enableRealtimeListing();

// Define "reconnection" room
gameServer.define("reconnection", ReconnectionRoom)
    .enableRealtimeListing();

// Define "reactiongame" room
gameServer.define("reactiongame", ReactionGameRoom)
    .enableRealtimeListing();

// Define "chromashift" room
gameServer.define("chromashift", ChromashiftRoom)
    .enableRealtimeListing();

gameServer.define("ppathsroom", PPathsRoom)
    .enableRealtimeListing();

// app.use('/', serveIndex(path.join(__dirname, "static"), {'icons': true}))

// app.use('/', serveIndex(path.join(__dirname, "static"), {'icons': true}))
app.use(express.static(path.join(__dirname, "static")));
// app.use('/static', express.static('static'))
// app.use(express.views(path.join))

app.use((req, res, next) => {
	console.log(`URL: ${req.url}`);
	next();
});

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    var details = {
        location: process.env.LOCATION ,
        city: process.env.CITY ,
        winning_city: process.env.WINNING_CITY ,
        winning_location: process.env.WINNING_LOCATION ,
        lobby_delay_mins: process.env.LOBBY_DELAY_MINS ,
        score_attack: process.env.SCORE_ATTACK ,
        one_shot: process.env.ONE_SHOT ,
        meta_name: process.env.META_NAME ,
    };

    var ip = req.ip;
    var name = req.cookies.name;

    name = get_name(name, ip);
    res.cookie('name', name, {expire : Date.now()+36000})
    res.render('home', details);
});

app.get('/lobby', (req, res) => {
    var ip = req.ip; //Need to move this into it's own function, which is called by each page
    var name = req.cookie.name;

    var details = {
        name: name ,
    }
    res.render('lobby', details);
});

app.get('/'+process.env.ONE_SHOT, (req, res) => {
    //Called by One Shot button on home page
    const details = {
        name: req.cookies.name,
        location: process.env.LOCATION,
    }
    res.render(process.env.ONE_SHOT+"/index", details);
});

app.get('/'+process.env.SCORE_ATTACK, (req, res) => {
    const details = {
        name: req.cookies.name,
    }
    res.render(process.env.SCORE_ATTACK+"/index", details);
});

app.get('/airheads', (req,res) => {
    res.render('airheads/index');
});

app.get('/showcookie', (req, res) => {
    res.send(req.cookies);
});

app.get("/clear", function(req, res){
    res.clearCookie('name').send('cookie has been deleted');
});

//Only include the below paths if the device is in a development environment
if(process.env.NODE_ENV=='development'){
    //These are a collection of the games created, but not currently in circuit, for development reasons only
    app.get('/maze', (req,res) => {
        res.render('maze/index');
    });

    app.get('/9squares', (req,res) => {
        res.render('9squares/index');
    });

    app.get('/enginebay', (req,res) => {
        res.render('enginebay/index');
    });

    //Access to the Static directory for development reasons only
    app.use('/static', serveIndex(path.join(__dirname, "static"), {'icons': true}))
    app.use('/static', express.static(path.join(__dirname, "static")));
}

app.use('/gamelist', function(req, res){
    res.render('gamelist');
});

app.use('/mysql', function(req, res){
    // res.render('gamelist');
    var con = mysql.createConnection({
        host: '192.168.0.23',
        user: 'dev_user',
        password: 'DevUserPass1!',
        database: 'dev_ring'
    });

    con.connect(function(err) {
        if(err) throw err;
        console.log("Connect!");
        var sql = "INSERT INTO chromashift (location, score, name, date) VALUES ('Spen', 2, 'Spen', 22102020)";

        con.query(sql, function(err, result) {
            if(err) throw err;
            console.log("1 record inserted");
        });
    });
    // res.render('maze/index');
});

// app.get('/planet/:home', (req, res) => {
// 	const memberDetails = {
// 		member: "spen",
// 		planet: req.params.home
// 	}
// 	res.render('guardian', memberDetails);
// });

app.get('*', (req, res, next) => {
	res.status(200).send('Sorry, requested page not found.');
	next();
});

// (optional) attach web monitoring panel
app.use('/colyseus', monitor());

gameServer.onShutdown(function(){
  console.log(`game server is going down.`);
});

gameServer.listen(port);

console.log(`Listening on http://localhost:${ port }`);