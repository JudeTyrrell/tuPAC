import { Element, Resi } from "./element";
import Pos from "./position";
import Canvas, { canvasColor, canvasOutline, timeBarColor, timeBarThickness, timeBarTranslateHeight } from './canvas';
import p5 from "p5";
import Mouse from "./mouse";
import { sampleMinSize } from './sample';


export class TimeBarTranslate extends Element { 
    origin: Canvas;
    dest: Canvas;

    constructor(size: Pos, origin: Canvas, dest: Canvas, p: p5) {
        super(new Pos(0, dest.size.y), size, new Pos(sampleMinSize.x, timeBarTranslateHeight), p, null, false, Resi.X);
        this.origin = origin;
        this.dest = dest;
    }

    clicked(mouse: Mouse): Element {
        if (mouse.resizing()) {
            return this;
        } else {
            return null;
        }
    }

    updateSize() {
        this.pos.y = this.dest.size.y;
        this.size.x = (this.dest.size.x * this.origin.speed) / this.dest.speed;
    }

    draw(offset: Pos, alpha?: number): void {
        let stroke = this.p.color(canvasOutline);
        stroke.setAlpha(alpha);
        let fill = this.p.color(canvasColor);
        fill.setAlpha(alpha);

        this.simpleRect(offset, stroke, fill);
    }

    drawBar(offset: Pos, alpha = 255): void {
        let tbt = this.p.color(timeBarColor);
        tbt.setAlpha(alpha);
        let from = new Pos(this.dest.timeBar.pos.x, this.pos.y);
        let to = new Pos(Math.max(0, this.origin.timeBar.pos.x - this.dest.pos.x), this.pos.y + this.size.y);
        this.line(Pos.sum(offset, from), Pos.sum(offset, to), tbt, timeBarThickness);
    }

    resize(change: Pos): Pos {
        return this.resizeTo(Pos.sum(change, this.pos));
    }

    resizeTo(size: Pos): Pos {
        let x0 = (this.dest.size.x * this.origin.speed) / this.dest.speed;
        let newSpeed = (this.dest.speed * x0) / (x0 + size.x - this.pos.x);
        if (this.dest.setSpeed(newSpeed)) {
            this.dest.updateStartTime();
        }
        return this.size;
    }
}