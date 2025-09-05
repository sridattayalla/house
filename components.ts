import { cubeWithTexture } from './src/api/CubeAPI.js';

export function wall(x: number, y: number, z: number) {
  return cubeWithTexture(x, y, z, 'white painted wall');
}

export function eastDoor(width: number, height: number){
	const door_thickness = .25
	const door = cubeWithTexture(0.25, height, width, 'wood')
	
	// Add wood door panel (closed door)
	const doorPanel = cubeWithTexture(0.05, height-(2*door_thickness), width-(2*door_thickness), 'wood')
	doorPanel.positionAt(door, 0.1, door_thickness, door_thickness)
	
	return door
}

export function eastDoorFrame(width: number, height: number, depth: number) {
	const frameThickness = 0.55
	const frameWidth = 0.45 // Width of frame border
	
	const frame = cubeWithTexture(depth, height, width, 'wood')
	frame.makeHole(0, 0.2, frameThickness, depth, height-(frameWidth+0.2), width-(2*frameWidth))
	
	return frame
}

export function eastWindow(width: number, height: number){
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

export function eastWindowFrame(width: number, height: number, depth: number) {
	const frameThickness = 0.15
	
	const outerFrame = cubeWithTexture(depth, height, width, 'white painted wall')
	outerFrame.makeHole(0, frameThickness, frameThickness, depth, height-(2*frameThickness), width-(2*frameThickness))
	
	return outerFrame
}

export function northWindow(width: number, height: number){
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

export function windowFrame(width: number, height: number, depth: number) {
	const frameThickness = 0.15
	const outerProtusion = 0.25
	const frameWidth = 0.25 // Width of frame border
	
	const outerFrame = cubeWithTexture(width, height, depth, 'white painted wall')
	outerFrame.makeHole(frameThickness, frameThickness, 0, width-(2*frameThickness), height-(2*frameThickness), depth)
	
	return outerFrame
}

export function vertical_bar(){
	return cubeWithTexture(0.1, 3, 0.1, 'black iron')
}

export function horizontal_bar(width: number){
	return cubeWithTexture(width, 0.2, 0.2, 'wood')
}

export function x_railing(count: number, start_immediately: boolean, ref: any) {
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

export function z_railing(count: number, start_immediately: boolean, ref: any) {
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

export function inclined_z_railing(count: number, start_immediately: boolean, ref: any, slope: number) {
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