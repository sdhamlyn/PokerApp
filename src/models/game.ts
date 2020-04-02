import {Player} from "./player";
import {Deck} from "./deck";
import pokersolver from 'pokersolver';
import { Card } from "./card";
const Hand = pokersolver.Hand;
import {PlayerUtils} from "./PlayerUtils";
const PlayerUtil = new PlayerUtils();

export class Game {
    adminName: any;
    isStarted: boolean;
    pot: number;
    indexBlind: number;
    indexTurn: number;
    deck: Deck;
    players: Player[];
    blindAmount: number;
    requestMade: boolean;
    handComplete: boolean;
    maxBet: number;

    // statuses:
    // 0 is hand hasn't started
    // 1 is preflop betting
    // 2 is flop betting
    // 3 is turn betting
    // 4 is river betting
    handStatus : number;

    constructor() {
        this.isStarted = false;
        this.pot = 0;
        this.indexBlind = 0;
        this.indexTurn = 0;
        this.deck = new Deck();
        this.players = [];
        this.blindAmount = 5;
        this.adminName = null;
        this.handComplete = false;
        this.maxBet= 0;
        this.requestMade = false;
        this.handStatus = 0;
        // isPlayerShowHands = 
    }

    // statuses:
    // 0 is hand hasn't started
    // 1 is preflop betting
    // 2 is flop betting
    // 3 is turn betting
    // 4 is river betting
    // 5 handling winners
    update() : any {
        this.indexTurn = (this.indexTurn + 1) % this.players.length;
        let newIndex;
        if (PlayerUtil.allFolded(this.players)) {
            this.handStatus = 0;
        }
        switch(this.handStatus) {
        
        case 0:
            this.resetHand();
            this.handStatus = 1;
            break;

        // preflop bets being made currently
        case 1:
            newIndex = PlayerUtil.findNextOrSet(this.players, this.indexTurn);
            // need to change the status blah blah
            if (newIndex === -1) {
                // sets the flop, the statuses, and the next turn
                this.setFlopCards();
                // set the statuses back
                this.setStatusesBet();
                // set the player's turn to bet
                this.setTurnBet();
                this.handStatus = 2;
                
            }
            else {
                this.indexTurn = newIndex;
            }
            break;
        case 2:
            newIndex = PlayerUtil.findNextOrSet(this.players, this.indexTurn);
            // need to change the status blah blah
            if (newIndex === -1) {
                // sets the turn, the statuses, and the next turn
                this.setRiverTurn();
                // set the statuses back
                this.setStatusesBet();
                // set the player's turn to bet
                this.setTurnBet();
                this.handStatus = 3;
            }
            else {
                this.indexTurn = newIndex;
            }
            break;
        case 3:
            newIndex = PlayerUtil.findNextOrSet(this.players, this.indexTurn);
            // need to change the status blah blah
            if (newIndex === -1) {
                // sets the river, the statuses, and the next turn
                this.setRiverTurn();
                // set the statuses back
                this.setStatusesBet();
                // set the player's turn to bet
                this.setTurnBet();
                this.handStatus = 4;
            }
            else {
                this.indexTurn = newIndex;
            }
            break;
        case 4:
            newIndex = PlayerUtil.findNextOrSet(this.players, this.indexTurn);

            // handle the winners if the river betting is over
            if (newIndex === -1) {
                // set the handstatus to 0, indicating the winners have been handled and the hand is over
                this.handStatus = 0;

                // set the index of the turn to -1 so nobody can make moves until the next hand maybe wrong way ?
                this.indexTurn = -1;

                // handle the winners of the hand and wait for someone to say start new hand (emit something from socket)
                this.handleWinners();

            }
            else {
                this.indexTurn = newIndex;
            }
            break;
        }
    }

    setAdmin(name : any) : void {
        this.adminName = name;
    }    
    // A request to start the game can only be made by admin
     startGameRequest(token: any) : void {
         if (token === this.adminName) {
             this.isStarted = true;
         }
     }

    // adds a player object to the game
    addPlayer(newPlayer: Player) {
        this.players.push(newPlayer);
    }

    // get player by their name
    getPlayerByName(name : any) : Player {
        for (const i of this.players) {
            if (i.getName() === name) {
                return i;
            }
        }
    }

