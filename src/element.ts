import p5 from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";

export abstract class Element {
    // pos = (x,y) are co-ordinates respective to the encapsulating Canvas' top-left corner, as is p5.js convention. x increases to the right, y increases down.
    pos: Pos;
    size: Pos;
    draggable: boolean;
    p: p5;
    parent: Capsule;
    speed: number; // (playback speed) Measured in pixels/second

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, draggable = false, speed = 10) {
        this.pos = pos;
        this.size = size;
        this.draggable = draggable;
        this.p = p;
        this.parent = parent;
        this.speed = speed;
    }

    clicked(): void {}

    simpleRect(offset: Pos, stroke: string, fill: string): void {
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

    rect(o: Pos, size: Pos, stroke: string) {
        this.p.stroke(stroke);
        this.p.noFill();
        this.p.rect(o.x, o.y, size.x, size.y);
    }

    setPos(pos: Pos): void {
        this.pos = pos;
    }


    setSpeed(speed: number): void {
        this.speed = speed;
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

    abstract draw(offset: Pos): void;

    abstract topUnderMouse(offset: Pos): Element;
}

export abstract class Playable extends Element {
    playing: boolean;
    scheduleId: number;
    abstract play(master: boolean): void;
    abstract pause(): void;
    abstract stop(): void;
    abstract schedule(): void;
    unschedule(): void {
        if (this.scheduleId != null) {
            Tone.Transport.clear(this.scheduleId);
            this.scheduleId = null;
        }
    }
}

export abstract class Capsule extends Playable {
    // Measure in seconds
    startTime: number;
    // Array of elements on this Canvas. Elements are drawn in order of increasing index, and so the later an element's index in this array, the closer to the 'top' it is.
    playables: Playable[];
    playing: boolean;
    // Where inner elements can be moved to
    inner: Box;

    constructor(pos: Pos, size: Pos, inner: Box, p: p5, parent: Capsule, draggable = true, speed = 10) {
        super(pos, size, p, parent, draggable, speed);
        this.inner = inner;
        this.playables = [];
        this.playing = false;
        this.updateStartTime();
    }

    updateStartTime(): void {
        if (this.parent === null) {
            this.startTime = 0;
        } else {
            this.startTime = this.parent.startTime + (this.pos.x / this.parent.speed);
        }
        this.schedule();
    }

    play(master: boolean): void {
        this.playing = true;
        console.log("Playing now, master: " + master + ", startTime: " + this.startTime);
        if (master) {
            Tone.Transport.debug = true;
            Tone.Transport.stop();
            Tone.Transport.seconds = this.startTime;
            console.log("Time: " + Tone.Transport.now());
        }
    }

    pause(): void {
        this.playing = false;
        for (let playable of this.playables) {
            playable.pause();
        }
    }

    stop(): void {
        this.playing = false;
        for (let playable of this.playables) {
            playable.stop();
        }
    }

    schedule(): void {
        this.unschedule();
        this.scheduleId = Tone.Transport.schedule((time) => {
            if (this.parent.playing || (this.parent === null)) {
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