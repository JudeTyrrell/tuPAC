import p5 from 'p5';
import { Element } from "./element";
import Pos from "./position";
import Mouse from "./mouse";

const iconMinSize = new Pos(10,10);

export enum Icons {
    missing,
    file,
    play,
    pause,
    stop,
    canvas,
    plus,
    distort,
    reverb
}

export default class Icon extends Element {
    img: p5.Image;
    static resources : p5.Image[];

    constructor(pos: Pos, size: Pos, p: p5, parent: Element, icon?: Icons) {
        super(pos, size, iconMinSize, p, parent, false);
        if (!(icon === undefined)) {
            this.set(icon);
        }
    }

    clicked(mouse: Mouse): Element {
        return this.parent;
    }

    draw(offset: Pos, alpha = 255): void {
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
            p.loadImage("../resource/img/canvas.png"),
            p.loadImage("../resource/img/plus.png"),
            p.loadImage("../resource/img/distort.png"),
            p.loadImage("../resource/img/reverb.png")
        ]
    }

    static resource(icon: Icons): p5.Image {
        return this.resources[icon];
    }

    setImage(img: p5.Image) {
        this.img = img;
    }

    set(icon: Icons) {
        this.img = Icon.resource(icon);
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