    // checks if this name has been chosen yet
    nameChosen(arg0: { name: any; }) {
        for (const i of this.players) {
            if (i.name === arg0.name) {
                return true;
            }
        }
        return false;
    }
    // shuffles a new deck
    newDeck() : void  {
        this.deck.clearGenerate();
    }

    // clears the player's deck
    clearDecks() : void {
        for (const i of this.players) {
            i.clearDeck();
        }
    }
    // clears the chips in the hand for the player
    clearChipsHand() : void {
        for (const i of this.players) {
            i.setChipsInHand(0);
        }
    }


    // sets the information for the next turn
    resetHand() : void { 
        // this.pot = 0; should not reset pot in case there was some extra????

        // clear the player's hands
        this.clearDecks();
        
        // set the statuses for the hand
        this.setStatusesHand();
        
        // set up the deck randomize
        this.deck.clearGenerate();

        // clear the chips
        this.clearChipsHand();

        // set the blinds for the hand
        this.setBlind();

        // set the player cards
        this.setPlayerCards();

    }

    // sets the next person's turn for the new betting round
    setTurnBet() : void {
        const i = (this.indexBlind + 1) % this.players.length;
        const nextindex = PlayerUtil.findNextOrSet(this.players, i);
        if (nextindex === -1) {
            this.handStatus = 5;
            // THIS DON'T SEEM RIGHT FIGURE THIS OUT how to handle what cannot happen
        }
        else {
            this.indexTurn = nextindex;
        }
    }

    // sets statuses for the new round of betting
    setStatusesBet() : void {
        for (const i of this.players) {
            if (i.getStatus() === 0) {
                i.setStatus(2);
            }
            // if they are folded, sitting out, or all in, don't do anything
        }
    }
    // sets all the statuses for players to 1
    setStatusesHand() : void {
        for (const i of this.players) {
            if (i.getStatus() === 100) {
                return;
            }
            else {
            i.setStatus(1);
            }
        }
    }

    // sets the two cards for each player
    setPlayerCards() {
        for (const i of this.players) {
            const card1 : Card = this.deck.getCard();
            const card2 : Card = this.deck.getCard();
            i.setInitialHand(card1, card2);
        }
    }
    // sets the flop in each player's hand
    setFlopCards() : void {
        const card1 : Card = this.deck.getCard();
        const card2 : Card = this.deck.getCard();
        const card3 : Card = this.deck.getCard();
        this.players.forEach(player => player.addFlop(card1, card2, card3));
    }

    // sets the river / turn
    setRiverTurn() : void {
        const card : Card = this.deck.getCard();
        this.players.forEach(player => player.addCard(card));
    }


    // changes turn and sets up the blind
    setBlind() : void {
        this.indexBlind = (this.indexBlind + 1) % this.players.length;
        while (this.players[this.indexBlind].hasEnoughChips(this.blindAmount) === false) {
            this.indexBlind = (this.indexBlind + 1) % this.players.length;
        } 
        this.indexTurn = (this.indexBlind + 1) % this.players.length;
        // takes the blind from the player and puts in the pot (sets player status to check)
        this.pot += this.blindAmount;
        this.players[this.indexBlind].payChips(this.blindAmount);
        this.players[this.indexBlind].setChipsInHand(this.blindAmount);
        this.players[this.indexBlind].setStatus(2);
        this.maxBet += this.blindAmount;
    }



    handleCall() : void {
        // check its the correct user
        const player = this.players[this.indexTurn];

            // they have enough to bet... they don't have to go all in
            if (player.hasEnoughChips(this.maxBet - player.getChipsInHand())) {
                this.pot += (this.maxBet - player.getChipsInHand()); // pot adds chips
                player.payChips(this.maxBet - player.getChipsInHand()); // player loses chips
                player.setChipsInHand(this.maxBet); // player's chips in hand is the max Bet  
                player.setStatus(0);  
            }

            // they don't have enough chips... therefore they are going all in
            else {
                this.pot += player.getChips(); // add whatever chips player has to the pot
                player.addChipsInHand(player.getChips()); // player has added rest of the chips in hand
                player.setChips(0); // player now has zero chips
                player.setStatus(3); // change status to all in
            }
            this.requestMade = true;
        }


