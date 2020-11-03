# Colyseus Setup with Defold
Colyseus is the multiplayer server used for this game, and it is used extensively by Unseen Arcade for the multiplayer games, score keeping for the Score Attack games and Metagame tracking.

Colyseus performs communication between the server and clients in a number of ways.  Firstly variables defined within a class that extends Schema are constantly shared with all connected clients.  With events triggered on any change to the variables (one event, not specific events for each variable).  The second method of communication is by sending messages to clients, this can be to a specific client, broadcast to all clients, or broadcast to all clients with an exception (one client doesn't receive the message).  On the client side these messages are used as a trigger for events (on_message)

## Required Files
To use Colyseus with Defold requires that within the game.project file of your Defold project, you include four dependencies:

https://github.com/colyseus/colyseus-defold/archive/master.zip
https://github.com/britzl/defold-websocket/archive/master.zip
https://github.com/britzl/defold-luasocket/archive/0.11.zip
https://github.com/britzl/defold-luasec/archive/master.zip

[INCLUDE IMAGE]

## Required Code
There are three main pieces of code required in each Unseen Arcade game (defold side) to use Colyseus. They all go within the main script [EDIT ONCE SEPARATE MODULE IS MADE]. The first one is used to give the client knowledge of the address the game is at on the Unseen Arcade server.

```
-- Get the system information of the device playing this game
local info = sys.get_sys_info()
local server_location
if (info.system_name == "HTML5") then
    -- If this is a HTML5 build use javascript code to read in the server addess details
	server_location = html5.run("location.protocol.replace('http', 'ws') + '//' + window.document.location.host.replace(/:.*/, '') + (location.port ? ':' + location.port : '');")

else
    -- Build is not a HTML5 build. This server location assumes the server and the clients are on the same device for testing generally.
	server_location = "ws://" .. server_address .. ":" .. server_port
end

function init(self)
    -- Creates the client instance which will be used throughtout the game to communicate with the server.
	client = Colyseus.new(server_location, false) -- false: not to connect immediately

```

The second piece of code is used to define the event-based behavior of the client instance 

```
    -- Function within which the client side behavior is defined, such as reactions to messages (room:on_message), reactions to changes in the gameplay room state (room.state.on_change) and the leave behavior of the player client (room:on("leave", ...)).
	client:join_or_create("reactiongame", function(err, room_instance)
        -- Detect if an error occurred whilst joining the game [IMPROVE THIS SECTION ONCE ERROR BEHAVIOR IS DEFINED]
		if (err ~= nil) then
			print("JOIN ERROR: " .. err)
			return
		end

        -- Pass the room instance grabbed from the server to the variable "room"
		room = room_instance

        -- React changes to the room state (such as player positions changing or the room mode changing)
		room.state.on_change = function(changes)
            ...
		end

        -- Function to react to messages from the server, first variable of the function "on_message" is the message type, and is used to create multiple on_message functions that react to different message types from the server. [FILL WIN FUNCTION WITH REDIRECT JAVASCRIPT FUNCTIONALITY].
		room:on_message("win", function(message)
            ...
		end)

        -- Function run when the player leaves the room.
		room:on("leave", function()
            ...
		end)
	end);
```

The final piece of code is merely to constantly update the client with any messages or state changes from the server, and it entails a single line of code run in the update function.  It can also be valuable to pull in important pieces of information from the server regularly in the update function.

```
function update(self, dt)
    -- Updates the room state and messages from the server.
	client:loop()
	...
end
```


# References



