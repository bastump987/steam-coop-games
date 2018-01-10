

const settings = Object.freeze(
{ STEAM_URL: "https://steamcommunity.com/search/users/#text="
, TEXTBOX_SEL: "#search_text_box"
, RESULT_SEL: ".search_row"
, INFO_SEL: "div.searchPersonaInfo > a.searchPersonaName"
, IMAGE_SEL: "div.avatarMedium > a > img"
, DS: ":~:"
});

const results = { username: "", profileUrl: "", imageUrl: "" };

var casper = require("casper").create();

var searchTerm = "";
if( casper.cli.args.length !== 1 ){
	casper.echo("Missing search term command-line arg, exiting.");
	casper.exit();
}else{
	searchTerm = casper.cli.args[0];
}


casper.start(settings.STEAM_URL, function(){
	this.waitForSelector(settings.TEXTBOX_SEL);
});

casper.then(function(){
	this.sendKeys(settings.TEXTBOX_SEL, searchTerm);
	this.sendKeys(settings.TEXTBOX_SEL, this.page.event.key.Enter);
	this.waitForSelector(settings.RESULT_SEL, null, function(){
		this.echo("No results for search term, exiting.");
		this.exit();
	});
});

// Get the username
casper.then(function(){
	results.username = this.evaluate(function(sel){
		return document.querySelector(sel).innerText;
	}, settings.INFO_SEL);
});

// Get the profile URL
casper.then(function(){
	results.profileUrl = this.evaluate(function(sel){
		return document.querySelector(sel).href;
	}, settings.INFO_SEL);
});

// Get the profile image URL
casper.then(function(){
	results.imageUrl = this.evaluate(function(sel){
		return document.querySelector(sel).src;
	}, settings.IMAGE_SEL);
});

// Finally, combine results and print to stdout, to be read by nodejs 
casper.then(function(){
	var DS   = settings.DS;
	var data = results.username + DS
		     + results.profileUrl + DS
		     + results.imageUrl;
	this.echo(data);
});

casper.run();
