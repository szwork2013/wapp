var Winner = {};
Winner.Boot = function(game){};
Winner.Boot.prototype = {
	preload: function(){
		// preload the loading indicator first before anything else
		this.load.image('preloaderBar', '/static/winner_skin/imgs/loading-bar.png');
		this.load.image('preloaderBarBg', '/static/winner_skin/imgs/loading-bar-bg.png');
		this.load.image('background', '/static/winner_skin/imgs/background.png');
		this.load.image('title', '/static/winner_skin/imgs/title.png');
	},
	create: function(){
		// set scale options
		this.input.maxPointers = 1;
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.setScreenSize(true);
		// start the Preloader state
		this.state.start('Preloader');
	}
};