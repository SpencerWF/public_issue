/* Lobby room server side functionality:
- List players currently in the lobby,
    - Player's assigned name
    - Player's ready state
    - Player's group number (if in a group)
- Display the "next game start" time,
- Allow players to determine their "ready state",
- Allow players to create a new group (to a maximum of 8 groups)
- Display the points accrued by players in the various multiplayer games
- Once timer has expired, group ready players for games
    - Keep pre-selected groups together
    - Fill groups to maximum where possible
    - Groups of 4 and 2 are selected over groups of 3 and 3
- Once groups are created send players off to their respective games
*/


import { Room, Client, Delayed, matchMaker } from "colyseus"; //Imports used for multiplayer functionality
import { Schema, type, MapSchema } from "@colyseus/schema";
import { ReactionGameRoom } from "./reactiongame";
var colors = ['AntiqueWhite','Lavender','Coral','Orchid','Cyan','DarkSeaGreen','DarkGrey','RosyBrown'];

// Cron job running
var CronJob = require('cron').CronJob;

var moment = require('moment');

var job;

export class Player extends Schema {
    @type("string")
    name = colors[Math.floor(Math.random() * colors.length)];

    @type("number")
    points = Math.floor(Math.random() * 400);

    @type("boolean")
    ready = false;

    @type("boolean")
    group_willing = false;

    @type("number")
    group = -1;
}

export class State extends Schema {
    @type("number")
    seconds_timer = 300; //This will need to be extracted from the environment at some point.

    @type("number")
    group_max = 4; //This will need to be extracted from the environment at some point.

    @type({ map: Player })
    players = new MapSchema<Player>();

    @type("string")
    cron_next = "12:00";

    today = new Date();
    group_count = [0,0,0,0,0,0,0,0];
    group_lead_ids = ["","","","","","","",""];
    player_count = 0;
    lobby_lock = false;
    // something = "This attribute won't be sent to the client-side";

    createPlayer (id: string) {
        this.player_count += 1;
        this.players[ id ] = new Player();
        this.players[ id ].ready = false;
    }

    removePlayer (id: string) {
        if (this.players[ id ].group >= 0) {
            this.group_count[this.players[ id ].group]--;
        }
        delete this.players[ id ];
    }

    pointToPlayer (id: string) {
        this.players[ id ].size += 50;
        return this.players[ id ].size;
    }
}

export class LobbyRoom extends Room<State> {
    // maxClients = 4;

    onCreate (options) {
        console.log("Lobby Room Created!", options);

        this.setState(new State());
        this.clock.start();

        job = new CronJob('0 * * * * *', () => {
            var ready_count = 0;
            var ready_ids = [];

            console.log("State:TryGameStart");

            this.clients.forEach(element => {
                if(this.state.players[ element.sessionId ].ready) {
                    ready_ids[ready_count] = element.sessionId;
                    ready_count += 1;
                    // if(this.state.players[ ])
                };
            });
        
            if(ready_count >= 2) {
                console.log("State:GameStarting");
                this.sort_players(ready_ids);
            } else {
                console.log("State:NotEnoughReadyPlayers");
                this.broadcast("Not enough ready players to start game.");
            }

            var moment_info = job.nextDates(1);
            var moment_minute = moment(moment_info[0]).minute();
            var moment_hour = moment(moment_info[0]).hour();

            if(moment_minute < 10) {
                moment_minute = String("0" + moment_minute);
            }

            this.state.cron_next = moment_hour + ":" + moment_minute;
        });
        job.start();

        var moment_info = job.nextDates(1);
        var moment_minute = moment(moment_info[0]).minute();
        var moment_hour = moment(moment_info[0]).hour();

        this.state.cron_next = moment_hour + ":" + moment_minute;

        this.onMessage("error", (client) => {
            console.log("State received by " + client.sessionId + " was incorrect.");
        })

        this.onMessage("check", (client, message) => {
            console.log(client.sessionId + " has clicked a button.");
            
            if (client.sessionId + '_readyButton' == message["Id"] && !this.state.lobby_lock) {
                console.log(client.sessionId + " has readied up.");
                this.state.players[ client.sessionId ].ready = !this.state.players[ client.sessionId ].ready;
                if(!this.state.players[ client.sessionId ].ready && this.state.players[ client.sessionId]) {
                    // this.state.players[ client.sessionId ].group = -1;
                    this.remove_from_group(this.state.players[ client.sessionId ])
                }
            }
        })

        this.onMessage("group_confirm", (client, message) => {
            console.log(client.sessionId + " has confirmed wanting to join group with " + message[ "Group" ]);
            if(this.state.players[ client.sessionId ].group > 0){
                this.state.group_count[ this.state.players[ client.sessionId ].group ]--;
            }
            this.state.players[ client.sessionId ].group = parseInt(this.state.players[ message[ "Id" ] ].group);
            this.state.players[ client.sessionId ].ready = true;
        })

        this.onMessage("group_decline", (client, message) => {
            console.log(client.sessionId + " has declined joining group.");
        })

        this.onMessage("group_swap", (client) => {
            var player = this.state.players[ client.sessionId ];
            if(player.group >= 0) {
                // player.group_willing = false;
                // this.state.group_count[player.group]--;
                // player.group = -1;
                this.remove_from_group(player);
            } else {
                // player.group_willing = true;
                var num = this.state.group_count.indexOf(0); 
                if (num >=0) {
                    // this.state.group_count[num]++;
                    // player.group = num;
                    // player.ready = true;
                    this.add_to_group(player,num);
                }
            }
        })

        this.onMessage("group_request", (client, message) => {
            console.log(client.sessionId + " has requested to join " + message["Id"] + "'s group.");
            // this.state.players[ client.sessionId ].group = -1;
            try {
                const otherClient = this.clients.find(client => client.id == message["Id"])

                otherClient.send("group_request", {Id:client.sessionId});
            } catch {
                console.error(`Could not send group_request to ${message["Id"]}`)
            }
        })
    }

