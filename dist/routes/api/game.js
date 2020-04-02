"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
exports.gameRouter = express_1.default.Router();
const auth_1 = __importDefault(require("../../middleware/auth"));
const GameObject_1 = require("../../GameObject");
const express_validator_1 = require("express-validator");
// @route PUT game/startGame
// @desc starts the game only if done by admin and only if it hasn't been started
// @access  private
exports.gameRouter.put('/startGame', auth_1.default, (req, res) => {
    const name = req.app.locals.payLoad.user.id;
    if (name !== GameObject_1.pokerGame.adminName && GameObject_1.pokerGame.isStarted === false) {
        return res.status(400).send("only the admin can start the game");
    }
    // they are the admin so start the game, with the index and everything
    GameObject_1.pokerGame.isStarted = true; // start the game
    // set the index of the blind and the player's turn to move
    // pokerGame.indexBlind = random.int(0, pokerGame.players.length - 1);
    GameObject_1.pokerGame.indexBlind = 0;
    GameObject_1.pokerGame.handStatus = 0;
    console.log(GameObject_1.pokerGame);
    return res.status(200).send("yay it worked");
});
// @route PUT game/startHand
// @desc starts the hand only if the hand status is zero
// @access public
exports.gameRouter.put('/startHand', auth_1.default, (req, res) => {
    const name = req.app.locals.payLoad.user.id;
    if (!name) {
        return res.status(401).send("This token don't work fool");
    }
    else if (GameObject_1.pokerGame.handStatus !== 0) {
        return res.this.state(400).send("In the middle of the hand fool");
    }
    else {
        // start the game with the update 
        GameObject_1.pokerGame.update();
        console.log(GameObject_1.pokerGame);
        return res.status(200).json({ game: GameObject_1.pokerGame });
    }
});
// @route GET api/auth
// @desc handles call for the user
// @access  Public or private do they need a token to access route
exports.gameRouter.put('/call', auth_1.default, (req, res) => {
    const name = req.app.locals.payLoad.user.id;
    console.log(name);
    // make sure the token exists and user's turn
    if (!name) {
        return res.status(400).json({ error: "jwt not found" });
    }
    // check not turn 
    if (name !== GameObject_1.pokerGame.players[GameObject_1.pokerGame.indexTurn].getName()) {
        return res.status(401).send("was not your turn");
    }
    // check poker game is started
    if (GameObject_1.pokerGame.isStarted === false || GameObject_1.pokerGame.handStatus === 0) {
        return res.status(401).send("game has not been started");
    }
    console.log("here");
    GameObject_1.pokerGame.handleCall();
    console.log(GameObject_1.pokerGame);
    GameObject_1.pokerGame.update();
    console.log(GameObject_1.pokerGame);
    return res.status(200).json({ game: GameObject_1.pokerGame });
});
// @route GET api/auth
// @desc handles raise for the user
// @access  Public or private do they need a token to access route
exports.gameRouter.put('/raise', auth_1.default, [
    express_validator_1.check('amount', 'need to send an amount to raise').not().isNumeric()
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("here");
    console.log(req.app.locals.payLoad);
    const { amount } = req.body;
    console.log(req.body);
    console.log(amount);
    const name = req.app.locals.payLoad.user.id;
    console.log(name);
    // make sure the token exists
    if (!name) {
        return res.status(400).json({ error: "jwt not found" });
    }
    // check it is their turn
    if (name !== GameObject_1.pokerGame.players[GameObject_1.pokerGame.indexTurn].getName()) {
        return res.status(401).send("was not your turn");
    }
    // check poker game and hand is started
    if (GameObject_1.pokerGame.isStarted === false || GameObject_1.pokerGame.handStatus === 0) {
        return res.status(401).send("game has not been started");
    }
    // check if they have enough chips to raise
    if (GameObject_1.pokerGame.players[GameObject_1.pokerGame.indexTurn].hasEnoughChips(GameObject_1.pokerGame.maxBet -
        GameObject_1.pokerGame.players[GameObject_1.pokerGame.indexTurn].getChipsInHand() + amount) === false) {
        return res.status(401).send("not enough chips to raise");
    }
    console.log(GameObject_1.pokerGame);
    GameObject_1.pokerGame.handleRaise(name);
    GameObject_1.pokerGame.update();
    return res.status(200).json({ game: GameObject_1.pokerGame });
}));
// @route PUT api/auth
// @desc handles fold for the user
// @access  Public or private do they need a token to access route
exports.gameRouter.put('/fold', auth_1.default, (req, res) => {
    const name = req.app.locals.payLoad.user.id;
    console.log(name);
    // make sure the token exists and user's turn
    if (!name) {
        return res.status(400).json({ error: "jwt not found" });
    }
    // check not turn 
    if (name !== GameObject_1.pokerGame.players[GameObject_1.pokerGame.indexTurn].getName()) {
        return res.status(401).send("was not your turn");
    }
    // check poker game is started
    if (GameObject_1.pokerGame.isStarted === false || GameObject_1.pokerGame.handStatus === 0) {
        return res.status(401).send("game has not been started");
    }
    GameObject_1.pokerGame.handleFold();
    GameObject_1.pokerGame.update();
    console.log(GameObject_1.pokerGame);
    return res.status(200).json({ game: GameObject_1.pokerGame });
});
//# sourceMappingURL=game.js.map