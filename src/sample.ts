import { Capsule, Element, Playable } from "./element";
import Pos, { Box } from "./position";
import p5 from "p5";
import { Player } from "tone";
import { controlBarHeight } from "./canvas";
import * as Tone from "tone";
import Icon from "./icon";
import Mouse from "./mouse";

const sampleOutline = "#314814";
const sampleBg = "#000000";
export const sampleMinSize = new Pos(30, 30);

export const wfResolution = 1024;
const wfLineThickness = 3;
const wfLinePad = 1;
const wfPad = new Pos(5, 5);
const wfColor = "#FFFFFF";

export default class Sample extends Playable {
    static waveforms = new Map<string, Float32Array>();
    player: Player;
    waveform: Float32Array;

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, sample: string) {
        super(pos, size, sampleMinSize, p, parent, true);
        this.player = new Player(sample, () => {
            this.updateWaveform(sample);
        }).toDestination();
        this.pauseTime = 0;
        this.waveform = null;
    }
    
    clicked(mouse: Mouse): Element {
        return this;
    }

    updateWaveform(sample: string) {
        for (let wf of Sample.waveforms.entries()) {
            if (wf[0] === sample) {
                this.waveform = wf[1];
                console.log(this.waveform);
                return;
            }
        }
        if(this.player.loaded) {
            this.waveform = this.player.buffer.toArray(0) as Float32Array;
            console.log(this.waveform);
            Sample.waveforms.set(sample, this.waveform);
            return;
        }
    }

    drop(onto: Capsule): void {
        /*if (this.parent.playables.indexOf(onto) > -1) {
            this.transfer(onto);
        }*/
    }

    play(master = false): void {
        this.player.start(0, this.pauseTime - this.startTime);
        console.log("Playing sample at:" + Tone.getTransport().seconds);
    }

    pause(master = false): void {
        this.pauseTime = this.player.sampleTime;
        this.player.stop();
    }

    stop(master = false): void {
        this.player.stop();
    }

    schedule(): void {
        this.unschedule();
        this.scheduleId = Tone.Transport.schedule((time) => {
            if (this.parent.playing) {
                this.play();
                this.pauseTime = 0;
            }
        }, this.startTime);
    }

    draw(offset: Pos, alpha = 255): void {
        let stroke = this.p.color(sampleOutline);
        stroke.setAlpha(alpha);
        let bg = this.p.color(sampleBg);
        bg.setAlpha(alpha);

        if (this.parent != null) {
            let length = Math.max(20, this.player.sampleTime * this.parent.speed);
            this.size.y = length;
        }
        this.simpleRect(offset, stroke, bg);
        this.drawWaveform(Pos.sum(offset,this.pos));
    }

    drawWaveform(offset: Pos) {
        // If waveform not loaded yet.
        if (this.waveform === null) {
            return;
        }

        // Calculate number of bars we will have, amount of samples we have per bar
        let bars = Math.floor(this.size.x / (wfLineThickness + wfLinePad)) - 1;
        let ratio = this.waveform.length / bars;

        let stroke = this.p.color(wfColor);

        let from = new Pos(offset.x + wfPad.x, 0);
        let to = new Pos(from.x, 0);
        let max = this.size.y - (wfPad.y * 2);

        for (let i = 0; i < bars; i++) {
            let height = this.waveform[Math.floor(ratio * i)] * max;
            from.y = offset.y + (this.size.y - height) / 2;
            to.y = from.y + height;
            
            this.line(from, to, stroke, wfLineThickness);

            from.x += wfLineThickness + wfLinePad;
            to.x += wfLineThickness + wfLinePad;
        }   
    }

    topUnderPos(offset: Pos, pos: Pos): Sample {
        if (Pos.inBox(Pos.sum(this.pos, offset), this.size, pos)) {
            return this;
        }
        return null;
    }

    moveTo(pos: Pos): void {
        let newBox = Box.within(new Box(pos, this.size), this.parent.inner);
        this.setPos(newBox.origin);
        this.updateStartTime();
    }
}