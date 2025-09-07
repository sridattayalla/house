import { cubeWithTexture, createThreeJSMesh } from './src/api/CubeAPI.js';
import { createSpiralStaircase } from './spiral-stairs.js';
import { createPergola, createInclinedShade, westRoom, createFirstFloorRailings, fgfrontPlantPot } from './outdoor-features.js';
import { wall, wood } from './components.js';
import * as THREE from 'three';

// ==================== CONFIGURATION ====================
const config = {
  internalWallHeight: 11,
  compoundWallHeight: 6,
  buildingLength: 44,
  wallThickness: 1
};

// ==================== UTILITY FUNCTIONS ====================

function windowFrame(width: number, height: number, depth: number) {
	const frameThickness = 0.15
	const outerProtusion = 0.25
	const frameWidth = 0.25 // Width of frame border
	
	const outerFrame = cubeWithTexture(width, height, depth, 'white painted wall')
	outerFrame.makeHole(frameThickness, frameThickness, 0, width-(2*frameThickness), height-(2*frameThickness), depth)
	
	return outerFrame
}

function doorFrame(width: number, height: number, depth: number) {
	const frameThickness = 0.55
	const frameWidth = 0.45 // Width of frame border
	
	const frame = cubeWithTexture(width, height, depth, 'wood')
	frame.makeHole(frameThickness, 0.2, 0, width-(2*frameWidth), height-(frameWidth+0.2), depth)
	
	return frame
}

function eastDoor(width: number, height: number){
	const door_thickness = .25
	const door = cubeWithTexture(0.25, height, width, 'wood')
	
	// Add wood door panel (closed door)
	const doorPanel = cubeWithTexture(0.05, height-(2*door_thickness), width-(2*door_thickness), 'wood')
	doorPanel.positionAt(door, 0.1, door_thickness, door_thickness)
	
	return door
}

function eastDoorFrame(width: number, height: number, depth: number) {
	const frameThickness = 0.55
	const frameWidth = 0.45 // Width of frame border
	
	const frame = cubeWithTexture(depth, height, width, 'wood')
	frame.makeHole(0, 0.2, frameThickness, depth, height-(frameWidth+0.2), width-(2*frameWidth))
	
	return frame
}

function eastWindowFrame(width: number, height: number, depth: number) {
	const frameThickness = 0.15
	
	const outerFrame = cubeWithTexture(depth, height, width, 'white painted wall')
	outerFrame.makeHole(0, frameThickness, frameThickness, depth, height-(2*frameThickness), width-(2*frameThickness))
	
	return outerFrame
}

function northDoor(width: number, height: number){
	const door_thickness = .25
	const door = cubeWithTexture(width, height, 0.25, 'wood')
// 	door.makeHole(door_thickness, door_thickness, 0, width-(2*door_thickness), height-(2*door_thickness), 0.25)
	
	// Add wood door panel (closed door)
	const doorPanel = cubeWithTexture(width-(2*door_thickness), height-(2*door_thickness), 0.05, 'wood')
	doorPanel.positionAt(door, door_thickness, door_thickness, 0.1)
	
	return door
}

function eastWindow(width: number, height: number){
	const window_thickness = .25
	const window = cubeWithTexture(0.25, height, width, 'wood')
	window.makeHole(0, window_thickness, window_thickness, 0.25, height-(2*window_thickness), width-(2*window_thickness))
	
	// Add glass pane
	const glass = cubeWithTexture(0.05, height-(2*window_thickness), width-(2*window_thickness), 'glass')
	glass.positionAt(window, 0.1, window_thickness, window_thickness)
	
	// Add horizontal bars across the window opening
	const barThickness = 0.05
	const barWidth = width - (2 * window_thickness)
	const barSpacing = 0.5
	const windowHeight = height - (2 * window_thickness)
	const numBars = Math.floor(windowHeight / barSpacing) - 1
	
	for (let i = 1; i <= numBars; i++) {
		const bar = cubeWithTexture(0.25, barThickness, barWidth, 'white iron')
		const barY = window_thickness + (i * barSpacing)
		bar.positionAt(window, 0, barY, window_thickness)
	}
	
	return window
}

