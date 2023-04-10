import p5 from "p5";
import Pos from "./position";
import Icon from "./icon";
import Window from "./window";
import Mouse from "./mouse";
import { Capsule } from "./Capsule";
import { Playable } from "./Playable";

export const winSizeX = 1200;
export const winSizeY = 900;
export const resizeLenience = 3;

export let window = new Window(winSizeX, winSizeY, null);

const cursors = ["default", "default", "ew-resize", "ns-resize", "nwse-resize", "text"];

const sketch = (p: p5) => {
    
    Icon.loadResources(p);
    window.p = p;
    
    new Mouse(window, p);
    const mouse = new Mouse(window, p);

    p.setup = () => {
        p.createCanvas(winSizeX, winSizeY);

        let inner = window.addCanvas(new Pos(200, 0), new Pos(1000, 1000));
        inner.setSpeed(200);

        let fe = window.addFileExplorer(new Pos(0, 0), new Pos(200, 500));
        fe.addFile("..\\resource\\audio\\ah.wav");
        fe.addFile("..\\resource\\audio\\ba.wav");

        let em = window.addElementMenu(new Pos(0, 500), new Pos(200, 500));
        em.addCanvasOption();
        em.addDistortOption();
        em.addReverbOption();
    }

    p.draw = () => {
        p.background(220);
        window.draw();
        
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

    p.keyTyped = () => {
        window.type(p.key);
        return false;
    }

    p.keyPressed = () => {
        if (p.keyCode === p.ENTER) {
            window.stopTyping();
        }
        if (p.keyCode === p.BACKSPACE) {
            window.typeBackspace();
        }
        if (p.keyCode === p.DELETE) {
            let h = mouse.held;
            if (h != null && h.parent['playables'] != null) {
                if (h['scheduleId'] != null) {
                    (h as Playable).unschedule();
                }
                (mouse.held.parent as Capsule).remove(h);
            }
        }
    }
}

new p5(sketch);