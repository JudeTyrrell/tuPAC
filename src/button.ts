import p5, { Image } from "p5";
import { Capsule, Element } from "./element";
import Pos from "./position";

export default class Button extends Element {
    img: Image;
    fn: Function;
    name: string;

    constructor(pos: Pos, size: Pos, p: p5, parent: Element, image: string, clicked: Function, name: string) {
        super(pos, size, p, parent, false);
        this.img = p.loadImage(image);
        this.fn = clicked;
        this.name = name;
    }

    draw(offset: Pos): void {
        let off = Pos.sum(this.pos, offset);
        this.p.image(this.img, off.x, off.y, this.size.x, this.size.y);
    }

    topUnderMouse(offset: Pos): Element {
        let abs = Pos.sum(this.pos, offset);
        if (Pos.inBox(abs, this.size, this.mPos())) {
            return this;
        }
        return null;
    }

    async clicked() {
        await this.fn();
    }
}