/* This module generates a random name for the players when they load up a page on
the local server.

Two paths can occur:
If the player doesn't have a name in their cookie already then a random name is 
generated, it is then compared to the pre-existing list of names which have been
used today. If the name has already been put into this list, it is written into
the dated name list along with the ip address of the player.
If the player does have a name in their cookie, it is checked against the dated
name list, and should have the same ip address as the player.  If the ip address
corresponds to the name then that name is used for the player. If it doesn't
correspond to the ip address a new name is generated for the player.

Name in Cookie - If Conditional
    Name is not on Dated list - check_name()
        Add Name and IP on Dated List - add_name()
        Return same name
    Name is on Dated list - check_name()
        Name with different ip address
            Go to No Name in Cookie
        Name with same ip address
            Return same name


No Name in Cookie - While Loop
    Generate New Name - gen_name
        New Name is not on Dated List - check_name()
            Add New Name and IP on Dated List - add_name()
            Return New Name
        New Name is on Dated List - check_name()
            Go to No Name in Cookie
*/
function get_name(name: string, ip: string) {
    /* This function is the core of the module, it returns a name for the player. 
    */
    // var new_name;
    var name_accepted:boolean = false;
    // var check_result;

    //Reads true if there is a name in the cookie, which is a string, and not empty
    //There is a name in the cookie
    // console.log("Name Type: " + typeof(name) + "\nName is: " + name);
    if(typeof(name) != "undefined") {
        console.log("Name Exists: To be evaluated")
        // Check if name is on dated list
        if(check_name(name, ip)) {
            //Check if name on the dated list has the same ip address
            name_accepted = true;
            console.log("Name Exists: Accepted")
        }
    } else {
        console.log("Name Does not Exist");
    }

    // name_accepted = false;
    // name = "majestic guitar"
    
    while(!name_accepted) {
        //repeat loop as long as the name is not accepted by the "check_name" function
        console.log("Name Rejected")
        name = gen_name();

        if(check_name(name, ip)) {
            name_accepted = true;
        }
        name_accepted = true;
    }

    return name;
}

function gen_name() {
    var name = "";

    var adjectives = get_file_list("./name_mng/adjectives.txt");
    var nouns = get_file_list("./name_mng/nouns.txt"); 
    
    var adj_rng;
    var noun_rng;

    adj_rng = Math.floor(Math.random()*adjectives.length);
    noun_rng = Math.floor(Math.random()*nouns.length);

    name = adjectives[adj_rng] + " " + nouns[noun_rng];
    console.log(name);

    return name;
}

function get_file_list(filename) {
    var fs = require('fs');
    try {
        var file_contents = fs.readFileSync(filename, 'utf8');
        var file_list = file_contents.split('\n');
    } catch (err) {
        if(err.code === "ENOENT") {
            if(process.env.DEBUG==="true") {
                console.log('[DEBUG] Get Name: ' + filename + ' File not found');
            }
            return false;
        }
    }
    return file_list;
}

function check_name(name, ip?) {
    /* This function verifys that the name generated for the player has not been used 
    previously today. Each day will have a different list for each of the names used
    on that day.
    */
    const fs = require('fs');

    var file_exists = true;
    var name_pos = -1;
    var name_list;
    var today = new Date();
    console.log(today);
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    var str_today = dd + '_' + mm + '_' + yyyy;

    name_list = get_file_list("./name_mng/" + str_today + "_names.txt");
    // fs.readFileSync("./name_mng/" + str_today + "_names.txt", 'utf8', (err, data) => {
    //     if(err) {
    //         console.log(err);
    //         file_exists = false;
    //     } else {
    //         // name_list = data.split("\n");
    //         // console.log(data);

    //         // for (let index = 0; index < name_list.length; index++) {
    //         //     const element = name_list[index];
    //         //     if(name_list[index].indexOf(name)!=-1) {
    //         //         name_pos = index;
    //         //         console.log("Found Name Pre-existing")
    //         //         break;
    //         //     }
    //         // }
    //         if(process.env.DEBUG=="true"){
    //             console.log("[DEBUG] Check Name:No Error")
    //         }
    //     }
    // })

    for (let index = 0; index < name_list.length; index++) {
        const element = name_list[index];
        if(name_list[index].indexOf(name)!=-1) {
            name_pos = index;
            console.log("Found Name Pre-existing")
            break;
        }
    }

    if(name_list!=false) {
        //If the file exists and the name was not found inside the file, write to the file
        //If the file exists and the name was found inside the file, verify the ip address
        if(name_pos === -1) {
            add_name(name, ip);
        } else {
            if(name_list[name_pos].indexOf(ip)===-1) {
                return false;
            }
        }
    } else {
        add_name(name, ip);
    }
    return true;
}

function add_name(name, ip?) {
    //If seeing issues with opening multiple versions of file at the same time
    //look into "fs.createWriteSteam()" instead.
    var fs = require('fs');

    var name_pos = -1;
    var name_list;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var str_today = dd + '_' + mm + '_' + yyyy;

    fs.writeFileSync("./name_mng/" + str_today + "_names.txt", name + " " + ip + "\n", 
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
}

function get_name_list(name) {
    var now = new Date()
    var name_file = now.getDate() + now.getMonth() + now.getFullYear() + "_names.txt";
    var name_list;
    var name_ver = false;

    var fs = require('fs');


    name_list = fs.readFileSync(name_file, (error, txtString) => {
        if(error) {
            fs.writeFile(name_file, name, (err) => {
                if(err) throw err;
            })
            name_list = [];
        }
    })

    return name_list;
}

function reshuffle_name(name, ip) {

}

export { get_name, reshuffle_name };