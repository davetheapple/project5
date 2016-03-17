/**
 *
 * Image Note Edit View
 *
 * imageNoteEditView.js
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
  "text!html/imageNoteEditView.html!strip", "app/views/textNoteEditView", "hammer"
], function( _y, noteStorageSingleton, imageNoteViewHTML, TextNoteEditView, Hammer ) {
  var _className = "ImageNoteEditView";
  var ImageNoteEditView = function() {
    var self = new TextNoteEditView();
    self.subclass( _className );
    /*
     * buttons in this view
     */
    self._takePictureButton = null;
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
     * we also need to keep track of the image area
     */
    self._imageContainer = null;
    /**
     * override the text editor's template with our own
     */
    self.overrideSuper( self.class, "render", self.render );
    self.render = function() {
      return _y.template( imageNoteViewHTML, {
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
     * Whenever the image is loaded or a new photo is taken, we need to update the image onscreen
     */
    self.updatePhoto = function() {
      // first, remove the old image from the CSS style
      _y.UI.styleElement( self._imageContainer, "background-image", "inherit" );
      // after a 100ms, add a new image (give the DOM a chance to notice the change)
      var template = "url(cdvfile://localhost/persistent%URL%?%CACHE%)";
      setTimeout( function() {
        var cacheBust = Math.floor( Math.random() * 100000 );
        var newBackground = _y.template( template, {
          "URL": self._note.mediaContents,
          "CACHE": cacheBust
        } );
        _y.UI.styleElement( self._imageContainer, "background-image", newBackground );
      }, 100 );
    };
    /**
     * When a photo is captured, remove the listener and update the photo on screen
     */
    self.onPhotoCaptured = function() {
      self._note.camera.removeListenerForNotification( "photoCaptured", self.onPhotoCaptured );
      // update our photo visually
      self.updatePhoto();
    };
    /**
     * Add a listener so we can be notified when the photo has been taken, and show the camera interface
     */
    self.takePicture = function() {
      self._note.camera.addListenerForNotification( "photoCaptured", self.onPhotoCaptured );
      self._note.camera.takePicture().catch( function( anError ) {
        // if we have an error, remove the listener
        self._note.camera.removeListenerForNotification( "photoCaptured", self.onPhotoCaptured );
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
      self._takePictureButton = self.element.querySelector(
        ".image-container .ui-glyph.non-outline" );
      self._imageContainer = self.element.querySelector( ".image-container" );
      Hammer( self._takePictureButton ).on( "tap", self.takePicture );
      // update the photo
      self.updatePhoto();
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
      // =============== END NEW =========================*/
      
    };
    /**
     * Clean up after ourselves and stop listening to notifications
     */
    self.overrideSuper( self.class, "destroy", self.destroy );
    self.destroy = function() {
      self._takePictureButton = null;
      self._imageContainer = null;
      self._note.camera.removeListenerForNotification( "photoCaptured", self.onPhotoCaptured );
      
      // ====================== NEW ==========================
      //self._followupButton = null; // destroy the new stuff
	  //self._archiveButton = null;
      
      self.super( _className, "destroy" );
    };
    return self;
  };
  return ImageNoteEditView;
} );
