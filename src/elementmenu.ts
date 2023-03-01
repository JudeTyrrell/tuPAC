import p5 from "p5";
import { controlBarHeight, canvasDefaultSize } from './canvas';
import { Element } from "./element";
import Window from "./window";
import { Ghost } from "./ghosts";
import Pos from "./position";
import Sample from "./sample";
import Icon, { Icons } from "./icon";
import Canvas from './canvas';
import { ControlBar } from "./controlbar";
import { dialog } from "electron";
import Mouse from "./mouse";

const FileExplorerBgColor = "#009978";
const FileExplorerOutline = "#00bd9a";
const FileOutline = "#FFFFFF";
const FilePad = new Pos(10,10);
const FileIconSize = new Pos(20,20);
const FilenameHeight = 12;
const FileSize = Pos.sum(FilePad, FileIconSize);
const elementMenuMinSize = new Pos(100, 100);
const elementOptionMinSize = new Pos(30, 30);

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
        element.resize(Pos.diff(this.elementSize, element.size));
        this.placeElements();
        return element;
    }

    addCanvasOption(pos: Pos): CanvasOption {
        let canv = new CanvasOption(Pos.sum(pos, this.pos), this.elementSize, this.p, this);
        this.elements.push(canv);
        this.placeElements();
        return canv;
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
        let x = 0;
        let y = controlBarHeight;
        let max = Pos.diff(this.size, this.elementSize);
        for (let element of this.elements) {
            element.moveTo(new Pos(x, y));
            x += this.elementSize.x;
            if (x > max.x) {
                x = 0;
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

export default class FileExplorer extends ElementMenu {
    controlBar: ControlBar;

    constructor(pos: Pos, size: Pos, p: p5, window: Window) {
        super(pos, size, FileSize, p, window);
        this.controlBar = new ControlBar(new Pos(this.size.x, controlBarHeight), p, this);
        /*this.controlBar.addLeftButton('addFile', Icons.plus, async () => {
            let files = await (await dialog.showOpenDialog({properties: ['openFile']})).filePaths;
            if (!(files === undefined)) {
                for (let path of files) {
                    this.addFile(Pos.zero(), new Pos(100,100), path);
                }
            }
        });*/
    }

    draw(offset: Pos, alpha = 255): void {
        let fill = this.p.color(FileExplorerBgColor);
        fill.setAlpha(alpha);
        let stroke = this.p.color(FileExplorerOutline);
        this.simpleRect(offset, stroke, fill);
        
        let off = Pos.sum(this.pos, offset);
        this.controlBar.draw(off);
        for (let element of this.elements) {
            element.draw(off);
        }
    }

    addFile(pos: Pos, file: string): File {
        let f = new File(pos, this.elementSize, this.p, this, file);
        this.addElement(f);
        return f;
    }
}

export abstract class ElementOption extends Element {
    parent: ElementMenu;
    icon: Icon;

    constructor(pos: Pos, size: Pos, p: p5, parent: ElementMenu) {
        super(pos, size, elementOptionMinSize, p, parent, true);
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

export class File extends ElementOption {
    file: string;

    constructor(pos: Pos, size: Pos, p: p5, parent: FileExplorer, file: string) {
        super(pos, size, p, parent);
        this.file = file;
        this.icon = new Icon(FilePad, FileIconSize, p, this, Icons.file);
    }

    draw(offset: Pos, alpha = 255): void {
        let stroke = this.p.color(FileOutline);
        stroke.setAlpha(alpha);

        let off = Pos.sum(offset, this.pos);

        this.icon.draw(off, alpha);
        let textOff = new Pos(this.size.x / 2, 2 * FilePad.y + this.icon.size.y);
        let txt = File.getName(this.file);
        this.p.textSize(FilenameHeight);
        if (this.p.textWidth(txt) > this.size.x) {
            txt = "..." + txt.slice(-10);
        }

        this.label(Pos.sum(off, textOff), FilenameHeight, stroke, txt);
    }

    ghost(abs: Pos): Element {
        return new Ghost(abs, new Pos(30, 30), this.p, null, this.parent.window, new Sample(abs, new Pos(30, 30), this.p, null, this.file), true);
    }

    static getName(file: string) {
        let f = file.split("/");
        return f[f.length - 1];
    }
}

export class CanvasOption extends ElementOption {
    constructor(pos: Pos, size: Pos, p: p5, parent: ElementMenu) {
        super(pos, size, p, parent);
        this.icon = new Icon(this.pos, this.size, p, this);
        this.icon.loadImage("../resource/img/canvas.png");
    }

    draw(offset: Pos, alpha: number) {
        this.icon.draw(Pos.sum(offset, this.pos), alpha);
    }

    ghost(abs: Pos): Element {
        return new Ghost(abs, canvasDefaultSize, this.p, null, this.parent.window, new Canvas(abs, canvasDefaultSize, this.p, null, true), true);
    }
}