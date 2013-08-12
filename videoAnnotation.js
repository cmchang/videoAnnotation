/*
 * Table of Contents - Organized by astrixed comment sections
 *		1. Youtube Video-Related Code
 *		2. Progressbar-related Code
 *		3. Commenting-related Code (includes accordion)
 *		4. Drag Range-related Code
 *		5. Zoom on ticks-related Code
 *		6. Draw Rectangle-related Code
 *		7. Tick-related code
 *		8. jQuery(document).ready() 
 *				-includes: updateProgressbar(), addAllCommentHTML(), setupAccordion(), isHoveringOverComments()
 *		9. Keyboard Shortcuts
 *		10. Alert-related code
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

var createTicks = true; //Dsan
// Display information about the current state of the player
// It’s called every 250 milliseconds in onYoutubePlayerReady()
function updatePlayerInfo() {
	// Also check that at least one function exists since when IE unloads the
	// page, it will destroy the SWF before clearing the interval.
	if(ytplayer && ytplayer.getDuration) {
		updateHTML("videoDuration", ytplayer.getDuration());
		updateHTML("videoCurrentTime", ytplayer.getCurrentTime());
		var percentage = 100*ytplayer.getCurrentTime()/ytplayer.getDuration();
		updateHTML("videoPercentage", percentage);
		updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
		updateHTML("startBytes", ytplayer.getVideoStartBytes());
		updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
		updateHTML("volume", ytplayer.getVolume());
		updateHTML("videoCurrentTimeMinSec", ytplayer.getCurrentTime());
		updateHTML("videoTimeDisplay", calculateTime(ytplayer.getCurrentTime())); //seen under progressbar
		updateHTML("videoTotalTimeDisplay", calculateTime(ytplayer.getDuration()));
		openCommentSyncVideo(); //syncs opening the comments with the video
		commentAutoScroll(); //Automatically scrolls to correct comment
		highlightTick();

		//this makes sure the ticks are only created AFTER ytplayer is created so we can use .getDuration()
		if(createTicks && ytplayer.getDuration() > 0){ //Dsan
			createTicks = false;
			addAllTicks();

		}
	}
}

//give the time in seconds, return the time as a string with (hours:)minutes:seconds
function calculateTime(givenTime){
	var totalSec = parseInt(givenTime);
	var hours = 0;
	if (totalSec >= 3600){
		hours = parseInt(totalSec/3600);
		totalSec -= hours*3600;
	}
	var minutes = 0;
	if(totalSec >= 60){
		minutes = parseInt(totalSec/60);
		totalSec -= minutes*60;
	}
	var display = "";
	if(hours > 0){
		display += hours + ":";
	}
	if(hours > 0 && minutes <10){
		display += "0" + minutes + ":";
	}else{
		display += minutes + ":";
	}
	if (totalSec < 10){
		display+= "0" + totalSec;
	}else{
		display+= totalSec;
	}
	return display;
}

// Given the time as a string, return the time as a number of seconds
function calcualateTime_stringToNum(timeStr){
	var seconds = parseInt(timeStr.substring(timeStr.length-2, timeStr.length)); //gets seconds
	timeStr = timeStr.substring(0, timeStr.length-3); //gets rid of the seconds portion of string
	var minutes, hours = 0;
	if (timeStr.length == 1 || timeStr.length == 2){
		minutes = parseInt(timeStr);
	}else{//if the video has hours
		minutes = parseInt(timeStr.substring(timeStr.length-2, timeStr.length));
		timeStr = timeStr.substring(0, timeStr.length-3); //gets rid of the seconds portion of string
		hours = parseInt(timeStr);
	}

	var totalSeconds = hours*3600 + minutes*60 + seconds;
	return totalSeconds;	
}

// This function is called every 500 milliseconds
// It gets the current time from the youtube player and adjusts the progressbar_filler to match to the corresponding time
function updateProgressbar(){
	var percentage = 100*ytplayer.getCurrentTime()/ytplayer.getDuration();
	$("#progressbar_filler").css("width", percentage+"%");
} 

// Allow the user to set the volume from 0-100 (feature is currently hidden)
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

// called when the play/pause button is clicked
// syncs the correct image with the action
function playORpause(){
	if ($(".playORpause").attr("src") == "images/play.png"){
		$(".playORpause").attr("src", "images/pause.png")
		playVideo();
	}else{
		$(".playORpause").attr("src", "images/play.png")
		pauseVideo();
	}
}

// called when the mute/unmute button is clicked
// syncs the correct image with the actionfunction muteORunmute(){
	if ($(".muteORunmute").attr("src") == "images/volume_up.png"){
		$(".muteORunmute").attr("src", "images/mute.png")
		muteVideo();
	}else{
		$(".muteORunmute").attr("src", "images/volume_up.png")
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
		$(".playORpause").attr("src", "images/play.png");
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
	setInterval(updateProgressbar, 1000);
	setInterval(updatePlayerInfo, 250);
	updatePlayerInfo();		
	ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
	ytplayer.addEventListener("onError", "onPlayerError");
	//Load an initial video into the player
	ytplayer.cueVideoById("HtSuA80QTyo");
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
}
google.setOnLoadCallback(_run);

//given the time in seconds, goes to corresponding time in the video
function goToTime(seconds){
	ytplayer.seekTo(seconds,true);
}

/*
 * 2. Progressbar-related Code  
 */

//update the time of the ytplayer given the mouse x-location
function progressbar_click(mouseX){
	var percentage = mouseX/$("#progressbar").width();  
	//console.log(percentage);
	$("#progressbar_filler").css("width", percentage*100 + "%"); //updates progressbar location
	var currentSec = percentage*ytplayer.getDuration();

	//updates ytplayer location in video
	ytplayer.seekTo(currentSec, true); 
}

