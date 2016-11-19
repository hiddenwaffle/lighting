import {input, Key} from './input';
import {eventBus} from '../event/event-bus';
import {PlayerMovement} from '../domain/player-movement';
import {Player} from '../domain/player';
import {PlayerMovementEvent} from '../event/player-movement-event';

// TODO: Here determine if player is holding down one of the arrow keys; if so, fire rapid events after (TBD) amount of time.

class Controller {

    start() {
        input.start();
    }

    step(elapsed: number) {
        if (input.isDownAndUnhandled(Key.Up)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.RotateClockwise, Player.Human));
        }

        if (input.isDownAndUnhandled(Key.Left)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Left, Player.Human));
        }

        if (input.isDownAndUnhandled(Key.Right)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Right, Player.Human));
        }

        if (input.isDownAndUnhandled(Key.Down)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Down, Player.Human));
        }

        if (input.isDownAndUnhandled(Key.Space)) {
            eventBus.fire(new PlayerMovementEvent(PlayerMovement.Drop, Player.Human));
        }
    }
}
export const controller = new Controller();