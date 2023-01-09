import Tone from "./node_modules/tone/build/tone.js";
import p5 from "p5";

export class Box {
    x: number;
    y: number;
    sizeX: number;
    sizeY: number;

    constructor(x, y, sizeX, sizeY) {
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
    }
}

export class Sample extends Box {
    player: Tone.Player;

    constructor(x, y, sizeX, sizeY, player) {
        super(x, y, sizeX, sizeY);
        this.player = player;
        Tone.Transport.schedule(player, "00:00:00")
    }

}

export class Canvas {
    sizeX: number;
    sizeY: number;
    originX: number;
    originY: number;
    samples: Sample[];
    sketch: p5;

    constructor(sizeX : number, sizeY : number, p5: p5, originX = 0, originY = 0) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.originX = originX;
        this.originY = originY;
        this.samples = [];
        this.sketch = p5;
    }

    addSample(x : number, y : number, sizeX : number, sizeY : number, sample : string) {
        let player = new Tone.Player(sample);
        this.samples.push(new Sample(x, y, sizeX, sizeY, player));
    }

    draw() {
        for (let sample of this.samples) {
            this.sketch.rect(sample.x, sample.y, sample.sizeX, sample.sizeY);
        }
    }

    play() {
        Tone.Transport.start();
    }
}
