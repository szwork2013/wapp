Winner.MainMenu = function(game){};
Winner.MainMenu.prototype = {
	create: function(){
		// display images
		this.add.sprite(0, 0, 'background');
		//this.add.sprite((Winner.GAME_WIDTH-445)/2, (Winner.GAME_HEIGHT-491)/2, 'intro');
		this.add.sprite(40, 20, 'title');
		// add the button that will start the game
		this.add.button((Winner.GAME_WIDTH-342)/2, Winner.GAME_HEIGHT-373, 'button-start', this.startGame, this, 1, 0, 2);
		this.add.button((Winner.GAME_WIDTH-342)/2, Winner.GAME_HEIGHT-258, 'skipBtn', skipGame, this, 1, 0, 2);
	},
	startGame: function() {
		// start the Game state
		this.state.start('Game');
	}
};
function skipGame(){
	resultDiv && resultDiv(200000, true)
}