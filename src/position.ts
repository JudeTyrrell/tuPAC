export default class Pos {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(a: Pos): Pos {
        this.x += a.x;
        this.y += a.y;
        return this;
    }

    sub(a: Pos): Pos {
        this.x -= a.x;
        this.y -= a.y;
        return this;
    }

    copy(): Pos {
        return new Pos(this.x, this.y);
    }

    toString(): string {
        return "(" + this.x + ", " + this.y + ")";
    }

    static sum(a: Pos, b: Pos): Pos {
        return new Pos(a.x + b.x, a.y + b.y);
    }

    static maxXY(a: Pos, b: Pos): Pos {
        let x = Math.max(a.x, b.x);
        let y = Math.max(a.y,b.y);
        return new Pos(x,y);
    }

    static minXY(a: Pos, b: Pos): Pos {
        let x = Math.min(a.x, b.x);
        let y = Math.min(a.y,b.y);
        return new Pos(x,y);
    }

    static diff(a: Pos, b: Pos): Pos {
        return new Pos(a.x - b.x, a.y - b.y);
    }

    static scale(p: Pos, m: number): Pos {
        return new Pos(p.x * m, p.y * m);
    }

    static inBox(origin: Pos, size: Pos, pos: Pos): boolean {
        let diff = Pos.diff(pos, origin);
        return (0 <= diff.x) && (diff.x <= size.x) && (0 <= diff.y) && (diff.y <= size.y);
    }

    static zero(): Pos {
        return new Pos(0, 0);
    }

    static within(a: number, b: number, desired: number): number {
        if (a > b) {
            throw new RangeError("Require b >= a for Pos.within");
        }
        if (desired < a) {
            return a;
        } else if (desired > b) {
            return b;
        }
        return desired;
    }
}

export class Box {
    origin: Pos;
    size: Pos;

    constructor(o: Pos, s: Pos) {
        this.origin = o;
        this.size = s;
    }

    in(pos: Pos) {
        return Pos.inBox(this.origin, this.size, pos);
    }

    copy(): Box {
        return new Box(this.origin, this.size);
    }

    toString(): string {
        return "[Box Origin:" + this.origin + ", Size:" + this.size + "]";
    }

    static within(desired: Box, space: Box): Box {
        let newBox = desired.copy();
        try {
            newBox.origin.x = Pos.within(space.origin.x, space.origin.x + space.size.x - newBox.size.x, newBox.origin.x);
            newBox.origin.y = Pos.within(space.origin.y, space.origin.y + space.size.y - newBox.size.y, newBox.origin.y);
            return newBox;
        } catch {
            throw new Error("Box too big to fit in space:" + desired + " in " + space);
        }
    }
}