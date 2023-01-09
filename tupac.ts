import * as objects from "./objects.js";
import p5 from "p5";

const winSizeX = 600;
const winSizeY = 400;

const sketch = (p5ob: p5) => {
    p5ob.setup = () => {
        p5ob.createCanvas(winSizeX, winSizeY);
    }
    p5ob.draw = () => {
        p5ob.background(220);
    }
}

const p5main = new p5(sketch);

const main = new objects.Canvas(winSizeX, winSizeY, p5main);