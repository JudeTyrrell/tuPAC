import p5 from "p5";
import Canvas from "./canvas";
import { Element } from "./element";
import Pos from "./position";
import * as Tone from "tone";
import Window from "./window";

const winSizeX = 800;
const winSizeY = 600;

const sketch = (p: p5) => {
    const main = new Window(winSizeX, winSizeY, p);
    let held: Element = null;
    let cursorOffX: number;
    let cursorOffY: number;

    let inner = main.addCanvas(new Pos(400, 0), new Pos(400, 600));
    inner.setSpeed(50);
    inner.addSample(new Pos(50, 50), "../resource/audio/ah.wav");

    let fe = main.addFileExplorer(new Pos(0, 0), new Pos(400, 600));
    fe.addFile(new Pos(10, 10), new Pos(40, 40), "../resource/audio/ah.wav");

    p.setup = () => {
        p.createCanvas(winSizeX, winSizeY);
    }

    p.draw = () => {
        p.background(220);
        main.draw();
        if (p.mouseIsPressed) {
            if (p.mouseButton === p.LEFT) {
                if (held != null) {
                    //held.move(new Pos(p.movedX, p.movedY)); // This seems to not work properly for whatever reason
                    let pos = new Pos(p.winMouseX - cursorOffX, p.winMouseY - cursorOffY);
                    held.moveTo(pos);
                    if (typeof held['element'] != 'undefined') {
                        held.draw(Pos.zero());
                    }
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
        let top = main.topUnderMouse();
        if (typeof top['inner'] != 'undefined') {
            held.drop(top);
        }
        held = null;
        return false;
    }
}

new p5(sketch);