function northWindow(width: number, height: number){
	const window_thickness = .25
	const window = cubeWithTexture(width, height, 0.25, 'wood')
	window.makeHole(window_thickness, window_thickness, 0, width-(2*window_thickness), height-(2*window_thickness), 0.25)
	
	// Add glass pane
	const glass = cubeWithTexture(width-(2*window_thickness), height-(2*window_thickness), 0.05, 'glass')
	glass.positionAt(window, window_thickness, window_thickness, 0.1)
	
	// Add horizontal bars across the window opening
	const barThickness = 0.05
	const barWidth = width - (2 * window_thickness)
	const barSpacing = 0.5
	const windowHeight = height - (2 * window_thickness)
	const numBars = Math.floor(windowHeight / barSpacing) - 1
	
	for (let i = 1; i <= numBars; i++) {
		const bar = cubeWithTexture(barWidth, barThickness, 0.25, 'white iron')
		const barY = window_thickness + (i * barSpacing)
		bar.positionAt(window, window_thickness, barY, 0)
	}
	
	return window
}

function wall_strip(length: number, direction: 'x' | 'z') {
  if (direction === 'x') {
    return cubeWithTexture(length, 0.3, 0.5, 'white painted wall');
  } else {
    return cubeWithTexture(0.5, 0.3, length, 'white painted wall');
  }
}

function vertical_bar(){
	return cubeWithTexture(0.1, 3, 0.1, 'black iron')
}

function horizontal_bar(width: number){
	return cubeWithTexture(width, 0.2, 0.2, 'wood')
}

function x_railing(count: number, start_immediately: boolean, ref: any) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from edge if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    bar.positionAt(ref, offset, 0, 0);
    
    bars.push(bar);
  }
  
  // Add horizontal top bar spanning from first to last bar
  const topBarWidth = count - 1;
  const topBar = horizontal_bar(topBarWidth);
  
  const xPos = start_immediately ? 0.05 : 1.05;
  topBar.positionAt(ref, xPos, 3, 0.05);
  
  return { bars, topBar };
}

function z_railing(count: number, start_immediately: boolean, ref: any) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from edge if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    bar.positionAt(ref, 0, 0, offset);
    
    bars.push(bar);
  }
  
  // Add horizontal top bar spanning from first to last bar
  const topBarWidth = count - 1;
  const topBar = cubeWithTexture(0.2, 0.2, topBarWidth, 'wood')
  
  const zPos = start_immediately ? 0.05 : 1.05;
  topBar.positionAt(ref, 0.05, 3, zPos);
  
  return { bars, topBar };
}

function inclined_x_railing(count: number, start_immediately: boolean, ref: any, slope: number) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from edge if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    bar.positionAt(ref, offset, 0, 0);
    
    bars.push(bar);
  }
  
  // Add inclined horizontal top bar spanning from first to last bar
  // Compensate length for the angle - actual length = horizontal length / cos(angle)
  const horizontalLength = count - 1;
  const compensatedLength = horizontalLength / Math.cos(slope * Math.PI / 180);
  const topBar = horizontal_bar(compensatedLength);
  
  const xPos = start_immediately ? 0.05 : 1.05;
  topBar.positionAt(ref, xPos, 3, 0.05);
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
    
    bar.positionAt(ref, 0, -yOffset, offset);
    
    bars.push(bar);
  }
  
  // Add inclined horizontal top bar spanning from first to last bar
  // Compensate length for the angle - actual length = horizontal length / cos(angle)
  const horizontalLength = count - 1;
  const compensatedLength = horizontalLength / Math.cos(slope * Math.PI / 180);
  const topBar = cubeWithTexture(0.2, 0.2, compensatedLength, 'wood');
  
  const zPos = start_immediately ? 0.05 : 1.05;
  topBar.positionAt(ref, 0, 3, zPos);
  topBar.rotateX(slope * Math.PI / 180); // Incline along z-axis (convert degrees to radians)
  
  return { bars, topBar };
}

function vertical_bars(count: number, start_immediately: boolean, left_ref: any) {
  const bars = [];
  
  for (let i = 0; i < count; i++) {
    const bar = vertical_bar();
    
    // Calculate position: start 1ft from left if not start_immediately, then 1ft spacing
    const offset = start_immediately ? i : (i + 1);
    bar.positionAt(left_ref, offset, 0, 0);
    
    bars.push(bar);
  }
  
  return bars;
}

