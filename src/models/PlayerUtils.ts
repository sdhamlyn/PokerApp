import { Player } from "./player";

export class PlayerUtils {

    // checks if there is more than one person in the hand (not folded or all in)
    allFolded(players: Player[]) : boolean {
        let countIn = 0
        for (const i of players) {
            if (i.getStatus() === 1 || i.getStatus() === 2 || i.getStatus() === 0 ) {
                countIn += 1;
            }
        }
        // if nobody in something messed up
        if (countIn === 0) {
            throw new ErrorEvent("no players in");
        }
        return countIn === 1;
    }

    // checks if not every player is done betting (for next cards)
    notAllSet(Players : Player[]) : boolean {
        for (const i of Players) {
            if (i.getStatus() === 1 || i.getStatus() === 2) {
                return false;
            }
        }
        return true;
    }


}