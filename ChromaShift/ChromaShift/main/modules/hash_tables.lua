-- Put functions in this file to use them in several other scripts.
-- To get access to the functions, you need to put:
-- require "my_directory.my_file"
-- in any script using the functions.


local Hash = {}



-- HIT BOX NAMES
Hash.PLAYER 		= hash("player")
Hash.FLOOR			= hash("floor")
Hash.GATE			= hash("obstical")
Hash.PICKUP			= hash("pickup")

-- DEFOLD GENERATED MESSAGES
Hash.TOUCH					= hash("touch")
Hash.TRIGGER_RESPONSE 		= hash("trigger_response")
Hash.ANIMATION_DONE			= hash("animation_done")
Hash.CONTACT_POINT_RESPONSE = hash("contact_point_response")

-- OTHER MESSAGES
Hash.SET_COLOUR				= hash("set_colour")		-- used to set the colour of a sprite, param: vector4(r, g, b, alpha)
Hash.CHECK_COLOUR			= hash("check_colour")		-- this could actually be done with set colour since they both pass the colour value, if we needed to save space replace uses of this with set colour and but it makes it easier to read the code
Hash.BLOCKED 				= hash("blocked")			-- used to tell the player object it has been blocked by a gate, param: bool
Hash.DELETED				= hash("deleted")			-- used to tell the world generator that an item has been deleted and can now be spawned again
Hash.GUI_DELETE				= hash("gui_delete")		-- used for gui delete
Hash.GAME_OVER				= hash("game_over")			-- used to bring up the game over ui
Hash.RESTART				= hash("restart")			-- used to restart the game


return Hash