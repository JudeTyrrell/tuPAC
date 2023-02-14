import p5 from "p5";
import Window from './window';
import Pos from "./position";
import { Element } from "./element";
import { resizeLenience } from "./tupac";

export enum CursorState {
    default = "default",
    drag = "default",
    resizeX = "ew-resize",
    resizeY = "ns-resize",
    resizeXY = "nwse-resize"
}

export enum MouseState {
    free,
    dragging,
    resizingX,
    resizingY,
    resizingXY
}

export default class Mouse {
    state: MouseState;
    cursor: CursorState;
    cursorOffX: number;
    cursorOffY: number;
    held: Element;
    p: p5;
    window: Window;

    constructor(window: Window, p: p5) {
        this.state = MouseState.free;
        this.cursor = CursorState.default;
        this.window = window;
        this.p = p;
    }

    getCursor(): CursorState {
        return this.cursor;
    }

    updateCursor() {
        if (this.state === MouseState.free) {
            let under = this.window.topUnderMouse(Pos.zero());
            let abs = under.getAbsolutePos();
            if (under.draggable) {
                this.cursor = CursorState.drag;
            }
            // Resizing overrules dragging
            if (this.p.winMouseX + under.size.x - abs.x >= resizeLenience) {
                if (this.cursor === CursorState.resizeY) {
                    this.cursor = CursorState.resizeXY;
                } else {
                    this.cursor = CursorState.resizeX;
                }
            }
            if (this.p.winMouseY + under.size.x - abs.x >= resizeLenience) {
                if (this.cursor === CursorState.resizeX) {
                    this.cursor = CursorState.resizeXY;
                } else {
                    this.cursor = CursorState.resizeY;
                }
            }
        } else {
            let mouse = new Pos(this.p.winMouseX, this.p.winMouseY);

            switch (this.state) {
                case MouseState.dragging:
                    this.held.moveTo(mouse);
                    if (typeof this.held['element'] != 'undefined') {
                        this.held.draw(Pos.zero());
                    }
                    break;
                case MouseState.resizingX:
                    this.held.resize(new Pos(this.p.movedX, 0));
                    break;

                case MouseState.resizingY:
                    this.held.resize(new Pos(0, this.p.movedY));
                    break;

                case MouseState.resizingXY:
                    this.held.resize(new Pos(this.p.movedX, this.p.movedY));
                    break;
            }
        }
    }

    leftClick() {
        let clicked = this.window.topUnderMouse(Pos.zero());
        clicked.clicked();
        this.cursorOffX = this.p.winMouseX - clicked.pos.x;
        this.cursorOffY = this.p.winMouseY - clicked.pos.y;
        this.held = clicked;
        switch (this.cursor) {
            case CursorState.resizeX:
                this.state = MouseState.resizingX;
                break;
            case CursorState.resizeY:
                this.state = MouseState.resizingY;
                break;
            case CursorState.resizeXY:
                this.state = MouseState.resizingXY;
                break;
            case CursorState.drag:
                this.state = MouseState.dragging;
                break;
            default:
                this.state = MouseState.free;
                break;
        }
    }

    release() {
        this.held = null;
        this.state = MouseState.free;
        let top = this.window.topUnderMouse();
        if (this.held != null && typeof top['inner'] != 'undefined' && typeof this.held['element'] != 'undefined') {
            this.held.drop(top);
        }
    }
}