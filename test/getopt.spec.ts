import { getopt } from '../index';

test('Getopt', () => {
  const observed = getopt({ a: 1, b: 2 });
  const expected = { b: 2, a: 1 };
  expect(observed).toEqual(expected);
});
