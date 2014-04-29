
var FONT = 32;


var ROWS = 10;
var COLS = 25;

var ACTORS = 10;

// Rows by columns matrix that contains actual map data
var gameMap;

// Actual ASCII display
var screen;

// Initialize actors; player is 0 in the list
var player;
var actorList;
var livingEnemies;

// List of actor locations for quick searching
var actorMap;

function drawMap() {
	for(y = 0; y < ROWS; y++)
		for(x = 0; x < COLS; x++)
			screen[y][x].content = gameMap[y][x];
}

function randomInt(max) {
   return Math.floor(Math.random() * max);
}

function onKeyUp(event) {
	drawMap();
    switch (event.keyCode) {
            case Phaser.Keyboard.LEFT:
				acted = moveTo(player, {x:-1,y:0});
				break;
            case Phaser.Keyboard.RIGHT:
				acted = moveTo(player, {x:1,y:0});
				break; 
            case Phaser.Keyboard.UP:
				acted = moveTo(player, {x:0,y:-1});
				break;
            case Phaser.Keyboard.DOWN:
				acted = moveTo(player, {x:0,y:1});
				break;
    }
	for(var enemyIndex = 1; enemyIndex < ACTORS; enemyIndex ++){
		if(actorList[enemyIndex] != null){
			try{
				basicEnemyAction(actorList[enemyIndex]);
			}catch(error){
				console.log("Error having enemy " + enemyIndex + " take his action");
			}
		}
	}
	drawActors();
}

function initMap() {
	gameMap = [];
	for (var y=0; y < ROWS; y++) {
		var newRow = [];
		for (var x = 0; x < COLS; x++) { 
			if(Math.random() > 0.8)
				newRow.push('#');
			else
				newRow.push('.');
		}
		gameMap.push(newRow);
	}
}

function initCell(chr, x, y) {
        // add a single cell in a given position to the ascii display
        var style = { font: FONT + "px monospace", fill:"#fff"};
        return game.add.text(FONT*0.6*x, FONT*y, chr, style);
}

function initActors() {
	actorList = [];
	actorMap = {};
	for(var actorNumber=0; actorNumber<ACTORS; actorNumber++){
		var actor = { x:0,y:0, hp:actorNumber==0?3:1, id:actorNumber };
		try{
		do {
			actor.x = randomInt(COLS);
			actor.y = randomInt(ROWS);
			console.log("Adding actor " + actorNumber + " to " + actor.x + "," + actor.y + " currently " + gameMap[actor.y][actor.x])
		} while ((gameMap[actor.y][actor.x] == '#') || (actorMap[actor.y + "_" + actor.x] != null));
		}catch(error){
			console.log("error adding actor " + actorNumber + " to " + actor.x + "," + actor.y + ":" + error)
		}
		actorMap[actor.y + "_" + actor.x] = actor;
		actorList.push(actor)
	}
	player = actorList[0]
	livingEnemies = ACTORS-1;
}

function canGo(actor,dir) {
    return  actor.x+dir.x >= 0 &&
        actor.x+dir.x <= COLS - 1 &&
                actor.y+dir.y >= 0 &&
        actor.y+dir.y <= ROWS - 1 &&
        gameMap[actor.y+dir.y][actor.x +dir.x] == '.';
}

function basicEnemyAction(actor){
	var directions = [{x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:1}];
	
	dx = actor.x - player.x;
	dy = actor.y - player.y;
	
	if (Math.abs(dx) + Math.abs(dy) > 6){
		moveTo(actor,directions[randomInt(directions.length)]);
	} else{
		possibleMoves = []
		if(dx < 0){
			possibleMoves.push({x:1,y:0});
		} else if (dx > 0){
			possibleMoves.push({x:-1,y:0});
		}
		if(dy < 0){
			possibleMoves.push({x:0,y:1});
		} else if (dy > 0){
			possibleMoves.push({x:0,y:-1});
		}
		moveTo(actor,possibleMoves[randomInt(possibleMoves.length)]);
	}
	console.log()
}

function moveTo(actor, dir) {
    // check if actor can move in the given direction
    if (!canGo(actor,dir))
            return false;
    // moves actor to the new location
    var newKey = (actor.y + dir.y) +'_' + (actor.x + dir.x);
	console.log(actor.id + " moving from " + actor.y + "," + actor.x + " to " + newKey);
	for(var actKey in actorMap){
		console.log(actorMap[actKey].id + " is at " + actKey);
	}
	console.log(actorMap[newKey] + " is already there");
	if (actorMap[newKey] != null) {
		var victim = actorMap[newKey];
        victim.hp--;
		if(victim == player){
			console.log("Holy shit the player took damage!");
		}
        if (victim.hp == 0) {
			console.log("Killed enemy at " + newKey)
             delete actorMap[newKey];
             actorList[actorList.indexOf(victim)]=null;
			 console.log(actorList.length);
             if(victim!=player) {
                     livingEnemies--;
                     if (livingEnemies == 0) {
                             // victory message
                             var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill : '#2e2', align: "center" } );
                             victory.anchor.setTo(0.5,0.5);
                     }
             } else {
                 var defeat = game.add.text(game.world.centerX, game.world.centerY, 'Defeat!\nCtrl+r to restart', { fill : '#2e2', align: "center" } );
                 defeat.anchor.setTo(0.5,0.5);
             }
         }
 	} else {
 		delete actorMap[actor.y + '_' + actor.x];
//		var newX = actor.x + dir.x;
//		console.log(newX);
//		var newY = actor.y + dir.y;
//		console.log(actor.id + " moving from " + actor.y + "," + actor.x + " to " + newY + "," + newX);
		actor.y += dir.y
		actor.x += dir.x
 		actorMap[actor.y + '_' + actor.x] = actor;
		for(var actKey in actorMap){
			console.log(actorMap[actKey].id + " is NOW at " + actKey);
		}
 	}
	return true;
}
	

function drawActors() {
	for(var a in actorList) {
		if(actorList[a] != null){
			if(actorList[a].hp > 0)
				screen[actorList[a].y][actorList[a].x].content = a == 0?''+player.hp:a;
		}
	}
}

function create() {
    // init keyboard commands
    game.input.keyboard.addCallbacks(null, null, onKeyUp);

	initMap();
	initActors();

	screen = [];
    for (var y = 0; y < ROWS; y++) {
            var newRow = [];
            screen.push(newRow);
            for (var x = 0; x < COLS; x++)
                    newRow.push( initCell('', x, y) );
    }
    drawMap();
	drawActors();
}


// initialize phaser, call create() once done
var game = new Phaser.Game(COLS * FONT * 0.6, ROWS * FONT, Phaser.AUTO, null, {
    create: create
});
 
 
