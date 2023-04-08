
import Effect from "./effect";
import { Resi } from "./element";
import { Capsule } from "./Capsule";
import p5 from "p5";
import Pos from "./position";
import * as Tone from "tone";

export default class Distort extends Effect {
    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, draggable = true, resizable = Resi.None) {
        super(pos, size, p, parent, new Tone.Distortion(0.7), draggable, resizable);
        this.controlBar.addTitle("Distortion");
        this.controlBar.label.typeable = false;
    }

    copy(): Effect {
        return new Distort(this.pos.copy(), this.size.copy(), this.p, this.parent, this.draggable.valueOf(), this.resizable.valueOf());
    }
}