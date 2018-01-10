"use strict";

// SearchNode.js

function SearchNode(){
	this.key      = "";
	this.data     = {}; // the associated data, if any
	this.children = {}; // dictionary of children nodes
	this.endNode  = false; // boolean flag, indicating if this node is the
						   // end of a term
}
function SearchNode(key, data, end){
	this.key      = key;
	this.data     = data;
	this.end      = end;
	this.children = {};
}

SearchNode.prototype.isEnd = function(){
	// Returns true when this instance of SearchNode is an end
	// node, returns false otherwise.
	return this.end;
};
SearchNode.prototype.get = function(c){
	// Returns the associated child node with the key matching "c", if
	// any.  Returns false if no match is found.

	let found = this.children[c];
	if( found ){
		return found;
	}else{
		return false;
	}
};
SearchNode.prototype.addChild = function(node){
	// Adds data associated with given "key" to the children
	// of this node.  Fails if node with same key already
	// exists.  Returns true on success, false otherwise.

	let hasMatchingChild = this.get(node.key);
	if( hasMatchingChild ){
		return false;
	}

	this.children[node.key] = node;
	return this.children[node.key];
};
SearchNode.prototype.hasChildren = function(){
	// Returns true if this node has any children nodes.
	// Returns false otherwise.

	return this.getChildren().length > 0;
};
SearchNode.prototype.getChildren = function(){
	// Returns a list of this node's children nodes.

	let chrn  = this.children; // shorthand
	let nodes = []; // where children will be put upon
	for(let prop in chrn){
		if( chrn.hasOwnProperty(prop) ){
			let c = chrn[prop];
			if( SearchNode.prototype.isPrototypeOf(c) ){
				nodes.push(c);
			}
		}
	}

	return nodes;
};
SearchNode.prototype._getContainedWordsHelper = Object.freeze(function(prefix, words){
	// Recursively computes all words spawning from this node.
	// Finally returns the list built by the recursion (words).
	// Prefix - the string prefixing this node, if any.
	// Words  - the list of words found already.

	// let current = prefix + this.key;
	let current = prefix;
	if( this.key !== "ROOT" ){
		current += this.key;
	}

	// if this.isEnd()
	//  -> add current as a word to words
	if( this.isEnd() ){
		words.push(current);
	}

	// if children
	//  -> for all children:
	//  ->  -> recursive call passing current for prefix, and words as words
	// else (if NOT children)
	//  -> return words

	let childNodes = this.getChildren();
	if( childNodes.length > 0 ){
		for(let i = 0; i < childNodes.length; i++){
			let c = childNodes[i];
			c._getContainedWordsHelper(current, words);
		}
	}
});
SearchNode.prototype.getContainedWords = function(){
	let words = [];
	this._getContainedWordsHelper("", words);
	return words;
};


// SearchTrie.js

function SearchTrie(){
	// the value of "root" is a dictionary identical in function
	// to that of the "children" property of SearchNode objects.
	this.root = Object.freeze(new SearchNode("ROOT", null, false));
}
SearchTrie.prototype.search = function(term){

	// Searches the trie for the given term.
	// Returns the end node corresponding to term if it exists.
	// Otherwise, returns false.
	// NOTE: see "SearchTrie.prototype.addTerm" for similar algorithm, commented.

	// -- Param Error Checking
	if(typeof term !== "string"){
		throw new Error("Term must be a string.");
	}

	// -- Vars
	let char    = null;
	let letters = term.split("");
	let ctx     = this.root;

	// -- Lambdas
	let done    = ()  => typeof char === "undefined";
	let next    = ()  => letters.shift();
	let empty   = ()  => char === "";
	let isNode  = (x) => SearchNode.prototype.isPrototypeOf(x);

	// -- Main Loop
	letters.push("");
	do{
		char = next();
		if( empty() ){
			if( ctx.isEnd() ){
				return ctx;
			}
			else{
				return false;
			}
		}
		else{
			let found = ctx.get(char);
			if( isNode(found) ){
				ctx = found;
			}
			else{
				return false;
			}
		}
	}while( !done() );

};
SearchTrie.prototype.addTerm = function(term, payload){

	// Adds the given term to the search trie.  If term already exists,
	// operation fails.  Returns true on success, false otherwise.

	// -- Vars
	let char    = null;           // the character we're currently looking at
	let letters = term.split(""); // the list of letters in the term
	let ctx     = this.root;      // the node we're currently looking at

	// -- Lambdas
	let done    = ()  => typeof char === "undefined";
	let next    = ()  => letters.shift();
	let empty   = ()  => char === "";
	let isNode  = (x) => SearchNode.prototype.isPrototypeOf(x);
	let addNode = (n) => ctx.addChild(new SearchNode(n, null, false));

	// -- Main Loop
	letters.push(""); // add empty char at bottom of stack
	do{
		char = next(); // take next char from the stack
		if( empty() ){ // did we get the empty char?
			if( ctx.isEnd() ){ // ...empty? yes. Is the ctx an end node?
				return false; // ...end node? yes. Return false, cannot add already existing term.
			}
			else{ // ...empty? no.
				ctx.end  = true;    // mark ctx as an end node
				ctx.data = payload; // set the data of ctx to payload
				return true;        // return true, we successfully added the term.
			}
		}
		else{ // ...empty? no.
			let found = ctx.get(char); // look for a child of ctx with a key matching char
			if( isNode(found) ){ // did we find a node?
				ctx = found; // ...node? yes. Set the ctx to the found node.
			}
			else{ // ...node? no.
				ctx = addNode(char); // add a new node with a key of char, and set ctx to it
			}
		}
	}while( !done() );


	// NOTE: should always return from within the loop.
	// For added security, a loop limit could be set.  This puts a limit on the
	// length of characters in a given SearchTrie term, and could perhaps be set
	// as an environment variable for the script.
};
SearchTrie.prototype._sizeHelper = function(ctx){

	// Returns the total number of terms represented by this trie.

	// -- Main Loop
	let children    = ctx.children; // the children of the node we currently have
	let found       = [];           // the list of found children nodes
	for(let c in children){
		if( children.hasOwnProperty(c) ){
			found.push(children[c]); // add all children nodes to found
		}
	}

	if( found.length > 0 ){ // if any nodes were found
		return found.reduce((acc, n) => acc += this._sizeHelper(n), 0); // compute recursive count
	}
	else{
		if( this.root === ctx ){ // base case 1: ctx is the root, no children
			return 0; // return height of 0, this is an empty trie
		}
		else{ // base case 2: not the root, no children.
			return 1; // return 1, representing this leaf node
		}
	}
};
SearchTrie.prototype.size = function(){
	return this._sizeHelper(this.root);
};
SearchTrie.prototype.autocomplete = function(input){
	// Returns the list of words starting with input
	let words = [];
	let start = this._traverse(input);
	if( start ){
		start._getContainedWordsHelper(input.slice(0, -1), words);
	}
	return words;
};
SearchTrie.prototype._traverse = function(path){
	// Attempts to follow the root to the node at the last letter of the given
	// path.  Will return that node if it exists, otherwise false.

	let char    = null;
	let letters = path.split("");
	let ctx     = this.root;

	let done    = ()  => typeof char === "undefined";
	let next    = ()  => letters.shift();
	let empty   = ()  => char === "";
	let isNode  = (x) => SearchNode.prototype.isPrototypeOf(x);

	letters.push("");
	do{
		char = next();
		if( empty() ){
			return ctx;
		}
		else{
			// attempt to find node in children
			let found = ctx.get(char);
			if( found ){
				ctx = found;
			}
			else{
				return false;
			}
		}

	}while( !done() );
};

