import p5, { Color } from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";
import Mouse from "./mouse";

export const capsuleMinSize = new Pos(200, 100);

export abstract class Element {
    // pos = (x,y) are co-ordinates respective to the encapsulating Canvas' top-left corner, as is p5.js convention. x increases to the right, y increases down.
    pos: Pos;
    size: Pos;
    minSize: Pos;
    draggable: boolean;
    resizable: boolean;
    p: p5;
    parent?: Element;
    
    constructor(pos: Pos, size: Pos, minSize: Pos, p: p5, parent: Element, draggable = false, resizable = false) {
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
        let newSize = Pos.minXY(Pos.sum(this.size, change), this.minSize);
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

    label(o: Pos, height: number, color: Color, text: string) {
        this.p.fill(color);
        this.p.textSize(height);
        this.p.textAlign('center');
        this.p.text(text, o.x, o.y);
    }

    setPos(pos: Pos): void {
        this.pos = pos;
    }

    move(dist: Pos): void {
        this.moveTo(Pos.sum(this.pos,dist));
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

    topUnderPos(offset: any, pos: Pos): any {
        let abs = Pos.sum(this.pos, offset);
        if (Pos.inBox(abs, this.size, this.mPos())) {
            return this;
        } else {
            return null;
        }
    }
}

export abstract class Playable extends Element {
    playing: boolean;
    scheduleId: number;
    speed: number; // (playback speed) Measured in pixels/second
    parent: Capsule;
    // Measure in seconds
    startTime: number;
    pauseTime: number;

    abstract play(master: boolean): void;
    abstract pause(master: boolean): void;
    abstract stop(master: boolean): void;
    abstract schedule(): void;

    transfer(to: Capsule): void {
        let pos = this.getAbsolutePos();
        this.parent.remove(this);
        to.add(this);
        this.pos = this.toRelative(pos, to);
    }
    
    toRelative(abs: Pos, capsule: Capsule): Pos {
        let top = capsule;
        let relative = abs.copy().sub(top.pos);
        let parent = top.parent;
        while (parent != null) {
            relative.sub(parent.pos);
            parent = parent.parent;
        }
        return relative;
    }

    updateStartTime(): void {
        if (this.parent === null) {
            // This is really dumb, has to be arbitrarily small because Tone.js won't let us set it to 0.
            this.startTime = 0.0001;
        } else {
            this.startTime = this.parent.startTime + (this.pos.x / this.parent.speed);
            this.schedule();
        }
        this.pauseTime = this.startTime;
        //console.log("Updated start time: " + this.startTime + " for " + this);
    }

    unschedule(): void {
        if (this.scheduleId != null) {
            Tone.Transport.clear(this.scheduleId);
            this.scheduleId = null;
        }
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }
}

export abstract class Capsule extends Playable {
    // Array of elements on this Canvas. Elements are drawn in order of increasing index, and so the later an element's index in this array, the closer to the 'top' it is.
    playables: Playable[];
    playing: boolean;
    // Where inner elements can be moved to
    inner: Box;

    constructor(pos: Pos, size: Pos, inner: Box, p: p5, parent: Capsule, draggable = true, resizable = true, speed = 20) {
        super(pos, size, capsuleMinSize, p, parent, draggable, resizable);
        this.inner = inner;
        this.playables = [];
        this.speed = speed;
        this.playing = false;
    }

    pushToTop(playable: Playable): void {
        let index = this.playables.indexOf(playable);
        if (index > -1) {
            this.playables.splice(index, 1);
            this.playables.push(playable);
        }
    }
    
    resize(change: Pos) : Pos {
        let newSize = Pos.maxXY(Pos.sum(this.size, change), this.minSize);
        change = Pos.diff(newSize, this.size);
        if (Box.within(new Box(this.pos, newSize), this.parent.inner)) {
            this.size = newSize;
            this.inner.size = Pos.sum(this.inner.size, change);
            this.updateStartTime();
            return newSize;
        } else{ 
            throw new Error("Can't resize to: "+newSize+", doesn't fit!");
        }
    }

    updateMinSize(): Pos {
        let newMinSize = Pos.zero()
        for (let playable of this.playables) {
            newMinSize = Pos.maxXY(Pos.sum(playable.pos, playable.size), newMinSize);
        }
        this.minSize = Pos.maxXY(newMinSize, capsuleMinSize);
        return this.minSize;
    }

    add(playable: Playable): Playable {
        playable.parent = this;
        playable.updateStartTime();
        //this.resize(Pos.maxXY(Pos.sum(playable.pos, playable.size), this.size));
        this.playables.push(playable);
        return playable;
    }

    remove(playable: Playable): void {
        let index = this.playables.indexOf(playable);
        if (index > -1) {
            this.playables.splice(index, 1);
        }
    }

    play(master: boolean) {
        console.log("Playing now, master: " + master + ", Start Time: " + this.pauseTime);
        if (master) {
            console.log(Tone.getTransport().seconds);
            if (Tone.getTransport().state != 'started') {
                Tone.getTransport().stop(0);
                Tone.getTransport().seconds = this.pauseTime;
                Tone.getTransport().start(0);
                console.log("Starting Transport at: "+this.pauseTime);
            }
            this.playing = true;
        } else {
            if (this.parent != null) {
                if (this.parent.playing) {
                    this.playing = true;
                }
            }
        }
    }

    pause(master: boolean): void {
        if (this.playing) {
            this.playing = false;
            for (let playable of this.playables) {
                playable.pause(false);
            }
            if (master) {
                Tone.getTransport().pause();
                this.pauseTime = Tone.getTransport().seconds;
            }
            console.log("Paused, set pauseTime to:" + this.pauseTime);
        }
    }

    stop(master: boolean): void {
        if (this.playing) {
            this.playing = false;
            for (let playable of this.playables) {
                playable.stop(false);
            }
            if (master) {
                Tone.getTransport().stop(0);
            } 
            this.pauseTime = this.startTime;
            console.log("Stopped, set pauseTime to:" + this.startTime);
        }
    }

    schedule(): void {
        this.unschedule();
        this.scheduleId = Tone.Transport.schedule((time) => {
            if ((this.parent === null) || this.parent.playing) {
                this.play(false);
            }
        }, this.startTime);
        for (let playable of this.playables) {
            playable.schedule();
        }
    }

    unschedule(): void {
        Tone.Transport.clear(this.scheduleId);
        for (let pb of this.playables) {
            pb.unschedule();
        }
    }

    moveTo(pos = Pos.zero()): void {
        let newBox = Box.within(new Box(pos, this.size), this.parent.inner);
        this.setPos(newBox.origin);
        this.updateStartTime();
    }
}