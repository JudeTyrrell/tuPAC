import { Element, Playable } from './element';
import p5 from "p5";
import Pos from "./position";
import Button from "./button";
import { controlBarColor, buttonSize, buttonBufferX, buttonBufferY, controlBarHeight } from './canvas';
import { Icons } from "./icon";
import Mouse from "./mouse";


export class ControlBar extends Element {
    buttons: Button[];

    constructor(size: Pos, p: p5, parent: Element, draggable = true) {
        super(Pos.zero(), size, new Pos(0, size.y), p, parent, draggable);
        this.buttons = [];
    }

    clicked(mouse: Mouse): Element {
        if (this.parent.draggable) {
            return this.parent;
        }
    }

    draw(offset: Pos, alpha = 255) {
        this.size.x = this.parent.size.x;
        let color = this.p.color(controlBarColor);
        color.setAlpha(alpha);
        this.simpleRect(offset, null, color);
        for (let button of this.buttons) {
            button.draw(offset);
        }
    }

    addLeftButton(name: string, icon: Icons, clicked: Function): Button {
        let button = new Button(
            new Pos(this.buttons.length * (buttonSize + buttonBufferX), buttonBufferY),
            new Pos(buttonSize, buttonSize), 
            this.p, this.parent, icon, clicked, name);
        this.buttons.push(button);
        return button;
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

    topUnderPos(offset: Pos, pos: Pos) {
        let top = null;
        let abs = Pos.sum(offset, this.pos);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this;
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
