/*
 * Table of Contents - Organized by astrixed comment sections
 *		1. Youtube Video-Related Code
 *		2. Progressbar-related Code
 *		3. Commenting-related Code (includes accordion)
 *		4. Drag Range-related Code
 *		5. Tick-related code
 *		6. jQuery(document).ready() 
 *				-includes: updateProgressbar(), addAllCommentHTML(), setupAccordion(), isHoveringOverComments()
 *		7. Keyboard Shortcuts
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

var createTicks = true;
// Display information about the current state of the player
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
		highlightTick();
		
		//this makes sure the ticks are only created AFTER ytplayer is created so we can use .getDuration()
		if(createTicks && ytplayer.getDuration() > 0){
			createTicks = false;
			addAllTicks();

		}
	}
}

//give the time in secodns, show the time as a string with (hours:)minutes:seconds
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

//calculate the number of seconds given the time as a string
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

//given the time in seconds, goes to corresponding time in the video
//called when the text "View" in the comment is clicked
function goToTime(seconds){
	ytplayer.seekTo(seconds,true);
}

/*
 * 2. Progressbar-related Code  
 */

//update the time of the ytplayer if the progress bar is clicked
function progressbar_click(mouseX){
	var percentage = mouseX/660;  // 660 because the progressbar container is 660px
	$("#progressbar").progressbar("option","value",percentage*100); //updates progressbar location
	var currentSec = percentage*ytplayer.getDuration();

	if(!drag_on){
		//deals with boolean associated whether or not the "time" or "to" input box is focused in the new comment section
		if (timeEndFocused){
			$("#comment_timeEnd").val(calculateTime(currentSec));
		}else{
			$("#comment_time").val(calculateTime(currentSec));
		}
	}

	//updates ytplayer location in video
	ytplayer.seekTo(currentSec, true); 
}

//calculate the position of the mouse relative to the progressbar if clicked
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

	dragRangeOn();
}

/*
 * 3. Commenting-related Code
 */

//the array of objects the stores all the information for every comment
//ID: number assigned in order of when comment is made (Starting at 0)
//timeSec: the time in seconds at which the comment refers to
//timeStr: the time as a string (in minute:second format) at which the comment refers to
//text: the body text of the comment
//type: the selected type - either Comment or Question
//viewer: who the student selected can view the comment (currently no functionality with it)
var commentObj = [
					{"ID": 0,
					"text": "This is my first comment! This is frame is interesting since ...",
					"timeEndSec": 164,
					"timeEndStr": "2:44",
					"timeSec" : 158, 
					"timeStr" : "2:38",
					"type" : "Comment",
					"viewer" : "Class",},
					{"ID": 1,
					"text": "Comment number 2!",
					"timeEndSec": 42,
					"timeEndStr": "2:48",
					"timeSec" : 38, 
					"timeStr" : "0:38",
					"type" : "Comment",
					"viewer" : "Class",},
					{"ID": 2,
					"text": "Question number 1!",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 8, 
					"timeStr" : "0:08",
					"type" : "Question",
					"viewer" : "Class",},
					{"ID": 3,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": 192,
					"timeEndStr": "3:12",
					"timeSec" : 191, 
					"timeStr" : "3:11",
					"type" : "Question",
					"viewer" : "Just Me"},
					{"ID": 4,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": 218,
					"timeEndStr": "3:38",
					"timeSec" : 214, 
					"timeStr" : "3:34",
					"type" : "Question",
					"viewer" : "Just Me"},
					{"ID": 5,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": "None",
					"timeEndStr": "None",
					"timeSec" : 2, 
					"timeStr" : "0:02",
					"type" : "Comment",
					"viewer" : "Just Me"},
					{"ID": 6,
					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
					"timeEndSec": 15,
					"timeEndStr": "0:20",
					"timeSec" : 5, 
					"timeStr" : "0:05",
					"type" : "Question",
					"viewer" : "Just Me"}
					];

//this function does all the work to display the comments:
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

	
	var headerHTML = "<text>" + typeInitial + ": " + commentSnippet;
	if(text.length > 30){ //if the text is too long, only show a portion of it
		headerHTML += "...";
	}
	headerHTML +="</text>";

	var contentHTML = "<div>";
	var timeHTML = "<span id = 'commentTimeShow'>Time: " +timeStr +"  </span>";
	var goToHTML = "<span id = 'commentGoTo' onclick = 'goToTime(" +commentObj[num].timeSec + ")'>view</span>";
	var textHTML = "<p>"+ text +"</p>";
	contentHTML += timeHTML + goToHTML + textHTML + "</div>";

	var html = headerHTML + contentHTML;

	return html;
}

