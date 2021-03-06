declare const THREE: any;

import {PANEL_COUNT_PER_FLOOR} from '../../domain/constants';
import {HpOrientation} from '../../domain/hp-orientation';

export class HpPanels {

    readonly group: any;

    private panels: any[];

    constructor(hpOrientation: HpOrientation) {
        this.group = new THREE.Object3D();
        
        this.panels = [];

        for (let idx = 0; idx < PANEL_COUNT_PER_FLOOR; idx++) {
            let geometry = new THREE.PlaneGeometry(0.6, 0.6);
            let material = new THREE.MeshPhongMaterial();
            let panel = new THREE.Mesh(geometry, material);

            let x: number;
            if (hpOrientation === HpOrientation.DecreasesRightToLeft) {
                x = idx;
            } else {
                x = PANEL_COUNT_PER_FLOOR - idx - 1;
            }
            let y = 0;
            let z = 0;
            panel.position.set(x, y, z);
            panel.visible = false;

            // TODO: Make this pulse at all?
            panel.material.emissive.setHex(0xeeee00);
            panel.material.emissiveIntensity = 0.5;

            this.panels.push(panel);
        }
    }

    start() {
        for (let panel of this.panels) {
            this.group.add(panel);
        }

        // Transform to fit against building.
        this.group.position.set(1.85, 3.55, -1.5);
        this.group.scale.set(0.7, 1.9, 1);

        this.updateHp(PANEL_COUNT_PER_FLOOR, false);
    }

    step(elapsed: number) {
        //
    }

    /**
     * HP bar can go from right-to-left or left-to-right, like a fighting game HP bar.
     * "blinkLost" means to animate the loss of the HP panels directly above.
     */
    updateHp(hp: number, blinkLost: boolean) {
        if (hp > PANEL_COUNT_PER_FLOOR) {
            hp = PANEL_COUNT_PER_FLOOR;
        }

        for (let idx = 0; idx < this.panels.length; idx++) {
            let panel = this.panels[idx];

            if (idx < hp) {
                panel.visible = true;
            } else {
                panel.visible = false;
            }
        }

        // Blink the lost panels, if any, to give the player the impression that they lost something.
        if (blinkLost === true && hp >= 0 && hp < this.panels.length - 1) {
            let idx = hp; // As in the next index up from the current HP index, since array start at 0.
            let panel1 = this.panels[idx];
            let panel2 = this.panels[idx + 1];

            let count = 0;
            let blinkHandle = setInterval(() => {
                count++;
                if (count > 15) {
                    panel1.visible = false;
                    panel2.visible = false;
                    clearInterval(blinkHandle);
                } else {
                    panel1.visible = !panel1.visible;
                    panel2.visible = !panel2.visible;
                }
            }, 200);
        }

        // TODO: Handle update to HP = full as different from HP < full.
    }
}