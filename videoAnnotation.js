/*
 * Table of Contents - Organized by astrixed comment sections
 *		1. Youtube Video-Related Code
 *		2. Progressbar-related Code
 *		3. Commenting-related Code (includes accordion)
 *		4. Tick-related code
 *		5. jQuery(document).ready() 
 */

/*
 * 1. Youtube Video-Related Code
 */

// Update a particular HTML element with a new value
function updateHTML(elmId, value) {
	document.getElementById(elmId).innerHTML = value;
}

// This function is called when an error is thrown by the player
function onPlayerError(errorCode) {
	alert("An error occured of type:" + errorCode);
}

// This function is called when the player changes state
function onPlayerStateChange(newState) {
	updateHTML("playerState", newState);
}

// Display information about the current state of the player
function updatePlayerInfo() {
	// Also check that at least one function exists since when IE unloads the
	// page, it will destroy the SWF before clearing the interval.
	if(ytplayer && ytplayer.getDuration) {
		updateHTML("videoDuration", ytplayer.getDuration());
		updateHTML("videoCurrentTime", ytplayer.getCurrentTime());
		var percentage = 100*ytplayer.getCurrentTime()/ytplayer.getDuration();
		//$("#progressbar").progressbar("option","value", percentage);
		updateHTML("videoPercentage", percentage);
		updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
		updateHTML("startBytes", ytplayer.getVideoStartBytes());
		updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
		updateHTML("volume", ytplayer.getVolume());
	}
}
function updateProgressBar(){
	var percentage = 100*ytplayer.getCurrentTime()/ytplayer.getDuration();
	$("#progressbar").progressbar("option","value", percentage);
}

// Allow the user to set the volume from 0-100
function setVideoVolume() {
	var volume = parseInt(document.getElementById("volumeSetting").value);
	if(isNaN(volume) || volume < 0 || volume > 100) {
		alert("Please enter a valid volume between 0 and 100.");
	}
	else if(ytplayer){
		ytplayer.setVolume(volume);
	}
}

//when the div covering the video is clicked; syncs with the play/pause button
function videoClicked(){
	playORpause();
}
//when the play/pause button is clicked
function playORpause(){
	if ($(".playORpause").attr("src") == "images/play.png"){
		$(".playORpause").attr("src", "images/pause.png")
		playVideo();
	}else{
		$(".playORpause").attr("src", "images/play.png")
		pauseVideo();
	}
}

//when the mute/unmute button is clicked
function muteORunmute(){
	if ($(".muteORunmute").attr("src") == "images/mute.png"){
		$(".muteORunmute").attr("src", "images/volume_up.png")
		muteVideo();
	}else{
		$(".muteORunmute").attr("src", "images/mute.png")
		unMuteVideo();
	}
}

function playVideo() {
	if (ytplayer) {
		ytplayer.playVideo();
	}
}

function pauseVideo() {
	if (ytplayer) {
		ytplayer.pauseVideo();
	}
}

function muteVideo() {
	if(ytplayer) {
		ytplayer.mute();
	}
}

function unMuteVideo() {
	if(ytplayer) {
		ytplayer.unMute();
	}
}


// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
	ytplayer = document.getElementById("ytPlayer");

	//This hack is an attempt to eliminate the big red play button by default
	//it prevents the default play button from playing the video without changing my own play button
	//it also starts the loading of the video sooner
	window.setTimeout(function() {
		ytplayer.playVideo();
	    ytplayer.pauseVideo();
	}, 0);

	// This causes the updatePlayerInfo function to be called every 250ms to
	// get fresh data from the player
	setInterval(updateProgressBar, 1000);
	setInterval(updatePlayerInfo, 250);
	updatePlayerInfo();
	ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
	ytplayer.addEventListener("onError", "onPlayerError");
	//Load an initial video into the player
	ytplayer.cueVideoById("BCkfTCjF8SM");
}

