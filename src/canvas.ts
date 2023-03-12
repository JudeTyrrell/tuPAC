import { Capsule, Element, Playable, Resi } from "./element";
import p5 from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";
import Sample from "./sample";
import { ControlBar } from "./controlbar";
import { TimeBar } from "./timebar";
import Mouse, { MouseState } from "./mouse";
import { TimeBarTranslate } from './timebartranslate';

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
    timeBarTranslate: TimeBarTranslate;

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, draggable = true, speed = 50) {
        super(pos, size, new Box(new Pos(0, controlBarHeight), new Pos(size.x, size.y - controlBarHeight)), p, parent, draggable, Resi.XY, speed);
        this.controlBar = new ControlBar(new Pos(size.x, controlBarHeight), p, this, true);
        this.controlBar.addPlayButton(this);
        this.controlBar.addStopButton(this);
        this.controlBar.addPauseButton(this);
        if (parent === null) { // We want to leave the initial start time nudge to the parent, but must do it straight away if no parent exists.
            this.updateStartTime();
        } else if (parent['timeBar'] != undefined) {
            this.timeBarTranslate = new TimeBarTranslate(new Pos((this.size.x * parent.speed) / this.speed, timeBarTranslateHeight), parent as Canvas, this, this.p);
            this.UI.push(this.timeBarTranslate);
        }
        this.timeBar = new TimeBar(p, this);
        this.UI.push(this.controlBar);
        this.UI.push(this.timeBar);
    }

    clicked(mouse: Mouse): Element {
        if (mouse.resizing()) {
            this.updateMinSize();
            return this;
        } else {
            return null;
        }
    }

    add(playable: Playable): Playable {
        let p = super.add(playable);
        if(p['timeBar'] != undefined) {
            let canv = p as Canvas;
            canv.updateTimeBarTranslate();
        }
        return p;
    }

    updateTimeBarTranslate() {
        this.timeBarTranslate = new TimeBarTranslate(new Pos((this.size.x * this.parent.speed) / this.speed, timeBarTranslateHeight), this.parent as Canvas, this, this.p);
        if (!this.UI.includes(this.timeBarTranslate)) {
            this.UI.push(this.timeBarTranslate);
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
            this.timeBar.pos.x = (Tone.getTransport().seconds - this.startTime) * this.speed;
            if (this.timeBar.pos.x > this.size.x) {
                this.stop(false);
                this.timeBar.pos.x = this.size.x - 2;
            }
            if (Tone.getTransport().state != "started") {
                this.pause(false);
            }
        } // Update timeBar when not playing.
        if (!this.playing) {
            this.timeBar.pos.x = (this.pauseTime - this.startTime) * this.speed;
        }
        
        //Draw everything inside canvas.
        let off = Pos.sum(this.pos, offset);
        for (let elem of this.UI) {
            elem.draw(off, alpha);
        }
        for (let playable of this.playables) {
            playable.draw(off, alpha);
        }

        //Draw timebar translation if parent has timebar
        if (this.parent != null && !(this.parent['timeBar'] == null)) {
            let parent = this.parent as Canvas;
            if (parent.playing && this.playing) {
                this.timeBarTranslate.drawBar(off, alpha);
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
}