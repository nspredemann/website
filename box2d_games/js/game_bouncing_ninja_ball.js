// some variables that we gonna use in this demo
var initId = 0;
var player = function(){
	this.object = null;
	this.canJump = false;
};

var boxes = [];
var boxMovingUp = [];
var world;
var ctx;
var win = false;
var canvasWidth;
var canvasHeight;
var keys = [];

// HTML5 onLoad event
Event.observe(window, 'load', function() {
	world = createWorld(); // box2DWorld 
	ctx = $('game').getContext('2d'); // 2
	var canvasElm = $('game');
	canvasWidth = parseInt(canvasElm.width);
	canvasHeight = parseInt(canvasElm.height);
	initGame(); // 3
	step(); // 4
	
// 5
	document.addEventListener('keydown',handleKeyDown,true); 
	document.addEventListener('keyup',handleKeyUp,true);
});

function initGame(){
	// create 2 big platforms	
	var ground = createBox(world, 3, 230, 60, 180, true, 'ground');
	createBox(world, 560, 360, 50, 50, true, 'ground');
	
	// create small platforms
	for (var i = 0; i < 5; i++){
		boxes[i] = createMovingBox(world, ground, 150+(80*i), 430-(i*15), 5, 100,'ground');
		boxMovingUp[i] = (Math.pow(-1,i)==1) ? true : false;
	}
	
	// create player ball
	var ballSd = new b2CircleDef();
	ballSd.density = 0.1;
	ballSd.radius = 12;
	ballSd.restitution = 0.5;
	ballSd.friction = 1;
	ballSd.userData = 'player';
	var ballBd = new b2BodyDef();
	ballBd.linearDamping = .03;
	ballBd.allowSleep = false;
	ballBd.AddShape(ballSd);
	ballBd.position.Set(20,0);
	player.object = world.CreateBody(ballBd);
	
}

//<p> Inside <code>box2dutils.js</code>, we've created a function, called <code>createBox</code>. This creates a static rectangle body. </p> 


function handleKeyDown(evt){
	keys[evt.keyCode] = true;
}


function handleKeyUp(evt){
	keys[evt.keyCode] = false;
}

// disable vertical scrolling from arrows :)
document.onkeydown=function(){return event.keyCode!=38 && event.keyCode!=40}

function handleInteractions(){
	// up arrow
	// 1
	var collision = world.m_contactList;
	player.canJump = false;
	if (collision != null){
		if (collision.GetShape1().GetUserData() == 'player' || collision.GetShape2().GetUserData() == 'player'){
			if ((collision.GetShape1().GetUserData() == 'ground' || collision.GetShape2().GetUserData() == 'ground')){
				var playerPos = (collision.GetShape1().GetUserData() == 'player' ? collision.GetShape1().GetPosition() :  collision.GetShape2().GetPosition());
				var playerObj = (collision.GetShape1().GetUserData() == 'player' ? collision.GetShape1() :  collision.GetShape2());
				var groundPos = (collision.GetShape1().GetUserData() == 'ground' ? collision.GetShape1().GetPosition() :  collision.GetShape2().GetPosition());
				var groundObj = (collision.GetShape1().GetUserData() == 'ground' ? collision.GetShape1() :  collision.GetShape2());
				var playerBottomPos = playerPos.y + playerObj.m_radius;
				var groundTopPos = groundPos.y-groundObj.m_coreVertices[0].y;
				if (playerBottomPos < groundTopPos){
					player.canJump = true;
				}
			}
		}
	}


	var vel = player.object.GetLinearVelocity();

	var pos = player.object.GetCenterPosition();
	if (pos.y > canvasHeight) {
		vel.y = 0;
		vel.x = 0;
		pos.y = 0;
		pos.x = 20;
		//player.object.SetCenterPosition(20,0);
	} else if (pos.x > canvasWidth-50){
		win = true;
	}


	
	if (keys[13] && win){
		win = false;
		vel.y = 0;
		vel.x = 0;
		pos.y = 0;
		pos.x = 20;
	}

	if (keys[38] && player.canJump){
		vel.y = -250;	
	}
	
	// left/right arrows
	if (keys[37]){
		vel.x = -60;
	}
	else if (keys[39]){
		vel.x = 60;
	}
	
	player.object.SetLinearVelocity(vel);
}
function step() {
	
	var stepping = false;
	var timeStep = 1.0/60;
	var iteration = 1;
	handleMovingBoxes();
	handleInteractions();
	
	world.Step(timeStep, iteration);

	if (win){
		showWin();
	} else {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		drawWorld(world, ctx);
	}
	// 3
	setTimeout('step()', 10);
}

function handleMovingBoxes(){
    for (var i=0; i < 5; i++){
		var pos = boxes[i].body.GetCenterPosition();
		if(boxMovingUp[i]){
    		if (pos.y > 420){
				boxMovingUp[i] = false;
				boxes[i].joint.SetMotorSpeed(-30);
    		} else {
				boxes[i].joint.SetMotorSpeed(30);
    		}
		} else {
    		if (pos.y < 350){
    		    boxMovingUp[i] = true;
				boxes[i].joint.SetMotorSpeed(30);
    		} else {
				boxes[i].joint.SetMotorSpeed(-30);
    		} 
		}
    }
}

function showWin(){
	ctx.fillStyle    = '#000';
	ctx.font         = '24px verdana';
	ctx.textAlign    = 'center';
	ctx.fillText('You Win!', canvasWidth/2, canvasHeight/2-12);
	ctx.fillText('Press [enter] to restart.', canvasWidth/2, canvasHeight/2+12);
	return;
}
