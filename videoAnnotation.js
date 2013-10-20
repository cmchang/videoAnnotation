NB_vid = {};

/*
 * Table of Contents - Organized by astrixed comment sections
 *		1. Youtube Video-Related Code
 *		2. Username Storage-Related Code
 *		3. Progressbar-related Code
 *		4. Commenting-related Code (includes accordion)
 *		5. Drag Range-related Code
 *		6. Zoom on ticks-related Code
 *		7. Draw Rectangle-related Code
 *		8. Tick-related code
 *		9. Progressbar hover tooltip-related Code
 *		10. My Notes Section 
 *		11. jQuery(document).ready() 
 *				-includes: updateProgressbar(), addAllCommentHTML(), setupAccordion(), isHoveringOverComments()
 *		12. Keyboard Shortcuts
 *		13. Alert-related code
 */

(function(){
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
		NB_vid.yt.updateHTML("playerState", newState);
	}

	// Display information about the current state of the player
	// It’s called every 250 milliseconds in onYoutubePlayerReady()
	function updatePlayerInfo() {
		// Also check that at least one function exists since when IE unloads the
		// page, it will destroy the SWF before clearing the interval.
		if(ytplayer && ytplayer.getDuration) {
			NB_vid.yt.updateHTML("videoDuration", ytplayer.getDuration());
			NB_vid.yt.updateHTML("videoCurrentTime", ytplayer.getCurrentTime());
			var percentage = 100*ytplayer.getCurrentTime()/ytplayer.getDuration();
			NB_vid.yt.updateHTML("videoPercentage", percentage);
			NB_vid.yt.updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
			NB_vid.yt.updateHTML("startBytes", ytplayer.getVideoStartBytes());
			NB_vid.yt.updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
			NB_vid.yt.updateHTML("volume", ytplayer.getVolume());
			NB_vid.yt.updateHTML("videoCurrentTimeMinSec", ytplayer.getCurrentTime());
			NB_vid.yt.updateHTML("videoTimeDisplay", NB_vid.yt.calculateTime(ytplayer.getCurrentTime())); //seen under progressbar
			NB_vid.yt.updateHTML("videoTotalTimeDisplay", NB_vid.yt.calculateTime(ytplayer.getDuration()));
			NB_vid.comment.openCommentSyncVideo(); //syncs opening the comments with the video
			NB_vid.comment.commentAutoScroll(); //Automatically scrolls to correct comment
			NB_vid.tick.highlightTick();
			NB_vid.comment.deleteHoverCheck();

			//this makes sure the ticks are only created AFTER ytplayer is created so we can use .getDuration()
			if(NB_vid.yt.createTicks && ytplayer.getDuration() > 0){ 
				NB_vid.yt.createTicks = false;
				NB_vid.tick.addAllTicks();

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
	function calculateTime_stringToNum(timeStr){
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
		NB_vid.yt.playORpause();
	}

	// called when the play/pause button is clicked
	// syncs the correct image with the action
	function playORpause(){
		if ($(".playORpause").attr("src") == "images/play.png"){
			$(".playORpause").attr("src", "images/pause.png")
			NB_vid.yt.playVideo();
		}else{
			$(".playORpause").attr("src", "images/play.png")
			NB_vid.yt.pauseVideo();
		}
	}

	// called when the mute/unmute button is clicked
	// syncs the correct image with the action
	function muteORunmute(){
		if ($(".muteORunmute").attr("src") == "images/volume_up.png"){
			$(".muteORunmute").attr("src", "images/mute.png")
			NB_vid.yt.muteVideo();
		}else{
			$(".muteORunmute").attr("src", "images/volume_up.png")
			NB_vid.yt.unMuteVideo();
		}
	}

	function playVideo() {
		if (ytplayer) {
			ytplayer.playVideo();
			NB_vid.yt.playVideoBool = true;
		}
	}

	function pauseVideo() {
		if (ytplayer) {
			$(".playORpause").attr("src", "images/play.png");
			ytplayer.pauseVideo();
			NB_vid.yt.playVideoBool = false;
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
	 * 2. Username Storage-related Code
	 */

	// Called when user clicks submit within username modal
	// stores their input for their username in localstorage
	function submitUsername(){
		NB_vid.user.yourUserName = $(".usernameInput").val();
		localStorage.yourUserName = NB_vid.user.yourUserName;
		
		$('.logBtn').html(NB_vid.user.yourUserName);
		$('.logBtn').attr("href", "#logoutModal");
		$('#loginModal').modal('hide')
	}

	// Same as above, but for different modal
	function submitCommentUsername(){
		NB_vid.user.yourUserName = $(".usernameCommentInput").val();
		localStorage.yourUserName = NB_vid.user.yourUserName;
		$('.logBtn').html(NB_vid.user.yourUserName);
		$('.logBtn').attr("href", "#logoutModal");
		$('#loginCommentModal').modal('hide')
	}

	// Same as above, but for different modal
	function submitUpvoteUsername(){
		NB_vid.user.yourUserName = $(".usernameUpvoteInput").val();
		localStorage.yourUserName = NB_vid.user.yourUserName;
		$('.logBtn').html(NB_vid.user.yourUserName);
		$('.logBtn').attr("href", "#logoutModal");
		$('#loginUpvoteModal').modal('hide');
	}

	// Deletes you username from local storage and reloads page
	function logout(){
		delete localStorage["yourUserName"];
		location.reload();
	}

	// Creates login button depending on whether or not you are currently logged
	function addLoginButton(){
		var loginBtn = $('<li class = "nav-collapse collapse divider-vertical"><a class = "logBtn navbar_btn" href="#loginModal" data-toggle = "modal">Log In</a></li>');
		var logoutBtn = $('<li class = "nav-collapse collapse divider-vertical"><a class = "logBtn navbar_btn pull-right" href="#logoutModal" data-toggle = "modal">' + NB_vid.user.yourUserName + '</a></li>');
		if("yourUserName" in localStorage){
			$(".nav").append(logoutBtn);
		}else{
			$(".nav").append(loginBtn);
		}
		$('.logBtn').on("mouseenter", function(){
			if($('.logBtn').html() == NB_vid.user.yourUserName){
				$('.logBtn').html('Log Out');
			}
		});
		$('.logBtn').on("mouseleave", function(){
			if($('.logBtn').html() == 'Log Out'){
				$('.logBtn').html(NB_vid.user.yourUserName);
			}
		})
		$(".usernameInput").keyup(function(event){
			if(event.keyCode == 13){ //enter button
				NB_vid.user.submitUsername();
			}
		});
		$(".usernameCommentInput").keyup(function(event){
			if(event.keyCode == 13){ //enter button
				NB_vid.user.submitCommentUsername();    
			}
		});
	}

	//Boolean indicating if the login textbox is focused
	//setupLoginTextbox assigns the correct values to boolean depending on action
	function setupLoginTextbox(){
		$(".newCommentTextbox").focus(function(){NB_vid.comment.textboxFocused = true;});
		$(".newCommentTextbox").focusout(function(){NB_vid.comment.textboxFocused = false;});

	}

/*
 * 3. Progressbar-related Code  
 */

	// This function is called every 500 milliseconds
	// It gets the current time from the youtube player and adjusts the progressbar_filler to match to the corresponding time
	function updateProgressbar(){
		var percentage = 100*ytplayer.getCurrentTime()/ytplayer.getDuration();
		$("#progressbar_filler").css("width", percentage+"%");
	} 

	//update the time of the ytplayer given the mouse x-location
	function progressbar_click(xloc){
		var percentage = xloc/$("#progressbar").width();  
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
			NB_vid.progressbar.progressbar_click(relX);
		});
	}

	//returns the pixel value of the parent left offset
	function progressbarOffsetX(){
		return $("#progressbar").parent().offset().left; //progressbar x offset
	}

	/*
	 * 4. Commenting-related Code
	 */

	// the array of objects the stores all the information for every comment
	// drawArr: an object with the information of the drawn rect {leftPos, rightPos, width, height}; or "None" if no rect drawn
	// ID: number assigned in order of when comment is made (Starting at 0)
	// timeEndSec: the end time in seconds at which the comment refers to; else 0
	// timeEndSecStr: the time as a string (in minute:second format) at which the comment refers to; else “None”
	// timeSec: the time in seconds at which the comment refers to
	// timeStr: the time as a string (in minute:second format) at which the comment refers to
	// text: the body text of the comment
	// type: the selected type - either Comment or Question
	// upvotes: Contains the number of upvotes currently associated with a comment
	// upvotesUserArray: Contains the usernames of all the users who upvoted this comment
	// userName: the ID of the student or person commenting
	// viewer: who the student selected can view the comment (currently no functionality with it)
	
	/*var UsernameArray = Parse.Object.extend("UsernameArray");
	usernameArray = new UsernameArray();*/
	/*var ParseCommentObj = Parse.Object.extend("ParseCommentObj");
	var parseCommentObj = new ParseCommentObj();*/
	var commentObj = [];
	var ParseCommentObj = Parse.Object.extend("ParseCommentObj");

	// Retrieves data from Parse, and then stores it in commentObj
	function parseInit(){
		var query = new Parse.Query(ParseCommentObj);
		query.find({
			success: function(results){
				//console.log("Successfully retrieved " + results.length + " results")
				for (var i = 0; i < results.length; i++){
					var object = results[i];
					var parseDrawArr = object.get('drawArr');
					var parseID = object.get('ID');
					var parseText = object.get('text');
					var parseTimeEndSec = object.get('timeEndSec');
					var parseTimeEndStr = object.get('timeEndStr');
					var parseTimeSec = object.get('timeSec');
					var parseTimeStr = object.get('timeStr');
					var parseType = object.get('type');
					var parseUpvotes= object.get('upvotes');
					var parseUpvotesUserArray = object.get('upvotesUserArray');
					var parseUserName = object.get('userName');
					var parseViewer = object.get('viewer');

					if(parseTimeEndSec == -1){
						var parseTimeEndSec = 0;
					}

					commentObj.push({"drawArr": parseDrawArr, 
						"ID": parseID, 
						"text": parseText, 
						"timeEndSec": parseTimeEndSec, 
						"timeEndStr": parseTimeEndStr, 
						"timeSec": parseTimeSec, 
						"timeStr": parseTimeStr, 
						"type": parseType, 
						"upvotes": parseUpvotes, 
						"upvotesUserArray": parseUpvotesUserArray, 
						"userName": parseUserName, 
						"viewer": parseViewer})
				}
				showNewComment();
				upvoteClick();
			}, Ferror: function(error){
				console.log("Could not create object");
			}
		})
	}

	// var commentObj = [
	// 					{"drawArr": "None",
	// 					"ID": 0,
	// 					"text": "This is my first comment! This is frame is interesting since ...",
	// 					"timeEndSec": 164,
	// 					"timeEndStr": "2:44",
	// 					"timeSec" : 158, 
	// 					"timeStr" : "2:38",
	// 					"type" : "Comment",
	// 					"userName": "User1",
	// 					"viewer" : "Class",},
	// 					{"drawArr": "None",
	// 					"ID": 1,
	// 					"text": "Comment number 2!",
	// 					"timeEndSec": 42,
	// 					"timeEndStr": "2:48",
	// 					"timeSec" : 38, 
	// 					"timeStr" : "0:38",
	// 					"type" : "Comment",
	// 					"userName": "User2",
	// 					"viewer" : "Class",},
	// 					{"drawArr": {posX: 78.00284099578857, posY: 157, width: 522, height: 47},
	// 					"ID": 2,
	// 					"text": "Question number 1!",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 8, 
	// 					"timeStr" : "0:08",
	// 					"type" : "Question",
	// 					"userName": "User3",
	// 					"viewer" : "Class",},
	// 					{"drawArr": "None",
	// 					"ID": 3,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": 192,
	// 					"timeEndStr": "3:12",
	// 					"timeSec" : 191, 
	// 					"timeStr" : "3:11",
	// 					"type" : "Question",
	// 					"userName": "User4",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 4,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": 218,
	// 					"timeEndStr": "3:38",
	// 					"timeSec" : 214, 
	// 					"timeStr" : "3:34",
	// 					"type" : "Question",
	// 					"userName": "User5",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 5,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 2, 
	// 					"timeStr" : "0:02",
	// 					"type" : "Comment",
	// 					"userName": "User6",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 6,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": 15,
	// 					"timeEndStr": "0:20",
	// 					"timeSec" : 5, 
	// 					"timeStr" : "0:05",
	// 					"type" : "Question",
	// 					"userName": "User7",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 7,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 25, 
	// 					"timeStr" : "0:25",
	// 					"type" : "Comment",
	// 					"userName": "User8",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 8,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 30, 
	// 					"timeStr" : "0:30",
	// 					"type" : "Comment",
	// 					"userName": "User9",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 9,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 35, 
	// 					"timeStr" : "0:35",
	// 					"type" : "Comment",
	// 					"userName": "User10",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 10,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 40, 
	// 					"timeStr" : "0:40",
	// 					"type" : "Comment",
	// 					"userName": "User11",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 11,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 45, 
	// 					"timeStr" : "0:45",
	// 					"type" : "Comment",
	// 					"userName": "User12",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 12,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 50, 
	// 					"timeStr" : "0:50",
	// 					"type" : "Comment",
	// 					"userName": "User13",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 13,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" :55, 
	// 					"timeStr" : "0:55",
	// 					"type" : "Comment",
	// 					"userName": "User14",
	// 					"viewer" : "Just Me"},
	// 					{"drawArr": "None",
	// 					"ID": 14,
	// 					"text": "Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque.",
	// 					"timeEndSec": "None",
	// 					"timeEndStr": "None",
	// 					"timeSec" : 60, 
	// 					"timeStr" : "1:00",
	// 					"type" : "Comment",
	// 					"userName": "User15",
	// 					"viewer" : "Just Me"}
	// ];

	//this function calls the necessary functions to display all the comments:
	//it calls SortsCommentObj, addAllCommentHTML, and setupAccordion
	function setup_commentDisplay(){
		NB_vid.comment.sortCommentObj();
		NB_vid.comment.addAllCommentHTML();
		NB_vid.comment.setupAccordion();
	}

	function setup_commentDisplay_filtered(type){
		NB_vid.comment.sortCommentObj();
		NB_vid.comment.addAllCommentHTML_type(type);
		NB_vid.comment.setupAccordion();
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

		NB_vid.commentObj.sort(compare);
	}

	//This function sorts the commentObj array by the ID so we can figure out the highest ID number
	function sortCommentObjID(){
		function compare(a,b) {
			if (a.ID > b.ID)
				return -1;
			if (a.ID < b.ID)
				return 1;
		return 0;
		}

		NB_vid.commentObj.sort(compare);
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
		var typeInitial = NB_vid.commentObj[num].type[0];
		var text = NB_vid.commentObj[num].text;
		var commentSnippet = text.substring(0,30);
		var timeStr = NB_vid.commentObj[num].timeStr;
		var iconHTML = "";
		if(typeInitial == "C"){
			iconHTML = "<i class='icon-comment'></i>";
		}else if(typeInitial == "Q"){
			iconHTML = "<i class='icon-question-sign'></i>";
		}
		if(NB_vid.commentObj[num].drawArr.none == false){
			iconHTML += "<i class='icon-picture'></i>";
		}
		var headerHTML = "<text>" + iconHTML + ": " + commentSnippet;
		if(text.length > 30){ //if the text is too long, only show a portion of it
			headerHTML += "...";
		}
		var deleteCommentBtn = '<button onclick="NB_vid.comment.showDeleteModal(' + NB_vid.commentObj[num].ID + ')" type="button" id = "deleteComment' + NB_vid.commentObj[num].ID + '" class = "btn btn-danger deleteComment" style="float: right"><b>×</b></button>';
		headerHTML += deleteCommentBtn + "</text>";

		var contentHTML = "<div>";
		var userNameHTML = "<span id = userNameHTML><b>" + NB_vid.commentObj[num].userName + "</b></span>&nbsp&nbsp&nbsp"
		var timeHTML = "<span id = 'commentTimeShow' onclick = 'NB_vid.comment.goToComment(" + num + ")' >Time: " +timeStr +"  </span>";
		if (NB_vid.commentObj[num].upvotesUserArray.indexOf(NB_vid.user.yourUserName) == -1){
			var upvoteHTML = "<span style = 'float: right;' class = 'comment" + NB_vid.commentObj[num].ID + "upvoteSpan'><img class = 'upvoteBtn' id = 'upvoteBtn" + NB_vid.commentObj[num].ID + "' style = 'width: 13px; height: 13px' src = 'images/unvoteIcon.png'><span style = 'vertical-align: middle' id = 'comment" + NB_vid.commentObj[num].ID + "upvotes' >" + NB_vid.commentObj[num].upvotes + "</span></span>"	
		}else{
			var upvoteHTML = "<span style = 'float: right;' class = 'comment" + NB_vid.commentObj[num].ID + "upvoteSpan'><img class = 'upvoteBtn' id = 'upvoteBtn" + NB_vid.commentObj[num].ID + "' style = 'width: 13px; height: 13px' src = 'images/upvoteIcon.png'><span style = 'vertical-align: middle' id = 'comment" + NB_vid.commentObj[num].ID + "upvotes' >" + NB_vid.commentObj[num].upvotes + "</span></span>"
		}
		
		var textHTML = "<p>"+ text +"</p>";
		contentHTML += userNameHTML + timeHTML + upvoteHTML + textHTML + "</div>";

		var html = headerHTML + contentHTML;

		return html;
	}

	function showDeleteModal(commentID){
		$("#deleteModal").modal("show");
		$("#deleteModal .btn-danger").attr("id", commentID);

	}

	// Removes comment from commentObj and parse
	function deleteComment(commentID){
		// Client Side
		for (var i = 0; i < NB_vid.commentObj.length; i++){
			if (NB_vid.commentObj[i].ID == commentID){
				//console.log(NB_vid.commentObj[i].ID,commentID);
				NB_vid.commentObj.splice(i, 1);
			}
		}
		NB_vid.comment.showNewComment();
		NB_vid.tick.addAllTicks();

		// Server Side
		var ParseCommentObj = Parse.Object.extend("ParseCommentObj");
		var query = new Parse.Query(ParseCommentObj);
		query.equalTo("ID", parseInt(commentID));
		query.find({
		  success: function(results) {
		    console.log("Successfully retrieved " + results.length + " comments");
		    // Do something with the returned Parse.Object values
		    for (var i = 0; i < results.length; i++) { 
		      var object = results[i];
		      object.destroy({
		      	success: function(object){
		      		//console.log("successfully removed your comment");
		      	},
		      	error: function(object, error){
		      		//console.log("We were unable to remove your object: " + error);
		      	}
		      })
		    }
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});
	}
	// When hovering over an accordion header, checks if you were the user that created that comment
	// If you are, then a delete button is shown
	function deleteHoverCheck(){
		$(".ui-accordion-header").mouseenter(function(){
			var deleteNum = $(this).children(".deleteComment").attr("id");
			var commentNum = deleteNum.slice(13, deleteNum.length);
			for (var i = 0; i < NB_vid.commentObj.length; i++){
				if (NB_vid.commentObj[i].ID == parseInt(commentNum)){
					if (NB_vid.commentObj[i].userName == NB_vid.user.yourUserName){
						$("#deleteComment" + commentNum).css("opacity", "1");
						$("#deleteComment" + commentNum).show();
					}
				}
			}
		});
		$(".ui-accordion-header").mouseleave(function(){
			var deleteNum = $(this).children(".deleteComment").attr("id");
			var commentNum = deleteNum.slice(13, deleteNum.length);
			$("#deleteComment" + commentNum).hide();
		})
	}

	//goes in a for loop to add all of the objects to the accordion section of the html
	function addAllCommentHTML(){
		var html = "";
		for(var num = 0; num < NB_vid.commentObj.length; num++){
			var htmlSection = NB_vid.comment.extractCommentHTML(num);
			html += htmlSection;
		}
		$("#accordion").append(html);
	}

	//given the comment type, goes in a for loop to add all of the objects with that type to the accordion section of the html
	function addAllCommentHTML_type(type){
		var html = "";
		for(var num = 0; num < NB_vid.commentObj.length; num++){
			if(NB_vid.commentObj[num].type == type){
				var htmlSection = NB_vid.comment.extractCommentHTML(num);
				html += htmlSection;
			}
		}
		$("#accordion").append(html);
	}

	//Given the comment index (for commentObj), go to the time in the video associated to the comment
	//show rectangle if exists or hide rectangle if none
	function goToComment(index){
		NB_vid.yt.goToTime(NB_vid.commentObj[index].timeSec);
		if(NB_vid.commentObj[index].drawArr.none == false){
			NB_vid.draw.changeRectCSS(NB_vid.commentObj[index].drawArr.posX, NB_vid.commentObj[index].drawArr.posY, NB_vid.commentObj[index].drawArr.width, NB_vid.commentObj[index].drawArr.height);
			$("#drawnRect").show();
		}else{
			NB_vid.draw.hideDrawnRect();
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
		NB_vid.comment.shrinkCommentHolder();
		$(".commentsView_newComment").css("display", "");
		$("#comment_time").val(NB_vid.yt.calculateTime(currentSec));
		$("#comment_timeEnd").val("");
		$(".newCommentTextbox").focus();
		NB_vid.drag.showRangeTick(currentSec);
	}
	//hides the comment editor
	function hide_addNewComment(){
		NB_vid.comment.normalSizeCommentHolder();
		$(".commentsView_newComment").css("display", "None");
		$("#newCommentTime").val("");
		$("#comment_timeEnd").val("");
		$(".newCommentTextbox").val("");
		$(".newCommentTextbox").focusout();
		NB_vid.drag.hideRangeTick();
		NB_vid.draw.hideDrawnRect();

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
		if ("yourUserName" in localStorage){
			pauseVideo();
			show_addNewComment();
		}else{
			$('#loginCommentModal').modal({'show': true});
		}
	}

	//Called when the submit button is pushed
	function submitNewComment(){
		NB_vid.comment.normalSizeCommentHolder();
		NB_vid.comment.sortCommentObjID(); //Necessary so we can get the current highest commentID
		var ID = NB_vid.commentObj[0].ID + 1;
		var text = $(".newCommentTextbox").val();
		var type = $('#comment_type').find(":selected").text();
		var viewer = $('#comment_viewer').find(":selected").text();
		var timeStr = $('#comment_time').val();
		var timeEndStr = $('#comment_timeEnd').val();
		var timeEnd, parseTimeEnd;
		if(timeEndStr == "" || timeStr == timeEndStr){
			parseTimeEnd = -1;
			timeEnd = 0;
			timeEndStr = "None";
		}else{
			timeEnd = NB_vid.yt.calculateTime_stringToNum(timeEndStr);
			parseTimeEnd = NB_vid.yt.calculateTime_stringToNum(timeEndStr);
		}
		commentObj.push({ "drawArr": NB_vid.draw.extractRectInfo(),
							"ID": ID, //issue: if comments are deleted, there can be repeat in IDs
							"text" : text,
							"timeEndSec": timeEnd,
							"timeEndStr": timeEndStr,
							"timeSec" : NB_vid.yt.calculateTime_stringToNum(timeStr),
							"timeStr" : timeStr,
							"type" : type,
							"upvotes": 0,
							"upvotesUserArray": [],
							"userName": NB_vid.user.yourUserName,
							"viewer" : viewer});
		$(".newCommentTextbox").val(""); //empty textbox		

		var ParseCommentObj = Parse.Object.extend("ParseCommentObj");
		var parseCommentObj = new ParseCommentObj();
		parseCommentObj.save(NB_vid.commentObj[NB_vid.commentObj.length -1], {
	  		success: function(parseCommentObj) {
	  			// Execute any logic that should take place after the object is saved.
	  			//console.log('New object created with objectId: ' + parseCommentObj.id);
	  		},
			error: function(parseCommentObj, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and description.
				//console.log('Failed to create new object, with error code: ' + error.description);
			}
		});



		//order matters for the next few functions!
		//console.log(commentObj);
		NB_vid.tick.addAllTicks();
		NB_vid.comment.hide_addNewComment();
		NB_vid.comment.goToComment(NB_vid.commentObj.length-1);
		NB_vid.comment.showNewComment();
		NB_vid.comment.upvoteClick();
		NB_vid.comment.deleteHoverCheck();
	}

	//gets rid of accordion and gets rid of the html
	//extracts information from the commentObj
	//calls setup_commentDisplay to inject new HTML and setup new accordion
	function showNewComment(){
		$("#accordion").accordion('destroy');
		$("#accordion").html("");
		NB_vid.comment.setup_commentDisplay();
	}

	//gets rid of accordion and gets rid of the html
	//extracts information from the commentObj
	//calls setup_commentDisplay to inject new HTML and setup new accordion
	function showFilteredComments(type){
		$("#accordion").accordion('destroy');
		$("#accordion").html("");
		NB_vid.comment.setup_commentDisplay_filtered(type);
	}

	//An array to hold all the seconds at which there are comments
	//Necessary to sync video with opening the corresponding comment if at correct time
	function createTimeSecArray(){
		NB_vid.comment.timeSecArray = [];
		for (var i in NB_vid.commentObj){
			NB_vid.comment.timeSecArray.push(NB_vid.commentObj[i].timeSec);
		}
	}

	//open the comment in accordion if at the correct time at video
	function openCommentSyncVideo(){
		NB_vid.comment.createTimeSecArray();
		var currentTime = parseInt(ytplayer.getCurrentTime());
		var indexOfArr = NB_vid.comment.timeSecArray.indexOf(currentTime);
		if(!NB_vid.comment.isHoveringOver){
			if(indexOfArr>-1){ //executes if currentTime is a time in the array
				$( "#accordion" ).accordion({ active: indexOfArr });
			}
		}
	}

	// Automatically keeps the current comment in view wihin the comment container
	function commentAutoScroll(){ //Dsan
		//console.log("NB_vid.yt.playVideoBool: "+ NB_vid.yt.playVideoBool, "!isHoveringOver" + !NB_vid.comment.isHoveringOver);
		if(NB_vid.yt.playVideoBool && !NB_vid.comment.isHoveringOver){
			createTimeSecArray();
			var currentTime = parseInt(ytplayer.getCurrentTime());
			var indexOfArr = NB_vid.comment.timeSecArray.indexOf(currentTime);
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
	}

	//this function sets a boolean depending if the mouse is hovering over the .commentsView_holder div
	function isHoveringOverComments(){
		$(".commentsView_holder").mouseenter(function(){
			NB_vid.comment.isHoveringOver = true;
		}).mouseleave(function(){
			NB_vid.comment.isHoveringOver = false;
		});
	}

	//given ID, get Index of placement in commentObj array
	function IDtoIndex(ID){
		for(var x = 0; x < NB_vid.commentObj.length; x++){
			if(NB_vid.commentObj[x].ID == ID){
				return x;
			}
		}
		return false;
	}

	//Boolean indicating if the main textbox in the comment editor is focused
	//setupTextboxFocus assigns the correct values to boolean depending on action
	function setupTextboxFocus(){
		$(".usernameInput").focus(function(){NB_vid.user.loginFocused = true;});
		$(".usernameInput").focusout(function(){NB_vid.user.loginFocused = false;});

	}

	// Updates commentObj when clicking on upvote icon and updates parse as well
	function upvoteClick(){
		var ParseCommentObj = Parse.Object.extend("ParseCommentObj");
		$(".upvoteBtn").on("click", function(){
			var commentID = $(this).attr("id");
			var commentNum = parseInt(commentID.slice(9, commentID.length));
			var numUpvotes = parseInt($("#comment" + commentNum + "upvotes").html());
			if ("yourUserName" in localStorage){
				if ($(this).attr("src") == "images/upvoteIcon.png"){
					$("#comment" + commentNum + "upvotes").html(parseInt($("#comment" + commentNum + "upvotes").html()) - 1);
					for (var i = 0; i < NB_vid.commentObj.length; i++){
						if(NB_vid.commentObj[i].ID == commentNum){
							var query = new Parse.Query(ParseCommentObj);
							query.equalTo("ID", commentNum);
							query.find({
								success: function(results){
									for(var i = 0; i < results.length; i++){
										results[i].increment("upvotes", -1); 
										var parseUsernameArray = results[i].get("upvotesUserArray");
										var index = parseUsernameArray.indexOf(NB_vid.user.yourUserName);
										parseUsernameArray.splice(index, 1);
										results[i].set("upvotesUserArray", parseUsernameArray);
										results[i].save();
									}
								}
							})
							NB_vid.commentObj[i].upvotes -= 1;
							var array = NB_vid.commentObj[i].upvotesUserArray
							var index = array.indexOf(NB_vid.user.yourUserName);
							array.splice(index, 1);
						}
					}
					$(this).attr("src", "images/unvoteIcon.png")
				}else if($(this).attr("src") == "images/unvoteIcon.png"){
					$("#comment" + commentNum + "upvotes").html(parseInt($("#comment" + commentNum + "upvotes").html()) + 1);
					for (var i = 0; i < NB_vid.commentObj.length; i++){
						if(NB_vid.commentObj[i].ID == commentNum){
							var query = new Parse.Query(ParseCommentObj);
							query.equalTo("ID", commentNum);
							query.find({
								success: function(results){
									for(var i = 0; i < results.length; i++){
										results[i].increment("upvotes"); 
										var parseUsernameArray = results[i].get("upvotesUserArray");
										parseUsernameArray.push(NB_vid.user.yourUserName); 
										results[i].save();
									}
								}
							})
							NB_vid.commentObj[i].upvotes += 1;
							NB_vid.commentObj[i].upvotesUserArray.push(NB_vid.user.yourUserName);
							
						}
					}
					$(this).attr("src", "images/upvoteIcon.png")
				}
			}else{
				$("#loginUpvoteModal").modal("show");
			}
		})
	}

	/*
	 *	5. Drag Range-related code
	 */

	//given "this" (i.e. the progressbar), the function will calculate the mouse position and then convert it to seconds relative to the progress bar
	function mouseXtoSec(This, e){
		var relX = NB_vid.drag.getRelMouseX(This,e);
		var percentage = relX/$("#progressbar").width();
		return percentage*ytplayer.getDuration();
	}

	//given "this" (i.e. the progressbar), the function will calculate the mouse position relative to "this"
	//So it will give you the xLoc of the mouse of the progressbar with 0 being at the left border of the progressbar
	function getRelMouseX(This, e){
		var parentOffset = $(This).parent().offset(); 
		var relX = e.pageX - parentOffset.left;
		return relX;
	}


	//this function controls when the mouse is clicked in unclicked over the progressbar
	//this function creates the the tick under the progressbar and gives it the left position
	//the width of the tick is controlled under document.ready() in the mousemove function
	function dragRangeOn(){
		$("#progressbar").mousedown(function(e){
			NB_vid.drag.startDragX = NB_vid.tick.mouseX - NB_vid.progressbar.progressbarOffsetX();
			NB_vid.drag.drag_mouseup = false; 
			NB_vid.drag.dragCurrentSec = NB_vid.drag.mouseXtoSec(this, e);
			if($(".commentsView_newComment").css("display") != "none"){
				//NB_vid.drag.showToolTip(NB_vid.drag.dragCurrentSec);
				NB_vid.comment.comment_btn();
				NB_vid.drag.showRangeTick(NB_vid.drag.dragCurrentSec);
			}
		});
		$(document).mouseup(function(e){
			if(!NB_vid.drag.drag_mouseup){
				NB_vid.drag.drag_mouseup = true;
				var currentSec = NB_vid.drag.mouseXtoSec("#progressbar", e);
				NB_vid.drag.hideToolTipDelay("#rangeTick");

				if($("#comment_time").val() == NB_vid.yt.calculateTime(currentSec)){ //if the two time entries are the same when clicking on progressbar, only print the time in the first time value box (creates a single tick)
					$("#comment_timeEnd").val("");
				}else{
					$("#comment_timeEnd").val(NB_vid.yt.calculateTime(currentSec));
				}
			}
		});

	}

	//if the text is changed in the time input box, update the tick to the corresponding position
	function time_updateTickRange(){
		$("#comment_time").change(function(){
			var timeStart = NB_vid.yt.calculateTime_stringToNum($("#comment_time").val());
			NB_vid.drag.startDragX = NB_vid.tick.calculateTickLoc(timeStart);
			if($("#comment_time").val() != ""){
				$("#rangeTick").css("left", NB_vid.drag.startDragX);
				NB_vid.yt.goToTime(timeStart);
			}
			if($("#comment_timeEnd").val() != ""){
				var timeEnd = NB_vid.yt.calculateTime_stringToNum($("#comment_timeEnd").val());
				var endDragX = NB_vid.tick.calculateTickLoc(timeEnd);
				NB_vid.drag.dragWidth = endDragX - NB_vid.drag.startDragX;
				var widthStr = NB_vid.drag.dragWidth.toString() + "px";
				$("#rangeTick").css("width", widthStr);
			}
		})
	}

	//if the text is changed in the time input box, update the tick to the corresponding position
	function timeEnd_updateTickRange(){
		$("#comment_timeEnd").change(function(){
			if($("#comment_timeEnd").val() != ""){
				var timeStart = NB_vid.yt.calculateTime_stringToNum($("#comment_time").val());
				var timeEnd = NB_vid.yt.calculateTime_stringToNum($("#comment_timeEnd").val());
				var timeDiff = timeEnd - timeStart;
				var ratio = timeDiff/ytplayer.getDuration();
				NB_vid.drag.dragWidth = ratio*$("#progressbar").width();
				var widthStr = NB_vid.drag.dragWidth.toString() + "px";
				$("#rangeTick").css("width", widthStr);
				NB_vid.yt.goToTime(timeEnd);

			}
		})
	}

	//given the currentSeconds (number, not string), initialize the tick in the progressbar area
	function showRangeTick(currentSec){
		$("#comment_time").val(NB_vid.yt.calculateTime(currentSec));
		var tickLoc = NB_vid.tick.calculateTickLoc(currentSec);
		NB_vid.drag.startDragX = tickLoc;
		var tickLocStr = tickLoc.toString() + "px";
		$("#rangeTick").css("left", tickLocStr);
		$("#rangeTick").css("width", "2px")
		$("#rangeTick").show();	
	}

	//hide the range tick and give it the default css
	function hideRangeTick(){
		$("#rangeTick").hide();
		$("#rangeTick").css("width", "2px")	
		NB_vid.drag.dragWidth = 2;
	}

	//this function does the calculations for the tick width while dragging
	function dragWidthCalc(e){
		if(NB_vid.drag.startDragX > 0 && !NB_vid.drag.drag_mouseup){
			NB_vid.drag.showRangeTick(NB_vid.drag.dragCurrentSec);
			NB_vid.drag.dragWidth = NB_vid.tick.mouseX-NB_vid.drag.startDragX - NB_vid.progressbar.progressbarOffsetX();
			var widthStr = NB_vid.drag.dragWidth.toString() + "px";
			$("#rangeTick").css("width", widthStr);

			var currentSec = NB_vid.drag.mouseXtoSec("#dragRangeContainer", e);
			//NB_vid.drag.showToolTip(currentSec);

			if($(".commentsView_newComment").css("display") == "none"){
				NB_vid.comment.comment_btn();
			}
		}
	}

	//Shows the tooltip given the current seconds
	function showToolTip(currentSec){
		// $("#rangeTick .rightTooltipDiv").show();
		$("#rangeTick .rightTooltipDiv").tooltip("destroy");
		$("#rangeTick .rightTooltipDiv").tooltip({animation: false, title: NB_vid.yt.calculateTime(currentSec)});	
		$("#rangeTick .rightTooltipDiv").tooltip('show');
	}

	//hides the tooltip
	function hideToolTip(Parent){
		$(Parent + " .tooltip").animate({"opacity": 0}, 250, function(){
			$(Parent + " .rightTooltipDiv").tooltip('destroy');
		});
	}

	//calls hideToolTip after a delay of 250 milliseconds
	function hideToolTipDelay(Parent){
		window.setTimeout(hideToolTip(Parent), 250);
	}

	/*
	 *	6. Zoom on ticks-related Code
	 */

	function zoomRangeOn(){ 
		$(".tickmark_holder").mousedown(function(e){
			//console.log("tickmar_holder mousedown");
			if (!NB_vid.zoom.zoomDragging ){
				if (NB_vid.zoom.enlargedDraggableCreated){
					$("#zoomTick").draggable("destroy");
				}
				NB_vid.zoom.startZoomX = NB_vid.tick.mouseX - NB_vid.progressbar.progressbarOffsetX(); 
				NB_vid.zoom.zoom_mouseup = false; 
				var currentSec = NB_vid.drag.mouseXtoSec(this, e);

				NB_vid.zoom.enlargedTimeStart = currentSec;
				$(".enlargedTickStart").html(NB_vid.yt.calculateTime(NB_vid.zoom.enlargedTimeStart));
				var tickLoc = NB_vid.tick.calculateTickLoc(currentSec);
				var tickLocStr = tickLoc.toString() + "px";
				
				$("#zoomTick").css("left", tickLocStr);
				$("#zoomTick").css("width", "2px")
				$("#zoomTick").show();
				$("#zoomTick .rightTooltipDiv").show();
				$("#zoomTick .rightTooltipDiv").tooltip({animation: false, title: NB_vid.yt.calculateTime(currentSec)});	
				$("#zoomTick .rightTooltipDiv").tooltip('show');
			}
		});
		$(document).mouseup(function(e){	
			if(!NB_vid.zoom.zoom_mouseup){
				NB_vid.zoom.zoom_mouseup = true;
				if(NB_vid.zoom.zoomWidth > 2){//starting to try to separate the click interactions -- clicking tick should open comment while dragging should open zoom ticks
					var currentSec = NB_vid.drag.mouseXtoSec(".tickmark_holder", e);
					NB_vid.zoom.enlargedTimeEnd = currentSec;
					$(".enlargedTickEnd").html(NB_vid.yt.calculateTime(NB_vid.zoom.enlargedTimeEnd));
					$(".enlargedTickBar").html("");
				
					$(".enlargedTickContainer").show().animate({"opacity": 1}, 400);

					$("#zoomTick").draggable({axis: "x", containment: "parent"});
					$("#zoomTick").effect("transfer", {to: ".enlargedTickBar"});

					NB_vid.zoom.enlargedDraggableCreated = true;
					// appends ticks to the enlarged tick bar
					NB_vid.zoom.addEnlargedTicks();
				}

				NB_vid.drag.hideToolTipDelay("#zoomTick");

			}
		});
	}

	// Figures out where ticks lie in enlarged tick bar
	// Called on mouseup in tickbar
	function enlargedTickHTML(xLoc, width, ID){
		var style = "'left:" + xLoc + "px; width:"+width + "px'";
		var html = "<div class = 'enlargedTickmark' id = 'enlargedTickmark"+ID + "' style="+style+" onclick = NB_vid.tick.tickClick(this)></div>"; //onmouseover = 'tickHover(this)'
		return html;
	}

	// Creates popovers for enlarged tick bar
	function createEnlargedTickPopover(ID){
		for (var i = 0; i <= NB_vid.commentObj.length - 1; i++){
	        if (NB_vid.commentObj[i].ID == ID){
	          	var tickContent = NB_vid.commentObj[i].text;
	          	var tickTitle = NB_vid.commentObj[i].userName;
	          	$("#enlargedTickmark" + ID).popover({trigger: "hover", placement: "top",title: tickTitle, content: tickContent});
	        }
	    }
	}

	// Called when dragging blue zoomed area or when creating the initial zoom
	// Recalculates the ticks within the enlarged tick bar
	function zoomRecalc(e){
		if (NB_vid.zoom.zoomInitResizing && !NB_vid.zoom.zoomResizing || NB_vid.zoom.zoomDragging){
			var zoomTickLeft = parseFloat($("#zoomTick").css("left"));
			var zoomTickRight = zoomTickLeft + $("#zoomTick").width();
			var startRatio = zoomTickLeft/$(".tickmark_holder").width();
			var endRatio = zoomTickRight/$(".tickmark_holder").width();
			NB_vid.zoom.enlargedTimeStart = startRatio*ytplayer.getDuration();
			NB_vid.zoom.enlargedTimeEnd = endRatio*ytplayer.getDuration();
			$(".enlargedTickStart").html(NB_vid.yt.calculateTime(NB_vid.zoom.enlargedTimeStart));
			$(".enlargedTickEnd").html(NB_vid.yt.calculateTime(NB_vid.zoom.enlargedTimeEnd));
			NB_vid.zoom.addEnlargedTicks();
		}
	}

	// updates the current player location (green tick) within enlarged bar
	function updateEnlargedTickBar(){ 
		if (NB_vid.zoom.enlargedTimeStart != "--:--" && NB_vid.zoom.enlargedTimeEnd != "--:--"){
			var enlargedDuration = NB_vid.zoom.enlargedTimeEnd - NB_vid.zoom.enlargedTimeStart;
			var percentage = 100*(ytplayer.getCurrentTime() - NB_vid.zoom.enlargedTimeStart)/enlargedDuration;
			var currentTime = ytplayer.getCurrentTime();
			if (currentTime > NB_vid.zoom.enlargedTimeStart && currentTime < NB_vid.zoom.enlargedTimeEnd){
				$(".currentPlayerLocationTick").css("display", "block").css("left", percentage + "%");
			}else{
				$(".currentPlayerLocationTick").css("display", "none")
			}
		}
	}

	// Adds all appropriate ticks to enlarged tick bar
	function addEnlargedTicks(){
		$(".enlargedTickBar").html("");
		for (var i = 0; i <= NB_vid.commentObj.length - 1; i++){
			if (NB_vid.commentObj[i].timeEndSec == 0){ //for ticks without range
				if(NB_vid.commentObj[i].timeSec > NB_vid.zoom.enlargedTimeStart && NB_vid.commentObj[i].timeSec < NB_vid.zoom.enlargedTimeEnd){
					var startToTickDiff = NB_vid.commentObj[i].timeSec - NB_vid.zoom.enlargedTimeStart;
					var totalDiff = NB_vid.zoom.enlargedTimeEnd - NB_vid.zoom.enlargedTimeStart;
					var tickRatio = startToTickDiff/totalDiff;
					var tickPxLeft = tickRatio*$(".enlargedTickBar").width();
					// console.log("enlargedTimeStart: " + NB_vid.zoom.enlargedTimeStart);
					var html = NB_vid.zoom.enlargedTickHTML(tickPxLeft, 1, NB_vid.commentObj[i].ID);
					$(".enlargedTickBar").append(html);
					NB_vid.zoom.createEnlargedTickPopover(NB_vid.commentObj[i].ID);
				}
			}else{ //for ticks with range
				if((NB_vid.commentObj[i].timeSec > NB_vid.zoom.enlargedTimeStart && NB_vid.commentObj[i].timeSec < NB_vid.zoom.enlargedTimeEnd) || (NB_vid.commentObj[i].timeEndSec > NB_vid.zoom.enlargedTimeStart && NB_vid.commentObj[i].timeSec < NB_vid.zoom.enlargedTimeEnd)){
					var startToTickStartDiff = NB_vid.commentObj[i].timeSec - NB_vid.zoom.enlargedTimeStart;
					var startToTickEndDiff = NB_vid.commentObj[i].timeEndSec - NB_vid.zoom.enlargedTimeStart;
					var totalDiff = NB_vid.zoom.enlargedTimeEnd - NB_vid.zoom.enlargedTimeStart;
					var tickStartRatio = startToTickStartDiff/totalDiff;
					var tickEndRatio = startToTickEndDiff/totalDiff;
					if (NB_vid.commentObj[i].timeEndSec > NB_vid.zoom.enlargedTimeEnd){var tickEndRatio = 1;}
					if (NB_vid.commentObj[i].timeSec < NB_vid.zoom.enlargedTimeStart){var tickStartRatio = 0;}
					var tickPxLeft = tickStartRatio*$(".enlargedTickBar").width();
					// console.log(tickPxLeft);
					var tickWidth = (tickEndRatio-tickStartRatio)*$(".enlargedTickBar").width();
					var html = NB_vid.zoom.enlargedTickHTML(tickPxLeft, tickWidth, NB_vid.commentObj[i].ID);
					$(".enlargedTickBar").append(html);
					NB_vid.zoom.createEnlargedTickPopover(NB_vid.commentObj[i].ID);
				}
			}
		}
	}

	// changes zommDragging variable depending on if you're dragging the blue zoom area or not
	function zoomDrag(){
		$("#zoomTick").mousedown(function(e){
			NB_vid.zoom.zoomDragging = true;
		});
		$("#zoomTick").mouseup(function(e){
			NB_vid.zoom.zoomDragging = false;
		})
	}

	// Closes the enlarged tick bar and deletes the blue enlarged selection if they exist
	function zoomClose(){
		if(NB_vid.zoom.enlargedDraggableCreated){
			$(".enlargedTickContainer").animate({"opacity": 0}, 400, function(){
				$(".enlargedTickContainer").hide();
			})
			$("#zoomTick").draggable("destroy");
			$("#zoomTick").animate({"opacity": 0}, 400, function(){
				$("#zoomTick").hide();
				$("#zoomTick").css("opacity", 1);
			})
			NB_vid.zoom.enlargedDraggableCreated = false;
		}
	}

	function zoomWidthCalc(e){
		if(NB_vid.zoom.startZoomX > 0 && !NB_vid.zoom.zoom_mouseup){ /////MOVE THIS TO OWN FUNCTION: zoomWidthCalc
			var currentSec = NB_vid.drag.mouseXtoSec(".tickmark_holder", e);
			NB_vid.zoom.zoomWidth = NB_vid.tick.mouseX-NB_vid.zoom.startZoomX - NB_vid.progressbar.progressbarOffsetX();
			var widthStr = NB_vid.zoom.zoomWidth.toString() + "px";
			$("#zoomTick").css("width", widthStr);
			$("#zoomTick .rightTooltipDiv").tooltip("destroy");
			$("#zoomTick .rightTooltipDiv").tooltip({animation: false, title: NB_vid.yt.calculateTime(currentSec)});
			$("#zoomTick .rightTooltipDiv").tooltip('show');
		}
	}

	/*
	 *	7. Draw Rectangle-related Code
	 */

	//Pause the video, make the rectangle visible
	function showRect(){
		NB_vid.yt.pauseVideo();

		if($(".commentsView_newComment").css("display") == "none"){
			NB_vid.comment.show_addNewComment();
		}

		var leftStr = NB_vid.draw.startDrawX.toString() + "px";
		var topStr = NB_vid.draw.startDrawY.toString() + "px";
		$("#drawnRect").show();
		$("#drawnRect").css("left", leftStr);
		$("#drawnRect").css("top", topStr);
	}

	//this function is the mousehandler for drawing the rectangle
	function drawRectOn(){
		$("#videoCover").mousedown(function(e){
			NB_vid.draw.draw_mouseup = false;
			NB_vid.draw.resetRectCSS();
			NB_vid.draw.startDrawX = NB_vid.tick.mouseX - NB_vid.draw.videoCoverOffsetX();
			NB_vid.draw.startDrawY = NB_vid.tick.mouseY - NB_vid.draw.videoCoverOffsetY();
			
		});
		$("#videoCover").mouseup(function(e){
			if($("#drawnRect").width()==0){ //when not drawing, a click will play/pause video (width is automatically set to 0 when not seen)
				NB_vid.yt.videoClicked();
			}
			NB_vid.draw.draw_mouseup = true;
			
		});

	}

	//this calculates the width and height of the rectangle when dragging the mouse over the videoCover
	function drawAreaCalc(){
		if(!NB_vid.draw.draw_mouseup){
			NB_vid.draw.drawWidth = NB_vid.tick.mouseX - NB_vid.draw.startDrawX - NB_vid.draw.videoCoverOffsetX();
			NB_vid.draw.drawHeight = NB_vid.tick.mouseY - NB_vid.draw.startDrawY - NB_vid.draw.videoCoverOffsetY();

			if(NB_vid.draw.drawWidth > 2 || NB_vid.draw.drawHeight > 2){
				NB_vid.draw.showRect();
				var widthStr = NB_vid.draw.drawWidth.toString() + "px";
				var heightStr = NB_vid.draw.drawHeight.toString() + "px";
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
		NB_vid.draw.drawWidth = 0;
		NB_vid.draw.drawHeight = 0;
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
		NB_vid.draw.resetRectCSS();
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
		if (NB_vid.draw.drawWidth > 0){
			return {"posX": NB_vid.draw.startDrawX, "posY":NB_vid.draw.startDrawY,"width": NB_vid.draw.drawWidth, "height": NB_vid.draw.drawHeight, "none":false};
		}else{
			return {"none": true}; //this used to return "None", let's hope for no bugs
		}
	}
	/*
	 *	8. Tick-related code
	 */

	//calculate the tick location given the time in seconds where the associated comment is given
	function calculateTickLoc(seconds){
		var ratio = seconds/ytplayer.getDuration();
		//console.log(seconds, ytplayer.getDuration(), ratio);
		var xLoc = $("#progressbar").width()*ratio;
		return xLoc;
	}

	//calculate the tick width given the starting and end time associated with the comment
	function calculateTickWidth(startTime, endTime){
		if (endTime != 0){
			var leftLoc = NB_vid.tick.calculateTickLoc(startTime);
			var rightLoc = NB_vid.tick.calculateTickLoc(endTime);
			var width = rightLoc - leftLoc;
			return width;
		}else{
			return "1"
		}
	}

	//given the tick location and ID, it creates the string of HTML to create the tick
	function tickHTML(xLoc, width, ID){
		var style = "'left:" + xLoc + "px; width:"+width + "px'";
		var html = "<div class = 'tickmark' id = 'tickmark"+ID + "' style="+style+" onclick = NB_vid.tick.tickClick(this)></div>"; //onmouseover = 'tickHover(this)'
		return html;
	}

	//This function should be called the the page is loading, it appends all the ticks to the tickholder
	function createTickPopover(ID){
		for (var i = 0; i <= NB_vid.commentObj.length - 1; i++){
	        if (NB_vid.commentObj[i].ID == ID){
	          	var tickContent = NB_vid.commentObj[i].text;
	          	var tickTitle = NB_vid.commentObj[i].userName;
	          	$("#tickmark" + ID).popover({trigger: "hover", placement: "bottom",title: tickTitle, content: tickContent});
	        }
	    }
	}

	//This function should be called the the page is loading
	function addAllTicks(){
		$(".tickmark_holder").html(""); 
		var xLoc, ID, width, html;
		for(var num = 0; num < NB_vid.commentObj.length; num++){
			xLoc = NB_vid.tick.calculateTickLoc(NB_vid.commentObj[num].timeSec);
			ID = NB_vid.commentObj[num].ID;
			width =NB_vid.tick.calculateTickWidth(NB_vid.commentObj[num].timeSec, NB_vid.commentObj[num].timeEndSec);
			html = NB_vid.tick.tickHTML(xLoc, width, ID);
			$(".tickmark_holder").append(html);
			NB_vid.tick.createTickPopover(ID);
			NB_vid.tick.addTickHover(ID);
			
		}
	}

	//highlights a tickmark if the mouse is hovering over a comment or if a comment is selected (via keyboard controls)
	//issue: can only call highlightTickControl() one at a time for hover and focus
	//			--without the if statement, the last function called will be the only one that works (it un-does what the first one did)
	function highlightTick(){
		if(!NB_vid.yt.createTicks){
			if($(".ui-state-hover").length == 1){
				NB_vid.tick.highlightTickControl(".ui-state-hover");
			}else if ($(".ui-state-hover").length ==1){
				NB_vid.tick.highlightTickControl(".ui-state-focus");
			}
		}
	}

	//An accessory helper for highlightTick()
	function highlightTickControl(className){

		if($(className).length > 0){ //if this then, then has ID
	 		var index = $(className).attr("id").substr(30, $(className).attr("id").length);
	 		//index gets the correct element index of the commentObj-- commentObj (array of objs) was rearranged to be in order
	 		var tickID = NB_vid.commentObj[index].ID;
	 		if(NB_vid.tick.currentID != tickID){ //if the mouse is not hovering over same comment, continue
				var tickStr = "#tickmark" + tickID;
				var tickmark = $(tickStr);
				NB_vid.tick.changeTickCSS(tickmark, "red", "No Change", "1");
				if(NB_vid.tick.currentHighlightedTick.length != 0){
					NB_vid.tick.changeTickCSS(NB_vid.tick.currentHighlightedTick, "red", "No Change", ".4");
				}
				NB_vid.tick.currentHighlightedTick = tickmark;
				NB_vid.tick.currentID = NB_vid.tick.currentHighlightedTick.attr("ID").substr(8, NB_vid.tick.currentHighlightedTick.attr("ID").length-1);
			}
		}else{
			if(NB_vid.tick.currentHighlightedTick.length != 0){
				NB_vid.tick.changeTickCSS(NB_vid.tick.currentHighlightedTick, "red", "No Change", ".4");
				NB_vid.tick.currentHighlightedTick = [];
				NB_vid.tick.currentID = "none";

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
		$(identifier).hover(function(){NB_vid.tick.tickHover(this)}, function(){NB_vid.tick.unTickHover(this)});
	}

	//gives the associated comment in the accodrion the correct attributes to act as if the mouse is hovering over it
	function tickHover(div){
		var ID = div.id.substr(8,div.id.length);
		var index = NB_vid.comment.IDtoIndex(ID);
		var identifier = "#ui-accordion-accordion-header-" + index;
		$(identifier).attr("class", "ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all ui-state-hover");
	}

	//gives the associated comment in the accodrion the correct attributes to act as if the mouse is not hovering over it
	function unTickHover(div){
		var ID = div.id.substr(8,div.id.length);
		var index = NB_vid.comment.IDtoIndex(ID);
		var identifier = "#ui-accordion-accordion-header-" + index;
		$(identifier).attr("class", "ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all");
	}

	//if a tick is click, open the corresponding comment in the accordion by triggering a click on the comment
	function tickClick(div){
		console.log(div)
		var ID = div.id.substr(16,div.id.length);
		var index = NB_vid.comment.IDtoIndex(ID);
		var identifier = "#ui-accordion-accordion-header-" + index;
		$(identifier).trigger("click");
		NB_vid.yt.pauseVideo();
		console.log(NB_vid.commentObj[index].timeStr)
		NB_vid.yt.goToTime(NB_vid.commentObj[index].timeSec);
	}

	//given the tick ID, adds the bootstrap popover 
	function createTickPopover(ID){
		for (var i = 0; i <= NB_vid.commentObj.length - 1; i++){
			if (NB_vid.commentObj[i].ID == ID){
				var tickContent = NB_vid.commentObj[i].text;
				var tickTitle = NB_vid.commentObj[i].userName;
				$("#tickmark" + ID).popover({trigger: "hover", placement: "bottom",title: tickTitle, content: tickContent});
			}
		}
	}

	/*
	 * 	9. Progressbar tooltip hover
	 */
	//check functions
	function progressBarHover(){
		$("#progressbar").mouseenter(function(){
			NB_vid.pbHover.progressbarHovering = true;
		}).mouseleave(function(){
			NB_vid.pbHover.progressbarHovering = false;
		});
		$("#videoCover").mouseenter(function(){
			NB_vid.pbHover.progressbarHovering = false;
		})
	}

	// When hovering over progressbar, tooltip shows displaying the time you are hovering over
	function progressBarHoverTooltip(e){
		if (NB_vid.pbHover.progressbarHovering){
			var xPosition = getRelMouseX("#progressbar", e);
			$(".mouseTooltipDiv").css("left", xPosition);
			$(".mouseTooltipDiv").tooltip("destroy");
			$.ajax({
					url: "http://juhokim.com/framegrabber/make-thumbnail.php",        
					type: "GET",
					data: {
						tm: mouseXtoSec("#progressbar", e),
						id: "HtSuA80QTyo"
				}}).done(function(data){
					//$("img").attr("src", data);   

					var img = "<img src= '" + data + "' style = 'width: 100px; height: 60px'/><br>";
					$(".mouseTooltipDiv").tooltip({title: img + calculateTime(mouseXtoSec("#progressbar", e)), html:true, animation: false})
					//$(".mouseTooltipDiv").tooltip({title: calculateTime(mouseXtoSec("#progressbar", e)), html:true, animation: false})
					$(".mouseTooltipDiv").tooltip("show");
					$("#progressbar .tooltip").css("opacity", "1");  

				}).fail(function(){
				console.log("capture failed."); 
			});
		}else{
			NB_vid.drag.hideToolTipDelay("#progressbar");
		}
	}

	//Makes sure gatherVidThumbnails is called at the correct time so that getDuration returns the correct value
	function gatherThumbnailHandler(event){
		//console.log(event, ytplayer.getDuration());
		if (NB_vid.pbHover.calledFunc == false && event == 1){
			ytplayer.pauseVideo();
			//console.log(event, ytplayer.getDuration());
			NB_vid.pbHover.calledFunc = true;
			NB_vid.pbHover.gatherVidThumbnails(ytPlayer.getDuration());
		}
	}

	//calls a for loop to add all the image urls to the imgDic
	function gatherVidThumbnails(length){
		for(var x = 0; x < length; x++){
			NB_vid.pbHover.getImgSrc(x)
			// NB_Vid.pbHover.imgDic.push(NB_vid.pbHover.imgSrc);
			// console.log(NB_vid.pbHover.imgDic);
		}
	}

	//Given the time in the video (seconds), add the url to the imgDic dictionary
	function getImgSrc(time){
		$.ajax({
					url: "http://juhokim.com/framegrabber/make-thumbnail.php",        
					type: "GET",
					data: {
						tm: time,
						id: "HtSuA80QTyo"
				}}).done(function(data){
					NB_vid.pbHover.imgDic[time] = data;   
					//console.log(NB_vid.pbHover.imgArr);                    
				}).fail(function(){
				console.log("capture failed."); 
		});
	}


	/*
	 *	10. My Notes Section
	 */

	//When "myNotes" button in the nav bar is clicked, it will either open the modal or tell you to sign in if you haven't already
	function myNotes_btn(){
		if ("yourUserName" in localStorage){
			pauseVideo();
			NB_vid.notes.setupNotesModal();
			$('#myNotesModal').modal({'show': true});
		}else{
			$('#loginCommentModal').modal({'show': true});
		}
	}

	//calls the necessary functions to setup your personal notes modal before it is shown
	function setupNotesModal(){
		NB_vid.notes.getMyComments();
		NB_vid.notes.addMyComments();
	}

	//Find all the comments you made within the commentObj and make a copy of your comments in myNotesCommentObj
	function getMyComments(){
		for(var x = 0; x < NB_vid.commentObj.length; x++){
			if(NB_vid.commentObj[x].userName == localStorage.yourUserName){
				NB_vid.notes.myNotesCommentObj.push(NB_vid.commentObj[x]);

			}
		}
	}

	//Adds the collected comments within myNotesCommentObj to the Modal
	function addMyComments(){
		$(".myNotesBody").html("");
		var html = "";
		for(var x = 0; x < NB_vid.notes.myNotesCommentObj.length; x++){
			html += "Time: " + NB_vid.notes.myNotesCommentObj[x].timeStr + "<br><ul><li>";
			if (NB_vid.notes.myNotesCommentObj[x].drawArr.none == false){ //check if has drawArr
				var imgClass = 'notesImg' + x;
				var imgSrc = "images/loadingImg.png";
				var imgHTML = "<img class = '" + imgClass + "'src = '"+ imgSrc + "'style = 'width:200px'/>";
				html += imgHTML + "</li><li>";
				NB_vid.notes.getImgSrc_myNotes(NB_vid.notes.myNotesCommentObj[x].timeSec ,"."+imgClass);
			}
			
			var text = NB_vid.notes.myNotesCommentObj[x].text;
			if(text == "" || text == " "){
				text = "(No text)";
			}
			html += text + "</li></ul><br>";
		}
		$(".myNotesBody").html(html);
		NB_vid.notes.myNotesCommentObj = [];
	}

	function getImgSrc_myNotes(time, imgClass){
		$.ajax({
					url: "http://juhokim.com/framegrabber/make-thumbnail.php",        
					type: "GET",
					data: {
						tm: time,
						id: "HtSuA80QTyo"
				}}).done(function(data){
					$(imgClass).attr("src", data); 
					$(imgClass).wrap($('<a>',{
						href: data
					}));
					//console.log(NB_vid.pbHover.imgArr);                    
				}).fail(function(){
				console.log("capture failed."); 
		});
	}

	/*
	 *	11. jQuery(document).ready()
	 */

	function mouseLoc(){
		$(document).mousemove(function(e){
			$('#status').html(e.pageX +', '+ e.pageY);
			NB_vid.tick.mouseX = e.pageX;
			NB_vid.tick.mouseY = e.pageY;
			NB_vid.drag.dragWidthCalc(e);
			NB_vid.zoom.zoomWidthCalc(e);
			NB_vid.draw.drawAreaCalc();
			NB_vid.zoom.zoomRecalc(e);
			NB_vid.pbHover.progressBarHoverTooltip(e);
		}); 
	}

	/*
	 * 12. Keyboard Shortcuts
	 */
	$(window).keyup(function(e) {
		if (!NB_vid.comment.textboxFocused && !$("#loginModal").hasClass("in")){
			if(e.which == 32){ //spacebar
				NB_vid.yt.videoClicked();
			}else if (e.which === 67){ // c
				if (NB_vid.keyboard.commentOrCancel){
					NB_vid.comment.comment_btn();
					NB_vid.keyboard.commentOrCancel = false;
				}else{
					NB_vid.comment.hide_addNewComment();
					NB_vid.keyboard.commentOrCancel = true;
				}
			}else if(e.which === 77){ // m
				NB_vid.yt.muteORunmute();
			}else if(e.which === 78){ // n
				NB_vid.notes.myNotes_btn()
			}

		}
		//here so that unaffected if textbox becomes focused
		if(e.which == 27){ //esc
			if($(".newCommentTextbox").val() == ""){
				NB_vid.comment.hide_addNewComment();
				NB_vid.keyboard.commentOrCancel = true;
				NB_vid.zoom.zoomClose();
			}
		}

	});


	/*
	 *	13. Alert-related code
	 */
	function closeCommentAlert(){
		alert("You added text to the new comment.  Click the 'cancel' button if you are sure you want to lose your data.");
	}



	NB_vid = {
		"yt": {"updateHTML": updateHTML,
				"onPlayerError": onPlayerError,
				"onPlayerStateChange": onPlayerStateChange,
				"createTicks": true, //makes sure add all ticks is called once during setup
				"updatePlayerInfo": updatePlayerInfo,
				"calculateTime": calculateTime,
				"calculateTime_stringToNum": calculateTime_stringToNum,
				"setVideoVolume": setVideoVolume,
				"videoClicked": videoClicked,
				"playORpause": playORpause,
				"muteORunmute": muteORunmute,
				"playVideo": playVideo,
				"playVideoBool": false,
				"pauseVideo": pauseVideo,
				"muteVideo": muteVideo,
				"unMuteVideo": unMuteVideo,
				"loadPlayer": loadPlayer,
				"_run":_run,
				"goToTime":goToTime
				},
		"user":{ 
				"yourUserName":localStorage.yourUserName,
				"submitUsername":submitUsername,
				"submitCommentUsername":submitCommentUsername,
				"submitUpvoteUsername":submitUpvoteUsername,
				"logout":logout,
				"addLoginButton":addLoginButton,
				"loginFocused": false,
				"setupLoginTextbox":setupLoginTextbox
		},
		"progressbar": {
				"updateProgressbar":updateProgressbar,
				"progressbar_click": progressbar_click,
				"updateProgressbarClick":updateProgressbarClick,
				"progressbarOffsetX":progressbarOffsetX
		},
		"commentObj": commentObj,
		"comment": {
				"parseInit": parseInit,
				"ParseCommentObj":ParseCommentObj,
				"setup_commentDisplay":setup_commentDisplay,
				"setup_commentDisplay_filtered":setup_commentDisplay_filtered,
				"sortCommentObj":sortCommentObj,
				"sortCommentObjID": sortCommentObjID,
				"extractCommentHTML":extractCommentHTML,
				"showDeleteModal":showDeleteModal,
				"deleteComment":deleteComment,
				"deleteHoverCheck":deleteHoverCheck,
				"addAllCommentHTML":addAllCommentHTML,
				"addAllCommentHTML_type":addAllCommentHTML_type,
				"goToComment":goToComment,
				"setupAccordion":setupAccordion,
				"show_addNewComment":show_addNewComment,
				"hide_addNewComment":hide_addNewComment,
				"shrinkCommentHolder":shrinkCommentHolder,
				"normalSizeCommentHolder":normalSizeCommentHolder,
				"comment_btn":comment_btn,
				"submitNewComment":submitNewComment,
				"showNewComment":showNewComment,
				"showFilteredComments":showFilteredComments,
				"timeSecArray": [],
				"createTimeSecArray":createTimeSecArray,
				"openCommentSyncVideo":openCommentSyncVideo,
				"commentAutoScroll":commentAutoScroll,
				"isHoveringOver": false,
				"isHoveringOverComments": isHoveringOverComments,
				"IDtoIndex":IDtoIndex,
				"textboxFocused":false,
				"setupTextboxFocus":setupTextboxFocus,
				"upvoteClick":upvoteClick
		},
		"drag": {
				"mouseXtoSec":mouseXtoSec,
				"getRelMouseX":getRelMouseX,
				"startDragX": 0, //relative to the page
				"dragWidth": 0,
				"drag_mouseup": true, //important when calculating the width of the dragtick
				"dragCurrentSec": 0,
				"dragRangeOn":dragRangeOn,
				"time_updateTickRange":time_updateTickRange,
				"timeEnd_updateTickRange":timeEnd_updateTickRange,
				"showRangeTick":showRangeTick,
				"hideRangeTick":hideRangeTick,
				"dragWidthCalc":dragWidthCalc,
				"showToolTip":showToolTip,
				"hideToolTip":hideToolTip,
				"hideToolTipDelay":hideToolTipDelay
		},
		"zoom": {
				"startZoomX": "",
				"zoomDragging":false,
				"zoom_mouseup":true,
				"zoomInitResizing":false,
				"zoomResizing":false,
				"enlargedTimeStart":"--:--",
				"enlargedTimeEnd": "--:--",
				"enlargedDraggableCreated":false,
				"zoomRangeOn": zoomRangeOn,
				"enlargedTickHTML":enlargedTickHTML,
				"createEnlargedTickPopover":createEnlargedTickPopover,
				"zoomRecalc":zoomRecalc,
				"updateEnlargedTickBar":updateEnlargedTickBar,
				"addEnlargedTicks":addEnlargedTicks,
				"zoomDrag":zoomDrag,
				"zoomClose":zoomClose,
				"zoomWidth": 0,
				"zoomWidthCalc":zoomWidthCalc

		},
		"draw": {
				"showRect":showRect,
				"startDrawX": 0, //relative to the video cover
				"startDrawY": 0, //relative to the video cover
				"drawWidth": 0,
				"drawHeight": 0,
				"draw_mouseup": true,
				"drawRectOn": drawRectOn,
				"drawAreaCalc": drawAreaCalc,
				"resetRectCSS":resetRectCSS,
				"changeRectCSS":changeRectCSS,
				"hideDrawnRect":hideDrawnRect,
				"videoCoverOffsetX":videoCoverOffsetX,
				"videoCoverOffsetY":videoCoverOffsetY,
				"extractRectInfo":extractRectInfo
		},
		"tick": {
				"calculateTickLoc":calculateTickLoc,
				"calculateTickWidth":calculateTickWidth,
				"tickHTML":tickHTML,
				"createTickPopover":createTickPopover,
				"addAllTicks":addAllTicks,
				"currentHighlightedTick": [], //changed from "None"
				"currentID": "none",
				"highlightTick": highlightTick,
				"highlightTickControl": highlightTickControl,
				"changeTickCSS":changeTickCSS,
				"addTickHover":addTickHover,
				"tickHover":tickHover,
				"unTickHover":unTickHover,
				"tickClick":tickClick,
		},
		"pbHover": {
				"progressbarHovering":false,
				"progressBarHover":progressBarHover,
				"imgDic": {},
				"forLoopVal": 0,
				"gatherThumbnailHandler":gatherThumbnailHandler,
				"calledFunc": false,
				"gatherVidThumbnails": gatherVidThumbnails,
				"progressBarHoverTooltip":progressBarHoverTooltip,
				"imgTime": 0,
				"getImgSrc":getImgSrc
		},
		"notes":{
				"myNotes_btn":myNotes_btn,
				"setupNotesModal": setupNotesModal,
				"myNotesCommentObj": [],
				"getMyComments": getMyComments,
				"addMyComments": addMyComments,
				"getImgSrc_myNotes":getImgSrc_myNotes
		},
		"jQueryReady": {
				"mouseX": 0,
				"mouseY": 0,
				"mouseLoc": mouseLoc
		},
		"keyboard": {
				"commentOrCancel": true  // true - next click is comment, false - next click cancels
		},
		"alert": {
				"closeCommentAlert":closeCommentAlert
		}
	};

	NB_vid.funcLists = { "jQueryReady":[NB_vid.comment.parseInit,
										NB_vid.user.addLoginButton,
										NB_vid.jQueryReady.mouseLoc, 
										NB_vid.progressbar.updateProgressbarClick, 
										NB_vid.comment.setup_commentDisplay,
										NB_vid.comment.isHoveringOverComments,
										NB_vid.comment.upvoteClick,
										NB_vid.comment.setupTextboxFocus,
										NB_vid.user.setupLoginTextbox,
										NB_vid.drag.time_updateTickRange,
										NB_vid.drag.timeEnd_updateTickRange,
										NB_vid.draw.drawRectOn,
										NB_vid.zoom.zoomDrag,
										NB_vid.drag.dragRangeOn,
										NB_vid.zoom.zoomRangeOn,
										NB_vid.pbHover.progressBarHover]
						};
						
})();

Parse.initialize("viexWXBNypmbAgN4HTsr000EkCzJ4t6mGle8wFoE", "bKkVou2qscsLmYvKsYiusjxAA0oJBUBE7vRXkJZP");

// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
	ytplayer = document.getElementById("ytPlayer");

	//ytplayer.addEventListener("onStateChange", "NB_vid.pbHover.gatherThumbnailHandler");

	//This hack is an attempt to eliminate the big red play button by default
	//it prevents the default play button from playing the video without changing my own play button
	//it also starts the loading of the video sooner
	window.setTimeout(function() {
		ytplayer.playVideo();
	    ytplayer.pauseVideo(); //comment this out if using the gatherThumbnailHandler
	}, 0);

	// This causes the updatePlayerInfo function to be called every 250ms to
	// get fresh data from the player
	setInterval(NB_vid.progressbar.updateProgressbar, 1000);
	setInterval(NB_vid.yt.updatePlayerInfo, 250);
	NB_vid.yt.updatePlayerInfo();		
	ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
	ytplayer.addEventListener("onError", "onPlayerError");
	//Load an initial video into the player
	ytplayer.cueVideoById("HtSuA80QTyo");
}


$(function(){ 
	for (var x = 0; x < NB_vid.funcLists.jQueryReady.length; x++ ){
		NB_vid.funcLists.jQueryReady[x]();
	}
	
});

dy[x]();
	}
	
});
"HtSuA80QTyo");
}


$(function(){ 
	for (var x = 0; x < NB_vid.funcLists.jQueryReady.length; x++ ){
		NB_vid.funcLists.jQueryReady[x]();
	}
	
});
