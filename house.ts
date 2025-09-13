import { createBox, createWall, createFloor, createWindow, createDoor, createRoom, BoxElement } from './src/api/GroupAPI.js';
import { createSpiralStaircase } from './spiral-stairs.js';
import { createPergola, createInclinedShade, westRoom, createFirstFloorRailings, fgfrontPlantPot } from './outdoor-features.js';
import { wall, wood, vertical_bar, horizontal_bar, x_railing, z_railing, inclined_z_railing, eastDoor, eastDoorFrame, eastWindow, eastWindowFrame, northWindow, windowFrame, doorFrame } from './components.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

// ==================== CONFIGURATION ====================
const config = {
  internalWallHeight: 11,
  compoundWallHeight: 6,
  buildingLength: 44,
  wallThickness: 1
};

// ==================== UTILITY FUNCTIONS ====================

function windowFrame(width: number, height: number, depth: number): BoxElement {
	const frameThickness = 0.15
	const frameWidth = 0.25 // Width of frame border
	
	const outerFrame = createBox(width, height, depth, 'white painted wall')
	outerFrame.makeHole(frameThickness, frameThickness, 0, width-(2*frameThickness), height-(2*frameThickness), depth)
	
	return outerFrame
}

function doorFrame(width: number, height: number, depth: number): BoxElement {
	const frameThickness = 0.55
	const frameWidth = 0.45 // Width of frame border
	
	const frame = createBox(width, height, depth, 'wood')
	frame.makeHole(frameThickness, 0.2, 0, width-(2*frameWidth), height-(frameWidth+0.2), depth)
	
	return frame
}



function northDoor(width: number, height: number): BoxElement {
	const door_thickness = .25
	const door = createBox(width, height, 0.25, 'wood')
	
	// Add wood door panel (closed door)
	const doorPanel = createBox(width-(2*door_thickness), height-(2*door_thickness), 0.05, 'wood')
	door.addChild(doorPanel, door_thickness, door_thickness, 0.1)
	
	return door
}


function wall_strip(length: number, direction: 'x' | 'z'): BoxElement {
  if (direction === 'x') {
    return createBox(length, 0.3, 0.5, 'white painted wall');
  } else {
    return createBox(0.5, 0.3, length, 'white painted wall');
  }
}


function x_railing(count: number, start_immediately: boolean, ref: any) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from edge if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    ref.addChild(bar, offset, 0, 0);
    
    bars.push(bar);
  }
  
  // Add horizontal top bar spanning from first to last bar
  const topBarWidth = count - 1;
  const topBar = horizontal_bar(topBarWidth);
  
  const xPos = start_immediately ? 0.05 : 1.05;
  ref.addChild(topBar, xPos, 3, 0.05);
  
  return { bars, topBar };
}

function z_railing(count: number, start_immediately: boolean, ref: any) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from edge if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    ref.addChild(bar, 0, 0, offset);
    
    bars.push(bar);
  }
  
  // Add horizontal top bar spanning from first to last bar
  const topBarWidth = count - 1;
  const topBar = createBox(0.2, 0.2, topBarWidth, 'wood')
  
  const zPos = start_immediately ? 0.05 : 1.05;
  ref.addChild(topBar, 0.05, 3, zPos);
  
  return { bars, topBar };
}

function inclined_x_railing(count: number, start_immediately: boolean, ref: any, slope: number) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from edge if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    ref.addChild(bar, offset, 0, 0);
    
    bars.push(bar);
  }
  
  // Add inclined horizontal top bar spanning from first to last bar
  // Compensate length for the angle - actual length = horizontal length / cos(angle)
  const horizontalLength = count - 1;
  const compensatedLength = horizontalLength / Math.cos(slope * Math.PI / 180);
  const topBar = horizontal_bar(compensatedLength);
  
  const xPos = start_immediately ? 0.05 : 1.05;
  ref.addChild(topBar, xPos, 3, 0.05);
  topBar.rotateZ(slope); // Incline along x-axis
  
  return { bars, topBar };
}

