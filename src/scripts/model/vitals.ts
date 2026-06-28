import {PANEL_COUNT_PER_FLOOR} from '../domain/constants';

export const MAX_HP = PANEL_COUNT_PER_FLOOR; // HP corresponds to the number of long windows on the second floor of the physical building.

class Vitals {
    humanHitPoints: number;
    aiHitPoints: number;

    constructor() {
        // ⚠️ TEMP DEBUG: HP forced to 1 so the game ends after a single top-out,
        // to reach the end screen quickly. REVERT both to MAX_HP before shipping
        // (and re-run `npm run deploy`). The deployed docs/ build does NOT have this.
        this.humanHitPoints = 1;
        this.aiHitPoints = 1;
    }
}
export const vitals = new Vitals();