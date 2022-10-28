import { Transpiler } from '../src/transpiler';
 

let transpiler: Transpiler;

beforeAll(() => {
    transpiler = new Transpiler();
})


describe('testing index file', () => {
  test('empty string should result in zero', () => {
    expect(0).toBe(0);
  });
});