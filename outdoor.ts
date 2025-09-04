import { basement } from './house.js';
import { cubeWithTexture } from './src/api/CubeAPI.js';

// ==================== GATE FUNCTIONS ====================

function vertical_gate_bar(){
	return cubeWithTexture(0.1, 6, 0.1, 'black iron')
}

function horizontal_gate_bar(width: number){
	return cubeWithTexture(width, 0.1, 0.1, 'black iron')
}

export function createIronGate(width: number, height: number) {
	const gateGroup = cubeWithTexture(0, 0, 0, ''); // Invisible container
	
	// Calculate number of vertical bars (spaced 0.5 units apart)
	const barSpacing = 0.5;
	const numBars = Math.floor(width / barSpacing) + 1;
	
	// Add vertical bars
	for (let i = 0; i < numBars; i++) {
		const bar = vertical_gate_bar();
		const xPos = i * barSpacing;
		bar.positionAt(gateGroup, xPos, 0, 0);
	}
	
	// Add top horizontal bar
	const topBar = horizontal_gate_bar(width);
	topBar.positionAt(gateGroup, 0, height - 0.1, 0);
	
	// Add bottom horizontal bar
	const bottomBar = horizontal_gate_bar(width);
	bottomBar.positionAt(gateGroup, 0, 0.1, 0);
	
	return gateGroup;
}

// ==================== COMPOUND WALL GATES ====================

export function addCompoundWallGates(northCompoundWall: any) {
	// Main gate (large opening)
	const mainGate = createIronGate(8, 6);
	mainGate.positionAt(northCompoundWall, 18, 0, 0);
	
	// Pedestrian gate (small opening)
	const pedestrianGate = createIronGate(3, 6);
	pedestrianGate.positionAt(northCompoundWall, 12, 0, 0);
}

const mainGate = createIronGate(8, 6);
mainGate.positionAt(basement, 2.7, 0, 67)

const pedestrianGate = createIronGate(3, 6);
pedestrianGate.positionAt(basement, -3.3, 0, 67)
