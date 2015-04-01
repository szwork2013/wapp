var finalScore = 0;
var gameObj = null;

Winner.Game = function(game){
		
	this._candyGroup = null;
	this._spawnCandyTimer = 0;
	this._deltaScoreTimer = 0;
	this._fontStyle = null;
	this._timer = null;
	
	Winner._player = null;
	Winner._scoreText = null;
	Winner._deltaScore = null;
	Winner._time = 60;
	Winner._score = 0;

	Winner._gravityValue = 800;
};
Winner.Game.prototype = {
	create: function(){		
		gameObj = this;
		this.physics.startSystem(Phaser.Physics.ARCADE);		
		this.physics.arcade.gravity.y = Winner._gravityValue;
		
		this.add.sprite(0, 0, 'background1');
		this.add.sprite(-30, Winner.GAME_HEIGHT-166, 'floor');
		this.add.sprite(10, 5, 'score-bg');		
		this.add.button(Winner.GAME_WIDTH-96-10, 5, 'button-pause', this.managePause, this, 1, 0, 2);					

		this._fontStyle = { font: "30px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };	
		var scoreTextFontStyle= { font: "30px Arial", fill: "#24FF53", stroke: "#661414", strokeThickness: 5, align: "center" };														
		var deltaScoreFontStyle= { font: "80px Arial", fill: "#24FF53", stroke: "#661414", strokeThickness: 8, align: "center" };																
		
		Winner._time = this.add.text(10, 115, "剩余时间:", this._fontStyle);
		Winner._scoreText = this.add.text(150, 35, "0", scoreTextFontStyle);
		Winner._deltaScore = this.add.text(300, 150, "", deltaScoreFontStyle);

		this._spawnCandyTimer = 0;
		this._deltaScoreTimer = 0;
		
		this._candyGroup = this.add.group();		
		Winner.item.spawnCandy(this);

		Winner._player = this.add.sprite(5, 600, 'monster-idle');
		Winner._player.checkWorldBounds = true; 
		this.physics.enable(Winner._player, Phaser.Physics.ARCADE);

		Winner._player.body.gravity.y = -Winner._gravityValue;
		// Winner._player.body.velocity.x = 500;
		
		Winner._player.animations.add('right', [0, 1, 2, 3, 4, 5], 10, true);
    	Winner._player.animations.add('left', [6, 7, 8, 9, 10, 11], 10, true);
    	Winner._player.animations.add('rightStop', [1], 10, true);
    	Winner._player.animations.add('leftStop', [7], 10, true);

		this._timer = this.time.create(false);
		this._timer.start();

		this.input.onDown.add(function(){
			if(this.input.x > 0 && this.input.x < Winner.GAME_WIDTH/2){
				this.moveLeft();
			} else if(this.input.x>Winner.GAME_WIDTH/2 && this.input.x < Winner.GAME_WIDTH){
				this.moveRight();
			}
		}, this);

		this.input.onUp.add(function(){
			this.stopPlayer();
		}, this);

		var leftBtn = this.add.button(20, Winner.GAME_HEIGHT-85, 'arrow-left', this.moveLeft, this, 1, 0, 2);
		var rightBtn = this.add.button(Winner.GAME_WIDTH-139, Winner.GAME_HEIGHT-85, 'arrow-right', this.moveRight, this, 1, 0, 2);		
		
		leftBtn.inputEnabled = true;		
		leftBtn.events.onInputDown.add(this.moveLeft, this);
		leftBtn.events.onInputUp.add(this.stopPlayer, this);

		rightBtn.inputEnabled = true;		
		rightBtn.events.onInputDown.add(this.moveRight, this);
		rightBtn.events.onInputUp.add(this.stopPlayer, this);
	},
	managePause: function(){		
		this.game.paused = true;		
		var pausedText = this.add.text(200, 250, "已暂停\n点击任意位置继续", this._fontStyle);
		
		this.input.onDown.add(function(){			
			pausedText.destroy();			
			this.game.paused = false;
		}, this);
	},
	moveLeft:function(){
		Winner._player.body.velocity.x = -700;
		Winner._player.animations.play('left');
	},
	moveRight:function(){
		Winner._player.body.velocity.x = 700;
		Winner._player.animations.play('right');
	},
	stopPlayer:function(){
		if(Winner._player.body.velocity.x<0){
			Winner._player.animations.play('leftStop');
		} else {
			Winner._player.animations.play('rightStop');
		}
		Winner._player.body.velocity.x = 0;
	},
	update: function(){
		//设置人物左右不出界面
		if(Winner._player.body.x<=0){
			Winner._player.body.x=0;
			// Winner._player.body.velocity.x = 500;
		} else if(Winner._player.body.x>=Winner.GAME_WIDTH-229) {
			Winner._player.body.x=Winner.GAME_WIDTH-229;
			// Winner._player.body.velocity.x = -500;
		}

		this._spawnCandyTimer += this.time.elapsed;
		this._deltaScoreTimer += this.time.elapsed;
		
		if(this._spawnCandyTimer > 200) {			
			this._spawnCandyTimer = 0;		
			Winner.item.spawnCandy(this);
		}

		if(this._deltaScoreTimer>1000){
			this._deltaScoreTimer = 0;
			Winner._deltaScore.setText("");
		}

		this._candyGroup.forEachExists(function(candy){			
			candy.angle += candy.rotateMe;
			if(candy.overlap(Winner._player)){	
				Winner._scoreText.setText(finalScore += parseInt(candy.name));	
				Winner._deltaScore.setText("+ " + candy.name);			
				candy.kill();
			}
		});
		
		Winner._time.setText("剩余时间: " + (30-Math.floor(this._timer.seconds)) + " 秒");		

		//每5秒重力提升一次
		var nowGravity = (Math.floor(this._timer.seconds/5) + 3) * Winner._gravityValue;
		this.physics.arcade.gravity.y = nowGravity;
		Winner._player.body.gravity.y = -nowGravity;

		if(this._timer.seconds>30) {			
			this.add.sprite((Winner.GAME_WIDTH-493)/2, (Winner.GAME_HEIGHT-271)/2, 'gameover');			
			this.game.paused = true;
			gameOver(finalScore)
		}
	}
};

Winner.item = {
	spawnCandy: function(game){		
		var dropPos = Math.floor(Math.random()*Winner.GAME_WIDTH);

		if(dropPos<10){
			dropPos = 10;
		} else if(dropPos>Winner.GAME_WIDTH-145){
			dropPos = Winner.GAME_WIDTH-145;
		}
		
		var dropOffset = [-27,-36,-48];		
		
		//设置0、1的概率为40%，2的概率为20%
		var randomNum = Math.floor(Math.random()*100);
		var candyType = 0;
		if(randomNum<=10){
			candyType = 0;
		} else if(randomNum>10 && randomNum<35){
			candyType = 1;
		} else if(randomNum>=35){
			candyType = 2;
		}

		var candy = game.add.sprite(dropPos, dropOffset[candyType], 'candy');

		if(candyType == 0){
	        candy.name="10000";
		}else if(candyType == 1){
	        candy.name="5000";
		} else {
	        candy.name="1000";
		}	
		
		//出现不同金额的金币
		candy.animations.add('anim', [candyType], 10, true);		
		candy.animations.play('anim');
		
		game.physics.enable(candy, Phaser.Physics.ARCADE);		
		
		candy.checkWorldBounds = true;	
		candy.outOfBoundsKill = true;
		
		candy.anchor.setTo(0.5, 0.5);		
		candy.rotateMe = (Math.random()*4)-2;
		
		game._candyGroup.add(candy);
	}
};

function gameOver(score){
	gameOverCallBack && gameOverCallBack(score)
}

function restartGame(){
	gameObj.state.start('Game');
}
