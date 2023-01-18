import p5 from "p5";
import Canvas from "./canvas";
import Element from "./element";
import { Pos } from "./position";

const winSizeX = 800;
const winSizeY = 600;

const sketch = (p: p5) => {
    const main = new Canvas(Pos.zero(), new Pos(winSizeX, winSizeY), p, false);
    let held: Element = null;

    main.addCanvas(new Pos(100, 100));

    p.setup = () => {
        p.createCanvas(winSizeX, winSizeY);
    }

    p.draw = () => {
        p.background(220);
        main.draw(new Pos(0, 0));

        if (p.mouseIsPressed) {
            if (p.mouseButton === p.LEFT) {
                if (held != null) {
                    held.move(new Pos(p.movedX,p.movedY));
                }
            }
        }
    }

    p.mousePressed = () => {
        if (p.mouseButton === p.LEFT) {
            let clicked = main.topUnderMouse(Pos.zero());
            if (clicked.draggable) {
                held = clicked;
            }
        }
        return false;
    }

    p.mouseReleased = () => {
        held = null;
        return false;
    }
}

new p5(sketch);