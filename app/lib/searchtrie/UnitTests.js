'use strict';

const tests      = [];
const outputArea = $("#testResults");

function w(data){
	// write data to output area
	let ele = $("<div class='log-stat'>" + data + "</div>");
	outputArea.append(ele);
}


function define(suitename, fnc){
	tests.push({
		name: suitename,
		test: fnc
	});
};


function run(){

	var pass = 0;
	var fail = 0;

	w("Running all test suites...");
	for(let i = 0; i < tests.length; i++){
		let c = tests[i];
		w("Running suite: " + c.name);
		if( typeof c.test === "function" ){
			c.test() ? pass++ : fail++;
		}else{
			w("Suite's test is not a function, skipping.");
		}
	}

	w("FINISHED");
	w("Ran: " + tests.length);
	w("Passed: " + pass + "  Failed: " + fail);
};



// === DEFINE TESTS HERE =========================================
function benchmark(n, l){

	w("benchmark: n=" + n + " l=" + l);

	// Create basic search trie.
	let trie = new SearchTrie();
	let pr   = () => w("trie: ", trie.root); // prints root to console

	// -- Create list of words, add to trie.
	const WORD_COUNT  = n;
	const WORD_LENGTH = l;
	const POSSIBLE    = "abcdefghijklmnopqrstuvwxyz";
	let   words       = [];
	for(let i = 0; i < WORD_COUNT; i++){
		let word = "";
		for(let j = 0; j < WORD_LENGTH; j++){
			word += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
		}
		words.push(word);
		trie.addTerm(word);
	}

	pr();
	w("arr length: " + words.length);
	w("trie count: " + trie.size());

	// Average Search Time - Array
	let tot_array = 0;
	for(let i = 0; i < words.length; i++){
		let start   = performance.now();
		let found   = words.includes(words[i]);
		let end     = performance.now();
		let elapsed = end - start;
		tot_array += elapsed;
	}
	let avg_array = tot_array / words.length;
	w(" arr avg: " + avg_array + " ms");

	// Average Search Time - Trie
	let tot_trie = 0;
	for(let i = 0; i < words.length; i++){
		let start   = performance.now();
		let found   = trie.search(words[i]);
		let end     = performance.now();
		let elapsed = end - start;
		tot_trie += elapsed;
	}
	let avg_trie = tot_trie / words.length;
	w("trie ave: " + avg_trie + " ms");
}

define("basic", function(){

	try{

		let words =
		[ "cat"
		, "car"
		, "c"
		, "bee"
		, "be"
		];

		window.trie = new SearchTrie();
		for(let i = 0; i < words.length; i++){
			trie.addTerm(words[i], {text: words[i]});
		}

		w("The following words are searchable by the autoselect:");
		w(words.join(", "));

		// -- Set up autoselect
		const container = $("<div class='col-flex'></div>");
		container.css({
			position: "fixed",
			top: "16px",
			right: "16px"
		});

		const input = $("<input type='text' placeholder='search...'></input>");
		input.css({
			height: "24px",
			width: "128px",
			padding: "2px",
			borderRadius: "4px",
			border: "solid 1px gray"
		});

		const suggestions = $("<div></div>");
		suggestions.css({
			width: input.css("width"),
			position: "relative",
			display: "flex",
			justifyContent: "center",
			flexDirection: "column",
			height: "100px",
			backgroundColor: "peachpuff"
		});

		container.append(input);
		container.append(suggestions);
		$("body").append(container);

		let updateTerms = (searchTerm) => {
			$(suggestions).children(".suggestion").each(function(){
				$(this).remove();
			});
			if( searchTerm.length > 0 ){
				let found = trie.autocomplete(searchTerm);
				for(let i = 0; i < found.length; i++){
					let sug = $("<div class='suggestion'></div>");
					sug.text(found[i]);
					sug.css({
						height: "20px",
						width: "100%",
						color: "white",
						backgroundColor: "black"
					});
					$(suggestions).append(sug);
				}
			}
		};

		input.keyup(function(event){
			let val = $(this).val();
			updateTerms(val);
		});


		// === Get Words ===
		w(trie.root.getContainedWords().join(", "));
		// =================


	}catch(err){
		console.log(err);
		return false;
	}

	return true;
});
// ===============================================================




// DO NOT CHANGE BELOW THIS LINE
run();
