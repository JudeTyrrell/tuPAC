import Playable from "./playable";
import Element from "./element";
import { Pair } from "./position";
import p5 from "p5";
import { Player } from "tone";

const sampleOutline = "#314814";

export default class Sample extends Element implements Playable {
    player: Player;
    _currentTime: number;

    constructor(pos: Pair, size: Pair, p: p5, sample: string) {
        super(pos, size, p, true);
        this.player = new Player(sample);
    }

    play(): void {
        this.player.start(this._currentTime);
    }

    pause(): void {
        this._currentTime = this.player.sampleTime;
        this.player.stop();
    }

    stop(): void {
        this.player.stop();
    }

    draw(offset: Pair): void {
        this.p.noFill();
        this.p.stroke(sampleOutline);
        this.simpleRect(offset);
    }
}