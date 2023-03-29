import p5 from "p5";
import { controlBarHeight } from './canvas';
import { Element } from "./element";
import { ElementMenu, ElementOption } from "./elementmenu";
import Window from "./window";
import Pos from "./position";
import Icon, { Icons } from "./icon";
import { ControlBar } from "./controlbar";
import { ipcRenderer } from 'electron';
import Sample, { sampleMinSize } from "./sample";
import { Ghost } from "./ghosts";
import { Label } from "./label";

export const FileExplorerBgColor = "#009978";
export const FileExplorerOutline = "#00bd9a";
const FileOutline = "#FFFFFF";
const FileIconPad = new Pos(20,10);
const FileIconSize = new Pos(20,20);
const FilenameHeight = 15;
export const FileSize = Pos.sum(new Pos(2*FileIconPad.x, 2*FileIconPad.y + FilenameHeight), FileIconSize);

export default class FileExplorer extends ElementMenu {
    controlBar: ControlBar;

    constructor(pos: Pos, size: Pos, p: p5, window: Window) {
        super(pos, size, FileSize, p, window);

        this.controlBar = new ControlBar(new Pos(this.size.x, controlBarHeight), p, this, false);
        this.controlBar.addLeftButton('addFile', Icons.plus, async () => {
            let files = (await ipcRenderer.invoke("showDialog")).filePaths;
            console.log(files);
            if (!(files === undefined)) {
                for (let path of files) {
                    this.addFile(path);
                }
            }
        });
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

    addFile(file: string): File {
        let f = new File(this.elementSize.copy(), this.p, this, file);
        this.addElement(f);
        return f;
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        let top = null;
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this;
            let inner = null;

            inner = this.controlBar.topUnderPos(abs, pos);
            if (inner != null) {
                top = inner;
            }
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

export class File extends ElementOption {
    file: string;
    label: Label;

    constructor(size: Pos, p: p5, parent: FileExplorer, file: string) {
        super(size, p, parent);
        this.file = file;
        this.icon = new Icon(FileIconPad, FileIconSize, p, this, Icons.file);
        let name = File.getName(file);
        this.p.textSize(FilenameHeight);
        this.label = new Label(new Pos((this.size.x - this.p.textWidth(name))/ 2, 2 * FileIconPad.y + this.icon.size.y), new Pos(this.size.x, FilenameHeight), name, this.p, this);
    }

    draw(offset: Pos, alpha = 255): void {
        let stroke = this.p.color(FileOutline);
        stroke.setAlpha(alpha);

        let off = Pos.sum(offset, this.pos);

        this.icon.draw(off, alpha);
        let txt = File.getName(this.file);
        this.p.textSize(FilenameHeight);
        if (this.p.textWidth(txt) > this.size.x) {
            txt = "..." + txt.slice(-10);
        }

        this.label.draw(off, alpha);
    }

    ghost(abs: Pos): Element {
        let sample = new Sample(Pos.sum(abs, FileIconPad), sampleMinSize.copy(), this.p, null, this.file);
        return new Ghost(sample.pos, sample.size, this.p, null, this.parent.window, sample, true);
    }

    static getName(file: string) {
        let f = file.split("\\");
        return f[f.length - 1];
    }
}