function inclined_z_railing(count: number, start_immediately: boolean, ref: any, slope: number) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from edge if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    
    // Calculate Y offset based on slope and distance from start
    const distance = start_immediately ? i : i;
    const yOffset = Math.tan(slope * Math.PI / 180) * distance;
    
    ref.addChild(bar, 0, -yOffset, offset);
    
    bars.push(bar);
  }
  
  // Add inclined horizontal top bar spanning from first to last bar
  // Compensate length for the angle - actual length = horizontal length / cos(angle)
  const horizontalLength = count - 1;
  const compensatedLength = horizontalLength / Math.cos(slope * Math.PI / 180);
  const topBar = createBox(0.2, 0.2, compensatedLength, 'wood');
  
  const zPos = start_immediately ? 0.05 : 1.05;
  ref.addChild(topBar, 0, 3, zPos);
  topBar.rotateX(slope * Math.PI / 180); // Incline along z-axis (convert degrees to radians)
  
  return { bars, topBar };
}

function vertical_bars(count: number, start_immediately: boolean, left_ref: any) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from left if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    left_ref.addChild(bar, offset, 0, 0);
    
    bars.push(bar);
  }
  
  return bars;
}

// ==================== FOUNDATION & BASEMENT ====================
const basement = wall(33, 2, 44);

// ==================== GROUND FLOOR WALLS ====================
// Main structural walls
const leftWall = createBox(1, config.internalWallHeight, 32, 'white painted wall');

leftWall.makeHole(0, 0, 25, 1, 6.7, 3);           // Door opening
const leftDoorFrame = eastDoorFrame(3.3, 6.7, 0.5);
leftDoorFrame.addChild(wall(1.5, 1, 5), -1, -1, -0.85) // upper step
leftDoorFrame.addChild(wall(3, 1, 5), -2.5, -2, -0.85) // lower step
leftWall.addChild(leftDoorFrame, -0.5, 0, 25);
const leftDoor = eastDoor(3.3, 6.7);
leftWall.addChild(leftDoor, 0, 0, 25);

leftWall.makeHole(0, 1.7, 20, 1, 5, 4);           // Window
const leftWindow1 = eastWindow(2, 5);
leftWall.addChild(leftWindow1, 0, 1.7, 20);
const leftWindow2 = eastWindow(2, 5);
leftWall.addChild(leftWindow2, 0, 1.7, 22);
const leftWindowFrame = eastWindowFrame(4, 5.5, 2);
leftWall.addChild(leftWindowFrame, -1, 1.5, 20);

leftWall.makeHole(0, 1.7 + 2.5, 10, 1, 2.5, 5);   // Small window
const leftSmallWindow1 = eastWindow(2.5, 2.5);
leftWall.addChild(leftSmallWindow1, 0, 1.7+2.5, 10);
const leftSmallWindow2 = eastWindow(2.5, 2.5);
leftWall.addChild(leftSmallWindow2, 0, 1.7+2.5, 12.5);
const leftSmallWindowFrame = eastWindowFrame(5, 3.0, 2);
leftWall.addChild(leftSmallWindowFrame, -1, 1.7+2.25, 10);

const rightWall = createBox(1, config.internalWallHeight, 44, 'white painted wall');
rightWall.makeHole(0, 1.7, 10, 1, 5, 4);           // Window
const rightWindow = eastWindow(4, 5);
rightWall.addChild(rightWindow, 0, 10, 1.7);
const rightWindowFrame = eastWindowFrame(4, 5, 1);
rightWall.addChild(rightWindowFrame, 1, 10, 1.7);

const backWall = createBox(33, 11, 1, 'white painted wall');
backWall.makeHole(6.25, 0, 0, 3.5, 6.7, 1);       // Back door opening
const backDoor = northDoor(3.5, 6.7);
backWall.addChild(backDoor, 6.25, 0, 0);
const backDoorFrame = doorFrame(3.5, 6.7, 0.3);
backWall.addChild(backDoorFrame, 6.25, -0.3, 0);
const backStep = wall(5, 3, 1)
backWall.addChild(backStep, 5.5, -3, -2)
const backUpperStep = wall(5, 1.5, 1)
backWall.addChild(backUpperStep, 5.5, -1.5, -1)

