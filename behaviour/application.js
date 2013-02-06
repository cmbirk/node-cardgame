'use strict';

(function(window, $, undefined) {

function hasRequiredFeatures() {
  var res = true;
  /*
  if (!("WebSocket" in window) && !("MozWebSocket" in window)) {
    res = false;
    console.error("No WebSocket support detected");
  }
  if (!("localStorage" in window)) {
    res = false;
    console.error("No localStorage support detected");
  } */
  console.log("Browser supported: " + res);
  return res;
}

function checkSocketIO() {
  var res = true;
  if (!("io" in window) && !("io" in window)) {
    res = false;
    console.error("No Socket.IO loaded");
  }
  console.log("Socket IO loaded: " + res);
  return res;
}

function showBrowserLinks() {
  $("#progressOverlay").hide();
  $("#canvas").hide();
  $("#fbContainer").hide();
  $("#browserLinks").show();
}

function showUnavailable() {
  $("#progressOverlay").hide();
  $("#canvas").hide();
  $("#fbContainer").hide();
  $("#unavailable").show();
}

function initConsole() {
   var alertFallback = false;
   if (typeof console === "undefined" || typeof console.log === "undefined") {
     console = {};
     if (alertFallback) {
         console.log = function(msg) {
              alert(msg);
         };
         console.debug = function(msg) {
              alert(msg);
         };
         console.error = function(msg) {
              alert(msg);
         };
     } else {
         console.log = function() {};
         console.debug = function() {};
         console.error = function() {};
     }
   } else if (console && !console.debug) {
     console.debug = function() {};
   } else if (console && !console.error) {
     console.error = function() {};
   }
}

function Application() {
}

Application.prototype = {
  init: function() {
    window.playerList = new PlayerList([]);
    window.playerCardList = new CardList([]);
    window.playerMoveList = new PlayerMoveList([]);
    window.game = new Game();

    var view = new View();
    var messageHandler = new MessageHandler();
   
    window.game.setView(view);
    window.game.setMessageHandler(messageHandler);

    window.game.setPlayerName("");
    window.game.setPlayerTeam("Team Suriname");
    window.game.setCpuTeam("Team Nederland");

    //First try to make WebSocket connection, before preloading images
    messageHandler.connect(function() {
      view.preload();
    }); 
  },

  getStoredValue: function(key) {  
    var value = localStorage.getItem(key);
    console.debug("Retrieved " + key + " with value " + value);
    return value;
  },

  storeValue: function(key, value) {
    console.debug("Storing  "+ key + " with value " + value);
    localStorage.setItem(key, value);
  }

};
    
initConsole();
if (!hasRequiredFeatures()) {
  showBrowserLinks();
} else if (!checkSocketIO()) {
  showUnavailable();
} else {
  var application = new Application();
  application.init();
}

})(window, jQuery);
