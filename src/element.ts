import p5 from "p5";

export class Element {
    x: number;
    y: number;
    sizeX: number;
    sizeY: number;
    draggable: boolean;
    p: p5;

    constructor(x : number, y : number, sizeX : number, sizeY : number, p : p5, draggable = false) {
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.draggable = draggable;
        this.p = p;
    }

    draw() : void {
        this.p.rect(this.x, this.y, this.sizeX, this.sizeY);
        this.p.text("Drawing a raw Element object", this.x, this.y);
    }
}