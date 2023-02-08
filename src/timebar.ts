import { Element } from "./element";
import p5 from "p5";
import Pos from "./position";
import Canvas, { timeBarThickness, timeBarColor, timeBarLenience } from "./canvas";


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
        if (!this.parent.playing) {
            let newPos = pos.copy();
            newPos.y = this.pos.y;
            if (newPos.x <= 0) {
                newPos.x = 0;
            } else if (newPos.x + this.size.x >= this.parent.size.x) {
                newPos.x = this.parent.size.x - this.size.x;
            }
            this.prevX = this.pos.x;
            this.parent.pauseTime = newPos.x / this.parent.speed;
            this.setPos(newPos);
        }
    }
}
