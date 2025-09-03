import { cubeWithTexture, createThreeJSMesh } from './src/api/CubeAPI.js';
import * as THREE from 'three';

const config = {internalWallHeight : 11, compoundWallHeight: 6, buildingLength: 44, wallThickness: 1}

// Create basement cube with dimensions: height 2ft, width 33ft, length 44ft
const basement = cubeWithTexture(33, 2, 44, 'stone');

// Create walls on three sides (leaving front 33ft side open)
const leftWall = cubeWithTexture(1, config.internalWallHeight, 32, 'white painted wall');
const rightWall = cubeWithTexture(1, config.internalWallHeight, 44, 'white painted wall');
const backWall = cubeWithTexture(33, 11, 1, 'white painted wall');
drawing_room();
sitout();

function wall(x, y, z){
	return cubeWithTexture(x,y,z, 'white painted wall');
}

// drawing room
function drawing_room(){
	const drawing_room_front = wall(20, 11, 1)
	drawing_room_front.positionAt(rightWall, -20, 0, config.buildingLength-config.wallThickness);
	drawing_room_front.makeHole(3, config.internalWallHeight-5-2, 2, 5, 1)
// 	drawing_room_front.makeHole(6, config.internalWallHeight-5-2, 2, 5, 1)

	const drawing_room_east = cubeWithTexture(1, 11, 12.5, 'white painted wall');
	drawing_room_east.positionAt(drawing_room_front, 0, 0, -12.5);
}

//sitout
function sitout(){
	const sitout_full_wall = wall(13, config.internalWallHeight, 1);
	sitout_full_wall.positionAtRelative(leftWall, 0, 0, 1);
}

// Create driveway in front of basement (width 13ft, length 24ft)
const driveway = cubeWithTexture(19.5, 0.1, 24, 'grass lines pavement');
const eastPavement = cubeWithTexture(6.5, 0.1, 50, 'grass lines pavement');
const northPavement = cubeWithTexture(20, 0.1, 3, 'grass lines pavement');
const southCompoundWall = cubeWithTexture(41.5, config.compoundWallHeight, 1, 'white painted wall');

// Position walls relative to basement
leftWall.positionAt(basement, 0, 2, 0);  // Left side
rightWall.positionAt(basement, 33-1, 2, 0); // Right side
backWall.positionAt(basement, 0, 2, 0);  // Back side
southCompoundWall.positionAt(eastPavement, -1.0, 0, -1);

// Position driveway in front of basement (centered)
driveway.positionAt(basement, -6.5, 0, 44);  // Centered in front, at ground level
eastPavement.positionAt(basement, -6.5, 0, -6); 
northPavement.positionAtRelative(driveway, 1, 0, 0); 

// Utility function to draw the entire house structure
export function drawHouseStructure(scene: THREE.Scene): THREE.Group {
  const houseGroup = new THREE.Group();
  
  // Convert all components to Three.js meshes
  const basementMesh = createThreeJSMesh(basement);
  
  // Add all meshes to the house group
  houseGroup.add(basementMesh);
  
  // Add the house group to the scene
  scene.add(houseGroup);
  
  return houseGroup;
}

export { basement, leftWall, rightWall, backWall, driveway };
