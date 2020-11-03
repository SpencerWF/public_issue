/* Server Side File for Pigeon Paths Game 
Functionality:
- Server must track player's movements to some degree
    - Ensure the player is not moving faster than possible in the game
    - Ensure the players only win when at the correct locations
    - Let players where the other players are relative to the end
- Track the time of a game
    - To ensure rooms cannot be left open for unreasonable periods of time.
    - Keep a rough score for players paths (high scoring?)
    - Ensure no player is faster than physically possible
- Authenticate players joining a game are reserved seats in that game
    - Make sure no players are joining games they aren't assigned to.
    - Track players who are joining games they aren't meant to
- Ensure all players are loaded in before starting the game
    - Players need to be allowed to view the tutorial screen before the
    game starts.
    - End line of initialize, each player sends a "ready" message to the
    server.
- Alert players when a win has occurred
    - What consitues a win? Is only the first player to the finish line
    the winner or all players within the time limit?
*/
import { Room, Client, Delayed } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number")
    points: number = 0;

    @type("string")
    name: string;

    @type("number")
    distance: number = 0;

    @type("boolean")
    ready: boolean = false;
}

export class State extends Schema {
    @type("number")
    player_count: number = 0;

    @type({ map: Player })
    players = new MapSchema<Player>();

    @type("number")
    path: number = 0;

    @type("number")
    timer: number = 100;

    createPlayer (id: string) {
        this.player_count += 1;
        this.players[ id ] = new Player();
    }

    removePlayer (id: string) {
        this.player_count -= 1;
        delete this.players[ id ];
    }
}

export class PPathsRoom extends Room<State> {
    maxClients = 4;
    reserved_count = 0;
    public timer_delayed: Delayed;

    onCreate (options) {
        this.setState(new State())
        console.log("State:Created\nRoom:PigeonPathsRoom", options);
        
        this.onMessage("error", (client, message) => {
            console.log("State received by " + client.sessionId + " was incorrect.");
        })

        this.onMessage("ready", (client) => {
            this.state.players[ client.sessionId ].ready = true;
        })

        this.onMessage("win", (client) => {
            this.broadcast("win");
        })

        this.onMessage("distance", (client, message) => {
            this.state.players[ client.sessionId ].distance = message["distance"];
        })

        this.clock.start();
        this.timer_delayed = this.clock.setInterval(() => {
            console.log("State:StartingTimer\nRoom:PigeonPathRoom");
            this.state.timer = this.state.timer - 1;
        }, 1000);
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
        console.log("State:Dispose\nRoom:PigeonPathsRoom");
    }

    startGame() {
        this.lock();

        let map = Math.random()
        console.log("State:StartingGame\nMap: ", map);
        this.broadcast("Start", {"map": map});
    }
}
