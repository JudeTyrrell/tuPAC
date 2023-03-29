import * as Tone from "tone";
import Pos from "./position";
import { Element, maxSpeed } from "./element";
import { Capsule } from "./Capsule";


export abstract class Playable extends Element {
    playing: boolean;
    scheduleId: number;
    speed: number;
    parent: Capsule;
    // Array of UI elements to be drawn on top.
    UI: Element[];

    // Measure in seconds
    startTime: number;
    pauseTime: number;

    abstract play(master: boolean): void;
    abstract pause(master: boolean): void;
    abstract stop(master: boolean): void;
    abstract schedule(): void;

    abstract copy(): Playable;

    transfer(to: Capsule): void {
        let pos = this.getAbsolutePos();
        this.parent.remove(this);
        to.add(this);
        this.pos = this.toRelative(pos, to);
        //console.log(this.pos);
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

    getMinSpeed(): number {
        return (this.size.x * this.parent.speed) / (this.parent.size.x - this.pos.x);
    }

    setSpeed(speed: number): boolean {
        if (this.parent != null) {
            let minSpeed = this.getMinSpeed();

            if (speed < minSpeed) {
                speed = minSpeed;
            } else if (speed === this.speed) {
                return false;
            } else if (speed > maxSpeed) {
                speed = maxSpeed;
            }
            this.speed = speed;
            return true;
        } else {
            this.speed = speed;
            return true;
        }
    }

    scaleSpeed(scale: number): boolean {
        return this.setSpeed(this.speed * scale);
    }
}