// ==================== FOUNDATION & BASEMENT ====================
const basement = wall(33, 2, 44);

// ==================== GROUND FLOOR WALLS ====================
// Main structural walls
const leftWall = cubeWithTexture(1, config.internalWallHeight, 32, 'white painted wall');
leftWall.makeHole(0, 0, 25, 1, 6.7, 3);           // Door opening
eastDoorFrame(3.3, 6.7, 0.5).positionAt(leftWall, -0.5, 0, 25)
eastDoor(3.3, 6.7).positionAt(leftWall, 0, 0, 25)
leftWall.makeHole(0, 1.7, 20, 1, 5, 4);           // Window
eastWindow(2, 5).positionAt(leftWall, 0, 1.7, 20)
eastWindow(2, 5).positionAt(leftWall, 0, 1.7, 22)
eastWindowFrame(4, 5.5, 2).positionAt(leftWall, -1, 1.5, 20)
leftWall.makeHole(0, 1.7 + 2.5, 10, 1, 2.5, 5);   // Small window
eastWindow(2.5, 2.5).positionAt(leftWall, 0, 1.7+2.5, 10)
eastWindow(2.5, 2.5).positionAt(leftWall, 0, 1.7+2.5, 12.5)
eastWindowFrame(5, 3.0, 2).positionAt(leftWall, -1, 1.7+2.25, 10)
const eastStep = wall(3, 1, 5)
eastStep.positionAt(leftWall, -3, -2, 24.25)
const eastUpperStep = wall(1.5, 1, 5)
eastUpperStep.positionAt(leftWall, -1.5, -1, 24.25)
const rightWall = cubeWithTexture(1, config.internalWallHeight, 44, 'white painted wall');
rightWall.makeHole(0, 1.7, 10, 1, 5, 4);           // Window
eastWindow(4, 5).positionAt(rightWall, 0, 1.7, 10)
eastWindowFrame(4, 5, 1).positionAt(rightWall, 1, 1.7, 10)

const backWall = cubeWithTexture(33, 11, 1, 'white painted wall');
backWall.makeHole(6.25, 0, 0, 3.5, 6.7, 1);       // Back door opening
northDoor(3.5, 6.7).positionAt(backWall, 6.25, 0, 0)
doorFrame(3.5, 6.7, 0.3).positionAt(backWall, 6.25, 0, -0.3)
const backStep = wall(5, 1, 3)
backStep.positionAt(backWall, 5.5, -2, -3)
const backUpperStep = wall(5, 1, 1.5)
backUpperStep.positionAt(backWall, 5.5, -1, -1.5)

// ==================== ROOM FUNCTIONS ====================
function drawingRoom() {
  const frontWall = wall(20, 11, 1);
  frontWall.positionAt(rightWall, -20, 0, config.buildingLength - config.wallThickness);
  frontWall.makeHole(3, 0.7, 0, 2, 6, 1);          // Window 1
  northWindow(2, 6).positionAt(frontWall, 3, 0.7, 0.5)
  windowFrame(2, 6, 1).positionAt(frontWall, 3, .7, 0.8)
  frontWall.makeHole(15, .7, 0, 2, 6, 1);         // Window 2
  northWindow(2, 6).positionAt(frontWall, 15, 0.7, 0.5)
  windowFrame(2, 6, 1).positionAt(frontWall, 15, 0.7, 0.8)

  const eastWall = cubeWithTexture(1, 11, 12.5, 'white painted wall');
  eastWall.positionAt(frontWall, 0, 0, -12.5);

  //font plantation
  fgfrontPlantPot(frontWall)
}

