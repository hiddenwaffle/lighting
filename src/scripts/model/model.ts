import {board} from './board';
import {npcManager} from './npc/npc-manager';
import {eventBus, EventType} from '../event/event-bus';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerMovementEvent} from '../event/player-movement-event';

class Model {
    
    start() {
        eventBus.register(EventType.PlayerMovementEventType, (event: PlayerMovementEvent) => {
            this.handlePlayerMovement(event.movement);
        });

        board.start();
        npcManager.start();

        board.beginNewGame(); // TODO: Instead, start game when player hits a key first.
    }

    step(elapsed: number) {
        board.step(elapsed);
        npcManager.step(elapsed);
    }

    private handlePlayerMovement(movement: PlayerMovement) {
        switch (movement) {
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