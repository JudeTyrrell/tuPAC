import { Element} from "./element";
import p5 from 'p5';
import Pos from "./position";

export enum Icons {
    missing,
    file,
    play,
    pause,
    stop,
    canvas
}

export default class Icon extends Element {
    img: p5.Image;
    static resources : p5.Image[];

    constructor(pos: Pos, size: Pos, p: p5, parent: Element) {
        super(pos, size, p, parent, false);
    }

    draw(offset: Pos, alpha = 255): void {
        this.pos = this.parent.pos;
        let off = Pos.sum(this.pos, offset);
        this.p.tint(255, alpha);
        if (this.img != null) {
            this.p.image(this.img, off.x, off.y, this.size.x, this.size.y);
        } else {
            this.p.image(Icon.resource(Icons.missing), off.x, off.y, this.size.x, this.size.y);
        }
    }

    loadImage(img: string) {
        this.img = this.p.loadImage(img);
    }

    static loadResources(p: p5): void {
        Icon.resources = [
            p.loadImage("../resource/img/missing.png"),
            p.loadImage("../resource/img/file.png"),
            p.loadImage("../resource/img/play.png"),
            p.loadImage("../resource/img/pause.png"),
            p.loadImage("../resource/img/stop.png"),
            p.loadImage("../resource/img/canvas.png")
        ]
    }

    static resource(i: Icons): p5.Image {
        return this.resources[i];
    }

    setImage(img: p5.Image) {
        this.img = img;
    }

    topUnderPos(offset: any, pos: Pos): any {
        let abs = Pos.sum(this.pos, offset);
        if (Pos.inBox(abs, this.size, this.mPos())) {
            return this.parent;
        } else {
            return null;
        }
    }
}