import p5 from "p5";
import { Capsule, Element, Playable } from "./element";
import Pos, { Box } from "./position";
import Window from "./window";
import Mouse from "./mouse";
import { sampleMinSize } from "./sample";

export class Ghost extends Element {
    element: Playable;
    window: Window;

    constructor(pos: Pos, size: Pos, p: p5, parent: Element, window: Window, element: Playable, draggable = true) {
        super(pos, size, sampleMinSize, p, parent, draggable);
        this.window = window;
        this.element = element;
    }

    clicked(mouse: Mouse): Element {
        return null;
    }

    draw(offset: Pos) {
        this.element.draw(offset, 125);
        this.element.pos = this.pos;
    }

    drop(onto: Capsule): void {
        onto.add(this.element);
        this.element.moveTo(this.window.toRelative(this.pos, onto));
    }
}