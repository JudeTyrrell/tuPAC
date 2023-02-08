import p5 from "p5";
import { controlBarHeight, canvasDefaultSize } from './canvas';
import { Element } from "./element";
import Window from "./window";
import { Ghost } from "./ghosts";
import Pos from "./position";
import Sample from "./sample";
import Icon from "./icon";
import Canvas from './canvas';

const FileExplorerBgColor = "#00383c";
const FileOutline = "#FFFFFF";
const FilePad = new Pos(10,10);
const FileIconSize = new Pos(20,20);
const FilenameHeight = 12;

export class ElementMenu extends Element {
    elements: Element[];
    window: Window;

    constructor(pos: Pos, size: Pos, p: p5, window: Window) {
        super(pos, size, p, null, false);
        this.window = window;
        this.elements = [];
    }

    addElement(element: Element): void {
        this.elements.push(element);
    }

    addCanvasOption(pos: Pos, size: Pos): CanvasOption {
        let canv = new CanvasOption(Pos.sum(pos,this.pos), size, this.p, this);
        this.elements.push(canv);
        return canv;
    }

    draw(offset: Pos, alpha = 255): void {
        let fill = this.p.color(FileExplorerBgColor);
        fill.setAlpha(alpha);
        let stroke = this.p.color("#00bd9a");
        this.simpleRect(offset, stroke, fill);

        for (let element of this.elements) {
            element.draw(offset);
        }
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        let top = null;
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this;
            let inner = null;

            for (let element of this.elements) {
                inner = element.topUnderPos(offset, pos);
                if (inner != null) {
                    top = inner;
                }
            }
        }

        return top;
    }
}

export default class FileExplorer extends ElementMenu {

    constructor(pos: Pos, size: Pos, p: p5, window: Window) {
        super(pos, size, p, window);
    }

    addFile(pos: Pos, size: Pos, file: string): File {
        let f = new File(Pos.sum(pos,this.pos), size, this.p, this, file);
        this.elements.push(f);
        return f;
    }
}

export abstract class ElementOption extends Element {
    parent: ElementMenu;
    icon: Icon;    

    constructor(pos: Pos, size: Pos, p: p5, parent: ElementMenu) {
        super(pos, size, p, parent, false);
    }

    abstract draw(offset: Pos, alpha: number);

    abstract ghost(abs: Pos);

    topUnderPos(offset: Pos, pos: Pos): Element {
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            return this.ghost(abs);
        }

        return null;
    }
}

export class File extends ElementOption {
    file: string;

    constructor(pos: Pos, size: Pos, p: p5, parent: FileExplorer, file: string) {
        super(pos, size, p, parent);
        this.file = file;
        this.icon = new Icon(Pos.sum(this.pos, FilePad), FileIconSize, p, this);
        this.icon.loadImage("../resource/img/file.png");
    }

    draw(offset: Pos, alpha = 255): void {
        let stroke = this.p.color(FileOutline);
        stroke.setAlpha(alpha);

        let abs = Pos.sum(this.pos, offset);
        this.icon.draw(offset, alpha);
        let textOff = new Pos(this.size.x / 2, 2 * FilePad.y + this.icon.size.y);    
        this.label(Pos.sum(this.pos, textOff), FilenameHeight, stroke, this.file);
    }

    ghost(abs: Pos): Element {
        return new Ghost(abs, new Pos(30, 30), this.p, null, this.parent.window, new Sample(abs, new Pos(30, 30), this.p, null, this.file), true);
    }
}

export class CanvasOption extends ElementOption {
    constructor(pos: Pos, size: Pos, p: p5, parent: ElementMenu) {
        super(pos, size, p, parent);
        this.icon = new Icon(this.pos, this.size, p, this);
        this.icon.loadImage("../resource/img/canvas.png");
    }

    draw(offset: Pos, alpha: number) {
        this.icon.draw(offset, alpha);
    }

    ghost(abs: Pos): Element {
        return new Ghost(abs, canvasDefaultSize, this.p, null, this.parent.window, new Canvas(abs, canvasDefaultSize, this.p, null, true), true);
    }
}