//If progressbar is clicked (mouseup), calculate the position of the mouse relative to the progressbar
function updateProgressbarClick(){
	//update progressbar if clicked
   $("#progressbar").mouseup(function(e){
		var parentOffset = $(this).parent().offset(); 
		//or $(this).offset(); if you really just want the current element's offset
		var relX = e.pageX - parentOffset.left;
		var relY = e.pageY - parentOffset.top;
		$('#offset').html(relX + ', ' + relY);
		progressbar_click(relX);
	});
}

//returns the pixel value of the parent left offset
function progressbarOffsetX(){
	return $("#progressbar").parent().offset().left; //progressbar x offset
}

/*
 * 3. Commenting-related Code
 */

// the array of objects the stores all the information for every comment
// drawArr: an object with the information of the drawn rect {leftPos, rightPos, width, height}; or "None" if no rect drawn
// ID: number assigned in order of when comment is made (Starting at 0)
// timeEndSec: the end time in seconds at which the comment refers to; else “None”
// timeEndSecStr: the time as a string (in minute:second format) at which the comment refers to; else “None”
// timeSec: the time in seconds at which the comment refers to
// timeStr: the time as a string (in minute:second format) at which the comment refers to
// text: the body text of the comment
// type: the selected type - either Comment or Question
// userName: the ID of the student or person commenting
// viewer: who the student selected can view the comment (currently no functionality with it)
var commentObj = [
					{"drawArr": "None",
					"ID": 0,
					"text": "This is my first comment! This is frame is interesting since ...",
					"timeEndSec": 164,
					"timeEndStr": "2:44",
					"timeSec" : 158, 
					"timeStr" : "2:38",
					"type" : "Comment",
					"userName": "User1",
					"viewer" : "Class",},
					{"drawArr": "None",
					"ID": 1,
					"text": "Comment number 2!",
					"timeEndSec": 42,
					"timeEndStr": "2:48",
					"timeSec" : 38, 
					"timeStr" : "0:38",
					"type" : "Comment",
					"userName": "User2",
					"viewer" : "Class",},
					{"drawArr": {posX: 78.00284099578857, posY: 157, width: 522, height: 47},
					"ID": 2,
					"text": "Question number 1!",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 8, 
					"timeStr" : "0:08",
					"type" : "Question",
					"userName": "User3",
					"viewer" : "Class",},
					{"drawArr": "None",
					"ID": 3,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": 192,
					"timeEndStr": "3:12",
					"timeSec" : 191, 
					"timeStr" : "3:11",
					"type" : "Question",
					"userName": "User4",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 4,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": 218,
					"timeEndStr": "3:38",
					"timeSec" : 214, 
					"timeStr" : "3:34",
					"type" : "Question",
					"userName": "User5",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 5,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 2, 
					"timeStr" : "0:02",
					"type" : "Comment",
					"userName": "User6",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 6,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": 15,
					"timeEndStr": "0:20",
					"timeSec" : 5, 
					"timeStr" : "0:05",
					"type" : "Question",
					"userName": "User7",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 7,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 25, 
					"timeStr" : "0:25",
					"type" : "Comment",
					"userName": "User8",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 8,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 30, 
					"timeStr" : "0:30",
					"type" : "Comment",
					"userName": "User9",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 9,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 35, 
					"timeStr" : "0:35",
					"type" : "Comment",
					"userName": "User10",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 10,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 40, 
					"timeStr" : "0:40",
					"type" : "Comment",
					"userName": "User11",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 11,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 45, 
					"timeStr" : "0:45",
					"type" : "Comment",
					"userName": "User12",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 12,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 50, 
					"timeStr" : "0:50",
					"type" : "Comment",
					"userName": "User13",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 13,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" :55, 
					"timeStr" : "0:55",
					"type" : "Comment",
					"userName": "User14",
					"viewer" : "Just Me"},
					{"drawArr": "None",
					"ID": 14,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 60, 
					"timeStr" : "1:00",
					"type" : "Comment",
					"userName": "User15",
					"viewer" : "Just Me"}
];

//this function calls the necessary functions to display all the comments:
//it calls SortsCommentObj, addAllCommentHTML, and setupAccordion
function setup_commentDisplay(){
	sortCommentObj();
	addAllCommentHTML();
	setupAccordion();
}

//This function sorts the commentObj array by the timeSec so we can later display the comments in order
function sortCommentObj(){
	function compare(a,b) {
		if (a.timeSec < b.timeSec)
			return -1;
		if (a.timeSec > b.timeSec)
			return 1;
	return 0;
	}

	commentObj.sort(compare);
}

//Given the array index, this function gets the stored text and wraps it in HTML to be put into accordion
//called in addAllCommentHTML(), showNewComment()
//html format:
//	<text>Header Content</text>
//	<div>
//		<span>Time here</span>
//		<p>Comment Text</p>
//	</div>
function extractCommentHTML(num){
	var typeInitial = commentObj[num].type[0];
	var text = commentObj[num].text;
	var commentSnippet = text.substring(0,30);
	var timeStr = commentObj[num].timeStr;
	var iconHTML = "";
	if(typeInitial == "C"){
		iconHTML = "<i class='icon-comment'></i>";
	}else if(typeInitial == "Q"){
		iconHTML = "<i class='icon-question-sign'></i>";
	}
	if(commentObj[num].drawArr != "None"){
		iconHTML += "<i class='icon-picture'></i>";
	}
	var headerHTML = "<text>" + iconHTML + ": " + commentSnippet;
	if(text.length > 30){ //if the text is too long, only show a portion of it
		headerHTML += "...";
	}
	headerHTML +="</text>";

	var contentHTML = "<div>";
	var timeHTML = "<span id = 'commentTimeShow' onclick = 'goToComment(" + num + ")' >Time: " +timeStr +"  </span>";
	var textHTML = "<p>"+ text +"</p>";
	contentHTML += timeHTML + textHTML + "</div>";

	var html = headerHTML + contentHTML;

	return html;
}

