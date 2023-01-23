import p5, { Color } from "p5";
import Canvas from "./canvas";
import Pos from "./position";

export interface Playable extends Element {
    play(): void;
    pause(): void;
    stop(): void;
}

export abstract class Element {
    // pos = (x,y) are co-ordinates respective to the encapsulating Canvas' top-left corner, as is p5.js convention. x increases to the right, y increases down.
    pos: Pos;
    size: Pos;
    draggable: boolean;
    p: p5;
    parent: Element;

    constructor(pos: Pos, size: Pos, p: p5, parent: Element, draggable = false) {
        this.pos = pos;
        this.size = size;
        this.draggable = draggable;
        this.p = p;
        this.parent = parent;
    }

    clicked(): void {}

    simpleRect(offset: Pos, stroke: string, fill: string): void {
        if (stroke === null) {
            this.p.noStroke();
        } else {
            this.p.stroke(stroke);
        }
        if (fill === null) {
            this.p.noFill();
        } else {
            this.p.fill(fill);
        }
        this.p.rect(this.pos.x + offset.x, this.pos.y + offset.y, this.size.x, this.size.y);
    }

    rect(o: Pos, size: Pos, stroke: string) {
        this.p.stroke(stroke);
        this.p.noFill();
        this.p.rect(o.x, o.y, size.x, size.y);
    }

    setPos(pos: Pos): void {
        this.pos = pos;
    }

    move(dist: Pos): Pos {
        return this.pos.add(dist);
    }

    // This is to allow certain classes to limit the range of movement. By default, we simply set the position.
    moveTo(pos: Pos): void {
        this.setPos(pos);
    }

    mPos(): Pos {
        return new Pos(this.p.winMouseX, this.p.winMouseY);
    }

    abstract draw(offset: Pos): void;

    abstract topUnderMouse(offset: Pos): Element;
}