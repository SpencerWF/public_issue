# Unseen Arcade Backend to Frontend Development
This file is to document necessary knowledge for interaction between front end and backend development.

## Enviroment Variables
Any page created in the nodejs environment of Unseen Arcade will require access to some Enviroment Varaibles (envs) for the functionality of the page. The envs will contain important information such as the location names and the current high-score, as well as functionaly required information such as paths to appropriate pages.


## File Creation and Location
Any game created for Unseen Arcade will be in a html5 bundle, the main html file from which [conventionally called *index.html*] needs to be converted into a pug file format [html-to-pug](https://html-to-pug.com/) and placed in a sub-folder in the *views* folder with it's corresponding game name.  The rest of the bundle must be separated and placed within a sub-folder in the *static* folder with the same game name.  This is shown by the below image:

![Game Location Images](https://github.com/SpencerWF/node_arcade/blob/master/images/game_location_images.jpg)

### Game Naming Convention
Any game developed for Unseen Arcade must be developed within Defold (or the appropriate game engine) under a no-capitals name (not *ChromaShift* but *chromashift*).  All numbers must be expressed in number format (not *eleven* but *11*), and have no spaces in the name. None of the following symbols may be used in the name of a game */ . ' " +*. This is merely to maintain consistency between front and back end development. Marketting will not be restricted by the same naming convention.

### Creating the Link to a Frontend Page in the Javascript Code
When creating the path to a page, if the page can change with the environment variables (Score Attack games) then the page must be created corresponding to those environment variables.  The below code demonstrates the appropriate calling of an environment variable through *process.env.* followed by the environment variable name.  All environment variables will be listed in an environment variables markdown file similar to this one.

All variables needed on the frontend page will need to be passed to the page through the *details*

```
app.get('/'+process.env.ONE_SHOT, (req, res) => {
    //Called by One Shot button on home page
    const details = {
        name: req.cookies.name,
    }
    res.render(process.env.ONE_SHOT+"/index", details);
});
```

## Environment Variables on a Local Device
As local devices are not connected to the Balena Server they do not have the environment variables which are needed for functionality.  Thus these variables must pushed to the local device another way.  This is done through the Dockerfile.template file and an environments variable file in a hidden folder. The hidden folder is not pushed to github and as such, will need to be created by each developer individually.

### Hidden File - .balena/balena.yml
All environment variables are pushed to local devices from this hidden file *balena.yml* which must be created in a hidden folder *.balena/*.  Each time a new game needs to be tested live on the device, one of the environment variables in this *balena.yml* file should be edited to reflect the new game's name, so that a button press can access the path created above in the javascript code.

Any new environment variables which need to be pushed to a local device can be added to this file as well.

### Pushing a New Environment Variable Through Docker
Once the balena.yml file has been edited to include the new environment variable, it will need to be created in the Dockerfile.template through an ARG command, and then pulled from the balena.yml through an ENV command.

```
ARG PORT
ARG CITY
ARG LOCATION
ARG ONE_SHOT
ARG SCORE_ATTACK
ARG WINNING_CITY
ARG WINNING_LOCATION
ARG LOBBY_DELAY_MINS
ARG META_NAME
ARG PROFILER

ENV PORT=${PORT}
ENV CITY=${CITY}
ENV LOCATION=${LOCATION}
ENV ONE_SHOT=${ONE_SHOT}
ENV SCORE_ATTACK=${SCORE_ATTACK}
ENV WINNING_CITY=${WINNING_CITY}
ENV WINNING_LOCATION=${WINNING_LOCATION}
ENV LOBBY_DELAY_MINS=${LOBBY_DELAY_MINS}
ENV META_NAME=${META_NAME}
ENV PROFILER=${PROFILER}
```

This, rather complex, process is necessary to allow each developer to have different environment variables on local devices.

## Quickest Testing Process for Rapid Development
Whilst the above process is for testing where the full site functionality is necessary a quicker process is viable in a development device. Currently in development environments a path to the *static* folder is created.  Placing the direct html5 bundle contents into this folder, unedited, will allow a player to use the */static/* path on the server to access the game. The player will need to navigate to the appropriate html file. 

# Sending Variables to Front End
There are many different sources of changing variables in Unseen Arcade. Specifically variables will be accessable from the following locations:
1. Global SQL Database - This database is general to all Unseen Arcade devices, containing largely referential information or global statistics.
2. Ring Database - These are general to the ring of devices, often a single event or city will have a "Ring Database"
3. Local Environment Variables - These are specific to the particular location which the Unseen Arcade is located
4. Local Client Variables - These are specific to the particular client device, such as assigned player names

## Accessing Variables from the Back End

## Accessing Variables from the Front End
From a front end perspective all of these variables will be accessable from a single function. The intention is to have as simple as possible for Front End development. Any of these variables must be passed to the appropriate pug file from the server side. Specifically where the route is created the appropriate variables must be pulled from the *ua_get_variable()* function.

The list of variables able to be called by this function is the following:
- Player Name - Extracted from Cookie
- Score Attack Local High Score - Extracted from Environment Variables
- Score Attack Ring High Score - Extracted from Ring Database
- Score Attack Global High Score - Extracted from Global Database
- Flag Game Score - Extracted from Ring Database
- Location Name - 



view model model-view