    // it shouldn't get to someone's turn if they are folded
    handleRaise(raiseAmt : number) : void {
            const player = this.players[this.indexTurn];
            const toBet = this.maxBet - player.getChipsInHand() + raiseAmt

            // first check if they have enough to make the raise;
                this.maxBet = this.maxBet + raiseAmt; // raise the max bet
                player.payChips(toBet); // player has to pay the chips he bet
                this.pot += toBet; // increase the pot
                player.setChipsInHand(this.maxBet); // the number of chips tthey have in hand is the max bet

                // for every player not folded or all in, set their status
                for (const i of this.players) {
                    // if same 
                    if (i.getName() === player.getName()) {
                        i.setStatus(0);
                    }
                    else if (i.getStatus() === 0 || i.getStatus() === 2) {
                        i.setStatus(1);
                    }
                    else {
                        // do nothing... they're in correct status
                    }
                }
                this.requestMade = true; // set the requestMade status to true
        }

    handleFold() : void {
            const player = this.players[this.indexTurn];
            player.setStatus(-1);
            this.requestMade = true;
        }

    // sleeps while waiting for a move to be made
    sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
    

    // place the bets for the turn
    async placeBetsTurn() {
        // while not players are checked set or folded
        while (PlayerUtil.AllSet(this.players) === false) {
            const player = this.players[(this.indexTurn)];

            // if they are checked and need to recheck or need to call
            if (player.getStatus() === 2 || player.getStatus() === 1) {
                while (this.requestMade === false) {
                    await this.sleep(50);
                }
                // set it back to false for the rest of the loop
                this.requestMade = false;
                
                // if everyone folded after this turn handle the winners
                if (PlayerUtil.allFolded(this.players)) {
                    this.handleWinners();
                    break;
                }
            }

            this.indexTurn = (this.indexTurn + 1) % this.players.length; // change the turn after the player moves
        }

    }

    // check if there is a winner, and if there is, invokes the end of hand stuff
    // checkWinner() : boolean {
    // }



    // handles the winners by adding the chips to their pile and cleaning the winners array
    handleWinners() : void {
        const winners = []
        for (const i of this.players) {
            if (i.getStatus() === 3 || i.getStatus() === 0) {
                winners.push(i);
            }
        }
        winners.sort((a : Player, b : Player) => a.getChipsInHand() - a.getChipsInHand());
        console.log(winners);
        // if there is only one winner he gets the entire pot... that's all that happens
        if (winners.length === 1) {
            winners[0].addChips(this.pot);
            return;
        }

        // if one player has more in it than the rest...he gets the difference back.
        else if (winners[winners.length - 1].getChipsInHand() !==  winners[winners.length - 2].getChipsInHand()) {
            const diff = winners[winners.length - 1].getChipsInHand() - winners[winners.length - 2].getChipsInHand();
            winners[winners.length - 1].addChips(diff);
            winners[winners.length - 1].chipsInHand -= diff;
            this.pot -= diff;
        }
        let winnerIndexes : number[] = []; 

        // while there are no potential winners to process
        while (winners.length > 1) {
            // get the indices of all the winning hands
            winnerIndexes = this.getWinnerInd(winners);
            // get the winning players from the indices
            const winningHands : Player[] = [];
            for (const i of winnerIndexes) {
                winningHands.push(winners[i]);
            }
            // now you have the winning players in a list 
            const minVal = Math.min.apply(Math, winningHands.map(p => { return p.getChipsInHand();}))
            let sidepot = 0;
            // subtract from each player's pot depending on how much they have
            for (const j of this.players) {
                if (j.getChipsInHand() <= minVal) {
                    sidepot += j.getChipsInHand();
                    this.pot -= j.getChipsInHand();
                    j.chipsInHand = 0;
                }
                else {
                    sidepot += minVal;
                    this.pot -= minVal;
                    j.chipsInHand -= minVal;
                }
            }
            // split the sidepot between the winners
            const sidePotSplit = sidepot / winningHands.length;
            winningHands.forEach(e => {
                e.addChips(sidePotSplit);
            })
            // get rid of the sidepots 
            winners.filter(p => p.getChipsInHand() > 0);
        }
        // should never hit this point
        if (winners.length === 1) {
            winners[0].addChips(this.pot);
            this.pot = 0;
        }
    }
    getWinnerInd(winners : Player[]) : any[]  {
        const winnerIndexes : any[] = [];
        const hands = winners.map(w => Hand.solve(w.getStringHand()));
        console.log(hands);
        const winningHands = Hand.winners(hands);
        console.log(winningHands);
        for (const w of winningHands) {
            winnerIndexes.push(hands.indexOf(w));
        }
        return winnerIndexes;
    }
}