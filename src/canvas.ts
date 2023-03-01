import { Capsule, Element, Playable } from "./element";
import p5 from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";
import Sample from "./sample";
import { ControlBar } from "./controlbar";
import { TimeBar } from "./timebar";
import Mouse, { MouseState } from "./mouse";
export const canvasColor = "#77b7bb";
export const canvasOutline = "#314814";
export const canvasDefaultSize = new Pos(200, 150);
export const controlBarHeight = 30;
export const controlBarColor = "#1d383a";
export const timeBarColor = "#db0000";
// How many pixels your mouse can be away from the time bar to be able to drag it.
export const timeBarLenience = 2;
export const timeBarThickness = 2;

export const timeBarTranslateHeight = 10;

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

    clicked(mouse: Mouse): Element {
        if (mouse.resizing()) {
            this.updateMinSize();
            console.log(this.minSize);
            return this;
        } else {
            return null;
        }
    }

    drop(onto: Capsule): void {
        /*if (this.parent.playables.indexOf(onto) > -1) {
            this.transfer(onto);
        }*/
    }

    draw(offset = Pos.zero(), alpha = 255): void {
        let scolor = this.p.color(canvasOutline);
        scolor.setAlpha(alpha);
        let fcolor = this.p.color(canvasColor);
        fcolor.setAlpha(alpha);
        this.simpleRect(offset, scolor, fcolor);

        //Move timeBar as sound plays, stop playing if Transport has been stopped.
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
        
        //Draw everything inside canvas.
        let off = Pos.sum(this.pos, offset);
        this.timeBar.draw(off);
        this.controlBar.draw(off);
        for (let playable of this.playables) {
            playable.draw(off);
        }

        //Draw timebar translation if parent has timebar
        if (this.parent != null && !(this.parent['timeBar'] == null)) {
            let parent = this.parent as Canvas;
            let box = new Box(new Pos(0, this.size.y), new Pos((this.size.x * parent.speed) / this.speed, timeBarTranslateHeight));
            this.rect(Pos.sum(off, box.origin), box.size, scolor, fcolor);

            if (parent.playing && this.playing) {
                let tbt = this.p.color(timeBarColor);
                tbt.setAlpha(alpha);
                let from = new Pos(this.timeBar.pos.x, box.origin.y);
                let to = new Pos(Math.max(0, parent.timeBar.pos.x - this.pos.x), box.origin.y + box.size.y);
                this.line(Pos.sum(off, from), Pos.sum(off, to), tbt, timeBarThickness);
            }
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