import p5, { Color } from "p5";
import { Element, Resi } from "./element";
import Pos from "./position";
import Mouse from "./mouse";


const minTextSize = new Pos(0, 10);

export class Label extends Element {
    raw_text: string;
    text: string;
    height: number;
    color: Color;
    
    constructor(pos: Pos, size: Pos, text: string, p: p5, parent: Element, color = "#FFFFFF", drag = false, resi = Resi.None) {
        super(pos, size, minTextSize, p, parent, drag, resi);
        this.height = this.size.y;
        this.raw_text = text;
        this.text = null;
        this.color = this.p.color(color);
    }

    setText(text: string): void {
        this.raw_text = text;
        this.updateText();
    }

    updateText(): void {
        this.p.textSize(this.height);
        let text_cut = this.raw_text;
        let diff = this.size.x - this.p.textWidth(text_cut);
        if (diff < 0) {
            text_cut = ".." + text_cut.slice(2 - diff);
        }
        console.log(text_cut);
        this.text = text_cut;
    }

    draw(offset: Pos, alpha?: number): void {
        if (this.text === null) {
            this.updateText();
        }

        this.color.setAlpha(alpha);
        this.p.fill(this.color);
        this.p.textSize(this.height);
        this.p.textAlign('center');

        let abs = Pos.sum(offset, this.pos);

        this.p.text(this.text, abs.x, abs.y);
    }

    clicked(mouse: Mouse): Element {
        if (Pos.inBox(this.pos, this.size, this.mPos())) {
            return this;
        }
        return null;
    }
}