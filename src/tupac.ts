import p5 from "p5";
import Canvas from "./canvas";
import { Element } from "./element";
import Pos from "./position";
import * as Tone from "tone";
import Window from "./window";
import { CanvasOption } from "./elementmenu";
import Icon from "./icon";
import Mouse from "./mouse";


export const winSizeX = 1200;
export const winSizeY = 900;
export const resizeLenience = 3;

const cursors = ["default", "default", "ew-resize", "ns-resize", "nwse-resize"];

const sketch = (p: p5) => {
    Icon.loadResources(p);
    const main = new Window(winSizeX, winSizeY, p);
    new Mouse(main, p);
    const mouse = new Mouse(main, p);

    let inner = main.addCanvas(new Pos(200, 0), new Pos(1000, 1000));
    inner.setSpeed(50);
    inner.addSample(new Pos(50, 50), "../resource/audio/ah.wav");
    let canv = inner.newCanvas(new Pos(10, 200), new Pos(300, 300));
    canv.setSpeed(30);
    canv.resize(new Pos(50,50));
    let fe = main.addFileExplorer(new Pos(0, 0), new Pos(200, 500));
    fe.addFile(new Pos(80, 50), "../resource/audio/ah.wav");
    fe.addFile(new Pos(80, 150), "../resource/audio/ba.wav");

    let em = main.addElementMenu(new Pos(0, 300), new Pos(200, 500));
    em.addCanvasOption(new Pos(50,50));

    p.setup = () => {
        p.createCanvas(winSizeX, winSizeY);
    }

    p.draw = () => {
        p.background(220);
        main.draw();
        
        mouse.updateCursor();
        p.cursor(cursors[mouse.getCursor()]);
    }

    p.mousePressed = () => {
        if (p.mouseButton === p.LEFT) {
            mouse.leftClick();
        }
        return false;
    }

    p.mouseReleased = () => {
        mouse.release();
        return false;
    }
}

new p5(sketch);