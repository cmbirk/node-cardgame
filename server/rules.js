"use strict";

var _ = require('underscore');

var getHighestBySuit = function(playerMoves, suit) {
  var sameSuitMoves = _.filter(playerMoves, function(move) {
    return move.card.suit == suit;
  });
  
  if (sameSuitMoves.length > 0) {
    var highestMove = _.max(sameSuitMoves, function(move) {
      return move.card.rank; 
    });

    return highestMove;
  } else {
    return null;
  }
};

var decideWinner = function(hand, trumpSuit) {
  var playerMoves = hand.playerMoves;

  var highestTrumpSuitMove = getHighestBySuit(playerMoves, trumpSuit);
  if (highestTrumpSuitMove != null) {
    return highestTrumpSuitMove;
  } else {
    var askedSuit = hand.getAskedSuit();
    var highestAskedSuitMove = getHighestBySuit(playerMoves, askedSuit);
    return highestAskedSuitMove;
  }
};

var isGameDecided = function(teamScores) {
   var team;
   for (team in teamScores) {
     if (teamScores[team] > 6) {
       return true;
     }
   }
   return false;
};

var getWinningTeam = function(teamScores) {
   var team;
   for (team in teamScores) {
     if (teamScores[team] > 6) {
       return team;
     }
   }
   return "";
};

var validatePlayerMove = function(hand, move, trumpSuit, remainingCards) {
        //the first move is always valid
        if (hand.playerMoves.length == 0) {
          return true;
        } else {
          var firstCard = hand.playerMoves[0].card
          var askedSuit = firstCard.suit

          console.log("Asked suit %s", askedSuit);
          console.log("Remaining cards %j", remainingCards);
          console.log("Remaining cards length %d", remainingCards.length);
          var remainingAskedSuit = _.where(remainingCards, {'suit': askedSuit});
          console.log("Remaining asked %j", remainingAskedSuit);

          if (remainingAskedSuit.length == 0) {
            return true;
          }

          var moveCard = move.card;
          var moveSuit = moveCard.suit;
          if (moveSuit == askedSuit) {
            return true;
          }

          console.log("PlayedMove %s not valid for current hand %j", move, hand);
          return false;
        }
};

module.exports = {
  decideWinner: decideWinner,
  validatePlayerMove: validatePlayerMove,
  isGameDecided: isGameDecided,
  getWinningTeam: getWinningTeam
}
