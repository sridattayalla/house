import { basement } from './house.js';
import { createBox, BoxElement } from './src/api/GroupAPI.js';

// ==================== GATE FUNCTIONS ====================

function vertical_gate_bar(): BoxElement {
	return createBox(0.1, 6, 0.1, 'black iron')
}

function horizontal_gate_bar(width: number): BoxElement {
	return createBox(width, 0.1, 0.1, 'black iron')
}

export function createIronGate(width: number, height: number) {
	const gateGroup = createBox(0.1, 0.1, 0.1, 'black iron'); // Container
	
	// Calculate number of vertical bars (spaced 0.5 units apart)
	const barSpacing = 0.5;
	const numBars = Math.floor(width / barSpacing) + 1;
	
	// Add vertical bars
	for (let i = 0; i < numBars; i++) {
		const bar = vertical_gate_bar();
		const xPos = i * barSpacing;
		gateGroup.addChild(bar, xPos, 0, 0);
	}
	
	// Add top horizontal bar
	const topBar = horizontal_gate_bar(width);
	gateGroup.addChild(topBar, 0, height - 0.1, 0);
	
	// Add bottom horizontal bar
	const bottomBar = horizontal_gate_bar(width);
	gateGroup.addChild(bottomBar, 0, 0.1, 0);
	
	return gateGroup;
}

// ==================== COMPOUND WALL GATES ====================

export function addCompoundWallGates(northCompoundWall: any) {
	// Main gate (large opening)
	const mainGate = createIronGate(8, 6);
	northCompoundWall.addChild(mainGate, 18, 0, 0);
	
	// Pedestrian gate (small opening)
	const pedestrianGate = createIronGate(3, 6);
	northCompoundWall.addChild(pedestrianGate, 12, 0, 0);
}

const mainGate = createIronGate(8, 6);
basement.addChild(mainGate, 2.7, 0, 67)

const pedestrianGate = createIronGate(3, 6);
basement.addChild(pedestrianGate, -3.3, 0, 67)