// The "main method" of this sample. Called when someone clicks "Run".
function loadPlayer() {
	// Lets Flash from another domain call JavaScript
	var params = { allowScriptAccess: "always" };
	// The element id of the Flash embed
	var atts = { id: "ytPlayer" };
	// All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
	swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
						"version=3&enablejsapi=1&playerapiid=player1", 
						"videoDiv", "752", "423", "9", null, null, params, atts);
}
function _run() {
	loadPlayer();
	$("#progressbar").progressbar();
	$("#progressbar").progressbar("option","value",0);
}
google.setOnLoadCallback(_run);

/*
 * 2. Progressbar-related Code  
 */

function progressbar_click(mouseX){
	var percentage = mouseX/660;
	$("#progressbar").progressbar("option","value",percentage*100); //updates progressbar location
	var currentSec = percentage*ytplayer.getDuration();
	ytplayer.seekTo(currentSec, true); //updates ytplayer location in video
}

function updateProgressbar(){
	//update progressbar if clicked
   $("#progressbar").click(function(e){
		var parentOffset = $(this).parent().offset(); 
		//or $(this).offset(); if you really just want the current element's offset
		var relX = e.pageX - parentOffset.left;
		var relY = e.pageY - parentOffset.top;
		$('#offset').html(relX + ', ' + relY);
		progressbar_click(relX);
	});

}

/*
 * 3. Commenting-related Code
 */

var commentObj = [
					{"ID": 0,
					"text": "This is my first comment! This is frame is interesting since ...",
					"type" : "Comment",
					"viewer" : "Class",},
					{"ID": 1,
					"text": "Comment number 2!",
					"type" : "Comment",
					"viewer" : "Class",},
					{"ID": 2,
					"text": "Question number 1!",
					"type" : "Question",
					"viewer" : "Class",},
					{"ID": 3,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"type" : "Question",
					"viewer" : "Just Me"},
					{"ID": 4,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"type" : "Question",
					"viewer" : "Just Me"}
					];

function addInitialCommentHTML(){
	var html = "";
	for(var num = 0; num < commentObj.length; num++){
		var typeInitial = commentObj[num].type[0];
		var text = commentObj[num].text;
		var commentSnippet = text.substring(0,30);

		html += "<text>" + typeInitial + ": " + commentSnippet;
		if(text.length > 30){
			html += "...";
		}
		html +="</text><div>"+ text + "</div>";
	}
	
	console.log(html);
	$("#accordion").append(html);
}

function setupAccordion(){
	$("#accordion").accordion({ header: "text", 
								collapsible: true, 
								active: false, 
								heightStyle: "content"});
}

//shows the add new comment options
function show_addNewComment(){
	$(".commentsView_newComment").css("display", "");
}

//when the comment button is pushed
function comment_btn(){
	ytplayer.pauseVideo();
	show_addNewComment();
}

//when the submit button is pushed
function submitNewComment(){
	$(".commentsView_newComment").css("display", "none"); //show the div
	var text = $(".newCommentTextbox").val();
	var type = $('#comment_type').find(":selected").text();
	var viewer = $('#comment_viewer').find(":selected").text();
	commentObj.push({ "ID": commentObj.length,
						"text" : text,
						"type" : type,
						"viewer" : viewer});
	$(".newCommentTextbox").val(""); //empty textbox
	showNewComment();

}
//adds the new comment into the accordion
//extracts information from the commentObj
function showNewComment(){
	var num = commentObj.length-1;
	var typeInitial = commentObj[num].type[0];
	var text = commentObj[num].text;
	var commentSnippet = text.substring(0,30);

	var html = "<text>" + typeInitial + ": " + commentSnippet;
	if(text.length > 30){
		html += "...";
	}
	html +="</text><div>"+ text + "</div>";

	//var html = "<text>" + "New " +commentObj[commentNum-1].type + "</text><div>"+commentObj[commentNum-1].text + "</div>"; //add code here
	console.log(html);
	$("#accordion").append(html).accordion('destroy');
	setupAccordion();
}

/*
 *	4. Tick-related code
 */

 function addTicks(){
 	var arrayOfLocs= []
 }

/*
 *	5. jQuery(document).ready()
 */

jQuery(document).ready(function(){
   $(document).mousemove(function(e){
      $('#status').html(e.pageX +', '+ e.pageY);
   }); 

 	updateProgressbar();
 	addInitialCommentHTML();
	setupAccordion();
	addTicks();
})