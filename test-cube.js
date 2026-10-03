import Cube from 'cubejs';
Cube.initSolver();
const cube = new Cube();
console.log(cube.asString());
cube.randomize();
console.log(cube.asString());
console.log(cube.solve());
