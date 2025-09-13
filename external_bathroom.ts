import {basement, wall} from './house.ts'
import { createBox, BoxElement } from './src/api/GroupAPI.js';
import * as THREE from 'three';

const southWall = wall(10, 8, 1)
basement.addChild(southWall, 33-10, 2, -7)

const eastWall = wall(0.5, 8, 4)
southWall.addChild(eastWall, 0, 0, 0)


const westWall = wall(0.5, 8, 4)
southWall.addChild(westWall, 9.5, 0, 0)

const northWall = wall(10, 8, 0.5)
southWall.addChild(northWall, 0, 0, 4)

const partitionWall = wall(0.5, 8, 4)
eastWall.addChild(partitionWall, 5.5, 0, 0)
