/**
 *
 * Video Note Edit View
 *
 * videoNoteEditView.js
 * @author Kerri Shotts
 * @version 1.0.0
 *
 * Copyright (c) 2013 Packt Publishing
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT
 * OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
/*jshint
         asi:true,
         bitwise:true,
         browser:true,
         curly:true,
         eqeqeq:false,
         forin:true,
         noarg:true,
         noempty:true,
         plusplus:false,
         smarttabs:true,
         sub:true,
         trailing:false,
         undef:true,
         white:false,
         onevar:false 
 */
/*global define*/
define( [ "yasmf", "app/models/noteStorageSingleton",
  "text!html/videoNoteEditView.html!strip", "app/views/textNoteEditView", "hammer"
], function( _y, noteStorageSingleton, videoNoteViewHTML, TextNoteEditView, Hammer ) {
  var _className = "VideoNoteEditView";
  var VideoNoteEditView = function() {
    var self = new TextNoteEditView();
    self.subclass( _className );
    /*
     * buttons in this view
     */
    self._recordButton = null;
    /*
    // =================== NEW buttons =======================
    
    	self._followupButton = null;
    	self._archiveButton = null;
    	
    // =================== NEW buttons =======================
    
     // =============== NEW =========================
    /**
     * Set the status of the specific note.
     
    self.setNoteStatus = function( e ) {
    	
		// get status text
    	var text = e.target.innerText;
    	
    	// hardcode changing all the buttons back to normal? Weird.
    	//
    	self.element.querySelector( ".archive" ).style.backgroundColor = "transparent";
    	self.element.querySelector( ".followup" ).style.backgroundColor = "transparent";
    	
    	// set selected color and store it in the note object
    	e.target.style.backgroundColor = "rgb(100, 243, 201)";
		self._note.setStatus(text);
    }*/
    
    /*
     * we also need to keep track of the area that will hold the video element
     */
    self._videoElementContainer = null;
    /**
     * override the text editor's template with our own
     */
    self.overrideSuper( self.class, "render", self.render );
    self.render = function() {
      return _y.template( videoNoteViewHTML, {
        "NOTE_NAME": self._note.name,
        "NOTE_CONTENTS": self._note.textContents,
        "BACK": _y.T( "BACK" ),
        "DELETE_NOTE": _y.T( "app.nev.DELETE_NOTE" ),
        
        // =============== NEW =========================
        "ARCHIVE_NOTE": "<img src='archive.png' title='archive' height='16px'>",//_y.T( "app.nev.ARCHIVE_NOTE" ),
        "FOLLOWUP_NOTE": "<img src='pin.png' title='follow-up' height='16px'>"//_y.T( "app.nev.FOLLOWUP_NOTE" )
        
      } );
    };
    /**
     * Update the video element (after loading or a video is recorded)
     */
    self.updateVideo = function() {
      var html = "<video controls src='%URL%?%CACHE%'></video>";
      var fm = noteStorageSingleton.fileManager;
      var nativePath = fm.getNativeURL( self._note.mediaContents );
      var cacheBust = Math.floor( Math.random() * 100000 );
      self._videoElementContainer.innerHTML = _y.template( html, {
        "URL": nativePath,
        "CACHE": cacheBust
      } );
    };
    /**
     * After video is captured, remove the listener and update the video on-screen
     */
    self.onVideoCaptured = function() {
      self._note.video.removeListenerForNotification( "videoCaptured", self.onVideoCaptured );
      self.updateVideo();
    };
    /**
     * Called when the user wants to record video
     */
    self.captureVideo = function() {
      self._note.video.addListenerForNotification( "videoCaptured", self.onVideoCaptured );
      self._note.video.captureVideo().catch( function( anError ) {
        // if an error, remove the listener
        self._note.video.removeListenerForNotification( "videoCaptured", self.onVideoCaptured );
        console.log( anError );
      } ).done();
    };
    /**
     * we get to use some of the text editor's renderToElement to load
     * in some of our elements and hook them up, though.
     */
    self.overrideSuper( self.class, "renderToElement", self.renderToElement );
    self.renderToElement = function() {
      self.super( _className, "renderToElement" );
      self._recordButton = self.element.querySelector(
        ".video-container .video-actions .ui-glyph" );
      self._videoElementContainer = self.element.querySelector(
        ".video-container .video-element" );
      Hammer( self._recordButton ).on( "tap", self.captureVideo );
      // update the photo
      self.updateVideo();
      /*
       // =============== NEW =========================
       // get elements from DOM
      self._archiveButton = self.element.querySelector( ".archive" );
      self._followupButton = self.element.querySelector( ".followup" );
      
      // if there is a status, change the color so we can see that it is set
      // and persistent
      var status = self._note.getStatus();
      if(status == undefined) status = "";
      if(status != "") {
	      switch(status) {
		      case "Archive":
		      	self._archiveButton.style.backgroundColor = "rgb(100, 243, 201)";
		      	break;
		      case "Follow-up":
		      	self._followupButton.style.backgroundColor = "rgb(100, 243, 201)";
		      	break;
	      }
      }
      
      //give status buttons a tab event
      Hammer( self._archiveButton ).on( "tap", self.setNoteStatus );
      Hammer( self._followupButton ).on( "tap", self.setNoteStatus );
      // =============== END NEW ========================= */
      
    };
    /**
     * Clean up after ourselves and stop listening to notifications
     */
    self.overrideSuper( self.class, "destroy", self.destroy );
    self.destroy = function() {
      self._recordButton = null;
      self._videoElementContainer = null;
      self._note.video.removeListenerForNotification( "videoCaptured", self.onVideoCaptured );
      
      // ====================== NEW ==========================
      self._followupButton = null; // destroy the new stuff
	  self._archiveButton = null;
      
      self.super( _className, "destroy" );
    };
    return self;
  };
  return VideoNoteEditView;
} );