//goes in a for loop to add all of the objects to the accordion section of the html
function addAllCommentHTML(){
	var html = "";
	for(var num = 0; num < commentObj.length; num++){
		var htmlSection = extractCommentHTML(num);
		html += htmlSection;
	}
	$("#accordion").append(html);
}

//Given the comment index (for commentObj), go to the time in the video associated to the comment
//show rectangle if exists or hide rectangle if none
function goToComment(index){
	goToTime(commentObj[index].timeSec);
	if(commentObj[index].drawArr != "None"){
		changeRectCSS(commentObj[index].drawArr.posX, commentObj[index].drawArr.posY, commentObj[index].drawArr.width, commentObj[index].drawArr.height);
		$("#drawnRect").show();
	}else{
		hideDrawnRect();
	}
}

//sets up the accordion with correct options
function setupAccordion(){
	$("#accordion").accordion({ header: "text", //selects type of element to be recognized as the 'header'
								collapsible: true, //allows all the panels to be collapsesd at the same time
								active: false, //initially none of the panels are selected- all starts closed
								heightStyle: "content"}); //each content panel adjusts its height to its own content
}

//shows the comment editor
function show_addNewComment(){
	var currentSec = ytplayer.getCurrentTime();
	shrinkCommentHolder();
	$(".commentsView_newComment").css("display", "");
	if(!timeEndFocused){
		$("#comment_time").val(calculateTime(currentSec));
	}
	$(".newCommentTextbox").focus();
	showRangeTick(currentSec);
}
//hides the comment editor
function hide_addNewComment(){
	normalSizeCommentHolder();
	$(".commentsView_newComment").css("display", "None");
	$("#newCommentTime").val("");
	$("#comment_timeEnd").val("");
	$(".newCommentTextbox").val("");
	$(".newCommentTextbox").focusout();
	timeEndFocused = false;
	hideRangeTick();
	hideDrawnRect();

}

//Called when the showing the comment editor to adjust the div height
function shrinkCommentHolder(){
	$(".commentsView_holder").css("height", "279px");
}

//Called when the no longer showing the new comment to adjust the div height
function normalSizeCommentHolder(){
	$(".commentsView_holder").css("height", "444px");
}

//Called when the comment button is pushed
function comment_btn(){
	pauseVideo();
	show_addNewComment();
}

//Called when the submit button is pushed
function submitNewComment(){
	normalSizeCommentHolder();
	var text = $(".newCommentTextbox").val();
	var type = $('#comment_type').find(":selected").text();
	var viewer = $('#comment_viewer').find(":selected").text();
	var timeStr = $('#comment_time').val();
	var timeEndStr = $('#comment_timeEnd').val();
	var timeEnd;
	if(timeEndStr == "" || timeStr == timeEndStr){
		timeEnd = "None";
		timeEndStr = "None";
	}else{
		timeEnd = calcualateTime_stringToNum(timeEndStr);
	}
	commentObj.push({ "drawArr": extractRectInfo(),
						"ID": commentObj.length,
						"text" : text,
						"timeEndSec": timeEnd,
						"timeEndStr": timeEndStr,
						"timeSec" : calcualateTime_stringToNum(timeStr),
						"timeStr" : timeStr,
						"type" : type,
						"userName": "You",
						"viewer" : viewer});
	$(".newCommentTextbox").val(""); //empty textbox
	//order matters for the next few functions!
	addAllTicks();
	hide_addNewComment();
	goToComment(commentObj.length-1);
	showNewComment();
}

//gets rid of accordion and gets rid of the html
//extracts information from the commentObj
//calls setup_commentDisplay to inject new HTML and setup new accordion
function showNewComment(){
	$("#accordion").accordion('destroy');
	$("#accordion").html("");
	setup_commentDisplay();
}

//An array to hold all the seconds at which there are comments
//Necessary to sync video with opening the corresponding comment if at correct time
var timeSecArray = [];
function createTimeSecArray(){
	timeSecArray = [];
	for (var i in commentObj){
		timeSecArray.push(commentObj[i].timeSec);
	}
}

//open the comment in accordion if at the correct time at video
function openCommentSyncVideo(){
	createTimeSecArray();
	var currentTime = parseInt(ytplayer.getCurrentTime());
	var indexOfArr = timeSecArray.indexOf(currentTime);
	if(!isHoveringOver){
		if(indexOfArr>-1){ //executes if currentTime is a time in the array
			$( "#accordion" ).accordion({ active: indexOfArr });
		}
	}
}

// Automatically keeps the current comment in view wihin the comment container
function commentAutoScroll(){ //Dsan
	createTimeSecArray();
	var currentTime = parseInt(ytplayer.getCurrentTime());
	var indexOfArr = timeSecArray.indexOf(currentTime);
	var commentID = "#ui-accordion-accordion-header-" + indexOfArr;

	var container = $('.commentsView_holder'),
    scrollTo = $(commentID);

	if (indexOfArr > -1){
		container.animate({"opacity": 1}, 500, function(){
			/*container.scrollTop(
			    scrollTo.offset().top - container.offset().top + container.scrollTop()
			);*/

			// Or you can animate the scrolling:

			container.animate({
			    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
			}, 500);
		})
		
	
		// Or you can animate the scrolling:

		/*container.animate({
		    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
		}, 1000);*/

	}
}


