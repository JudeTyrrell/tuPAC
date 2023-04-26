import p5 from "p5";
import Pos from "./position";
import Icon from "./icon";
import Window from "./window";
import Mouse from "./mouse";
import { Capsule } from "./Capsule";
import { Playable } from "./Playable";

export const winSizeX = 1400;
export const winSizeY = 1000;
export const resizeLenience = 3;

export let window = new Window(winSizeX, winSizeY, null);
export let mouse;

const cursors = ["default", "default", "ew-resize", "ns-resize", "nwse-resize", "text"];

const sketch = (p: p5) => {
    
    Icon.loadResources(p);
    window.p = p;

    mouse = new Mouse(window, p);

    let f;

    p.setup = () => {
        f = p.loadFont("../resource/font/Poppins-Regular.ttf");
        p.createCanvas(winSizeX, winSizeY);

        

        let inner = window.addCanvas(new Pos(200, 0), new Pos(1400, 1000));
        inner.setSpeed(250);

        let fe = window.addFileExplorer(new Pos(0, 0), new Pos(200, 500));

        let em = window.addElementMenu(new Pos(0, 500), new Pos(200, 500));
        em.addCanvasOption();
        em.addDistortOption();
        em.addReverbOption();
    }

    p.draw = () => {
        p.background(220);
        
        p.textFont(f);
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
            let h = mouse.lastClicked;
            if (h != null && h.parent['playables'] != null) {
                if (h['scheduleId'] != null) {
                    (h as Playable).unschedule();
                }
                (h.parent as Capsule).remove(h);
            }
        }
    }
}

new p5(sketch);