
import Effect from "./effect";
import { Resi } from "./element";
import { Capsule } from "./Capsule";
import p5 from "p5";
import Pos from "./position";
import * as Tone from "tone";

export default class Reverb extends Effect {
    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, draggable = true, resizable = Resi.None) {
        super(pos, size, p, parent, new Tone.Reverb(0.7), draggable, resizable);
        this.controlBar.addTitle("Reverb");
        this.controlBar.label.typeable = false;
        this.controlBar.label.height = 14;
        this.controlBar.label.updateText();
    }

    copy(): Effect {
        return new Reverb(this.pos.copy(), this.size.copy(), this.p, this.parent, this.draggable.valueOf(), this.resizable.valueOf());
    }
}