//this function sets a boolean depending if the mouse is hovering over the .commentsView_holder div
var isHoveringOver = false;
function isHoveringOverComments(){
	$(".commentsView_holder").mouseenter(function(){
		isHoveringOver = true;
	}).mouseleave(function(){
		isHoveringOver = false;
	});
}

//given ID, get Index of placement in commentObj array
function IDtoIndex(ID){
	for(var x = 0; x < commentObj.length; x++){
		if(commentObj[x].ID == ID){
			return x;
		}
	}
	return false;
}

//Booleans indicating if the timeStart or timeEnd input box is focused -- interacts with dragRangeOn
//setupTimeFocus assigns correct values to booleans depending on action
var timeStartFocused = false;
var timeEndFocused = false;
function setupTimeFocus(){
	$("#comment_timeEnd").focus(function(){
									timeEndFocused = true;
									timeStartFocused = false;
									});
	$("#comment_time").focus(function(){
									timeEndFocused = false;
									timeStartFocused = true;	
									});
}

//Boolean indicating if the main textbox in the comment editor is focused
//setupTextboxFocus assigns the correct values to boolean depending on action
var textboxFocused = false;
function setupTextboxFocus(){
	$(".newCommentTextbox").focus(function(){textboxFocused = true;});
	$(".newCommentTextbox").focusout(function(){textboxFocused = false;});

}

/*
 *	4. Drag Range-related code
 */

//given "this" (i.e. the progressbar), the function will calculate the mouse position and then convert it to seconds relative to the progress bar
function mouseXtoSec(This, e){
	var relX = getRelMouseX(This,e);
	var percentage = relX/$("#progressbar").width();
	return percentage*ytplayer.getDuration();
}

//given "this" (i.e. the progressbar), the function will calculate the mouse position relative to "this"
//So it will give you the xLoc of the mouse of the progressbar with 0 being at the left border of the progressbar
	var parentOffset = $(This).parent().offset(); 
	var relX = e.pageX - parentOffset.left;
	return relX;
}


//These variables should ONLY be used for functions related to dragRange 
var startDragX; //relative to progressbar
var dragWidth; //whenever the tick is adjusted, this needs to be adjusted as well
var drag_mouseup = true; //important when calculating the width of the dragtick
var dragCurrentSec; //the time when the drag initially starts

//this function controls when the mouse is clicked in unclicked over the progressbar
//this function creates the the tick under the progressbar and gives it the left position
//the width of the tick is controlled under document.ready() in the mousemove function
var startDragX; //relative to the page!
var startZoomX;	//Dsan
var dragWidth;
var drag_mouseup = true; //important when calculating the width of the dragtick
var zoom_mouseup = true; //Dsan
var dragCurrentSec;
function dragRangeOn(){
	$("#progressbar").mousedown(function(e){
		if(!timeStartFocused){
			if (!timeEndFocused){
				startDragX = mouseX - progressbarOffsetX();
				drag_mouseup = false; 
				dragCurrentSec = mouseXtoSec(this, e);
				if($(".commentsView_newComment").css("display") != "none"){
					showToolTip(dragCurrentSec);
					comment_btn();
					showRangeTick(dragCurrentSec);
				}
			}
		}

	});
	$("#progressbar").mouseup(function(e){
		drag_mouseup = true;
		var currentSec = mouseXtoSec(this, e);
		hideToolTipDelay();
		if(timeEndFocused){ //if the timeEnd input is focused, adjust tick width on this click
			$("#comment_timeEnd").val(calculateTime(currentSec));
			timeEndFocused_adjustTickWidth(this,e);
			
		}else if(timeStartFocused){//if the timeStart inpus is focused, adjust the tick location and width on this click
			timeStartFocused_adjustTick(this, e);

		}else{
			if($("#comment_time").val() == calculateTime(currentSec)){ //if the two time entries are the same when clicking on progressbar, only print the time in the first time value box (creates a single tick)
				if (!timeStartFocused){//only the clear it if dragging - if user just wants to change the starting time don't clear
					$("#comment_timeEnd").val("");
				}
			}else{
				$("#comment_timeEnd").val(calculateTime(currentSec));
			}
		}

		timeStartFocused = false;
		timeEndFocused = false;
	});

}

var zoomDragging = false;
var zoomInitResizing = false;
var zoomResizing = false;

function zoomRangeOn(){ //Dsan
	/*if (zoom_mouseup){*/
		$(".tickmark_holder").mousedown(function(e){
			console.log("tickmar_holder mousedown");
			if(!timeStartFocused){
				if (drag_on && !timeEndFocused && !zoomDragging ){
					console.log("zoomTick should show")
					startZoomX = mouseX - progressbarOffsetX();
					zoom_mouseup = false; 
					var currentSec = mouseXtoSec(this, e);
					comment_btn();

					// $("#comment_time").val(calculateTime(currentSec));
					enlargedTimeStart = currentSec;
					$(".enlargedTickStart").html(calculateTime(enlargedTimeStart));
					var tickLoc = calculateTickLoc(currentSec);
					var tickLocStr = tickLoc.toString() + "px";
					
					$("#zoomTick").css("left", tickLocStr);
					$("#zoomTick").css("width", "2px")
					$("#zoomTick").show();
					$("#zoomTick .rightTooltipDiv").show();
					$("#zoomTick .rightTooltipDiv").tooltip({animation: false, title: calculateTime(currentSec)});	
					$("#zoomTick .rightTooltipDiv").tooltip('show');
				}
			}
		});
	/*}else if (!zoom_mouseup){*/
		$(".tickmark_holder").mouseup(function(e){
			if(drag_on){
				zoom_mouseup = true;
				var currentSec = mouseXtoSec(this, e);
				enlargedTimeEnd = currentSec;
				$(".enlargedTickEnd").html(calculateTime(enlargedTimeEnd));
				$(".enlargedTickBar").html("");
				function hideToolTip(){
					$("#zoomTick .tooltip").animate({"opacity": 0}, 250, function(){
						$("#zoomTick .rightTooltipDiv").tooltip('destroy');
					});
				}

				$(".zoomTickContent").draggable({axis: "x", containment: ".tickmark_holder"});
				$(".leftZoomAdjust").draggable({axis: "x"});
				$(".rightZoomAdjust").draggable({axis: "x"});
				
				window.setTimeout(hideToolTip, 1500);

				// appends ticks to the enlarged tick bar
				addEnlargedTicks();
			}
		});
	/*}*/
	
}

