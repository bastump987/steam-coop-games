$(function(){

	// Register ENTER keypress on search box
	const searchbox = $("#searchbox");
	searchbox.on("keydown", function(event){
		if( event.keyCode === 13 ){

			let searchTerm = $(this).val();
			let reqUrl     = window.location.href + "search";

			// send post request to server to search for user
			$.post(reqUrl, { searchTerm: searchTerm }, (data) => {
				
				// create an img element
				let img = $("<img></img>");
				img.prop("src", data.imageUrl);

				// add img element to results area
				$("#dbg-results").append(img);
			});
		}
	});


});
