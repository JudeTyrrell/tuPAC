import p5 from "p5";
import { ControlBar, controlBarHeight } from "./canvas";
import { Element } from "./element";
import Window from "./window";
import { Ghost } from "./ghosts";
import Pos from "./position";
import Sample from "./sample";

const FileExplorerBgColor = "#00383c";
const FileOutline = "#FFFFFF";

export default class FileExplorer extends Element {
    files: File[];
    controlBar: ControlBar;
    window: Window;

    constructor(pos: Pos, size: Pos, p: p5, window: Window) {
        super(pos, size, p, null, false);
        this.window = window;
        this.controlBar = new ControlBar(new Pos(this.size.x, controlBarHeight), p, this);
        this.files = [];
    }

    addFile(pos: Pos, size: Pos, file: string): File {
        let f = new File(pos, size, this.p, this, file);
        this.files.push(f);
        return f;
    }

    draw(offset: Pos, alpha = 255): void {
        let fill = this.p.color(FileExplorerBgColor);
        fill.setAlpha(alpha);
        this.simpleRect(offset, null, fill);

        for (let file of this.files) {
            file.draw(offset);
        }
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        let top = null;
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this;
            let inner = null;
            let controlBar = this.controlBar.topUnderPos(abs, pos);

            if (controlBar != null) {
                top = controlBar;
            }

            for (let element of this.files) {
                inner = element.topUnderPos(offset, pos);
                if (inner != null) {
                    top = inner;
                }
            }
        }

        return top;
    }
}

export class File extends Element {
    file: string;
    parent: FileExplorer;

    constructor(pos: Pos, size: Pos, p: p5, parent: FileExplorer, file: string) {
        super(pos, size, p, parent, false);
        this.file = file;
    }

    draw(offset: Pos, alpha = 255): void {
        let stroke = this.p.color(FileOutline);
        stroke.setAlpha(alpha);
        this.simpleRect(offset, stroke, null);
        this.p.text(this.file, this.pos.x + 10, this.pos.y + 10);
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            return new Ghost(abs, new Pos(30, 30), this.p, this.parent.parent, this.parent.window, new Sample(abs, new Pos(30, 30), this.p, null, this.file), true);
        }

        return null;
    }
}