//if the text is changed in the time input box, update the tick to the corresponding position
function time_updateTickRange(){
	$("#comment_time").change(function(){
		var timeStart = calcualateTime_stringToNum($("#comment_time").val());
		startDragX = calculateTickLoc(timeStart);
		if($("#comment_time").val() != ""){
			$("#rangeTick").css("left", startDragX);
			goToTime(timeStart);
		}
		if($("#comment_timeEnd").val() != ""){
			var timeEnd = calcualateTime_stringToNum($("#comment_timeEnd").val());
			var endDragX = calculateTickLoc(timeEnd);
			dragWidth = endDragX - startDragX;
			var widthStr = dragWidth.toString() + "px";
			$("#rangeTick").css("width", widthStr);
		}
		timeStartFocused = false;
	})
}

//if the text is changed in the time input box, update the tick to the corresponding position
function timeEnd_updateTickRange(){
	$("#comment_timeEnd").change(function(){
		if($("#comment_timeEnd").val() != ""){
			var timeStart = calcualateTime_stringToNum($("#comment_time").val());
			var timeEnd = calcualateTime_stringToNum($("#comment_timeEnd").val());
			var timeDiff = timeEnd - timeStart;
			var ratio = timeDiff/ytplayer.getDuration();
			dragWidth = ratio*$("#progressbar").width();
			var widthStr = dragWidth.toString() + "px";
			$("#rangeTick").css("width", widthStr);
			goToTime(timeEnd);

		}
		timeEndFocused = false;

	})
}

//given the currentSeconds (number, not string), initialize the tick in the progressbar area
function showRangeTick(currentSec){
	$("#comment_time").val(calculateTime(currentSec));
	var tickLoc = calculateTickLoc(currentSec);
	startDragX = tickLoc;
	var tickLocStr = tickLoc.toString() + "px";
	$("#rangeTick").css("left", tickLocStr);
	$("#rangeTick").css("width", "2px")
	$("#rangeTick").show();	
}

//hide the range tick and give it the default css
function hideRangeTick(){
	$("#rangeTick").hide();
	$("#rangeTick").css("width", "2px")	
	dragWidth = 2;
}

//this function does the calculations for the tick width while dragging
function dragWidthCalc(e){
	// console.log("startDragX: " + startDragX + ", startZoomX: " + startZoomX);
	if(startDragX > 0 && !drag_mouseup){
		showRangeTick(dragCurrentSec);
		dragWidth = mouseX-startDragX - progressbarOffsetX();
		var widthStr = dragWidth.toString() + "px";
		$("#rangeTick").css("width", widthStr);

		var currentSec = mouseXtoSec("#dragRangeContainer", e);
		showToolTip(currentSec);

		if($(".commentsView_newComment").css("display") == "none"){
			comment_btn();
		}
	}
	if(startZoomX > 0 && !zoom_mouseup){ //Dsan
		var currentSec = mouseXtoSec(".tickmark_holder", e);
		drag_on = true;
		dragWidth = mouseX-startZoomX - progressbarOffsetX();
		console.log(dragWidth);
		var widthStr = dragWidth.toString() + "px";
		$("#zoomTick").css("width", widthStr);
		$("#zoomTick .rightTooltipDiv").tooltip("destroy");
		$("#zoomTick .rightTooltipDiv").tooltip({animation: false, title: calculateTime(currentSec)});
		$("#zoomTick .rightTooltipDiv").tooltip('show');

	}
}

//if the timeEnd is focused, when the progressbar is clicked, this function is called
//the function readjusts the width of the tick depending on where the click occurs
function timeEndFocused_adjustTickWidth(This, e){
	var currentSec = mouseXtoSec(This, e);
	var currentX = calculateTickLoc(currentSec);
	dragWidth = currentX-startDragX;
	var widthStr = dragWidth.toString() + "px";
	$("#rangeTick").css("width", widthStr);
}

//if the timeStart is focused, when the progressbar is clicked, this function is called
//the function readjusts the width and the left position of the tick depending on where the click occurs
function timeStartFocused_adjustTick(This, e){
	var currentSec = mouseXtoSec(This, e);
	startDragX = calculateTickLoc(currentSec);
	var currentTickX = parseInt($("#rangeTick").css("left").substr(0, $("#rangeTick").css("left").length-2));
	var xDiff = startDragX - currentTickX;

	if(xDiff < 0){ //new X location is left of original, width increases 
		dragWidth += Math.abs(xDiff);
	}else{//new X location is left of original, width increases  
		dragWidth -= Math.abs(xDiff);
	}
	var widthStr = dragWidth.toString() + "px";
	$("#rangeTick").css("width", widthStr);
	//startDragX -= Math.abs(moveX);
	$("#comment_time").val(calculateTime(currentSec));
	var tickLocStr = startDragX.toString() + "px";
	$("#rangeTick").css("left", tickLocStr);
	
}

//Shows the tooltip given the current seconds
function showToolTip(currentSec){
	// $("#rangeTick .rightTooltipDiv").show();
	$("#rangeTick .rightTooltipDiv").tooltip("destroy");
	$("#rangeTick .rightTooltipDiv").tooltip({animation: false, title: calculateTime(currentSec)});	
	$("#rangeTick .rightTooltipDiv").tooltip('show');
}