// ==================== ROOM FUNCTIONS ====================
function drawingRoom() {
  const frontWall = wall(20, 11, 1);
  rightWall.addChild(frontWall, -20, 0, config.buildingLength - config.wallThickness);
  frontWall.makeHole(3, 0.7, 0, 2, 6, 1);          // Window 1
  frontWall.addChild(northWindow(2, 6), 3, 0.7, 0.5)
  frontWall.addChild(windowFrame(2, 6, 1), 3, .7, 0.8)
  frontWall.makeHole(15, .7, 0, 2, 6, 1);         // Window 2
  frontWall.addChild(northWindow(2, 6), 15, 0.7, 0.5)
  frontWall.addChild(windowFrame(2, 6, 1), 15, 0.7, 0.8)

  const eastWall = createBox(1, 11, 11, 'white painted wall');
  frontWall.addChild(eastWall, 0, 0, -11);

  // furniture
	const gltfLoader = new GLTFLoader();
	gltfLoader.load('./models/tv_table.glb', (gltfScene)=>{
		frontWall.add(gltfScene.scene)
		gltfScene.scene.position.set(10, 0.5, -1);
		gltfScene.scene.scale.set(2.5, 2.5, 2.5)
		gltfScene.scene.rotateY(Math.PI)
	})
	gltfLoader.load('./models/2018_flat_screen_tv.glb', (gltfScene)=>{
		frontWall.add(gltfScene.scene)
		gltfScene.scene.position.set(10, 2.9, -1);
		gltfScene.scene.scale.set(2.5, 2.5, 2.5)
		gltfScene.scene.rotateY(Math.PI)
	})
	gltfLoader.load('./models/corner_sofa.glb', (gltfScene)=>{
		frontWall.add(gltfScene.scene)
		gltfScene.scene.position.set(10, 0, -8.5);
		gltfScene.scene.scale.set(1.3, 1.3, 1.3)
		gltfScene.scene.rotateY(-Math.PI/2)
	})
	gltfLoader.load('./models/coffee_table.glb', (gltfScene)=>{
		frontWall.add(gltfScene.scene)
		gltfScene.scene.position.set(10, 0, -5);
		gltfScene.scene.scale.set(0.4, 0.4, 0.4)
		gltfScene.scene.rotateY(Math.PI)
	})
  
	const entranceWall = wall(20, 11, 0.5)
	frontWall.addChild(entranceWall, 0, 0, -11)
	entranceWall.makeHole(1.5, 0, 0, 3.3, 6.7, 0.5)
// 	entranceWall.makeSemiCircularHole(1.5, 5, 0, 1.7, 0.5, 'xy')

  //font plantation
  fgfrontPlantPot(frontWall)
}

function sitout() {
  const frontWall = wall(13, config.internalWallHeight, 1);

  leftWall.addChild(frontWall, 0, 0, 32);
  frontWall.makeHole(6, 0, 0, 4, 6.7, 1);          // Door opening
  frontWall.addChild(northDoor(4, 6.7), 6, 0, 0.5)
  frontWall.addChild(doorFrame(4, 6.7, 0.3), 6, 0, 1)

  frontWall.makeHole(2, .7, 0, 3, 6, 1);          // Window
  frontWall.addChild(northWindow(3, 6), 2, .7, 0)
  const eastDrop = wall(1, 2, 13);
  frontWall.addChild(eastDrop, 0, config.internalWallHeight-2, -1)
  const northDrop = wall(13, 2, 1);
  frontWall.addChild(northDrop, 0, config.internalWallHeight-2, 11)
  const eastExtension = wall(3, 0.4, 21.5);
  eastDrop.addChild(eastExtension, -3, .5, -7)
  const northExtension = wall(14.5, 0.4, 3);
  northDrop.addChild(northExtension, -3, 0.5, 1)
  const step = wall(7.5, 1, 1.5)
  basement.addChild(step, 5.15, 0, 44)
  const pillar = wall(1.5, config.internalWallHeight, 1.5)
  basement.addChild(pillar, 0, 2, 42.5)
  const first_bar = vertical_bar()
  pillar.addChild(first_bar, 1.5, 0, 0.75)
  x_railing(5, true, first_bar)
  const inclined_railing_invisible = wall(0, 0, 0)
  pillar.addChild(inclined_railing_invisible, 5.5, 0, 0.75)
  inclined_z_railing(4, true, inclined_railing_invisible, 30)
  const inclined_railing_invisible_right = wall(0,0,0)
  pillar.addChild(inclined_railing_invisible_right, 12.1, 0, 0.75)
  inclined_z_railing(4, true, inclined_railing_invisible_right, 30)
  // east sitting parapet wall
  const eastWall = wall(0.5, 3, 9.5)
  frontWall.addChild(eastWall, 0, 0, 1)
//   eastWall.makeHole(0, 0, 0.5, 0.5, 2.5, 5.5)
  const seatingSlab = createBox(2, 0.3, 9.5, 'stone');
  eastWall.addChild(seatingSlab, -1+0.15, 3, 0)
  
  // East side step for sitout
  const eastStep = wall(1.5, 1, 4);
  eastWall.addChild(eastStep, -1.2, -2, 6)
}

