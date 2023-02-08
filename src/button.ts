import p5, { Image } from "p5";
import { Capsule, Element } from "./element";
import Pos from "./position";
import Icon from "./icon";

export default class Button extends Element {
    icon: Icon;
    fn: Function;
    name: string;

    constructor(pos: Pos, size: Pos, p: p5, parent: Element, image: string, clicked: Function, name: string) {
        super(pos, size, p, parent, false);
        this.icon = new Icon(pos, size, p, this);
        this.icon.loadImage(image);
        this.fn = clicked;
        this.name = name;
    }

    draw(offset: Pos, alpha = 255): void {
        this.icon.draw(offset, alpha);
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        return this.icon.topUnderPos(offset, pos);
    }

    async clicked() {
        await this.fn();
    }
}