//hides the tooltip 
function hideToolTip(){
	$("#rangeTick .tooltip").animate({"opacity": 0}, 250, function(){
		$("#rangeTick .rightTooltipDiv").tooltip('destroy');
	});
}

//calls hideToolTip after a delay of 250 milliseconds
function hideToolTipDelay(){
	window.setTimeout(hideToolTip, 250);
}

/*
 *	5. Zoom on ticks-related Code
 */
function showZoomTick(currentSec){ //Dsan
	var tickLoc = calculateTickLoc(currentSec);
	startDragX = tickLoc;
	var tickLocStr = tickLoc.toString() + "px";
	$("#zoomTick").css("left", tickLocStr);
	$("#zoomTick").css("width", "2px")
	$("#zoomTick").show();	
}
function hideZoomTick(){ //Dsan
	$("#zoomTick").hide();
	$("#zoomTick").css("width", "2px")	
	dragWidth = 2;
}
function enlargedTickHTML(xLoc, width, ID){
	var style = "'left:" + xLoc + "px; width:"+width + "px'";
	var html = "<div class = 'enlargedTickmark' id = 'enlargedTickmark"+ID + "' style="+style+" onclick = tickClick(this)></div>"; //onmouseover = 'tickHover(this)'
	return html;
}

function createEnlargedTickPopover(ID){
	for (var i = 0; i <= commentObj.length - 1; i++){
        if (commentObj[i].ID == ID){
          	var tickContent = commentObj[i].text;
          	var tickTitle = commentObj[i].userName;
          	$("#enlargedTickmark" + ID).popover({trigger: "hover", placement: "bottom",title: tickTitle, content: tickContent});
        }
    }
}
function zoomRecalc(e){
	if (zoomInitResizing && !zoomResizing){
		var zoomTickLeft = parseFloat($("#zoomTick").css("left")) + 4;
		var zoomTickRight = zoomTickLeft + $(".zoomTickContent").width();
		var startRatio = zoomTickLeft/$(".tickmark_holder").width();
		var endRatio = zoomTickRight/$(".tickmark_holder").width();
		enlargedTimeStart = startRatio*ytplayer.getDuration();
		enlargedTimeEnd = endRatio*ytplayer.getDuration();
		$(".enlargedTickStart").html(calculateTime(enlargedTimeStart));
		$(".enlargedTickEnd").html(calculateTime(enlargedTimeEnd));
		addEnlargedTicks();
	}else if(zoomResizing){
		/*console.log("Resizing...");*/
	}

}
function zoomInitialResize(){
	$("#zoomTick").mousedown(function(e){
		zoomInitResizing = true;
		console.log("zoomInitResize on")
	});
	$("#zoomTick").mouseup(function(e){
		zoomInitResizing = false;
		console.log("zoomInitResize off")
	})
}
function addEnlargedTicks(){
	/*console.log("addEnlargedTicks called");
	console.log("enlargedTimeStart: " + enlargedTimeStart);
	console.log("enlargedTimeEnd: " + enlargedTimeEnd);*/
	$(".enlargedTickBar").html("");
	for (var i = 0; i <= commentObj.length - 1; i++){
		if (commentObj[i].timeEndSec == "None"){
			if(commentObj[i].timeSec > enlargedTimeStart && commentObj[i].timeSec < enlargedTimeEnd){
				console.log("found a singular tick")
				var startToTickDiff = commentObj[i].timeSec - enlargedTimeStart;
				var totalDiff = enlargedTimeEnd - enlargedTimeStart;
				var tickRatio = startToTickDiff/totalDiff;
				var tickPxLeft = tickRatio*$(".enlargedTickBar").width();
				var html = enlargedTickHTML(tickPxLeft, 1, commentObj[i].ID);
				$(".enlargedTickBar").append(html);
				createEnlargedTickPopover(commentObj[i].ID);
			}
		}else{
			if((commentObj[i].timeSec > enlargedTimeStart && commentObj[i].timeSec < enlargedTimeEnd) || (commentObj[i].timeEndSec > enlargedTimeStart && commentObj[i].timeSec < enlargedTimeEnd)){
				console.log("found tick ranges");
				var startToTickStartDiff = commentObj[i].timeSec - enlargedTimeStart;
				var startToTickEndDiff = commentObj[i].timeEndSec - enlargedTimeStart;
				var totalDiff = enlargedTimeEnd - enlargedTimeStart;
				var tickStartRatio = startToTickStartDiff/totalDiff;
				var tickEndRatio = startToTickEndDiff/totalDiff;
				if (commentObj[i].timeEndSec > enlargedTimeEnd){var tickEndRatio = 1;}
				if (commentObj[i].timeSec < enlargedTimeStart){var tickStartRatio = 0;}
				var tickPxLeft = tickStartRatio*$(".enlargedTickBar").width();
				var tickWidth = (tickEndRatio-tickStartRatio)*$(".enlargedTickBar").width();
				var html = enlargedTickHTML(tickPxLeft, tickWidth, commentObj[i].ID);
				$(".enlargedTickBar").append(html);
				createEnlargedTickPopover(commentObj[i].ID);
			}
		}
	}
}

function zoomDrag(){
	$(".zoomTickContent").mousedown(function(e){
		zoomDragging = true;
	});
	$(".zoomTickContent").mouseup(function(e){
		zoomDragging = false;
	})
}

