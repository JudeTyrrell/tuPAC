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
    typeable: boolean;
    
    constructor(pos: Pos, size: Pos, text: string, p: p5, parent: Element, color = "#FFFFFF", drag = false, resi = Resi.None, typeable = true) {
        super(pos, size, minTextSize, p, parent, drag, resi);
        this.height = this.size.y;
        //console.log(this.height);
        this.raw_text = text;
        this.typeable = typeable;
        this.text = null;
        this.color = this.p.color(color);
    }

    resize(change: Pos): Pos {
        return this.resizeTo(Pos.sum(this.size, change));
    }

    resizeTo(size: Pos): Pos {
        let s = super.resizeTo(size);
        this.updateText();
        return s;
    }

    setText(text: string): void {
        this.raw_text = text;
        this.updateText();
    }

    updateText(): void {
        this.p.textSize(this.height * 0.9);
        let text_cut = this.raw_text;
        let char = this.p.textWidth("E");
        let diff = this.size.x - (text_cut.length * char);
        if (diff < 0) {
            text_cut = ".." + text_cut.slice(2 - diff / char);
        }
        //console.log(this.p.textWidth(text_cut), this.size.x);
        this.text = text_cut;
    }

    draw(offset: Pos, alpha?: number): void {
        if (this.text === null) {
            this.updateText();
        }

        this.color.setAlpha(alpha);
        this.p.fill(this.color);
        this.p.textSize(this.height * 0.9);
        this.p.textAlign('left');

        let abs = Pos.sum(offset, this.pos);
        let width = this.p.textWidth(this.text);

        this.p.text(this.text, abs.x + ((this.size.x - width) / 2), abs.y + this.height * 0.1, abs.x + this.size.x, abs.y + this.height);
    }

    clicked(mouse: Mouse): Element {
        if (this.typeable && Pos.inBox(this.pos, this.size, this.mPos())) {
            return this;
        }
        return null;
    }

    topUnderPos(offset: any, pos: Pos) {
        let abs = Pos.sum(offset, this.pos);

        if (this.typeable && Pos.inBox(abs, this.size,  pos)) {
            return this;
        }
        return null;
    }
}