//only called once when page is setting up (document ready function)
//goes in a for loop to add all of the objects to the accordion section of the html
function addAllCommentHTML(){
	var html = "";
	for(var num = 0; num < commentObj.length; num++){
		var htmlSection = extractCommentHTML(num);
		html += htmlSection;
	}
	$("#accordion").append(html);
}

//sets up the accordion
function setupAccordion(){
	$("#accordion").accordion({ header: "text", //selects type of element to be recognized as the 'header'
								collapsible: true, //allows all the panels to be collapsesd at the same time
								active: false, //initially none of the panels are selected- all starts closed
								heightStyle: "content"}); //each content panel adjusts its height to its own content
}

//shows the add new comment options
function show_addNewComment(){
	shrinkCommentHolder();
	$(".commentsView_newComment").css("display", "");
	$("#comment_time").val(calculateTime(ytplayer.getCurrentTime()));
	$(".newCommentTextbox").focus();
}
//hodes the add new comment options
function hide_addNewComment(){
	normalSizeCommentHolder();
	$(".commentsView_newComment").css("display", "None");
	$("#newCommentTime").val("");
	$("#comment_timeEnd").val("");
	$(".newCommentTextbox").val("");
	$(".newCommentTextbox").focusout();
	timeEndFocused = false;
	turnDrag_off();
	hideRangeTick();
}

//Called when the showing the new comment
function shrinkCommentHolder(){
	$(".commentsView_holder").css("height", "279px");
}

//Called when the no longer showing the new comment
function normalSizeCommentHolder(){
	$(".commentsView_holder").css("height", "444px");
}

//when the comment button is pushed
function comment_btn(){
	ytplayer.pauseVideo();
	show_addNewComment();
}

//when the submit button is pushed
function submitNewComment(){
	normalSizeCommentHolder();
	var text = $(".newCommentTextbox").val();
	var type = $('#comment_type').find(":selected").text();
	var viewer = $('#comment_viewer').find(":selected").text();
	var time = $('#comment_time').val();
	var timeEndStr = $('#comment_timeEnd').val();
	var timeEnd;
	if(timeEndStr == ""){
		timeEnd = "None";
		timeEndStr = "None";
	}else{
		timeEnd = calcualateTime_stringToNum(timeEndStr);
	}
	commentObj.push({ "ID": commentObj.length,
						"text" : text,
						"timeEndSec": timeEnd,
						"timeEndStr": timeEndStr,
						"timeSec" : calcualateTime_stringToNum(time),
						"timeStr" : time,
						"type" : type,
						"viewer" : viewer});
	$(".newCommentTextbox").val(""); //empty textbox
	goToTime(calcualateTime_stringToNum(time)); //this so when the comment is submitted, it will open the comment
	showNewComment();
	addAllTicks();
	hide_addNewComment();
}

//adds the new comment into the accordion
//extracts information from the commentObj
function showNewComment(){
	$("#accordion").accordion('destroy');
	$("#accordion").html("");
	setup_commentDisplay();
}

//An array to hold all the seconds at which there are comments
//neede to sync video with opening the corresponding comment if at correct time
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

var timeEndFocused = false;
function setupTimeEndFocus(){
	$("#comment_timeEnd").focus(function(){timeEndFocused = true;});
	$("#comment_time").focus(function(){timeEndFocused = false;});
}

var textboxFocused = false;
function setupTextboxFocus(){
	$(".newCommentTextbox").focus(function(){textboxFocused = true;});
	$(".newCommentTextbox").focusout(function(){textboxFocused = false;});

}

/*
 *	4. Drag Range-related code
 */

var drag_on = false;

//Called when drag range button is pushed
function dragRange(){
	$(".dragRange_btn").attr("disabled", "disabled");
	drag_on = true;
}

//turns off the drag boolean
function turnDrag_off(){
	drag_on = false;
	$(".dragRange_btn").removeAttr("disabled");
}
//given "this", the function will calculate the mouse position and then convert it to seconds relative to the progress bar
function mouseXtoSec(This, e){
	var parentOffset = $(This).parent().offset(); 
	var relX = e.pageX - parentOffset.left;
	var percentage = relX/660;  // 660 because the progressbar container is 660px
	return percentage*ytplayer.getDuration();
}


