
export class Pos {
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

    static sum(a: Pos, b: Pos): Pos {
        return new Pos(a.x + b.x, a.y + b.y);
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
}