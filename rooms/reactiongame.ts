// Server Side File
import { Room, Client, Delayed } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number")
    points: number = 0;

    @type("string")
    name: string;
}

export class State extends Schema {
    @type("number")
    player_count: number = 0; //0 = normal, 1 = good state (wood log), 2 = bad state (bomb)

    @type({ map: Player })
    players = new MapSchema<Player>();

    @type("number")
    mode: number = 0;

    min_time: number = 3001; //longest time that a good state lasts for
    point_to: string = "-1";

    createPlayer (id: string) {
        this.player_count += 1;
        this.players[ id ] = new Player();
    }

    removePlayer (id: string) {
        this.player_count -= 1;
        delete this.players[ id ];
    }
}

export class ReactionGameRoom extends Room<State> {
    maxClients = 4;
    timer_delayed: Delayed;

    onCreate (options) {
        this.setState(new State())
        console.log("Reaction game room created!", options);
        
        this.onMessage("error", (client, message) => {
            console.log("State received by " + client.sessionId + " was incorrect.");
        })

        this.onMessage("time", (client, message) => {
            if (this.state.point_to == "-1") {
                this.timer_delayed.clear();
                this.timer_delayed = this.clock.setTimeout(() => {
                    this.modeToZero();
                }, 100);

            }
            console.log("Time received by player " + client.sessionId + " was " + message["time_taken"] + ".");
            if (this.state.mode == 1 && message["time_taken"] < this.state.min_time) {
                this.state.min_time = message["time_taken"];
                this.state.point_to = client.sessionId;
            }
        })

        this.onMessage("misclick", (client) => {
            console.log("Player has clicked when the mode was danger, losing points");
            this.clients.forEach(element => {
                if(element.sessionId != client.sessionId) {
                    this.state.players[ element.sessionId ].points +=1;
                } else {
                    this.state.players[ element.sessionId ].points -=3;
                    if (this.state.players[ element.sessionId ].points < 0) {
                        this.state.players[ element.sessionId ].points = 0;
                    }
                }
            });

            this.timer_delayed.clear();
            this.timer_delayed = this.clock.setTimeout(() => {
                this.modeToZero();
            }, 100);
        })
    }

    onJoin (client: Client) {
        this.state.createPlayer(client.sessionId);
        console.log("Player count is " + this.state.player_count);
        // Need to lock after 4 players have joined
        if (this.state.player_count == 4) {
            this.startGame()
        }
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onDispose () {
        console.log("Dispose ReactionGameRoom");
    }

    startGame() {
        this.lock();

        let t_out = 2000 + Math.floor(Math.random()*5000)
        console.log("Time out duration is ", t_out);
        this.timer_delayed = this.clock.setTimeout(() => {
            this.modeToGoodBad();
        }, t_out);
    }

    pointTo() {
        if (this.state.point_to != "-1") {
            this.state.players[this.state.point_to].points += 3;
        }
    }

    playerWin() {
        this.broadcast("win")
        console.log("Player has won, and timer should be disabled.")
        this.timer_delayed.clear();
    }

    modeToZero() {
        this.state.mode = 0;
        this.timer_delayed = this.clock.setTimeout(() => {
            this.modeToGoodBad();
        }, 3000);
        if (this.state.min_time < 3001) {
            console.log("Player " + this.state.point_to + " got the lowest time with " + this.state.min_time + ".");
            this.pointTo();
        }
        this.state.min_time = 3001;
        this.state.point_to = "-1";

        let i;
        for (i in this.state.players) {
            if (this.state.players[ i ].points >= 9) {
                this.playerWin();
            }
        }
    }

    modeToGoodBad() {
        let rnd_max = 3;
        let good_or_bad = Math.floor(Math.random()*rnd_max);
        if (good_or_bad < rnd_max - 1) {
            this.state.mode = 1; //1 or 0 is good mode
            this.state.point_to = "-1"
            this.state.min_time = 3001;
        }
        else if (good_or_bad >= rnd_max - 1) {
            this.state.mode = 2; //2 is bad mode
        }

        // Set timer to return mode to zero when completed
        let t_out = 2000 + Math.floor(Math.random()*5000)
        console.log("Time out duration is ", t_out);
        this.timer_delayed = this.clock.setTimeout(() => {
            this.modeToZero();
        }, t_out);
    }
}
