import p5, { Color } from "p5";
import Pos from "./position";
import Mouse from "./mouse";
import { sampleMinSize } from './sample';

export const capsuleMinSize = new Pos(300, 100);

export const maxSpeed = 1000;

export enum Resi {
    None,
    X,
    Y,
    XY
}

export abstract class Element {
    // pos = (x,y) are co-ordinates respective to the encapsulating Canvas' top-left corner, as is p5.js convention. x increases to the right, y increases down.
    pos: Pos;
    size: Pos;
    minSize: Pos;
    draggable: boolean;
    resizable: Resi;
    p: p5;
    parent?: Element;
    
    constructor(pos: Pos, size: Pos, minSize: Pos, p: p5, parent: Element, draggable = false, resizable = Resi.None) {
        this.pos = pos;
        this.size = size;
        this.draggable = draggable;
        this.resizable = resizable;
        this.p = p;
        this.parent = parent;
        this.minSize = minSize;
    }

    abstract clicked(mouse: Mouse): Element;

    drop(onto: Element): void {}

    toTop(): void {
        if (this.parent != null) {
            this.parent.pushToTop(this);
        }
    }

    pushToTop(element: Element): void {}

    simpleRect(offset: Pos, stroke: Color, fill: Color): void {
        /** 
         *  Draws a simple rectangle the size of the Element that calls it.
         */
        this.rect(Pos.sum(offset, this.pos), this.size, stroke, fill, 1);
    }

    resize(change: Pos): Pos {
        let newSize = Pos.maxXY(Pos.sum(this.size, change), this.minSize);
        this.size = newSize;
        return this.size;
    }

    resizeTo(size: Pos): Pos {
        let newSize = Pos.maxXY(size, this.minSize);
        this.size = newSize;
        return this.size;
    }

    getAbsolutePos(): Pos {
        let p = this.parent;
        let pos = this.pos.copy();
        while (p != null) {
            pos = Pos.sum(pos, p.pos);
            p = p.parent;
        }
        return pos;
    }

    rect(o: Pos, size: Pos, stroke?: Color, fill? : Color, weight = 1) {
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
        this.p.strokeWeight(weight);
        this.p.rect(o.x, o.y, size.x, size.y);
    }

    line(from: Pos, to: Pos, stroke: Color, thickness: number) {
        this.p.stroke(stroke);
        this.p.strokeWeight(thickness);
        this.p.line(from.x, from.y, to.x, to.y);
    }

    setPos(pos: Pos): void {
        this.pos = pos;
    }

    move(dist: Pos): void {
        this.moveTo(Pos.sum(this.pos, dist));
    }

    // This is to allow certain classes to limit the range of movement. By default, we simply set the position.
    moveTo(pos: Pos): void {
        this.setPos(pos);
    }

    mPos(): Pos {
        return new Pos(this.p.winMouseX, this.p.winMouseY);
    }

    abstract draw(offset: Pos, alpha?: number): void;

    topUnderMouse(offset: Pos): Element {
        return this.topUnderPos(offset, this.mPos());
    };

    topUnderPos(offset: Pos, pos: Pos): any {
        let abs = Pos.sum(this.pos, offset);
        if (Pos.inBox(abs, this.size, this.mPos())) {
            return this;
        } else {
            return null;
        }
    }
}

