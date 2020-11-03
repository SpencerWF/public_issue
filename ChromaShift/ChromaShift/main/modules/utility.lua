-- Put functions in this file to use them in several other scripts.
-- To get access to the functions, you need to put:
-- require "my_directory.my_file"
-- in any script using the functions.

local Utility = {}

Utility.gravity = -346

local player = 
{
	url = "",
	jumpVel = vmath.vector3(0, 300, 0),
	jumpAcc = vmath.vector3(0, 180, 0),
	height = 60,
	scale = 2,
	dead = false
}
function Utility.GetPlayerProps(--[[optional]]prop)
	return player[prop] or player
end

local fall = 
{
	vel = vmath.vector3(0, 0, 0),
	acc = vmath.vector3(0, Utility.gravity, 0)
}

function Utility.GetFallProps(--[[optional]]prop)
	return fall[prop] or fall
end

local jump = 
{
	vel = fall.vel + player.jumpVel,
	acc = fall.acc + player.jumpAcc
}

function Utility.GetJumpProps(--[[optional]]prop)
	return jump[prop] or jump
end

local plat = 
{
	vel = vmath.vector3(228, 0, 0),
	start_vel = vmath.vector3(228, 0, 0),
	acc = vmath.vector3(0, 0, 0),
	thickness = 4,
	scale = 3,
	minLen = 30,
	maxLen = 600
}
function Utility.GetPlatProps(--[[optional]]prop)
	return plat[prop] or plat
end
function Utility.ResetSpeed()
	plat.vel = plat.start_vel
end

local colour_index = 
{
	red,
	green,
	blue,
	yellow,
	magenta,
	cyan,
	orange,
	purple
}
local colour = 
{
	count = 8,
	vmath.vector4(1,0,0,1),
	vmath.vector4(0,0.85,0,1),
	vmath.vector4(0,0.25,1,1),
	vmath.vector4(1,1,0,1),
	vmath.vector4(1,0.2,0.75,1),
	vmath.vector4(0,1,1,1),
	vmath.vector4(1,0.5,0,1),
	vmath.vector4(0.75,0,1,1)
}
function Utility.GetColour(--[[optional]]name)
	return colour[name] or colour
end

-- version
Utility.VERSION = "v3.1.4"

-- pause
Utility.Pause =  false

-- pause

-- tutorial
Utility.Tutorial = true
-- tutorial

-- game over
Utility.Game_Over = false
-- game over

-- spawns
Utility.MinSpawnThresh = 299
Utility.NONE 	= 0
Utility.PICKUP 	= 1
Utility.GATE 	= 2
--spawns 

function Utility.RandomFloat(lower, greater)
	return lower + math.random()  * (greater - lower);
end

function Utility.GetMaxYLimit()
	return Screen_Height - player.height * player.scale - plat.thickness * plat.scale
end

return Utility