import { Element, Playable } from "./element";
import Pos from "./position";
import p5 from "p5";
import { Player } from "tone";
import Canvas, { controlBarHeight } from "./canvas";

const sampleOutline = "#314814";

export default class Sample extends Element implements Playable {
    player: Player;
    _currentTime: number;

    constructor(pos: Pos, size: Pos, p: p5, parent: Canvas, sample: string) {
        super(pos, size, p, parent, true);
        this.player = new Player(sample);
    }

    play(): void {
        this.player.start(this._currentTime);
    }

    pause(): void {
        this._currentTime = this.player.sampleTime;
        this.player.stop();
    }

    stop(): void {
        this.player.stop();
    }

    draw(offset: Pos): void {
        this.simpleRect(offset, sampleOutline, null);
    }

    topUnderMouse(offset: Pos): Sample {
        if (Pos.inBox(Pos.sum(this.pos, offset), this.size, this.mPos())) {
            return this;
        }
        return null;
    }

    moveTo(pos: Pos): void {
        if (pos.x <= 0) {
            pos.x = 0;
        } else if (pos.x + this.size.x >= this.parent.size.x) {
            pos.x = this.parent.size.x - this.size.x;
        }
        if (pos.y <= controlBarHeight) {
            pos.y = controlBarHeight;
        } else if (pos.y + this.size.y >= this.parent.size.y) {
            pos.y = this.parent.size.y - this.size.y;
        }
        this.setPos(pos);
    }
}