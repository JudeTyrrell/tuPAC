import Pos from "./position";
import { Element, Resi } from "./element";
import { Capsule } from "./Capsule";
import Canvas from "./canvas";
import p5 from "p5";
import { ElementMenu } from "./elementmenu";
import FileExplorer from "./FileExplorer";

const elementSize = new Pos(80, 80);

export default class Window {
    elements: Element[];
    size: Pos;
    p: p5;

    constructor(sizeX: number, sizeY: number, p: p5) {
        this.elements = [];
        this.size = new Pos(sizeX, sizeY);
        this.p = p;
    }

    addCanvas(pos: Pos, size: Pos): Canvas {
        let canv = new Canvas(pos, size, this.p, null, false, Resi.None);
        this.elements.push(canv);
        return canv;
    }

    addFileExplorer(pos: Pos, size: Pos): FileExplorer {
        let fe = new FileExplorer(pos, size, this.p, this);
        this.elements.push(fe);
        return fe;
    }

    addElementMenu(pos: Pos, size: Pos): ElementMenu {
        let em = new ElementMenu(pos, size, elementSize, this.p, this);
        this.elements.push(em);
        return em;
    }

    draw() {
        for (let element of this.elements) {
            element.draw(Pos.zero());
        }
    }

    mPos(): Pos {
        return new Pos(this.p.winMouseX, this.p.winMouseY);
    }

    toRelative(abs: Pos, capsule: Capsule): Pos {
        let top = capsule;
        let relative = abs.copy().sub(top.pos);
        let parent = top.parent;
        while (parent != null) {
            relative.sub(parent.pos);
            parent = parent.parent;
        }
        //console.log("Absolute: "+ abs + "Relative: " + relative);
        return relative;
    }

    topUnderMouse(offset = Pos.zero()): Element {
        return this.topUnderPos(offset, this.mPos());
    }

    topUnderPos(offset, pos: Pos): Element {
        let top = null;

        if (Pos.inBox(Pos.zero(), this.size, pos)) {
            let inner = null;
            for (let element of this.elements) {
                inner = element.topUnderPos(offset, pos);
                if (inner != null) {
                    top = inner;
                }
            }
        }
        //console.log(top);
        return top;
    }
}