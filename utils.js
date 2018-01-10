'use strict';


const DEBUGGING = true; // set to "false" to supress debugging messages
const spawn = require("child_process").spawn;

function dbg(object){
	if( DEBUGGING ){
		console.log(object);
	}
}

/*
var input  = "scenesix";
var steamsearch = spawn("casperjs", ["steamsearch.js", input]);

var response = "";
steamsearch.stdout.on("data", (data) => response += data);
steamsearch.on("close", (code) => {
	if(code === 0){
		console.log(response);
	}else{
		console.log("Something went wrong.  Exit code: ", code);
	}
});
//*/

function searchSteamName(input){

	const DS = ":~:";

	if( input ){

		// Call the casperjs script via spawn()
		var steamsearch = spawn("casperjs", ["steamsearch.js", input]);

		// Listen to stdout of casperjs, gather data in "response"
		var response = "";
		steamsearch.std.on("data", (data) => response += data);

		// If search script exits normally, handle the output
		steamsearch.on("close", (code) => {
			if( code === 0 ){
				// handle response
				let parts = response.split(DS);
				return
				{ username:   parts[0]
				, profileUrl: parts[1]
				, imageUrl:   parts[2]
				};
			}else{
				dbg("Something went wrong.  Exit code: " + code);
				return false;
			}
		});

	}else{
		return false;
	}

}
