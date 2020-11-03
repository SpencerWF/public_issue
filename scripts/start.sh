#!/usr/bin/env bash

export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket

# Optional step - it takes couple of seconds (or longer) to establish a WiFi connection
# sometimes. In this case, following checks will fail and wifi-connect
# will be launched even if the device will be able to connect to a WiFi network.
# If this is your case, you can wait for a while and then check for the connection.
sleep 15
# which nmcli
# if [ $? -ne 0 ]
# then
# 	printf 'Installing wget\n'
# 	sudo apt install network-manager
# fi

# (crontab -l; echo "${LOBBY_START_GAME:*/4 8 * * *} /usr/src/scripts/lobby.sh") | crontab -
# (crontab -l; echo "${BACKLIGHT_OFF:-0 23 * * *} /usr/src/backlight_off.sh") | crontab -

# Choose a condition for running WiFi Connect according to your use case:

# 1. Is there a default gateway?
# ip route | grep default

# 2. Is there Internet connectivity?
# nmcli -t g | grep full

# 3. Is there Internet connectivity via a google ping?
wget --spider http://google.com 2>&1

# 4. Is there an active WiFi connection?
# iwgetid -r

if [ $? -eq 0 ]; then
    printf 'Skipping WiFi Connect\n'
else
    printf 'Starting WiFi Connect\n'
    ./wifi-connect
fi

printf 'Starting Lobby MVP Application\n'

# Start your application here.
# cd colyseus

printf 'NPM Install Command Starting\n'
npm install
# npm install -g pm2

printf 'Running NPM Start Command\n'
npm start

# cd ../javascript-pixi/
# npm install
# npm start