import Pos, { Box } from "../dist/position";

test('add function adds (1,1) and (2,2) to be (3,3)', () => {
	let one = new Pos(1, 1);
	let two = new Pos(2, 2);
	one.add(two);
	expect(one).toEqual(new Pos(3,3));
});

test('add function returns itself', () => {
	let one = new Pos(1, 1);
	let two = new Pos(2, 2);
	let three = one.add(two);
	expect(one).toBe(three);
});

test('inBox only returns true when the given co-ordinate is in the range.', () => {
	let origin = Pos.zero();
	let size = new Pos(30, 30);
	let one = new Pos(30, 30);
	let two = new Pos(0, 0);
	let three = new Pos(0, 30);
	let four = new Pos(30, 0);
	let five = new Pos(-1, 10);
	let six = new Pos(30000, 5);
	let seven = new Pos(0, 100);
	let eight = new Pos(-10, -10);
	expect(Pos.inBox(origin, size, one)).toBeTruthy();
	expect(Pos.inBox(origin, size, two)).toBeTruthy();
	expect(Pos.inBox(origin, size, three)).toBeTruthy();
	expect(Pos.inBox(origin, size, four)).toBeTruthy();
	expect(Pos.inBox(origin, size, five)).not.toBeTruthy();
	expect(Pos.inBox(origin, size, six)).not.toBeTruthy();
	expect(Pos.inBox(origin, size, seven)).not.toBeTruthy();
	expect(Pos.inBox(origin, size, eight)).not.toBeTruthy();
});

test('Pos.within limits number input to range', () => {
	let lower = Pos.within(0, 10, -1);
	let upper = Pos.within(0, 10, 11);
	let within = Pos.within(0, 10, 3);

	expect(lower).toEqual(0);
	expect(upper).toEqual(10);
	expect(within).toEqual(3);
	expect(() => { Pos.within(10, 0, 1) }).toThrow(RangeError);
});

test('Box.within limits box input to range', () => {
	let b = new Box(new Pos(5, 5), new Pos(2, 2));
	let space = new Box(new Pos(0, 0), new Pos(10, 10));
	let within = Box.within(b, space);

	expect(within).toEqual(b);
})