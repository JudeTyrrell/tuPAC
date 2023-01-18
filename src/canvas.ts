import Element from "./element";
import p5 from "p5";
import { Transport } from "tone";
import { Pos } from "./position";
import Sample from "./sample";
import Playable from "./element";

const canvasColor = "#77b7bb";
const canvasOutline = "#314814";
const controlBarHeight = 30;
const controlBarColor = "#111111"

export class ControlBar extends Element {
    constructor(size: Pos, p: p5) {
        super(new Pos(0, 0), size,  p, false);
    }

    draw(offset: Pos) {
        this.p.fill(controlBarColor);
        this.p.noStroke();
        this.p.rect(offset.x, offset.y, this.size.x, this.size.y);
    }

    // Placeholder until Button class implemented
    topUnderMouse(offset: Pos): Element {
        return null;
    }
}

export default class Canvas extends Element implements Playable {
    time: number;
    // Array of elements on this Canvas. Elements are drawn in order of increasing index, and so the later an element's index in this array, the closer to the 'top' it is.
    elements: Element[];
    controlBar: ControlBar;

    constructor(pos: Pos, size: Pos, p: p5, draggable = true) {
        super(pos, size, p, draggable);
        this.time = Transport.immediate();
        this.elements = [];
        this.controlBar = new ControlBar(new Pos(size.x, controlBarHeight), p);
    }

    draw(offset: Pos): void {
        this.p.fill(canvasColor);
        this.p.stroke(canvasOutline);
        this.simpleRect(offset);
        let off = Pos.sum(this.pos, offset);
        for (let element of this.elements) {
            element.draw(off);
        }
        this.controlBar.draw(off);
    }

    play(): void {
        throw new Error("Method not implemented.");
    }

    pause(): void {
        throw new Error("Method not implemented.");
    }

    stop(): void {
        throw new Error("Method not implemented.");
    }

    addSample(pos: Pos, sample: string, size = new Pos(30,30)): Sample {
        let samp = new Sample(pos, size, this.p, sample);
        this.elements.push(samp);
        return samp;
    }

    addCanvas(pos: Pos): Canvas {
        let canvas = new Canvas(pos, Pos.scale(this.size,0.3), this.p, true);
        this.elements.push(canvas);
        return canvas;
    }

    // Returns the Element directly under the mouse. By looping through the elements array and replacing any previous 
    // values with elements further in the array, we will return the Element that the mouse is within the range of which is also drawn last.
    topUnderMouse(offset: Pos): Element {
        let top = null;
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, this.mPos())) {
            top = this;
            for (let element of this.elements) {
                let inner = element.topUnderMouse(abs);
                if (inner != null) {
                    top = inner;
                }
            }   
        }

        return top;
    }
}