function groundFloorSlab() {
  const slab = wall(33, 0.6, 44);
  basement.addChild(slab, 0, config.internalWallHeight + 2, 0);
  return slab;
}

// ==================== FIRST FLOOR ====================
function firstFloor(gfSlab: any) {
  // First floor walls
  const backWall = wall(33, config.internalWallHeight, 1);
  backWall.makeHole(21, 1.7, 0, 4, 5, 1) // window
  backWall.addChild(northWindow(4, 5), 21, 1.7, 0)
  backWall.addChild(windowFrame(4, 5, 1), 21, 1.7, -0.8)
  // bathroom ventilation
  backWall.makeHole(17, 5.2, 0, 2, 1.5, 1)
  backWall.addChild(northWindow(2, 1.5), 17, 5.2, 0)
  backWall.addChild(windowFrame(2, 1.5, 1), 17, 5.2, -0.8)
  gfSlab.addChild(backWall, 0, 0, 0);

  // second room bathroom ventilation
  backWall.makeHole(13, 5.2, 0, 2, 1.5, 1)
  backWall.addChild(northWindow(2, 1.5), 13, 5.2, 0)
  backWall.addChild(windowFrame(2, 1.5, 1), 13, 5.2, -0.8)

  const leftWall = wall(1, config.internalWallHeight, 31);
  backWall.addChild(leftWall, 0, 0, 0);
  leftWall.makeHole(0, 1.7, 10, 1, 5, 4);          // Window 1
  leftWall.addChild(eastWindow(4, 5), 0, 1.7, 10)
  leftWall.addChild(eastWindowFrame(4, 5, 1), -1, 1.7, 10)
  leftWall.makeHole(0, 1.7, 20, 1, 5, 4);          // Window 2
  leftWall.addChild(eastWindow(4, 5), 0, 1.7, 20)
  leftWall.addChild(eastWindowFrame(4, 5, 1), -1, 1.7, 20)

  const rightWall = wall(1, config.internalWallHeight, 31);
  backWall.addChild(rightWall, 33 - 1, 0, 0);
  // rigtwall window
  rightWall.makeHole(0, 1.7, 10, 1, 5, 4)
  rightWall.addChild(eastWindow(4, 5), 0, 1.7, 10)
  rightWall.addChild(eastWindowFrame(4, 5, 1), 1, 1.7, 10)

  const frontWall = wall(33, config.internalWallHeight, 1);
  backWall.addChild(frontWall, 0, 0, 33 - 2);
  frontWall.makeHole(6, 0, 0, 4, 6.7, 1);       // Door opening
  frontWall.addChild(northDoor(4, 6.7), 6, 0, 0.5)
  frontWall.addChild(doorFrame(4, 6.7, 0.3), 6, 0, 1)
  frontWall.makeHole(14.5, 1.7, 0, 4, 5, 1);          // Window
  frontWall.addChild(northWindow(2, 5), 14.5, 1.7, 0)
  frontWall.addChild(northWindow(2, 5), 16.5, 1.7, 0)


  // First floor slab (roof)
  const slab = wall(33, 1, 32);
  backWall.addChild(slab, 0, config.internalWallHeight, 0);
  
  // East extension
  const eastExtension = wall(3, 0.4, 8);
  leftWall.addChild(eastExtension, -3, 8, 26);
  
  // North extension
  const northExtension = wall(24, 0.4, 3);
  frontWall.addChild(northExtension, -3, 8, 1);
  
  // Create first floor railings
  createFirstFloorRailings(gfSlab, frontWall);
 
  // Spiral stairs at west side, north of front wall
  const spiralStairs = createSpiralStaircase({
    totalHeight: config.internalWallHeight,
    stepHeight: 0.8,
    innerRadius: 0.5,
    outerRadius: 2.5,
    stepThickness: 0.2,
    turns: 1.2,
    poleRadius: 0.25
  });
  
  // Position the spiral stairs
  frontWall.addChild(spiralStairs, 29, 14, 34.5)

  // Outdoor features
//   createPergola(frontWall);  // Commented out pergola
//   createInclinedShade(frontWall);
// 	westRoom(frontWall);

  
//   wood(0.5, 0.5, 12).positionAt(frontWall, -.5, 10.5, -11)
//   wood(33.5, 0.5, .5).positionAt(frontWall, -.5, 10.5, 1)
  return { slab, spiralStairs };
}

