import p5 from "p5";
import { Element } from "./element.js";

const winSizeX = 800;
const winSizeY = 600;

const bgColor = "#77b7bb";

const sketch = (p: p5) => {
    const elements = [];
    const elementTest = new Element(10,10,30,30,p);

    p.setup = () => {
        p.createCanvas(winSizeX, winSizeY);
    }

    p.draw = () => {
        p.background(bgColor);
        elementTest.draw();
    }

    p.mousePressed = () => {
        return false;
    }
}

new p5(sketch);