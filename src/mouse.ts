import p5 from "p5";
import Window from './window';
import Pos from "./position";
import { Element } from "./element";
import { resizeLenience } from "./tupac";

export enum CursorState {
    default,
    drag,
    resizeX,
    resizeY,
    resizeXY
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
    cursorOff: Pos;
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
            if (!(under == null)) {
                let abs = under.getAbsolutePos();
                this.cursor = CursorState.default;
                if (under.draggable) {
                    this.cursor = CursorState.drag;
                }
                // Resizing overrules dragging
                if (under.resizable) {
                    if (under.size.x + abs.x - this.p.winMouseX <= resizeLenience) {
                        this.cursor = CursorState.resizeX;
                    }
                    if (under.size.y + abs.y - this.p.winMouseY <= resizeLenience) {
                        if (this.cursor === CursorState.resizeX) {
                            this.cursor = CursorState.resizeXY;
                        } else {
                            this.cursor = CursorState.resizeY;
                        }
                    }
                }
            }
        } else {
            let change = new Pos(this.p.winMouseX - this.p.pwinMouseX, this.p.winMouseY - this.p.pwinMouseY);

            switch (this.state) {
                case MouseState.dragging:
                    this.held.move(change);
                    if (this.held['element'] != undefined) {
                        this.held.draw(Pos.zero());
                    }
                    break;
                case MouseState.resizingX:
                    this.held.resize(new Pos(change.x, 0));
                    break;

                case MouseState.resizingY:
                    this.held.resize(new Pos(0, change.y));
                    break;

                case MouseState.resizingXY:
                    this.held.resize(change);
                    break;
            }
        }
    }

    resizing(): boolean {
        return (this.cursor === CursorState.resizeX) || (this.cursor === CursorState.resizeY) || (this.cursor === CursorState.resizeXY);
    }

    leftClick() {
        let clicked = this.window.topUnderMouse(Pos.zero());
    
        let abs = clicked.getAbsolutePos();
        console.log(abs);
        this.cursorOff = Pos.diff(clicked.mPos(), abs);

        this.held = clicked.clicked(this);
        if (!(this.held == null)) {
            this.held.toTop();
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
    }

    release() {
        this.state = MouseState.free;
        let top = this.window.topUnderPos(Pos.zero(), new Pos(this.p.winMouseX-this.cursorOff.x-1, this.p.winMouseY-this.cursorOff.y-1));
        console.log(top);
        if (!(this.held == null)) {
            this.held.drop(top);
        }
        this.held = null;
    }
}