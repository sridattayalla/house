import {basement, wall} from './house.ts'
import { cubeWithTexture, createThreeJSMesh } from './src/api/CubeAPI.js';
import * as THREE from 'three';

const southWall = wall(10, 8, 1)
southWall.positionAt(basement, 33-10, 2, -7)

const eatWall = wall(0.5, 8, 4)
eatWall.positionAt(southWall, 0, 0, 1)


const westWall = wall(0.5, 8, 4)
westWall.positionAt(southWall, 9.5, 0, 1)

const northWall = wall(10, 8, 0.5)
northWall.positionAt(southWall, 0, 0, 5)

const partitionWall = wall(0.5, 8, 4)
partitionWall.positionAt(eatWall, 5.5, 0, 0)
