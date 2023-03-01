import p5, { Image } from "p5";
import { Capsule, Element } from "./element";
import Pos from "./position";
import Icon, { Icons } from "./icon";
import Mouse from "./mouse";

const minButtonSize = new Pos(10, 10);

export default class Button extends Element {
    icon: Icon;
    fn: Function;
    name: string;

    constructor(pos: Pos, size: Pos, p: p5, parent: Element, icon: Icons, clicked: Function, name: string) {
        super(pos, size, minButtonSize, p, parent, false);
        this.icon = new Icon(pos, size, p, this, icon);
        this.fn = clicked;
        this.name = name;
    }

    draw(offset: Pos, alpha = 255): void {
        this.icon.draw(offset, alpha);
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        return this.icon.topUnderPos(offset, pos);
    }

    clicked(mouse: Mouse): Element {
        console.log(this.name);
        this.fn();
        return null;
    }
}