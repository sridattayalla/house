const { cubeWithTexture } = require('./cube3d.js');

// Create cubes with textures
const cube = cubeWithTexture(10, 10, 10, 'wood');
const cube2 = cubeWithTexture(5, 5, 5, 'metal');

// Position cube2 relative to cube
cube2.positionAt(cube, 12, 0, 0);

// Make a hole in the first cube
const hole = cube.makeHole(2, 2, 4, 4, 8);

console.log('Cube 1:');
console.log('Position:', [cube.x, cube.y, cube.z]);
console.log('Dimensions:', [cube.length, cube.width, cube.height]);
console.log('Texture:', cube.texture);
console.log('Holes:', cube.holes);
console.log('');

console.log('Cube 2:');
console.log('Position:', [cube2.x, cube2.y, cube2.z]);
console.log('Dimensions:', [cube2.length, cube2.width, cube2.height]);
console.log('Texture:', cube2.texture);
console.log('');

console.log('Hole details:');
console.log('Position:', [hole.x, hole.y, hole.z]);
console.log('Dimensions:', [hole.length, hole.width, hole.depth]);
console.log('');

console.log('Cube 1 render data:');
console.log(JSON.stringify(cube.render(), null, 2));