// ==================== SECOND FLOOR ====================
function secondFloor(ffSlab: any) {
  // Second floor parapet walls (4ft height)
  const parapetHeight = 3.5;
  
  // Back parapet wall
  const backParapet = wall(33, parapetHeight, 1);
  ffSlab.addChild(backParapet, 0, 0, 0);
  
  // Left parapet wall
  const leftParapet = wall(1, parapetHeight, 32);
  backParapet.addChild(leftParapet, 0, 0, 0);
  
  // Right parapet wall
  const rightParapet = wall(1, parapetHeight, 32);
  backParapet.addChild(rightParapet, 33 - 1, 0, 0);
  
  // Front parapet wall
  const frontParapet = wall(33, parapetHeight, 1);
  backParapet.addChild(frontParapet, 0, 0, 32 - 1);
  
  // Add decorative blocks on top of parapet walls at 5ft intervals
  const blockSize = { width: 0.5, height: 0.75, depth: 0.5 };
  
  // Back wall blocks (33ft length, blocks at 5ft intervals)
  for (let i = 5; i < 33; i += 5) {
    const block = createBox(blockSize.width, blockSize.height, blockSize.depth, 'white painted wall');
    backParapet.addChild(block, i - blockSize.width/2, parapetHeight, 0.5 - blockSize.depth/2);
  }
  
  // Left wall blocks (32ft length, blocks at 5ft intervals)
  for (let i = 5; i < 32; i += 5) {
    const block = createBox(blockSize.depth, blockSize.height, blockSize.width, 'white painted wall');
    leftParapet.addChild(block, 0.5 - blockSize.depth/2, parapetHeight, i - blockSize.width/2);
  }
  
  // Right wall blocks (32ft length, blocks at 5ft intervals)
  for (let i = 5; i < 32; i += 5) {
    const block = createBox(blockSize.depth, blockSize.height, blockSize.width, 'white painted wall');
    rightParapet.addChild(block, 0.5 - blockSize.depth/2, parapetHeight, i - blockSize.width/2);
  }
  
  // Front wall blocks (33ft length, blocks at 5ft intervals)
  for (let i = 5; i < 33; i += 5) {
    const block = createBox(blockSize.width, blockSize.height, blockSize.depth, 'white painted wall');
    frontParapet.addChild(block, i - blockSize.width/2, parapetHeight, 0.5 - blockSize.depth/2);
  }
  
  // Add wall strips connecting the blocks on top
  const stripHeight = parapetHeight + blockSize.height;
  
  // Back wall strip
  const backStrip = wall_strip(33, 'x');
  backParapet.addChild(backStrip, 0, stripHeight, 0.25);
  
  // Left wall strip
  const leftStrip = wall_strip(32, 'z');
  leftParapet.addChild(leftStrip, 0.25, stripHeight, 0);
  
  // Right wall strip
  const rightStrip = wall_strip(32, 'z');
  rightParapet.addChild(rightStrip, 0.25, stripHeight, 0);
  
  // Front wall strip
  const frontStrip = wall_strip(33, 'x');
  frontParapet.addChild(frontStrip, 0, stripHeight, 0.25);
  
  return { backParapet, leftParapet, rightParapet, frontParapet };
}

