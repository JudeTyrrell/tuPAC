
export class Pair {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static sum(a: Pair, b: Pair): Pair {
        return new Pair(a.x + b.x, a.y + b.y);
    }

    static scale(p: Pair, m: number) {
        return new Pair(p.x * m, p.y * m);
    }
}