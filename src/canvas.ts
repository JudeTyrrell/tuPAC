import { Element, Resi, capsuleMinSize } from "./element";
import { Capsule } from "./Capsule";
import { Playable } from "./Playable";
import p5 from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";
import Sample from "./sample";
import { ControlBar } from "./controlbar";
import { TimeBar } from "./timebar";
import Mouse from "./mouse";
import { TimeBarTranslate } from './timebartranslate';
import { sampleMinSize } from './sample';

export const canvasColor = "#77b7bb";
export const canvasOutline = "#314814";
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
let canvasNum = 0;

export default class Canvas extends Capsule {
    controlBar: ControlBar;
    timeBar: TimeBar;
    timeBarTranslate: TimeBarTranslate;

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, draggable = true, resi = Resi.XY, speed = 30) {
        super(pos, size, new Box(new Pos(0, controlBarHeight), new Pos(size.x, size.y - controlBarHeight)), p, parent, draggable, resi, speed);
        
        this.controlBar = new ControlBar(new Pos(size.x, controlBarHeight), p, this, true);
        this.controlBar.addPlayPauseButton(this);
        this.controlBar.addStopButton(this);
        //this.controlBar.addCopyButton(this);
        this.controlBar.addTitle("Canvas"+canvasNum);
        canvasNum += 1;
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

    resize(change: Pos): Pos {
        return this.resizeTo(Pos.sum(this.size, change));
    }

    resizeTo(size: Pos): Pos {
        let s = super.resizeTo(size);
        this.controlBar.resizeTo(new Pos(s.x, controlBarHeight));
        this.timeBar.resizeTo(new Pos(timeBarThickness, s.y - controlBarHeight))
        if (this.timeBarTranslate != null) {
            this.timeBarTranslate.moveTo(new Pos(0, s.y));
        }
        return s;
    }

    updateStartTime(): void {
        super.updateStartTime();
        if (this.timeBarTranslate != null) {
            this.timeBarTranslate.updateSize();
        }
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
        this.remove(this.timeBarTranslate);
        this.timeBarTranslate = new TimeBarTranslate(new Pos((this.size.x * this.parent.speed) / this.speed, timeBarTranslateHeight), this.parent as Canvas, this, this.p);
        this.UI.push(this.timeBarTranslate);
    }

    drop(onto: Capsule): void {
        if (this.parent.playables.indexOf(onto) > -1) {
            this.transfer(onto);
        }
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

    addSample(pos: Pos, sample: string, size = sampleMinSize.copy()): Sample {
        let samp = new Sample(pos, size, this.p, this, sample);
        this.add(samp);
        return samp;
    }
    
    newCanvas(pos: Pos, size = capsuleMinSize.copy()): Canvas {
        let canvas = new Canvas(pos, size, this.p, this, true, Resi.XY, this.speed);
        this.add(canvas)
        return canvas;
    }

    copy(): Canvas {
        let canv = new Canvas(this.pos, this.size, this.p, this.parent, this.draggable, this.resizable, this.speed);
        canv.playables = [];
        for (let playable of this.playables) {
            canv.playables.push(playable.copy());
        }
        return canv;
    }
}