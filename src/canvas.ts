import { Capsule, Element, Playable } from "./element";
import p5 from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";
import Sample from "./sample";
import Button from "./button";
export const canvasColor = "#77b7bb";
export const canvasOutline = "#314814";
export const controlBarHeight = 30;
export const controlBarColor = "#111111";
export const timeBarColor = "#db0000";
// How many pixels your mouse can be away from the time bar to be able to drag it.
export const timeBarLenience = 2;
export const timeBarThickness = 2;

export const buttonBufferX = 10;
export const buttonBufferY = 5;
export const buttonSize = 20;

export class ControlBar extends Element {
    buttons: Button[];

    constructor(size: Pos, p: p5, parent: Element) {
        super(Pos.zero(), size, p, parent, false);
        this.buttons = [];
    }

    draw(offset: Pos, alpha = 255) {
        let color = this.p.color(controlBarColor);
        color.setAlpha(alpha);
        this.simpleRect(offset, null, color);
        for (let button of this.buttons) {
            button.draw(offset);
        }
    }

    addButton(name: string, image: string, clicked: Function): Button {
        let button = new Button(new Pos(this.buttons.length * (buttonSize + buttonBufferX), buttonBufferY),
            new Pos(buttonSize, buttonSize), this.p, this.parent, image, clicked, name);
        this.buttons.push(button);
        return button;
    }

    addPlayButton(toPlay: Playable) {
        this.addButton('play', "../resource/img/play.png", () => {
            toPlay.play(true);
        });
    }

    addStopButton(toStop: Playable) {
        this.addButton('stop', "../resource/img/stop.png", () => {
            toStop.stop(true);
        });
    }

    addPauseButton(toPause: Playable) {
        this.addButton('pause', "../resource/img/pause.png", () => {
            toPause.pause(true);
        });
    }

    topUnderPos(offset: Pos, pos: Pos) {
        let top = null;
        let abs = Pos.sum(offset, this.pos);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this.parent;
            let inner = null;
            for (let button of this.buttons) {
                inner = button.topUnderPos(offset, pos);
                if (inner != null) {
                    top = inner;
                }
            }
        }
        return top;
    }
}

export class TimeBar extends Element {
    prevX: number;
    parent: Canvas;

    constructor(p: p5, parent: Canvas) {
        super(new Pos(parent.inner.origin.x, parent.controlBar.size.y), new Pos(timeBarThickness, parent.size.y - parent.controlBar.size.y), p, parent, true);
        this.prevX = 0;
        this.parent = parent;
    }

    draw(offset: Pos, alpha = 255): void {
        let color = this.p.color(timeBarColor);
        color.setAlpha(alpha);
        this.simpleRect(offset, null, color);
    }

    topUnderPos(offset: Pos, pos: Pos) {
        let abs = Pos.sum(this.pos, offset);
        let capt = new Pos(this.size.x + (timeBarLenience * 2) + timeBarThickness, this.size.y);
        abs.add(new Pos(-timeBarLenience - timeBarThickness / 2, 0));

        if (Pos.inBox(abs, capt, pos)) {
            return this;
        }

        return null;
    }

    moveTo(pos: Pos): void {
        let newPos = pos.copy();
        newPos.y = this.pos.y;
        if (newPos.x <= 0) {
            newPos.x = 0;
        } else if (newPos.x + this.size.x >= this.parent.size.x) {
            newPos.x = this.parent.size.x - this.size.x;
        }
        this.prevX = this.pos.x;
        this.setPos(newPos);
    }
}

export default class Canvas extends Capsule {
    controlBar: ControlBar;
    timeBar: TimeBar;

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, draggable = true, speed = 10) {
        super(pos, size, new Box(new Pos(0, controlBarHeight), new Pos(size.x, size.y - controlBarHeight)), p, parent, draggable, speed);
        this.playables = [];
        this.controlBar = new ControlBar(new Pos(size.x, controlBarHeight), p, this);
        this.controlBar.addPlayButton(this);
        this.controlBar.addStopButton(this);
        this.controlBar.addPauseButton(this);
        this.timeBar = new TimeBar(p, this);
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
            this.currentTime = Tone.getTransport().seconds;
            this.timeBar.moveTo(new Pos((this.currentTime - this.startTime) * this.speed, 0));
        }
        if (Tone.getTransport().state != "started") {
            this.stop(false);
        }
         for (let playable of this.playables) {
            playable.draw(off);
        }
    }


    addSample(pos: Pos, sample: string, size = new Pos(30,30)): Sample {
        let samp = new Sample(pos, size, this.p, this, sample);
        this.playables.push(samp);
        return samp;
    }

    addCanvas(pos: Pos): Canvas {
        let canvas = new Canvas(pos, Pos.scale(this.size, 0.3), this.p, this);
        this.playables.push(canvas);
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