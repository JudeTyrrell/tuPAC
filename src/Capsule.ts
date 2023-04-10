import p5 from "p5";
import * as Tone from "tone";
import Pos, { Box } from "./position";
import { Playable } from './Playable';
import { Resi, capsuleMinSize, Element } from "./element";


export abstract class Capsule extends Playable {
    // Array of elements on this Canvas. Elements are drawn in order of increasing index, and so the later an element's index in this array, the closer to the 'top' it is.
    playables: Playable[];
    playing: boolean;
    // Where inner elements can be moved to
    inner: Box;

    constructor(pos: Pos, size: Pos, minSize: Pos, inner: Box, p: p5, parent: Capsule, draggable = true, resizable = Resi.XY, speed = 20) {
        super(pos, size, minSize, p, parent, draggable, resizable);
        this.inner = inner;
        this.playables = [];
        this.UI = [];
        this.speed = speed;
        this.playing = false;
    }

    getMinSpeed(): number {
        if (this.parent === null) {
            return 0;
        }

        let minSpeed = (this.size.x * this.parent.speed) / (this.parent.size.x - this.pos.x);

        for (let playable of this.playables) {
            let min = playable.getMinSpeed();

            if (min > minSpeed) {
                minSpeed = min;
            }
        }

        return minSpeed;
    }

    getMaxSpeed(): number {
        let maxSpeed = 1000;

        for (let playable of this.playables) {
            let max = (this.size.x - playable.pos.x) * playable.speed / playable.size.x;

            if (max < maxSpeed) {
                maxSpeed = max;
            }
        }

        return maxSpeed;
    }


    setSpeed(speed: number): boolean {
        let minSpeed = this.getMinSpeed();
        let maxSpeed = this.getMaxSpeed();

        console.log(maxSpeed, speed);
        if (speed < minSpeed) {
            speed = minSpeed;
        } else if (speed === this.speed) {
            return false;
        } else if (speed > maxSpeed) {
            speed = maxSpeed;
        }
        for (let playable of this.playables) {
            playable.updateStartTime();
        }
        console.log(speed);
        this.speed = speed;
        return true;
    }
    
    drop(onto: Capsule): void {
        if (this.parent === null || this.parent.playables.indexOf(onto) > -1) {
            this.transfer(onto);
        }
    }

    topUnderPos(offset: Pos, pos: Pos): Element {
        let top = null;
        let abs = Pos.sum(this.pos, offset);

        if (Pos.inBox(abs, this.size, pos)) {
            top = this;
        }
        
        let inner = null;
        for (let element of this.playables) {
            inner = element.topUnderPos(abs, pos);
            if (inner != null) {
                top = inner;
            }
        }
       
        for (let element of this.UI) {
            let inner = element.topUnderPos(abs, pos);
            if (inner != null) {
                top = inner;
            }
        }
        return top;
    }

    pushToTop(playable: Playable): void {
        let index = this.playables.indexOf(playable);
        if (index > -1) {
            this.playables.splice(index, 1);
            this.playables.push(playable);
        }
    }

    resize(change: Pos): Pos {
        return this.resizeTo(Pos.sum(this.size, change));
    }

    resizeTo(size: Pos): Pos {
        let newSize = Pos.maxXY(size, this.minSize);
        let maxSize = Pos.diff(this.parent.inner.size, this.pos);
        newSize = Pos.minXY(maxSize, newSize);
        let change = Pos.diff(newSize, this.size);
        if (Box.smallerThan(new Box(this.pos, newSize), this.parent.inner)) {
            this.size = newSize;
            this.inner.size = Pos.sum(this.inner.size, change);
            this.updateStartTime();
            return newSize;
        } else {
            return this.size;
        }
    }

    updateMinSize(): Pos {
        let newMinSize = Pos.zero();
        for (let playable of this.playables) {
            newMinSize = Pos.maxXY(Pos.sum(playable.pos, playable.size), newMinSize);
        }
        this.minSize = Pos.maxXY(newMinSize, capsuleMinSize);
        return this.minSize;
    }

    add(playable: Playable): Playable {
        playable.parent = this;
        this.playables.push(playable);
        playable.connect(this);
        return playable;
    }

    remove(element: Element): void {
        let indexp = this.playables.indexOf(element as Playable);
        let indexu = this.UI.indexOf(element);
        if (indexp > -1) {
            this.playables.splice(indexp, 1);
            element.parent = null;
        }
        if (indexu > -1) {
            this.UI.splice(indexu, 1);
            element.parent = null;
        }
    }

    play(master: boolean) {
        console.log("Playing now, master: " + master + ", Start Time: " + this.pauseTime);
        if (master) {
            if (Tone.getTransport().state === 'started') {
                Tone.getTransport().stop(0);
            }
            Tone.getTransport().seconds = this.pauseTime;
            Tone.getTransport().start(0);
            console.log("Starting Transport at: " + this.pauseTime);
            //console.log(Tone.getTransport().seconds);
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
            if (Tone.Transport.state === 'started') {
                this.pauseTime = Tone.Transport.seconds;
                if (master) {
                    Tone.getTransport().stop(0);
                }
            }
            console.log("Paused, set pauseTime to:" + this.pauseTime);
        }
    }

    stop(master: boolean): void {
        for (let playable of this.playables) {
            playable.stop(false);
        }
        if (this.playing) {
            this.playing = false;
            if (master && Tone.Transport.state === 'started') {
                Tone.getTransport().stop(0);
            }
            this.pauseTime = this.startTime;
            console.log("Stopped, set pauseTime to:" + this.startTime);
        } else {
            this.pauseTime = this.startTime;
        }
    }

    schedule(): void {
        this.unschedule();
        this.scheduleId = Tone.Transport.schedule((time) => {
            if ((this.parent != null) || this.parent.playing) {
                this.play(false);
            }
        }, this.startTime);
        //console.log(this.startTime);
        for (let playable of this.playables) {
            playable.updateStartTime();
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
        this.stop(false);
        this.updateStartTime();
    }
}
