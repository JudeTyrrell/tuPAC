import { Element, Playable } from "./element";
import p5 from "p5";
import Pos from "./position";
import Button from "./button";
import { controlBarColor, buttonSize, buttonBufferX, buttonBufferY } from "./canvas";


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

    addLeftButton(name: string, image: string, clicked: Function): Button {
        let button = new Button(new Pos(this.buttons.length * (buttonSize + buttonBufferX), buttonBufferY),
            new Pos(buttonSize, buttonSize), this.p, this.parent, image, clicked, name);
        this.buttons.push(button);
        return button;
    }

    addPlayButton(toPlay: Playable) {
        this.addLeftButton('play', "../resource/img/play.png", () => {
            toPlay.play(true);
        });
    }

    addStopButton(toStop: Playable) {
        this.addLeftButton('stop', "../resource/img/stop.png", () => {
            toStop.stop(true);
        });
    }

    addPauseButton(toPause: Playable) {
        this.addLeftButton('pause', "../resource/img/pause.png", () => {
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