//// Testing
/*function zoomHover(){
	$(".zoomAdjust").on("mouseenter", function(){
		$(this).animate({"opacity": 1}, 250);
	});

	$(".zoomAdjust").on("mouseleave", function(){
		$(this).animate({"opacity": .5}, 250);
	})
}
function zoomResize(e){
	if(zoomResizing){
		$(".zoomAdjust").mouseup(function(e){

			zoomResizing = false;
		})
	}else if(!zoomResizing){
		$(".zoomAdjust").mousedown(function(e){

			console.log("zoomResizing: " + zoomResizing)
		});
	}
}*/

/*
 *	6. Draw Rectangle-related Code
 */

//Pause the video, make the rectangle visible
function showRect(){
	pauseVideo();

	if($(".commentsView_newComment").css("display") == "none"){
		show_addNewComment();
	}

	var leftStr = startDrawX.toString() + "px";
	var topStr = startDrawY.toString() + "px";
	$("#drawnRect").show();
	$("#drawnRect").css("left", leftStr);
	$("#drawnRect").css("top", topStr);
}
var startDrawX, startDrawY; //relative to the videoCover
var drawWidth,drawHeight;
var draw_mouseup = true;

//this function is the mousehandler for drawing the rectangle
function drawRectOn(){
	$("#videoCover").mousedown(function(e){
		draw_mouseup = false;
		resetRectCSS();
		startDrawX = mouseX - videoCoverOffsetX();
		startDrawY = mouseY - videoCoverOffsetY();
		
	});
	$("#videoCover").mouseup(function(e){
		if($("#drawnRect").width()==0){ //when not drawing, a click will play/pause video (width is automatically set to 0 when not seen)
			videoClicked();
		}
		draw_mouseup = true;
		
	});

}

//this calculates the width and height of the rectangle when dragging the mouse over the videoCover
function drawAreaCalc(){
	if(!draw_mouseup){
		drawWidth = mouseX - startDrawX - videoCoverOffsetX();
		drawHeight = mouseY - startDrawY - videoCoverOffsetY();

		if(drawWidth > 2 || drawHeight > 2){
			showRect();
			var widthStr = drawWidth.toString() + "px";
			var heightStr = drawHeight.toString() + "px";
			$("#drawnRect").css("width", widthStr);
			$("#drawnRect").css("height", heightStr);
		}
	}	
}

//Returns to the default width and height of 0 px
//When you drag a new rectangle, you won't see a flash of the previous width and height
function resetRectCSS(){
	$("#drawnRect").css("width", "0px");
	$("#drawnRect").css("height", "0px");
	drawWidth = 0;
	drawHeight = 0;
}

//changes the rect css given the necessary information
//give "None" as a parameter if not necessary to change
function changeRectCSS(left, top, width, height){
	if (left != "None"){
		var leftStr = left.toString() + "px";
		$("#drawnRect").css("left", leftStr);
	}
	if (top != "None"){
		var topStr = top.toString() + "px";
		$("#drawnRect").css("top", topStr);
	}
	if (width != "None"){
		var widthStr = width.toString() + "px";
		$("#drawnRect").css("width", widthStr);
	}
	if (height != "None"){
		var heightStr = height.toString() + "px";
		$("#drawnRect").css("height", heightStr);
	}
}

//hide the drawn rect
function hideDrawnRect(){
	$("#drawnRect").hide();
	resetRectCSS();
}

//returns the x offset of the objects containing the videoCover
function videoCoverOffsetX(){
	return $("#videoCover").parent().offset().left; //progressbar x offset
}

//returns the y offset of the objects containing the videoCover
function videoCoverOffsetY(){
	return $("#videoCover").parent().offset().top; //progressbar x offset
}

//This functions gets all the informatino from the rectangle that needs to be stored in the commentObj
function extractRectInfo(){
	if (drawWidth > 0){
		return {"posX": startDrawX, "posY":startDrawY,"width": drawWidth, "height": drawHeight};
	}else{
		return "None";
	}
}
/*
 *	7. Tick-related code
 */

//calculate the tick location given the time in seconds where the associated comment is given
function calculateTickLoc(seconds){
	var ratio = seconds/ytplayer.getDuration();
	//console.log(seconds, ytplayer.getDuration(), ratio);
	var xLoc = $("#progressbar").width()*ratio;
	console.log("calculateTickLoc.xLoc: " + xLoc);
	return xLoc;
}

//calculate the tick width given the starting and end time associated with the comment
function calculateTickWidth(startTime, endTime){
	if (endTime != "None"){
		var leftLoc = calculateTickLoc(startTime);
		var rightLoc = calculateTickLoc(endTime);
		var width = rightLoc - leftLoc;
		//console.log(startTime, endTime, width);
		console.log("calculateTickWidth.width: " + width)
		return width;
	}else{
		return "1"
	}
}

//given the tick location and ID, it creates the string of HTML to create the tick
function tickHTML(xLoc, width, ID){
	var style = "'left:" + xLoc + "px; width:"+width + "px'";
	var html = "<div class = 'tickmark' id = 'tickmark"+ID + "' style="+style+" onclick = tickClick(this)></div>"; //onmouseover = 'tickHover(this)'
	return html;
}

//This function should be called the the page is loading, it appends all the ticks to the tickholder
function createTickPopover(ID){
	for (var i = 0; i <= commentObj.length - 1; i++){
        if (commentObj[i].ID == ID){
          	var tickContent = commentObj[i].text;
          	var tickTitle = commentObj[i].userName;
          	$("#tickmark" + ID).popover({trigger: "hover", placement: "bottom",title: tickTitle, content: tickContent});
        }
    }
}

//This function should be called the the page is loading
function addAllTicks(){
	$(".tickmark_holder").html(""); //Dsan
	var xLoc, ID, width, html;
	for(var num = 0; num < commentObj.length; num++){
		xLoc = calculateTickLoc(commentObj[num].timeSec);
		ID = commentObj[num].ID;
		width =calculateTickWidth(commentObj[num].timeSec, commentObj[num].timeEndSec);
		html = tickHTML(xLoc, width, ID);
		//console.log(ID, xLoc, width, html);
		$(".tickmark_holder").append(html);
		createTickPopover(ID);
		addTickHover(ID);
		
	}
}

