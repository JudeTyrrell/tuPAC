import p5 from "p5";
import { Pos } from "./position";

export interface Clickable {
    clicked(): void;
}

export interface Playable extends Element {
    play(): void;
    pause(): void;
    stop(): void;
}

export default abstract class Element {
    // pos = (x,y) are co-ordinates respective to the encapsulating Canvas' top-left corner, as is p5.js convention. x increases to the right, y increases down.
    pos: Pos;
    size: Pos;
    draggable: boolean;
    p: p5;

    constructor(pos: Pos, size: Pos, p: p5, draggable = false) {
        this.pos = pos;
        this.size = size;
        this.draggable = draggable;
        this.p = p;
    }

    abstract draw(offset: Pos): void;

    simpleRect(offset: Pos): void {
        this.p.rect(this.pos.x + offset.x, this.pos.y + offset.y, this.size.x, this.size.y);
    }

    setPos(pos: Pos): void {
        this.pos = pos;
    }

    move(dist: Pos): Pos {
        return this.pos.add(dist);
    }

    abstract topUnderMouse(offset: Pos): Element;

    mPos(): Pos {
        return new Pos(this.p.winMouseX, this.p.winMouseY);
    }
}