import { Element, capsuleMinSize } from './element';
import { Playable } from "./Playable";
import p5 from "p5";
import Pos from "./position";
import Button from "./button";
import Canvas, { controlBarColor, buttonSize, buttonBufferX, buttonBufferY } from './canvas';
import { Icons } from "./icon";
import Mouse from "./mouse";
import { Ghost } from './ghosts';
import { window } from './tupac';
import { Label } from './label';

const titlePad = 0.1;
const titleColor = "#FFFFFF";
const titleMaxWidth = capsuleMinSize.x / 2;

export class ControlBar extends Element {
    buttonsL: Button[];
    buttonsR: Button[];
    label: Label;

    constructor(size: Pos, p: p5, parent: Element, draggable = true) {
        super(Pos.zero(), size, new Pos(0, size.y), p, parent, draggable);
        this.buttonsL = [];
        this.buttonsR = [];
        this.label = new Label(new Pos((this.size.x - Math.min(titleMaxWidth, this.size.x)) * 0.5, this.size.y * titlePad * 0.5), new Pos(Math.min(titleMaxWidth, this.size.x), this.size.y * (1-titlePad)), "", this.p, this, titleColor);
    }

    clicked(mouse: Mouse): Element {
        if (this.parent.draggable) {
            return this.parent;
        }
        return null;
    }

    draw(offset: Pos, alpha = 255) {
        let color = this.p.color(controlBarColor);
        color.setAlpha(alpha);

        this.simpleRect(offset, null, color);
        for (let button of this.buttonsL) {
            button.draw(offset);
        }
        for (let button of this.buttonsR) {
            button.draw(offset);
        }
        
        this.label.draw(offset, alpha);
    }

    addTitle(title: string) {
        this.label.setText(title);
    }

    addLeftButton(name: string, icon: Icons, clicked: Function): Button {
        let button = new Button(
            new Pos(this.buttonsL.length * (buttonSize + buttonBufferX), buttonBufferY),
            new Pos(buttonSize, buttonSize), 
            this.p, this.parent, icon, clicked, name);
        this.buttonsL.push(button);
        let shove = button.pos.x + button.size.x - this.label.pos.x;
        if (shove > 0) {
            this.label.move(new Pos(shove, 0));
        }
        return button;
    }

    addRightButton(name: string, icon: Icons, clicked: Function): Button {
        let button = new Button(
            new Pos(this.size.x - ((this.buttonsR.length+1) * (buttonSize + buttonBufferX)), buttonBufferY),
            new Pos(buttonSize, buttonSize), 
            this.p, this.parent, icon, clicked, name);
        this.buttonsR.push(button);
        return button;
    }

    addPlayPauseButton(toPlay: Playable) {
        this.addLeftButton('play', Icons.play, () => {
            if (toPlay.playing) {
                toPlay.pause(true);
            } else {
                toPlay.play(true);
            }
        });
    }

    addPlayButton(toPlay: Playable) {
        this.addLeftButton('play', Icons.play, () => {
            toPlay.play(true);
        });
    }

    addStopButton(toStop: Playable) {
        this.addLeftButton('stop', Icons.stop, () => {
            toStop.stop(true);
        });
    }

    addPauseButton(toPause: Playable) {
        this.addLeftButton('pause', Icons.pause, () => {
            toPause.pause(true);
        });
    }

    addCopyButton(toCopy: Canvas) {
        this.addRightButton('copy', Icons.missing, () => {
            return new Ghost(this.mPos(), capsuleMinSize, this.p, null, window, toCopy.copy(), true);
        })
    }

    topUnderPos(offset: Pos, pos: Pos) {
        let top = null;
        let abs = Pos.sum(offset, this.pos);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this;
            let inner = null;
            for (let button of this.buttonsL) {
                inner = button.topUnderPos(offset, pos);
                if (inner != null) {
                    top = inner;
                }
            }
            for (let button of this.buttonsR) {
                inner = button.topUnderPos(offset, pos);
                if (inner != null) {
                    top = inner;
                }
            }
            inner = this.label.topUnderPos(offset, pos);
            if (inner != null) {
                top = inner;
            }
        }
        return top;
    }

    resize(change: Pos): Pos {
        let size = super.resize(change);
        for (let button of this.buttonsR) {
            button.pos.x += change.x;
        }
        return size;
    }
}
