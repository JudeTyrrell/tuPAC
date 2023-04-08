import p5 from "p5";
import { controlBarHeight } from './canvas';
import { Element, capsuleMinSize } from './element';
import Window from "./window";
import { Ghost } from "./ghosts";
import Pos from "./position";
import Icon from "./icon";
import Canvas from './canvas';
import Mouse from "./mouse";
import Distort from './distort';
import { effectEmptySize } from "./effect";

const elementMenuMinSize = new Pos(100, 100);
const elementOptionMinSize = new Pos(30, 30);
const elementOptionPad = 20;

const FileExplorerBgColor = "#7A8990";
const FileExplorerOutline = "#353D40";

export class ElementMenu extends Element {
    elements: Element[];
    window: Window;
    elementSize: Pos;

    constructor(pos: Pos, size: Pos, elementSize: Pos, p: p5, window: Window) {
        super(pos, size, elementMenuMinSize, p, null);
        this.window = window;
        this.elements = [];
        this.elementSize = elementSize;
    }

    addElement(element: Element): Element {
        this.elements.push(element);
        this.placeElements();
        return element;
    }

    addCanvasOption(): CanvasOption {
        let canv = new CanvasOption(this.elementSize.copy(), this.p, this);
        this.addElement(canv);
        return canv;
    }

    addDistortOption(): DistortEffectOption {
        let dist = new DistortEffectOption(this.elementSize.copy(), this.p, this);
        this.addElement(dist);
        return dist;
    }

    clicked(mouse: Mouse): Element {
        return null;
    }

    draw(offset: Pos, alpha = 255): void {
        let fill = this.p.color(FileExplorerBgColor);
        fill.setAlpha(alpha);
        let stroke = this.p.color(FileExplorerOutline);
        this.simpleRect(offset, stroke, fill);
        
        let off = Pos.sum(this.pos, offset);
        for (let element of this.elements) {
            element.draw(off);
        }
    }

    placeElements(): void {
        let x = elementOptionPad;
        let y = controlBarHeight;
        let max = Pos.diff(this.size, this.elementSize);
        for (let element of this.elements) {
            element.moveTo(new Pos(x, y));
            x += this.elementSize.x + elementOptionPad;
            if (x > max.x) {
                x = elementOptionPad;
                y += this.elementSize.y;
            }
            if (y > max.y) {
                break;
            }
        }
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        let top = null;
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this;
            let inner = null;

            for (let element of this.elements) {
                inner = element.topUnderPos(abs, pos);
                if (inner != null) {
                    top = inner;
                }
            }
        }

        return top;
    }
}

export abstract class ElementOption extends Element {
    parent: ElementMenu;
    icon: Icon;

    constructor(size: Pos, p: p5, parent: ElementMenu) {
        super(Pos.zero(), size, elementOptionMinSize, p, parent, true);
    }

    clicked(mouse: Mouse): Element {
        return this.ghost(new Pos(mouse.p.winMouseX - mouse.cursorOff.x, mouse.p.winMouseY - mouse.cursorOff.y));
    }

    abstract draw(offset: Pos, alpha: number);

    abstract ghost(abs: Pos);

    topUnderPos(offset: Pos, pos: Pos): Element {
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            return this;
        }

        return null;
    }
}

export class CanvasOption extends ElementOption {
    constructor(size: Pos, p: p5, parent: ElementMenu) {
        super(size, p, parent);
        this.icon = new Icon(this.pos, this.size, p, this);
        this.icon.loadImage("../resource/img/canvas.png");
    }

    draw(offset: Pos, alpha: number) {
        this.icon.draw(Pos.sum(offset, this.pos), alpha);
    }

    ghost(abs: Pos): Element {
        return new Ghost(abs, capsuleMinSize, this.p, null, this.parent.window, new Canvas(abs, capsuleMinSize, this.p, null, true), true);
    }
}

export abstract class EffectOption extends ElementOption {
    constructor(size: Pos, p: p5, parent: ElementMenu) {
        super(size, p, parent);
        this.icon = new Icon(this.pos, this.size, p, this);
        this.icon.loadImage("../resource/img/effect.png");
    }

    draw(offset: Pos, alpha: number) {
        this.icon.draw(Pos.sum(offset, this.pos), alpha);
    }

    abstract ghost(abs: Pos);
}

export class DistortEffectOption extends EffectOption {
    ghost(abs: Pos) {
        return new Ghost(abs, effectEmptySize, this.p, null, this.parent.window, new Distort(abs, effectEmptySize, this.p, null, true), true)
    }
}