//this function controls when the mouse is clicked in unclicked over the progressbar IF drag_on is true (the drag button is pushed)
//this function creates the the tick under the progressbar and gives it the left position
//the width of the tick is controlled under document.ready() in the mousemove function
var startDragX;
var drag_mouseup = true; //important when calculating the width of the dragtick
function dragRangeOn(){
	$("#progressbar").mousedown(function(e){
		if (drag_on){
			startDragX = mouseX;
			drag_mouseup = false; 
			console.log(startDragX);
			var currentSec = mouseXtoSec(this, e);
			comment_btn();
			$("#comment_time").val(calculateTime(currentSec));
			var tickLoc = calculateTickLoc(currentSec);
			var tickLocStr = tickLoc.toString() + "px";
			$("#rangeTick").css("left", tickLocStr);
			$("#rangeTick").css("width", "2px")
			$("#rangeTick").show();	
		}
	});
	$("#progressbar").mouseup(function(e){
		if(drag_on){
			drag_mouseup = true;
			var currentSec = mouseXtoSec(this, e);
			$("#comment_timeEnd").val(calculateTime(currentSec));
		}
	});
}

function hideRangeTick(){
	$("#rangeTick").hide();
	$("#rangeTick").css("width", "2px")	
}

/*
 *	5. Tick-related code
 */

//calculate the tick location given the time where the associated comment is given
function calculateTickLoc(seconds){
	var ratio = seconds/ytplayer.getDuration();
	//console.log(seconds, ytplayer.getDuration(), ratio);
	var xLoc = $(".progressbar_container").width()*ratio;
	return xLoc;
}

//calculate the tick location given the starting and end time associated with the comment
function calculateTickWidth(startTime, endTime){
	if (endTime != "None"){
		var leftLoc = calculateTickLoc(startTime);
		var rightLoc = calculateTickLoc(endTime);
		var width = rightLoc - leftLoc;
		//console.log(startTime, endTime, width);
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

//This function should be called the the page is loading
function addAllTicks(){
	$(".tickmark_holder").html("");
	var xLoc, ID, width, html;
	for(var num = 0; num < commentObj.length; num++){
		xLoc = calculateTickLoc(commentObj[num].timeSec);
		ID = commentObj[num].ID;
		width =calculateTickWidth(commentObj[num].timeSec, commentObj[num].timeEndSec);
		html = tickHTML(xLoc, width, ID);
		//console.log(ID, xLoc, width, html);
		$(".tickmark_holder").append(html);
		addTickHover(ID);
		
	}
}

//Highlight the associated tick when hovering over the comment 
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

function addTickHover(ID){
	var identifier = "#tickmark" +ID;
	$(identifier).hover(function(){tickHover(this)}, function(){unTickHover(this)});
}

function tickHover(div){
	var ID = div.id.substr(-1,1);
	var index = IDtoIndex(ID);
	var identifier = "#ui-accordion-accordion-header-" + index;
	$(identifier).attr("class", "ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all ui-state-hover");
}

function unTickHover(div){
	var ID = div.id.substr(-1,1);
	var index = IDtoIndex(ID);
	var identifier = "#ui-accordion-accordion-header-" + index;
	$(identifier).attr("class", "ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all");
}

function tickClick(div){
	var ID = div.id.substr(-1,1);
	var index = IDtoIndex(ID);
	var identifier = "#ui-accordion-accordion-header-" + index;
	$(identifier).trigger("click");
	pauseVideo();
	goToTime(commentObj[index].timeSec);
}
/*
 *	6. jQuery(document).ready()
 */

var mouseX, mouseY;
jQuery(document).ready(function(){
	$(document).mousemove(function(e){
		$('#status').html(e.pageX +', '+ e.pageY);
		mouseX = e.pageX;
		mouseY = e.pageY;
		if(drag_on && startDragX > 0 && !drag_mouseup){
			//console.log("here");
			var width = mouseX-startDragX;
			var widthStr = width.toString() + "px";
			$("#rangeTick").css("width", widthStr);
		}
	}); 
 	updateProgressbar();
 	setup_commentDisplay();
	isHoveringOverComments();
	setupTimeEndFocus();
	setupTextboxFocus();

})

var commentOrCancel = true;  // true - next click is comment, false - next click cancels

/*
 *	7. Keyboard Shortcuts
 */

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
		}else if(e.which ===68){ //d
			dragRange();
		}else if(e.which === 77){ // m
			muteORunmute();
		}
	}
	//here so that unaffected if textbox becomes focused
	if(e.which == 27){ //esc
		hide_addNewComment();
		commentOrCancel = true;
		}

});



