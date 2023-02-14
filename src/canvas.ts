import { Capsule, Element, Playable } from "./element";
import p5 from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";
import Sample from "./sample";
import { ControlBar } from "./controlbar";
import { TimeBar } from "./timebar";
export const canvasColor = "#77b7bb";
export const canvasOutline = "#314814";
export const canvasDefaultSize = new Pos(200, 150);
export const controlBarHeight = 30;
export const controlBarColor = "#111111";
export const timeBarColor = "#db0000";
// How many pixels your mouse can be away from the time bar to be able to drag it.
export const timeBarLenience = 2;
export const timeBarThickness = 2;

export const buttonBufferX = 10;
export const buttonBufferY = 5;
export const buttonSize = 20;

export default class Canvas extends Capsule {
    controlBar: ControlBar;
    timeBar: TimeBar;

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, draggable = true, speed = 50) {
        super(pos, size, new Box(new Pos(0, controlBarHeight), new Pos(size.x, size.y - controlBarHeight)), p, parent, draggable, true, speed);
        this.playables = [];
        this.controlBar = new ControlBar(new Pos(size.x, controlBarHeight), p, this);
        this.controlBar.addPlayButton(this);
        this.controlBar.addStopButton(this);
        this.controlBar.addPauseButton(this);
        if (parent === null) { // We want to leave the initial start time nudge to the parent, but must do it straight away if no parent exists.
            this.updateStartTime();
        }
        this.timeBar = new TimeBar(p, this);
    }

    resize(change: Pos) : Pos {
        let newSize = Pos.sum(this.size, change);
        if (Box.within(new Box(this.pos, newSize), this.parent.inner)) {
            this.size = newSize;
            this.inner.size = Pos.sum(this.inner.size, change);
            this.controlBar.size.x += change.x;
            this.timeBar.size.y += change.y;
            this.updateStartTime();
            return newSize;
        } else{ 
            throw new Error("Can't resize to: "+newSize+", doesn't fit!");
        }
    }

    draw(offset = Pos.zero(), alpha = 255): void {
        let scolor = this.p.color(canvasOutline);
        scolor.setAlpha(alpha);
        let fcolor = this.p.color(canvasColor);
        fcolor.setAlpha(alpha);
        this.simpleRect(offset, scolor, fcolor);

        let off = Pos.sum(this.pos, offset);
        this.timeBar.draw(off);
        this.controlBar.draw(off);
        if (this.playing) {
            this.timeBar.setPos(new Pos(this.inner.origin.x + ((Tone.getTransport().seconds - this.startTime) * this.speed), this.inner.origin.y));
            if (this.timeBar.pos.x > this.size.x) {
                this.stop(false);
                this.timeBar.pos.x = this.size.x - 2;
            }
            if (Tone.getTransport().state != "started") {
                this.pause(false);
            }
        }
         for (let playable of this.playables) {
            playable.draw(off);
        }
    }

    addSample(pos: Pos, sample: string, size = new Pos(30,30)): Sample {
        let samp = new Sample(pos, size, this.p, this, sample);
        this.add(samp);
        return samp;
    }

    newCanvas(pos: Pos, size = canvasDefaultSize): Canvas {
        let canvas = new Canvas(pos, size, this.p, this, true);
        this.add(canvas)
        return canvas;
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        let top = null;
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this;
            let controlBar = this.controlBar.topUnderPos(abs, pos);
            let timeBar = this.timeBar.topUnderPos(abs, pos);

            if (controlBar != null) {
                top = controlBar;
            }
            if (timeBar != null) {
                top = timeBar;
            }
            let inner = null;
            for (let element of this.playables) {
                inner = element.topUnderPos(abs, pos);
                if (inner != null) {
                    top = inner;
                }
            }
        }

        return top;
    }
}