function sitout() {
  const frontWall = wall(13, config.internalWallHeight, 1);
  frontWall.positionAtRelative(leftWall, 0, 0, 1);
  frontWall.makeHole(6, 0, 0, 4, 6.7, 1);          // Door opening
  northDoor(4, 6.7).positionAt(frontWall, 6, 0, 0.5)
  doorFrame(4, 6.7, 0.3).positionAt(frontWall, 6, 0, 1)
  frontWall.makeHole(2, .7, 0, 3, 6, 1);          // Window
  northWindow(3, 6).positionAt(frontWall, 2, .7, 0)
  const eastDrop = wall(1, 2, 13);
  eastDrop.positionAt(frontWall, 0, config.internalWallHeight-2, -1)
  const northDrop = wall(13, 2, 1);
  northDrop.positionAt(frontWall, 0, config.internalWallHeight-2, 11)
  const eastExtension = wall(3, 0.4, 21.5);
  eastExtension.positionAt(eastDrop, -3, .5, -7)
  const northExtension = wall(14.5, 0.4, 3);
  northExtension.positionAt(northDrop, -3, 0.5, 1)
  const step = wall(7.5, 1, 1.5)
  step.positionAt(basement, 5.15, 0, 44)
  const pillar = wall(1.5, config.internalWallHeight, 1.5)
  pillar.positionAt(basement, 0, 2, 42.5)
  const first_bar = vertical_bar()
  first_bar.positionAt(pillar, 1.5, 0, 0.75)
  x_railing(5, true, first_bar)
  const inclined_railing_invisible = wall(0, 0, 0)
  inclined_railing_invisible.positionAt(pillar, 5.5, 0, 0.75)
  inclined_z_railing(4, true, inclined_railing_invisible, 30)
  const inclined_railing_invisible_right = wall(0,0,0)
  inclined_railing_invisible_right.positionAt(pillar, 12.1, 0, 0.75)
  inclined_z_railing(4, true, inclined_railing_invisible_right, 30)
  // east sitting parapet wall
  const eastWall = wall(0.5, 3, 6.5)
  eastWall.positionAt(frontWall, 0, 0, 1)
//   eastWall.makeHole(0, 0, 0.5, 0.5, 2.5, 5.5)
  const seatingSlab = cubeWithTexture(2, 0.3, 6.5, 'stone');
  seatingSlab.positionAt(eastWall, -1+0.15, 3, 0)
  
  // East side step for sitout
  const eastStep = wall(1.5, 1, 4);
  eastStep.positionAt(eastWall, -1.2, -2, 6)
}

function groundFloorSlab() {
  const slab = wall(33, 0.6, 44);
  slab.positionAt(basement, 0, config.internalWallHeight + 2, 0);
  return slab;
}

