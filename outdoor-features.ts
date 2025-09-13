import { createBox, BoxElement } from './src/api/GroupAPI.js';
import { wall, eastDoor, eastDoorFrame, eastWindow, eastWindowFrame, northWindow, windowFrame, vertical_bar, x_railing, z_railing, wood } from './components.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export function createPergola(frontWall: any) {
  // Pergola pillars
  const pillarXPositions = [1, 12, 24];
  const pillarZPositions = [1, 6, 12];
  
  for (const xPos of pillarXPositions) {
    for (const zPos of pillarZPositions) {
      const pillar = createBox(0.3, 0.3, 8, 'black iron');
      frontWall.addChild(pillar, xPos, zPos, 0);
    }
  }

  // North south lines
  for(let i=0; i < 7; i++){
    const beam = createBox(0.3, 11, 0.3, 'black iron');
    frontWall.addChild(beam, (i*4) || 1, 1, 8);
  }
  
  // East west lines
  const eastWestZPositions = [1, 4, 8, 12];
  
  for (const zPos of eastWestZPositions) {
    const eastWestBeam = createBox(23.3, 0.3, 0.3, 'black iron');
    frontWall.addChild(eastWestBeam, 1, zPos, 8);
  }
  
  // Glass roof panels
  const glassRoof = createBox(23.3, 0.1, 11, 'glass');
  frontWall.addChild(glassRoof, 1, 1, 8.1);
}

export function createInclinedShade(frontWall: any) {
  // Shade support posts
  const shadeSupport1 = createBox(0.2, 0.2, 11, 'black iron');
  frontWall.addChild(shadeSupport1, 2, 2, 0);
  
  const shadeSupport2 = createBox(0.2, 0.2, 11, 'black iron');
  frontWall.addChild(shadeSupport2, 22, 2, 0);
  
  const shadeSupport3 = createBox(0.2, 0.2, 9, 'black iron');
  frontWall.addChild(shadeSupport3, 2, 10, 0);
  
  const shadeSupport4 = createBox(0.2, 0.2, 9, 'black iron');
  frontWall.addChild(shadeSupport4, 22, 10, 0);
  
  // Inclined shade panels with cantilever
  const shadePanel = createBox(21, 0.1, 12, 'brownish red clay tiles');
  frontWall.addChild(shadePanel, 1.5, 1, 11.4);
  shadePanel.rotateX(15 * Math.PI / 180); // 15 degree incline with 3ft cantilever extension
}

export function westRoom(refWall: any){
	// roof
	refWall.addChild(wall(20, 0.5, 13), 13, 11, 0)

	// frontWall (north wall) with windows
	const frontWall = wall(20, 11, 0.5);
	refWall.addChild(frontWall, 13, 0, 12.5);
	frontWall.makeHole(2, 1.7, 0, 2, 5, 0.5);   // Small window 1
	frontWall.addChild(northWindow(2, 5), 2, 1.7, 0)
	frontWall.addChild(windowFrame(2, 5, 0.5), 2, 1.7, 0.5)
	frontWall.makeHole(14, 1.7, 0, 2, 5, 0.5);   // Small window 2
	frontWall.addChild(northWindow(2, 5), 14, 1.7, 0)
	frontWall.addChild(windowFrame(2, 5, 0.5), 14, 1.7, 0.5)

	// eastWall with door
	const eastWall = wall(0.5, 11, 13);
	refWall.addChild(eastWall, 13, 0, 0);
	eastWall.makeHole(0, 0, 5, 0.5, 6.7, 3);           // Door opening
	eastWall.addChild(eastDoorFrame(3.3, 6.7, 0.5), -0.5, 0, 5)
	eastWall.addChild(eastDoor(3.3, 6.7), 0, 0, 5)

	//westwall
	refWall.addChild(wall(0.5, 11, 13), 32.5, 0, 0)
}

export function createFirstFloorRailings(gfSlab: any, frontWall: any) {
  // parapet wall
  frontWall.addChild(wall(0.5, 2, 11.5), 0, 0.5, 1)
//   wood(0.5, 0.5, 12).positionAt(frontWall, -.5, 0.5, 1)
  frontWall.addChild(wall(33, 2, .5), 0, 0.5, 12.5)
//   wood(34, 0.5, .5).positionAt(frontWall, -0.5, 0.5, 13)
  frontWall.addChild(wall(0.5, 2, 11.5), 32.5, 0.5, 1)
//   wood(0.5, 0.5, 12).positionAt(frontWall, 33, 0.5, 1)

  const railing_height = 1;
  const railing_lift = 2.5;
  const first_bar = vertical_bar(railing_height)
  gfSlab.addChild(first_bar, 0.5, railing_lift, 43.5)
  x_railing(17, true, first_bar, railing_height, 2)
  
  const first_dummy_bar_east = createBox(0.1, 0.1, 0.1, 'black iron')
  frontWall.addChild(first_dummy_bar_east, 0.5, railing_lift, 0.5)
  z_railing(6, false, first_dummy_bar_east, railing_height, 2)
  
  const first_dummy_bar_west = createBox(0.1, 0.1, 0.1, 'black iron')
  frontWall.addChild(first_dummy_bar_west, 32.5, railing_lift, 0.5)
  z_railing(6, false, first_dummy_bar_west, railing_height, 2)
}

export function fgfrontPlantPot(frontWall: any){
	frontWall.addChild(wall(20, 2, 0.5), 1, -2, 3) // north
	frontWall.addChild(wall(0.5, 2, 2), 1, -2, 1) // east
	frontWall.addChild(wall(0.5, 2, 2), 20.5, -2, 1) // west
	const gltfLoader = new GLTFLoader();
	// mud
	const groundClay = createBox(19, 0.1, 2, 'ground clay');
	frontWall.addChild(groundClay, 1.5, -0.2, 1);
	// white flower
	gltfLoader.load('./textures/white_flower/scene.gltf', (gltfScene)=>{
		gltfScene.scene.position.z = 45;
		gltfScene.scene.position.x = 15;
		gltfScene.scene.position.y = 1.5;
		gltfScene.scene.scale.set(.05, .05, .05)
		window.scene.add(gltfScene.scene)
	})

	// set of plants
	gltfLoader.load('./textures/periwinkle_plant_4k.gltf/periwinkle_plant_4k.gltf', (gltfScene)=>{
		gltfScene.scene.position.z = 45.5;
		gltfScene.scene.position.x = 21;
		gltfScene.scene.position.y = 1.5;
		gltfScene.scene.scale.set(10, 10, 10)
		window.scene.add(gltfScene.scene)
	})
	// roses
	gltfLoader.load('./textures/rose_flower.glb', (gltfScene)=>{
		gltfScene.scene.position.z = 45;
		gltfScene.scene.position.x = 30;
		gltfScene.scene.position.y = 2;
// 		gltfScene.scene.scale.set(1.5, 1.5, 1.5)
		window.scene.add(gltfScene.scene)
	})

	//grass
// 	gltfLoader.load('./models/simple_grass_chunks.glb', (gltfScene)=>{
// 		gltfScene.scene.position.z = 45;
// 		gltfScene.scene.position.x = 33;
// 		gltfScene.scene.position.y = 2;
// 		gltfScene.scene.scale.set(10, 10, 10)
// 		window.scene.add(gltfScene.scene)
// 	})
}
