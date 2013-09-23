Contents---

	css folder: contains css files for bootstrap (slightly modified from original)
	demo folder: contains a short screencapture video showing various features of the prototype (note this video has buggy features that are now fixed)
	images folder: the main image-containing folder
	img folder: contains the bootstrap glyphicons
	js folder: contins contains the bootstrap js files

	videoAnnotation.css: main css file
	videoAnnotation.html: main html file
	videoAnnotation.js: main js file

videoAnnotation.js File---
	Within the file there is a table of contents: (as of 9/23/2013)

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

	 Important to know the difference of DRAG, DRAW, and ZOOM. Our convention is such that:
	 	DRAG: refers to the action of dragging the mouse over the progressbar to make a comment with a range
	 	DRAW: refers to the action of dragging the mouse over the video to create a yellow rectangular highlight
	 	ZOOM: refers to the action of dragging the mouse over the tickbar holder to select a range of comments to view

	 To see all of the functions within the JS file, look at the bottom of the file where all the functions are added to the NB_vid object.

	 Understanding the general structure:
	 	-There is an anonymous function that creates all of the functions
	 	-At the end of the anonymouse function, it is put into the NB_vid object
	 	-After the anonymous function 3 main functions are called:
	 		- Parse.initialize: initializes Parse, our current server (this will soon be changed)
	 		- onYoutubePlayerReady: this function is specific to the youtube API and is necessary to have our video player function
	 		- $()-- Equivalent to jQuery(document).ready(): this runs all of the functions within NB_vid.funcLists.jQueryReady