// ==================== FIRST FLOOR ====================
function firstFloor(gfSlab: any) {
  // First floor walls
  const backWall = wall(33, config.internalWallHeight, 1);
  backWall.makeHole(21, 1.7, 0, 4, 5, 1) // window
  northWindow(4, 5).positionAt(backWall, 21, 1.7, 0)
  windowFrame(4, 5, 1).positionAt(backWall, 21, 1.7, -0.8)
  // bathroom ventilation
  backWall.makeHole(17, 5.2, 0, 2, 1.5, 1)
  northWindow(2, 1.5).positionAt(backWall, 17, 5.2, 0)
  windowFrame(2, 1.5, 1).positionAt(backWall, 17, 5.2, -0.8)
  backWall.positionAt(gfSlab, 0, 0, 0);

  // second room bathroom ventilation
  backWall.makeHole(13, 5.2, 0, 2, 1.5, 1)
  northWindow(2, 1.5).positionAt(backWall, 13, 5.2, 0)
  windowFrame(2, 1.5, 1).positionAt(backWall, 13, 5.2, -0.8)

  const leftWall = wall(1, config.internalWallHeight, 31);
  leftWall.positionAt(backWall, 0, 0, 0);
  leftWall.makeHole(0, 1.7, 10, 1, 5, 4);          // Window 1
  eastWindow(4, 5).positionAt(leftWall, 0, 1.7, 10)
  eastWindowFrame(4, 5, 1).positionAt(leftWall, -1, 1.7, 10)
  leftWall.makeHole(0, 1.7, 20, 1, 5, 4);          // Window 2
  eastWindow(4, 5).positionAt(leftWall, 0, 1.7, 20)
  eastWindowFrame(4, 5, 1).positionAt(leftWall, -1, 1.7, 20)

  const rightWall = wall(1, config.internalWallHeight, 31);
  rightWall.positionAt(backWall, 33 - 1, 0, 0);
  // rigtwall window
  rightWall.makeHole(0, 1.7, 10, 1, 5, 4)
  eastWindow(4, 5).positionAt(rightWall, 0, 1.7, 10)
  eastWindowFrame(4, 5, 1).positionAt(rightWall, 1, 1.7, 10)

  const frontWall = wall(33, config.internalWallHeight, 1);
  frontWall.positionAt(backWall, 0, 0, 33 - 2);
  frontWall.makeHole(6, 0, 0, 4, 6.7, 1);       // Door opening
  northDoor(4, 6.7).positionAt(frontWall, 6, 0, 0.5)
  doorFrame(4, 6.7, 0.3).positionAt(frontWall, 6, 0, 1)
  frontWall.makeHole(14.5, 1.7, 0, 4, 5, 1);          // Window
  northWindow(2, 5).positionAt(frontWall, 14.5, 1.7, 0)
  northWindow(2, 5).positionAt(frontWall, 16.5, 1.7, 0)


  // First floor slab (roof)
  const slab = wall(33, 1, 32);
  slab.positionAt(backWall, 0, config.internalWallHeight, 0);
  
  // East extension
  const eastExtension = wall(3, 0.4, 8);
  eastExtension.positionAt(leftWall, -3, 8, 26);
  
  // North extension
  const northExtension = wall(24, 0.4, 3);
  northExtension.positionAt(frontWall, -3, 8, 1);
  
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
  spiralStairs.position.set(
    frontWall.x + 28,  // X position relative to front wall
    frontWall.y + 1,   // Y position (height)
    frontWall.z + 4    // Z position relative to front wall
  );

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
  backParapet.positionAt(ffSlab, 0, 0, 0);
  
  // Left parapet wall
  const leftParapet = wall(1, parapetHeight, 32);
  leftParapet.positionAt(backParapet, 0, 0, 0);
  
  // Right parapet wall
  const rightParapet = wall(1, parapetHeight, 32);
  rightParapet.positionAt(backParapet, 33 - 1, 0, 0);
  
  // Front parapet wall
  const frontParapet = wall(33, parapetHeight, 1);
  frontParapet.positionAt(backParapet, 0, 0, 32 - 1);
  
  // Add decorative blocks on top of parapet walls at 5ft intervals
  const blockSize = { width: 0.5, height: 0.75, depth: 0.5 };
  
  // Back wall blocks (33ft length, blocks at 5ft intervals)
  for (let i = 5; i < 33; i += 5) {
    const block = cubeWithTexture(blockSize.width, blockSize.height, blockSize.depth, 'white painted wall');
    block.positionAt(backParapet, i - blockSize.width/2, parapetHeight, 0.5 - blockSize.depth/2);
  }
  
  // Left wall blocks (32ft length, blocks at 5ft intervals)
  for (let i = 5; i < 32; i += 5) {
    const block = cubeWithTexture(blockSize.depth, blockSize.height, blockSize.width, 'white painted wall');
    block.positionAt(leftParapet, 0.5 - blockSize.depth/2, parapetHeight, i - blockSize.width/2);
  }
  
  // Right wall blocks (32ft length, blocks at 5ft intervals)
  for (let i = 5; i < 32; i += 5) {
    const block = cubeWithTexture(blockSize.depth, blockSize.height, blockSize.width, 'white painted wall');
    block.positionAt(rightParapet, 0.5 - blockSize.depth/2, parapetHeight, i - blockSize.width/2);
  }
  
  // Front wall blocks (33ft length, blocks at 5ft intervals)
  for (let i = 5; i < 33; i += 5) {
    const block = cubeWithTexture(blockSize.width, blockSize.height, blockSize.depth, 'white painted wall');
    block.positionAt(frontParapet, i - blockSize.width/2, parapetHeight, 0.5 - blockSize.depth/2);
  }
  
  // Add wall strips connecting the blocks on top
  const stripHeight = parapetHeight + blockSize.height;
  
  // Back wall strip
  const backStrip = wall_strip(33, 'x');
  backStrip.positionAt(backParapet, 0, stripHeight, 0.25);
  
  // Left wall strip
  const leftStrip = wall_strip(32, 'z');
  leftStrip.positionAt(leftParapet, 0.25, stripHeight, 0);
  
  // Right wall strip
  const rightStrip = wall_strip(32, 'z');
  rightStrip.positionAt(rightParapet, 0.25, stripHeight, 0);
  
  // Front wall strip
  const frontStrip = wall_strip(33, 'x');
  frontStrip.positionAt(frontParapet, 0, stripHeight, 0.25);
  
  return { backParapet, leftParapet, rightParapet, frontParapet };
}