// ==================== EXTERIOR ELEMENTS ====================
// Pavements and driveways
const driveway = createBox(19.5, 0.1, 24, 'grass lines pavement');
const eastPavement = createBox(6.5, 0.1, 50, 'grass lines pavement');
const northPavement = createBox(20, 0.1, 3, 'grass lines pavement');
const southPavement = createBox(36, 0.1, 6, 'concrete');
eastPavement.addChild(southPavement, 6.5, 0, 0)
const westPavement = createBox(4, 0.1, 53, 'concrete');
eastPavement.addChild(westPavement, 39.5, 0, 0)

// Compound walls
const southCompoundWall = createBox(44.5, config.compoundWallHeight, 1, 'white painted wall');
eastPavement.addChild(southCompoundWall, -1.0, 0, -1);
const eastCompoundWall = wall(1, config.compoundWallHeight, 75);
eastCompoundWall.rotateY(-Math.PI / 30);
southCompoundWall.addChild(eastCompoundWall, 0, 0, 0)
const eastGreenary = createBox(20, 0.05, 75, 'grass')
southCompoundWall.addChild(eastGreenary, 0, 0, 0)
eastGreenary.rotateY(-Math.PI/30)
const westGreenary = createBox(24, 0.05, 24, 'grass')
northPavement.addChild(westGreenary, 0, 0, 3)
const northCompundWall = wall(55, config.compoundWallHeight, 1)
eastCompoundWall.addChild(northCompundWall, -7.85, 0, 74)
northCompundWall.makeHole(12, 0, 0, 3, config.compoundWallHeight, 1)
northCompundWall.makeHole(18, 0, 0, 8, config.compoundWallHeight, 1)
const westCompoundWall = wall(1, config.compoundWallHeight, 75)
southCompoundWall.addChild(westCompoundWall, 44.5, 0, 0)
const road = createBox(60, 0.1, 12, 'stone')
northCompundWall.addChild(road, 0, 0, 1)

// ==================== POSITIONING ====================
// Position main walls
basement.addChild(leftWall, 0, 2, 0);
basement.addChild(rightWall, 33 - 1, 2, 0);
basement.addChild(backWall, 0, 2, 0);
backWall.makeHole(21, 1.7, 0, 4, 5, 1)
backWall.addChild(northWindow(4, 5), 21, 1.7, 0)
backWall.addChild(windowFrame(4, 5, 1), 21, 1.7, -0.8)
// bath room ventilation
backWall.makeHole(17, 5.2, 0, 2, 1.5, 1)
backWall.addChild(northWindow(2, 1.5), 17, 5.2, 0)
backWall.addChild(windowFrame(2, 1.5, 1), 17, 5.2, -0.8)

// Position pavements
basement.addChild(driveway, -6.5, 0, 44);
basement.addChild(eastPavement, -6.5, 0, -6);
driveway.addChild(northPavement, 1, 0, 0);

// ==================== INITIALIZATION ====================
// Build the house structure
drawingRoom();
sitout();
const slab = groundFloorSlab();
const { slab: ffSlab, spiralStairs } = firstFloor(slab);
secondFloor(ffSlab);

// ==================== EXPORT FUNCTIONS ====================
export function drawHouseStructure(scene: THREE.Scene): THREE.Group {
  const houseGroup = new THREE.Group();
  
  // Add basement directly (it's already a BoxElement/Group)
  houseGroup.add(basement);
  
  // Add spiral stairs to the scene directly (since it's a Three.js Group)
  if (spiralStairs) {
    scene.add(spiralStairs);
  }
  
  // Add the house group to the scene
  scene.add(houseGroup);
  
  return houseGroup;
}

export { basement, leftWall, rightWall, backWall, driveway, wall};
