"use strict";

var _ = require('underscore');
var rules = require('./rules');

function Player(id, index, isHuman, team) {
   this.id = id;
   this.index = index;
   this.isHuman = isHuman;
   this.team = team;
}

var createPlayer = function (id, index, isHuman, team) {
  return new Player(id, index, isHuman, team);
  //return {'id': id, 'index': index, 'isHuman': isHuman, 'team': team};
}

var createPlayers = function(teams) {
  var p1 = new Player('A1', 0, true, teams[0]);
  var p2 = new Player('B1', 1, false, teams[1]);
  var p3 = new Player('A2', 2, false, teams[0]);
  var p4 = new Player('B2', 3, false, teams[1]);
  
  var players = [p1, p2, p3, p4];
  return players;
}

var getHighestRankedCard = function(cards) {
  return _.max(cards, function(c) {
    return c.rank;
  });
}

var getLowestRankedCard = function(cards) {
  console.log("getLowestRankedCard for: %j", cards);
  return _.min(cards, function(c) {
    return c.rank;
  });
}

var getHighestCardBySuit = function (cards, suit) {
  var sameSuitCards = _.where(cards, {'suit': suit});
  return getHighestRankedCard(sameSuitCards);
}

var isMyTeamWinning = function(player, hand, trumpSuit) {
  if (hand.playerMoves.length > 0) {
    var winningMove = getWinningMove(hand, trumpSuit);
    var winningPlayer = winningMove.player;
    return (winningMove != null && player.team == winningPlayer.team);
  } else {
    return false;
  }
};

var canBeatWinningMoves = function(hand, sameSuits, trumps, askedSuit, trumpSuit) {
  if (hand.playerMoves.length > 0) {
    var winningMove = getWinningMove(hand, trumpSuit);
    var winningCard = winningMove.card;
    console.log("canBeatWinningMove: winningCard %j", winningCard);
    var higherSameSuits = _.filter(sameSuits, function(c) {
      return (c.suit == winningCard.suit && c.rank > winningCard.rank);
    });
    console.log("canBeatWinningMove: sameSuits %j", sameSuits);
    console.log("canBeatWinningMove: higherSameSuits %j", higherSameSuits);
    console.log("canBeatwinningMove: trumps %j", trumps);
    
    var hasWinner;
    if (higherSameSuits.length > 0) {
      hasWinner = true;
    } else if (sameSuits.length == 0 && trumps.length > 0) {
      hasWinner = true;
    } else {
      hasWinner = false;
    }
    return hasWinner;
  } else {
    return true;
  }
};

var getWinningMove = function(hand, trumpSuit) {
  var playerMoves = hand.playerMoves;
  var num = playerMoves.length;
  
  console.log("Looking for Winning move in hand %j", playerMoves);

  var winningMove = null;
  if (num == 1) {
    //first move is always winning moves
    winningMove = playerMoves[0];
  } else if (num > 1) {
    winningMove = rules.decideWinner(hand, trumpSuit);
    console.log("Winning move decided by rules: %s", winningMove);
  } else {
    //no moves yet played, so no winning move
    winningMove = null;
  }
  console.log("Winning move %j", winningMove);
  return winningMove;
}

//TODO: don't always use highest trump card, but keep slightly higher than required
var getNextMove = function(player, remainingCards, hand, trumpSuit) {
        console.log("** DECIDING NEXT MOVE FOR PLAYER %s ", player.id);
        console.log(" Remaining cards in getNextMove %j", remainingCards);

        //Data sets
        var askedSuit = hand.getAskedSuit();
        console.log("Asked suit %s", askedSuit);
        var sameSuits = _.where(remainingCards, {'suit': askedSuit});
        console.log(" Same suit cards in getNextMove %j", sameSuits);
        var trumps = _.where(remainingCards, {'suit': trumpSuit});
        console.log(" Trump cards in getNextMove %j", trumps);
        var candidates = _.union(sameSuits, trumps);
        console.log(" Candidate cards in getNextMove %j", candidates);
        var others = _.difference(remainingCards, candidates);
        console.log(" Other cards in getNextMove %j", others);

        //Facts
        var isFirstPlayer = hand.size() == 0;
        var onWinningTeam = isMyTeamWinning(player, hand, trumpSuit);
        var canBeatWinningMove = canBeatWinningMoves(hand, sameSuits, trumps, askedSuit, trumpSuit);
        var hasSameSuit = sameSuits.length > 0;
        var hasTrump = trumps.length > 0;
        var hasOthers = others.length > 0;
        console.log("Player %s ==> HasSameSuit %s HasTrump %s HasOthers %s OnWinningTeam %s CanBeatWinningMove %s", player.id, hasSameSuit, hasTrump, hasOthers, onWinningTeam, canBeatWinningMove);

        //Rules
        var strategy = "lowestAny"; 
        if (isFirstPlayer) {
          strategy = "highestAny";  
        }

        if (!isFirstPlayer) {
          if (onWinningTeam) {
            if (hasSameSuit) {
              strategy = "lowestSameSuit";
            } else if (hasOthers) {
              strategy = "lowestOthers";
            } else {
              strategy = "lowestTrump";
            }
          } else {
            if (hasSameSuit) {
              if (canBeatWinningMove) {
                strategy = "highestSameSuit";
              } else {
                strategy = "lowestSameSuit";
              }
            } else if (hasTrump) {
              if (canBeatWinningMove) {
                strategy = "highestTrump";
              } else if (hasOthers) {
                strategy = "lowestOthers";
              } else {
                strategy = "lowestTrump";
              }
            } else {
              strategy = "lowestOthers";
            }
          }
        }

        //Strategy
        console.log("Chosen strategy: %s", strategy);

        var choice = null;

        switch (strategy) {
          case "lowestAny":
            choice = getLowestRankedCard(remainingCards);
            break;
          case "lowestOthers":
            choice = getLowestRankedCard(others);
            break;
          case "lowestSameSuit":
            choice = getLowestRankedCard(sameSuits);
            break;
          case "lowestTrump":
            choice = getLowestRankedCard(trumps);
            break;
          case "highestAny":
            choice = getHighestRankedCard(remainingCards);
            break;
          case "highestOthers":
            choice = getHighestRankedCard(others);
            break;
          case "highestSameSuit":
            choice = getHighestRankedCard(sameSuits);
            break;
          case "highestTrump":
            choice = getHighestRankedCard(trumps);
            break;
          default: 
            throw new Error("Incorrect rules, choice should not be %s for strategy %", choice, strategy);
        }

        if (typeof(choice) == undefined || choice == null) {
          throw new Error("Incorrect rules, choice should not be %s for strategy %", choice, strategy);
        }
        
        console.log("choice %j", choice); 

        var isValidMove = rules.validatePlayerMove(hand, choice, trumpSuit, remainingCards);
        if (!isValidMove) {
          throw new Error("Incorrect rules, choice %j should not be invalid for strategy %", choice, strategy);
        }

        return choice;
};

module.exports = {
  Player: Player,
  createPlayers: createPlayers,
  getNextMove: getNextMove
}