// ==================== EXTERIOR ELEMENTS ====================
// Pavements and driveways
const driveway = cubeWithTexture(19.5, 0.1, 24, 'grass lines pavement');
const eastPavement = cubeWithTexture(6.5, 0.1, 50, 'grass lines pavement');
const northPavement = cubeWithTexture(20, 0.1, 3, 'grass lines pavement');
const southPavement= cubeWithTexture(36, 0.1, 6, 'concrete');
southPavement.positionAt(eastPavement, 6.5, 0, 0)
const westPavement = cubeWithTexture(4, 0.1, 53, 'concrete');
westPavement.positionAt(eastPavement, 39.5, 0, 0)

// Compound walls
const southCompoundWall = cubeWithTexture(44.5, config.compoundWallHeight, 1, 'white painted wall');
southCompoundWall.positionAt(eastPavement, -1.0, 0, -1);
const eastCompoundWall = wall(1, config.compoundWallHeight, 75);
eastCompoundWall.rotateY(-Math.PI / 30);
eastCompoundWall.positionAt(southCompoundWall, 0, 0, 0)
const eastGreenary = cubeWithTexture(20, 0.05, 75, 'grass')
eastGreenary.positionAt(southCompoundWall, 0, 0, 0)
eastGreenary.rotateY(-Math.PI/30)
const westGreenary = cubeWithTexture(24, 0.05, 24, 'grass')
westGreenary.positionAt(northPavement, 0, 0, 3)
const northCompundWall = wall(55, config.compoundWallHeight, 1)
northCompundWall.positionAt(eastCompoundWall, -7.85, 0, 74)
northCompundWall.makeHole(12, 0, 0, 3, config.compoundWallHeight, 1)
northCompundWall.makeHole(18, 0, 0, 8, config.compoundWallHeight, 1)
const westCompoundWall = wall(1, config.compoundWallHeight, 75)
westCompoundWall.positionAt(southCompoundWall, 44.5, 0, 0)
const road = cubeWithTexture(60, 0.1, 12, 'stone')
road.positionAt(northCompundWall, 0, 0, 1)

// ==================== POSITIONING ====================
// Position main walls
leftWall.positionAt(basement, 0, 2, 0);
rightWall.positionAt(basement, 33 - 1, 2, 0);
backWall.positionAt(basement, 0, 2, 0);
backWall.makeHole(21, 1.7, 0, 4, 5, 1)
northWindow(4, 5).positionAt(backWall, 21, 1.7, 0)
windowFrame(4, 5, 1).positionAt(backWall, 21, 1.7, -0.8)
// bath room ventilation
backWall.makeHole(17, 5.2, 0, 2, 1.5, 1)
northWindow(2, 1.5).positionAt(backWall, 17, 5.2, 0)
windowFrame(2, 1.5, 1).positionAt(backWall, 17, 5.2, -0.8)

// Position pavements
driveway.positionAt(basement, -6.5, 0, 44);
eastPavement.positionAt(basement, -6.5, 0, -6);
northPavement.positionAtRelative(driveway, 1, 0, 0);

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
  
  // Convert all components to Three.js meshes
  const basementMesh = createThreeJSMesh(basement);
  
  // Add all meshes to the house group
  houseGroup.add(basementMesh);
  
  // Add spiral stairs to the scene directly (since it's a Three.js Group)
  if (spiralStairs) {
    scene.add(spiralStairs);
  }
  
  // Add the house group to the scene
  scene.add(houseGroup);
  
  return houseGroup;
}

export { basement, leftWall, rightWall, backWall, driveway, wall};
