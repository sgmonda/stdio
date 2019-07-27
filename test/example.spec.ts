import { getopt } from '../index';

test('Getopt', () => {
  const observed = getopt({})
  const expected = {};
  expect(JSON.stringify(observed)).toBe(JSON.stringify(expected));
});
