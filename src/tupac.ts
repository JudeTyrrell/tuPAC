import p5 from "p5";
import Canvas from "./canvas";
import { Pair } from "./position";

const winSizeX = 800;
const winSizeY = 600;

const sketch = (p: p5) => {
    const main = new Canvas(new Pair(0,0),new Pair(winSizeX,winSizeY), p, false);
   
    p.setup = () => {
        p.createCanvas(winSizeX, winSizeY);
    }

    p.draw = () => {
        main.draw(new Pair(0,0));
    }

    p.mousePressed = () => {
        return false;
    }
}

new p5(sketch);