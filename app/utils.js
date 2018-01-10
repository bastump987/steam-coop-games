'use strict';


const DEBUGGING = true; // set to "false" to supress debugging messages
const spawn = require("child_process").spawn;

function dbg(object){
	if( DEBUGGING ){
		console.log(object);
	}
}
module.exports.dbg = dbg;


function searchSteam(input, callback){

	const DS = ":~:";

	if( input ){

		// Call the casperjs script via spawn()
		var steamsearch = spawn("casperjs", ["./steamsearch.js", input]);

		// Listen to stdout of casperjs, gather data in "response"
		var response = "";
		steamsearch.stdout.on("data", (data) => response += data);

		// If search script exits normally, handle the output
		steamsearch.on("close", (code) => {
			if( code === 0 ){
				// handle response
				let parts = response.split(DS);
				let result = {
					username:   parts[0],
					profileUrl: parts[1],
					imageUrl:   parts[2],
				};
				callback(result);
			}else{
				dbg("Something went wrong.  Exit code: " + code);
				callback(false);
			}
		});

	}else{
		callback(false);
	}
}
module.exports.searchSteam = searchSteam;
