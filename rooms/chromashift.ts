// Server Side File
import { Room, Client, Delayed } from "colyseus";
import { Schema, type } from "@colyseus/schema";
import { createPrinter } from "typescript";

export class State extends Schema {
    @type("number")
    score: number = 0; //0 = normal, 1 = good state (wood log), 2 = bad state (bomb)

    @type("number")
    mode: number = 0;

    @type("string")
    player_state = "paused";
}

export class ChromashiftRoom extends Room<State> {
    maxClients = 1;
    timer_delayed: Delayed;

    jump_flag = false;

    player_name: string;
    // cheat_delayed: Delayed;
    // max_time_between_jumps:number = 3000;

    onCreate (options) {
        this.setState(new State());
        console.log("Chromashift game room created!", options);
        
        this.onMessage("error", (client, message) => {
            console.log("State received by " + client.sessionId + " was incorrect.");
        });

        this.onMessage("name", (client, message) => {
            console.log("Name is " + message["name"]);
            this.player_name = message["name"];
        });

        this.onMessage("paused", (client, message) => {
            this.timer_delayed.pause();
            console.log("Pause Message");
        });

        this.onMessage("unpaused", (client, message) => {
            this.timer_delayed.resume();
            console.log("Unpause Message");
        });

        this.onMessage("dead", (client, message) => {
            console.log("Dead Message");
            const fs = require('fs');

            var today = new Date();
            fs.writeFileSync("../database/scores.txt", "chromashift," + message["player_score"] + "," + this.player_name + "," + String(today) + "\n", 
                {
                    encoding:"utf8",
                    flag:"a",
                    mode: 0o666
                },

                (err) => {
                    if(err)
                        console.log(err);
                    else {
                        console.log("File written successfully\n"); 
                    }
                }
            );


        });

        this.onMessage("jump", (client) => {
            console.log("Jump Message");
            this.jump_flag = true;
        });

        this.onMessage("started", (client, message) => {
            // When a player starts the game we want to start a timer
            this.clock.start();

            this.timer_delayed = this.clock.setInterval(() => {
                if(this.jump_flag==false){
                    this.broadcast("cheat");
                    this.state.score = 0;
                }
                this.jump_flag = false;
            }, 10000);
        });

        this.onMessage("location_hs", (client) => {
            console.log("Location High Score Message");
            // this.broadcast("location_hs",parseInt(process.env.CHROMA_LOCATION_HS));
        });
    }

    onJoin (client: Client) {
        // Lock the room after a person joins?
    }

    onLeave (client) {
    }

    onDispose () {
        console.log("Dispose ChromashiftGameRoom");
    }
}
