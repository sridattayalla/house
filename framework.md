An API, that let's you do following things

const cube = cubeWithTexture(length, width, height, texture)
const cube2 = cubeWithTexture(length, width, height, texture)
cube2.positionAt(cube, offset_lenght, offset_width, offset_height)
const hole = cube.makeHole(atX, atY, length, width, depth)


hole should be an actual hole. this can be achieves by combining diffent cubes and leaving a hole in between.
so class Cube would contains other cubes in it (recursive object)
then further holes should be handles recursively (if needed)
