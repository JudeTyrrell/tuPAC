import Playable from "./playable";
import Element from "./element";
import p5 from "p5";
import { Transport } from "tone";
import { Pair } from "./position";
import Sample from "./sample";

const canvasColor = "#77b7bb";
const canvasOutline = "#314814";
const controlBarHeight = 30;
const controlBarColor = "#111111"


export class ControlBar extends Element {

    constructor(size: Pair, p: p5) {
        super(new Pair(0, 0), size,  p, false);
    }

    draw(offset: Pair) {
        this.p.fill(controlBarColor);
        this.p.noStroke();
        this.p.rect(offset.x, offset.y, this.size.x, this.size.y);
    }
}

export default class Canvas extends Element implements Playable {
    time: number;
    elements: Element[];
    controlBar: ControlBar;

    constructor(pos: Pair, size: Pair, p: p5, draggable = true) {
        super(pos, size, p, draggable);
        this.time = Transport.immediate();
        this.elements = [];
        this.controlBar = new ControlBar(new Pair(size.x, controlBarHeight), p);
    }

    draw(offset: Pair): void {
        this.p.fill(canvasColor);
        this.p.stroke(canvasOutline);
        this.simpleRect(offset);
        let off = Pair.sum(this.pos, offset);
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

    addSample(pos: Pair, sample: string, size = new Pair(30,30)): Sample {
        let samp = new Sample(pos, size, this.p, sample);
        this.elements.push(samp);
        return samp;
    }

    addCanvas(pos: Pair): Canvas {
        let canvas = new Canvas(pos, Pair.scale(this.size,0.3), this.p, true);
        this.elements.push(canvas);
        return canvas;
    }
}