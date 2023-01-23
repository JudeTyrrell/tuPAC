import p5 from "p5";
import Canvas from "./canvas";
import { Element } from "./element";
import Pos from "./position";

const winSizeX = 800;
const winSizeY = 600;

const sketch = (p: p5) => {
    const main = new Canvas(Pos.zero(), new Pos(winSizeX, winSizeY), p, null, false);
    let held: Element = null;
    let cursorOffX: number;
    let cursorOffY: number;

    main.addCanvas(new Pos(100, 100));

    p.setup = () => {
        p.createCanvas(winSizeX, winSizeY);
    }

    p.draw = () => {
        p.background(220);
        main.draw();
        let top = main.topUnderMouse(Pos.zero());
        p.text(top.pos.x + ", " + top.pos.y,100,100);
        if (p.mouseIsPressed) {
            if (p.mouseButton === p.LEFT) {
                if (held != null) {
                    //held.move(new Pos(p.movedX, p.movedY)); // This seems to not work for whatever reason
                    let pos = new Pos(p.winMouseX - cursorOffX, p.winMouseY - cursorOffY);
                    held.moveTo(pos);
                    console.log(pos);
                }
            }
        }
    }

    p.mousePressed = () => {
        if (p.mouseButton === p.LEFT) {
            let clicked = main.topUnderMouse(Pos.zero());
            clicked.clicked();
            if (clicked.draggable) {
                cursorOffX = p.winMouseX - clicked.pos.x;
                cursorOffY = p.winMouseY - clicked.pos.y;
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