import {Board} from './board/board';
import {Ai} from './ai/ai';
import {npcManager} from './npc/npc-manager';
import {eventBus, EventType} from '../event/event-bus';
import {Player} from '../domain/player';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerMovementEvent} from '../event/player-movement-event';

class Model {
    private humanBoard: Board;
    private aiBoard: Board;
    private ai: Ai;

    constructor() {
        this.humanBoard = new Board(Player.Human);
        this.aiBoard = new Board(Player.Ai);
        this.ai = new Ai(this.aiBoard);
    }

    start() {
        eventBus.register(EventType.PlayerMovementEventType, (event: PlayerMovementEvent) => {
            this.handlePlayerMovement(event);
        });

        this.humanBoard.start();
        this.aiBoard.start();
        this.ai.start();
        npcManager.start();

        // TODO: Instead, start game when player hits a key first.
        this.humanBoard.beginNewGame();
        this.aiBoard.beginNewGame();
    }

    step(elapsed: number) {
        this.humanBoard.step(elapsed);
        this.ai.step(elapsed);
        this.aiBoard.step(elapsed);
        npcManager.step(elapsed);
    }

    private handlePlayerMovement(event: PlayerMovementEvent) {
        let board: Board;
        if (event.player === Player.Human) {
            board = this.humanBoard;
        } else {
            board = this.aiBoard;
        }

        switch (event.movement) {
            case PlayerMovement.Left:
                board.moveShapeLeft();
                break;
            case PlayerMovement.Right:
                board.moveShapeRight();
                break;
            case PlayerMovement.Down:
                board.moveShapeDown();
                break;
            case PlayerMovement.Drop:
                board.moveShapeDownAllTheWay();
                board.stepNow(); // prevent any other keystrokes till next tick
                break;
            case PlayerMovement.RotateClockwise:
                board.rotateShapeClockwise();
                break;
            default:
                console.log('unhandled movement');
                break;
        }
    }
}
export const model = new Model();