    onAuth(client, options, req) {
        console.log(req.headers.cookie);
        return true;
    }

    onJoin (client: Client) {
        this.state.createPlayer(client.sessionId);

        var moment_info = job.nextDates(1);
        var moment_minute = moment(moment_info[0]).minute();
        var moment_hour = moment(moment_info[0]).hour();

        if(moment_minute < 10) {
            moment_minute = String("0" + moment_minute);
        }

        this.state.cron_next = moment_hour + ":" + moment_minute;
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onDispose () {
        console.log("Dispose Lobby Room");
    }

    time_check() {
        var minutes_past_midnight = 0;

        minutes_past_midnight = this.state.today.getHours() * 60;
        minutes_past_midnight += this.state.today.getMinutes();
    }

    sort_players(ready_ids) {
        /* Sorting Code Define:
        Needs to take a random assortment of players, sort them into groups of 4
        and send each of those groups off to another room.
        Step 1 by checking the pre-existing groups distance from 4, if there is enough
        players to fill all groups then fill them with players and continue to fill the
        remaining empty groups with players, step 2. */

        var games_num = 0;
        ready_ids.forEach(element => {
            //Need to go through each player and put them in a group

            if(this.state.players[ element ].group<0) {
                // var group_num = this.state.players[ element.sessionId ].group;
                var group_ids = [];
                // group_ids = this.get_group_ids(group_num);

                for (let index = 0; index < this.state.group_count.length; index++) {
                    const group_num = this.state.group_count[index];
                    
                    if(group_num > 0 && group_num < 4) {
                        this.state.players[ element ].group = index;
                        this.state.group_count[index]++;
                        //this.send_group(index);
                    }
                }

                if(this.state.players[ element ].group <0 || this.state.players[ element ].group > this.state.group_count.length) {
                    for (let index = 0; index < this.state.group_count.length; index++) {
                        const group_num = this.state.group_count[index];
                        
                        if(group_num == 0) {
                            this.state.players[ element ].group = index;
                            this.state.group_count[index]++;
                            break;
                        }
                    }
                }
            }
        });

        for (let index = 0; index < this.state.group_count.length-1; index++) {
            const group_num = this.state.group_count[index];
            
            if(group_num > 0 && group_num < 4) {
                for (let index_2 = index+1; index_2 < this.state.group_count.length; index_2++) {
                    const group_num_2 = this.state.group_count[index_2];
                    
                    if(group_num_2 > 0 && group_num_2 < 4) {
                        if(group_num+group_num_2 <= 4) {
                            this.combine_groups(index, index_2);
                        }
                    }
                }
            }

            if(group_num > 0 && group_num <=4) {
                games_num++;
            }
        }

        this.send_groups();
    }

    combine_groups(group_1:number, group_2:number) {
        this.clients.forEach(element => {
            //Need to go through each player and put them in a group

            if(this.state.players[ element.sessionId ].group==group_2) {
                this.remove_from_group(this.state.players[ element.sessionId ]);
                this.add_to_group(this.state.players[ element.sessionId ], group_1);
                // this.state.players[ element.sessionId ].group==group_1;
                // this.state.group_count[ group_1 ]++;
                // this.state.group_count[ group_2 ]--;
            }
        });
    }

    add_to_group(player, group_num) {
        this.state.group_count[ group_num ]++;
        player.group = group_num;
        player.ready = true;
    }

    remove_from_group(player) {
        var group_num = player.group;
        player.group = -1;
        this.state.group_count[ group_num ]--;
        player.ready = false;
    }

    send_group(group_number:number) {
        //Send a group to their game.
        // this.generate_game();
        console.log("State:GeneratingGame");
        console.log("Group:" + group_number);
        console.log("Players:" + this.state.group_count[group_number]);
        // const reservation = await matchMaker.reserveSeatFor(ReactionGameRoom, {mode:"lobby"})
    }

    send_groups() {
        for (let index = 0; index < this.state.group_count.length; index++) {
            const group_num = this.state.group_count[index];

            if(group_num > 1 && group_num <=4) {
                this.send_group(index);
            }
        }
    };

    get_group_ids(group_number) {
        var group_ids = [];
        this.clients.forEach(client => {
            if(this.state.players[ client.sessionId ].group == group_number) {
                group_ids.push(client.sessionId);
            };
        });

        return group_ids;
    }
}
