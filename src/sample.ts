import { Element } from "./element";
import { Capsule } from "./Capsule";
import { Playable } from "./Playable";
import Pos, { Box } from "./position";
import p5 from "p5";
import { Player } from "tone";
import * as Tone from "tone";
import Mouse from "./mouse";
import { ControlBar } from './controlbar';
import { File } from "./FileExplorer";

const sampleOutline = "#314814";
const sampleBg = "#000000";
export const sampleMinSize = new Pos(20, 50);

const sampleTitleHeight = 20;

const wfLineThickness = 2;
const wfLinePad = 1;
const wfPad = new Pos(2, 2);
const wfColor = "#FFFFFF";
const maxWidth = 15;

export default class Sample extends Playable {
    static buffers = new Map<string, Float32Array>();
    player: Player;
    sample: string;
    waveform: Float32Array;
    title: ControlBar;

    constructor(pos: Pos, size: Pos, p: p5, parent: Capsule, sample: string) {
        super(pos, size, sampleMinSize, p, parent, true);
        this.UI = [];
        this.sample = sample;
        this.title = new ControlBar(new Pos(this.size.x, sampleTitleHeight), this.p, this, true);
        this.UI.push(this.title);
        this.player = new Player(sample, () => {
            this.updateWaveform();
        }).toDestination();
        this.pauseTime = 0;
        this.waveform = null;
        this.title.addTitle(Sample.getTitle(sample));
    }

    copy(): Sample {
        let samp = new Sample(this.pos, this.size, this.p, this.parent, this.sample);
        return samp;
    }
    
    clicked(mouse: Mouse): Element {
        return this;
    }

    generateWaveform(buff: Float32Array): Float32Array {
        let length = Math.floor((this.size.x - (wfPad.x * 2)) / (wfLineThickness + wfLinePad));
        let wf = new Float32Array(length);

        let maxV = Math.max(...buff);

        let ratio = Math.floor(buff.length / length);

        let width = Math.floor(Math.min(maxWidth, ratio) / 2);

        for (let i = 0; i < length; i++) {
            let ave = 0;

            let centre = i * ratio;
            let min = Math.max(centre-width, 0); 
            let max = Math.min(centre+width, buff.length-1);

            for (let j = min; j <= max; j++) {
                ave += Math.abs(buff[j]);
            }
            ave = ave / (max-min);

            wf[i] = ave / maxV;
        }

        //console.log(wf);
        return wf;
    }

    updateWaveform() {
        if (this.parent != null) {
            for (let wf of Sample.buffers.entries()) {
                if (wf[0] === this.sample) {
                    this.waveform = this.generateWaveform(wf[1]);
                    return;
                }
            }
            if(this.player.loaded) {
                let buff = this.player.buffer.toArray(0) as Float32Array;
                this.waveform = this.generateWaveform(buff);
                Sample.buffers.set(this.sample, buff);
                this.setSpeed(0);
                return;
            }
        }
    }

    drop(onto: Capsule): void {
        this.transfer(onto);
        this.updateWaveform();
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

    // Speed measured as is everywhere else, pixels / second
    setSpeed(speed: number): boolean {
        if (this.parent != null) {
            this.speed = this.parent.speed;
            if (this.player.loaded) {
                this.size.x = Math.max(sampleMinSize.x, this.player.buffer.duration * this.speed);
                this.updateWaveform();
                this.player.playbackRate = this.player.buffer.duration / (this.size.x / this.speed);
            }
            return true;
        }
        return false;
    }

    draw(offset: Pos, alpha = 255): void {
        let stroke = this.p.color(sampleOutline);
        stroke.setAlpha(alpha);
        let bg = this.p.color(sampleBg);
        bg.setAlpha(alpha);

        let off = Pos.sum(offset, this.pos);
        this.simpleRect(offset, stroke, bg);
        for (let element of this.UI) {
            element.draw(off, alpha);
        }
        this.drawWaveform(off, alpha);
    }

    drawWaveform(offset: Pos, alpha = 255) {
        offset.y += sampleTitleHeight;
        // If waveform not loaded yet.
        if (this.waveform === null) {
            this.updateWaveform();
            return;
        }

        

        let from = new Pos(wfPad.x + offset.x, 0);
        let to = new Pos(wfPad.x + offset.x, 0);
        let max = this.size.y - sampleTitleHeight - (wfPad.y * 2);

        let stroke = this.p.color(wfColor);
        stroke.setAlpha(alpha);

        for (let bar of this.waveform) {
            let height = max * bar;

            from.y = offset.y + (this.size.y - sampleTitleHeight - height) / 2;
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

    static getTitle(file: string): string {
        let t = File.getName(file).split(".");
        return t[0];
    }
}