import p5 from "p5";
import { Capsule } from "./Capsule";
import { controlBarHeight } from './canvas';
import Pos, { Box } from "./position";
import { Element, Resi } from "./element";
import { Playable } from "./Playable";
import { ToneAudioNode } from "tone";
import { ControlBar } from "./controlbar";
import Mouse from "./mouse";

export const effectBg = "#FFFFFF";
export const effectOutline = "#EEEEEE";
export const effectBarHeight = 20;
export const effectEmptySize = new Pos(60, 40);

export default abstract class Effect extends Capsule {
    controlBar: ControlBar;

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, node: ToneAudioNode, draggable = true, resizable = Resi.None) {
        super(pos, size, effectEmptySize, new Box(new Pos(0, effectBarHeight), new Pos(size.x, size.y - effectBarHeight)), p, parent, draggable, resizable);
        this.node = node;
        if (this.parent != null && this.parent['node'] != null) {
            this.node.connect(this.parent.node);
        } else {
            this.node.toDestination();
        }
        this.controlBar = new ControlBar(new Pos(this.size.x, effectBarHeight), p, this, true);
        this.UI.push(this.controlBar);
    }

    add(playable: Playable): Playable {
        super.add(playable);
        this.resizeTo(new Pos(playable.size.x, playable.size.y + effectBarHeight));
        playable.setPos(this.inner.origin);
        console.log(playable);
        return playable;
    }

    clicked(mouse: Mouse): Element {
        return null;
    }

    draw(offset: Pos, alpha = 255): void {
        let off = Pos.sum(this.pos, offset);
        let stroke = this.p.color(effectOutline);
        stroke.setAlpha(alpha);
        
        let fill = this.p.color(effectBg);
        fill.setAlpha(alpha);

        this.simpleRect(offset, stroke, fill);
        if (this.playables[0] != null) {
            this.playables[0].draw(off);
        }
        this.controlBar.draw(off, alpha);
    }

    resize(change: Pos): Pos {
        return this.resizeTo(Pos.sum(this.size, change));
    }

    resizeTo(size: Pos): Pos {
        this.size = size;
        this.inner.size = new Pos(this.size.x, this.size.y - effectBarHeight);
        this.controlBar.resizeTo(new Pos(size.x, effectBarHeight));
        return size;
    }

    abstract copy(): Effect;
}