//Don't touch or change this variables
var currentHighlightedTick = "none";
var currentID = "none";

//highlights a tickmark if the mouse is hovering over a comment or if a comment is selected (via keyboard controls)
//issue: can only call highlightTickControl() one at a time for hover and focus
//			--without the if statement, the last function called will be the only one that works (it un-does what the first one did)
function highlightTick(){
	if($(".ui-state-hover").length>0){
		highlightTickControl(".ui-state-hover");
	}else{
		highlightTickControl(".ui-state-focus");
	}
}

//An accessory helper for highlightTick()
function highlightTickControl(className){

	if($(className).length > 0){ //if this then, then has ID
 		var index = $(className).attr("id").substr(30, $(className).attr("id").length);
 		//index gets the correct element index of the commentObj-- commentObj (array of objs) was rearranged to be in order
 		var tickID = commentObj[index].ID;
 		if(currentID != tickID){ //if the mouse is not hovering over same comment, continue
			var tickStr = "#tickmark" + tickID;
			var tickmark = $(tickStr);
			changeTickCSS(tickmark, "red", "No Change", "1");
			//console.log(currentID);
			if(currentHighlightedTick != "none"){
				changeTickCSS(currentHighlightedTick, "red", "No Change", ".4");
			}
			currentHighlightedTick = tickmark;
			currentID = currentHighlightedTick.attr("ID").substr(8, currentHighlightedTick.attr("ID").length-1);
		}
	}else{
		if(currentHighlightedTick != "none"){
			changeTickCSS(currentHighlightedTick, "red", "No Change", ".4");
			currentHighlightedTick = "none";
			currentID = "none";

		}
	}
}

//changes the tick css given the necessary information
//give "No Change" as a parameter if not necessary to change
function changeTickCSS(tick, color, width, opacity){
	if(color !="No Change"){
		tick.css("background", color);
	}
	if(width !="No Change"){
		tick.css("width", width);
	}
	if(opacity !="No Change"){
		tick.css("opacity", opacity)
	}
}

//give the tickID, call the tickHover/unTickHover function to make the associated comment in the accordion have the affect of having the mouse hover over it
function addTickHover(ID){
	var identifier = "#tickmark" +ID;
	$(identifier).hover(function(){tickHover(this)}, function(){unTickHover(this)});
}

//gives the associated comment in the accodrion the correct attributes to act as if the mouse is hovering over it
function tickHover(div){
	var ID = div.id.substr(-1,1);
	var index = IDtoIndex(ID);
	var identifier = "#ui-accordion-accordion-header-" + index;
	$(identifier).attr("class", "ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all ui-state-hover");
}

//gives the associated comment in the accodrion the correct attributes to act as if the mouse is not hovering over it
function unTickHover(div){
	var ID = div.id.substr(-1,1);
	var index = IDtoIndex(ID);
	var identifier = "#ui-accordion-accordion-header-" + index;
	$(identifier).attr("class", "ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all");
}

//if a tick is click, open the corresponding comment in the accordion by triggering a click on the comment
function tickClick(div){
	var ID = div.id.substr(-1,1);
	var index = IDtoIndex(ID);
	var identifier = "#ui-accordion-accordion-header-" + index;
	$(identifier).trigger("click");
	pauseVideo();
	goToTime(commentObj[index].timeSec);
}

//given the tick ID, adds the bootstrap popover 
function createTickPopover(ID){
	for (var i = 0; i <= commentObj.length - 1; i++){
		if (commentObj[i].ID == ID){
			var tickContent = commentObj[i].text;
			var tickTitle = commentObj[i].userName;
			$("#tickmark" + ID).popover({trigger: "hover", placement: "bottom",title: tickTitle, content: tickContent});
		}
	}
}
/*
 *	8. jQuery(document).ready()
 */

var mouseX, mouseY;
$(function(){ 
	$(document).mousemove(function(e){
		$('#status').html(e.pageX +', '+ e.pageY);
		mouseX = e.pageX;
		mouseY = e.pageY;
		dragWidthCalc(e);
		drawAreaCalc();
		zoomRecalc(e);

	}); 
 	updateProgressbarClick();
 	setup_commentDisplay();
	isHoveringOverComments();
	setupTimeFocus();
	setupTextboxFocus();
	time_updateTickRange();
	timeEnd_updateTickRange();
	drawRectOn();
	zoomDrag(); //Dsan
	zoomHover(); //Dsan
	dragRangeOn();
	zoomRangeOn(); //Dsan
	zoomResize();


});


/*
 *	9. Keyboard Shortcuts
 */
var commentOrCancel = true;  // true - next click is comment, false - next click cancels
$(window).keyup(function(e) {
	if (!textboxFocused){
		if(e.which == 32){ //spacebar
			videoClicked();
		}else if (e.which === 67){ // c
			if (commentOrCancel){
				comment_btn();
				commentOrCancel = false;
			}else{
				hide_addNewComment();
				commentOrCancel = true;
			}
		}else if(e.which === 77){ // m
			muteORunmute();
		}
	}
	//here so that unaffected if textbox becomes focused
	if(e.which == 27){ //esc
		if($(".newCommentTextbox").val() == ""){
			hide_addNewComment();
			commentOrCancel = true;
		}else{
			closeCommentAlert();
		}
	}

});

/*
 *	10. Alert-related code
 */
function closeCommentAlert(){
	alert("You added text to the new comment.  Click the 'cancel' button if you are sure you want to lose your data.");
}

