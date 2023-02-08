import p5, { Color } from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";
import { theWindow } from "tone/build/esm/core/context/AudioContext";

export abstract class Element {
    // pos = (x,y) are co-ordinates respective to the encapsulating Canvas' top-left corner, as is p5.js convention. x increases to the right, y increases down.
    pos: Pos;
    size: Pos;
    draggable: boolean;
    p: p5;
    parent?: Element;
    
    constructor(pos: Pos, size: Pos, p: p5, parent: Element, draggable = false) {
        this.pos = pos;
        this.size = size;
        this.draggable = draggable;
        this.p = p;
        this.parent = parent;
    }

    clicked(): void {}
    drop(onto: Element): void {}

    simpleRect(offset: Pos, stroke: Color, fill: Color): void {
        /** 
         *  Draws a simple rectangle the size of the Element that calls it.
         */
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
        this.p.rect(this.pos.x + offset.x, this.pos.y + offset.y, this.size.x, this.size.y);
    }

    rect(o: Pos, size: Pos, stroke: Color) {
        this.p.stroke(stroke);
        this.p.noFill();
        this.p.rect(o.x, o.y, size.x, size.y);
    }

    label(o: Pos, height: number, color: Color, text: string) {
        this.p.fill(color);
        this.p.textAlign('center');
        this.p.textSize(height);
        this.p.text(text, o.x, o.y);
    }

    setPos(pos: Pos): void {
        this.pos = pos;
    }

    move(dist: Pos): Pos {
        return this.pos.add(dist);
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
    currentTime: number;
    abstract play(master: boolean): void;
    abstract pause(master: boolean): void;
    abstract stop(master: boolean): void;
    abstract schedule(): void;

    updateStartTime(): void {
        if (this.parent === null) {
            // This is really dumb, has to be arbitrarily small because Tone.js won't let us set it to 0.
            this.startTime = 0.0001;
        } else {
            this.startTime = this.parent.startTime + (this.pos.x / this.parent.speed);
        }
        this.currentTime = this.startTime;
        this.schedule();
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

    constructor(pos: Pos, size: Pos, inner: Box, p: p5, parent: Capsule, draggable = true, speed = 20) {
        super(pos, size, p, parent, draggable);
        this.inner = inner;
        this.playables = [];
        this.speed = speed;
        this.playing = false;
        this.updateStartTime();
        this.currentTime = this.startTime;
    }
    
    //resize(size: Pos) {
      //  this.size = size;
    //}

    add(playable: Playable): Playable {
        playable.parent = this;
        playable.updateStartTime();
        playable.currentTime = playable.startTime;
        //this.resize(Pos.maxXY(Pos.sum(playable.pos, playable.size), this.size));
        this.playables.push(playable);
        return playable;
    }

    play(master: boolean) {
        if (this.parent === null) {
            this.playing = true;
        } else if (this.parent.playing || master) {
            this.playing = true;
        }
        console.log("Playing now, master: " + master + ", Start Time: " + this.currentTime);
        if (master) {
            if (Tone.getTransport().state === 'started') {
                Tone.getTransport().stop(0);
            }
            console.log(Tone.getTransport().seconds);
            Tone.getTransport().seconds = this.currentTime;
            Tone.getTransport().start(0);
        }
    }

    pause(master: boolean): void {
        if (this.playing) {
            this.playing = false;
            for (let playable of this.playables) {
                playable.pause(false);
            }
            if (master) {
                Tone.getTransport().pause(0);
                this.currentTime = Tone.getTransport().seconds;
            }
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
                Tone.getTransport().seconds = this.startTime;
                this.currentTime = this.startTime;
            } 
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