import p5 from "p5";
import { Pair } from "./position";

export default abstract class Element {
    // pos = (x,y) are co-ordinates respective to the encapsulating Canvas' top-left corner, as is p5.js convention. x increases to the right, y increases down.
    pos: Pair;
    size: Pair;
    draggable: boolean;
    p: p5;

    constructor(pos: Pair, size: Pair, p: p5, draggable = false) {
        this.pos = pos;
        this.size = size;
        this.draggable = draggable;
        this.p = p;
    }

    abstract draw(offset: Pair): void;

    simpleRect(offset: Pair): void {
        this.p.rect(this.pos.x + offset.x, this.pos.y + offset.y, this.size.x, this.size.y);
    }
}