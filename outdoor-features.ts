import { cubeWithTexture } from './src/api/CubeAPI.js';
import { wall, eastDoor, eastDoorFrame, eastWindow, eastWindowFrame, northWindow, windowFrame, vertical_bar, x_railing, z_railing, wood } from './components.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export function createPergola(frontWall: any) {
  // Pergola pillars
  const pillarXPositions = [1, 12, 24];
  const pillarZPositions = [1, 6, 12];
  
  for (const xPos of pillarXPositions) {
    for (const zPos of pillarZPositions) {
      cubeWithTexture(0.3, 8, 0.3, 'black iron').positionAt(frontWall, xPos, 0, zPos);
    }
  }

  // North south lines
  for(let i=0; i < 7; i++){
    cubeWithTexture(0.3, 0.3, 11, 'black iron').positionAt(frontWall, (i*4) || 1, 8, 1)
  }
  
  // East west lines
  const eastWestZPositions = [1, 4, 8, 12];
  
  for (const zPos of eastWestZPositions) {
    cubeWithTexture(23.3, 0.3, 0.3, 'black iron').positionAt(frontWall, 1, 8, zPos);
  }
  
  // Glass roof panels
  cubeWithTexture(23.3, 0.1, 11, 'glass').positionAt(frontWall, 1, 8.1, 1)
}

export function createInclinedShade(frontWall: any) {
  // Shade support posts
  const shadeSupport1 = cubeWithTexture(0.2, 11, 0.2, 'black iron');
  shadeSupport1.positionAt(frontWall, 2, 0, 2);
  
  const shadeSupport2 = cubeWithTexture(0.2, 11, 0.2, 'black iron');
  shadeSupport2.positionAt(frontWall, 22, 0, 2);
  
  const shadeSupport3 = cubeWithTexture(0.2, 9, 0.2, 'black iron');
  shadeSupport3.positionAt(frontWall, 2, 0, 10);
  
  const shadeSupport4 = cubeWithTexture(0.2, 9, 0.2, 'black iron');
  shadeSupport4.positionAt(frontWall, 22, 0, 10);
  
  // Inclined shade panels with cantilever
  const shadePanel = cubeWithTexture(21, 0.1, 12, 'brownish red clay tiles');
  shadePanel.positionAt(frontWall, 1.5, 11.4, 1);
  shadePanel.rotateX(15 * Math.PI / 180); // 15 degree incline with 3ft cantilever extension
}

export function westRoom(refWall: any){
	// roof
	wall(20, 0.5, 13).positionAt(refWall, 13, 11, 0)

	// frontWall (north wall) with windows
	const frontWall = wall(20, 11, 0.5);
	frontWall.positionAt(refWall, 13, 0, 12.5);
	frontWall.makeHole(2, 1.7, 0, 2, 5, 0.5);   // Small window 1
	northWindow(2, 5).positionAt(frontWall, 2, 1.7, 0)
	windowFrame(2, 5, 0.5).positionAt(frontWall, 2, 1.7, 0.5)
	frontWall.makeHole(14, 1.7, 0, 2, 5, 0.5);   // Small window 2
	northWindow(2, 5).positionAt(frontWall, 14, 1.7, 0)
	windowFrame(2, 5, 0.5).positionAt(frontWall, 14, 1.7, 0.5)

	// eastWall with door
	const eastWall = wall(0.5, 11, 13);
	eastWall.positionAt(refWall, 13, 0, 0);
	eastWall.makeHole(0, 0, 5, 0.5, 6.7, 3);           // Door opening
	eastDoorFrame(3.3, 6.7, 0.5).positionAt(eastWall, -0.5, 0, 5)
	eastDoor(3.3, 6.7).positionAt(eastWall, 0, 0, 5)

	//westwall
	wall(0.5, 11, 13).positionAt(refWall, 32.5, 0, 0)
}

export function createFirstFloorRailings(gfSlab: any, frontWall: any) {
  // parapet wall
  wall(0.5, 2, 11.5).positionAt(frontWall, 0, 0.5, 1)
//   wood(0.5, 0.5, 12).positionAt(frontWall, -.5, 0.5, 1)
  wall(33, 2, .5).positionAt(frontWall, 0, 0.5, 12.5)
//   wood(34, 0.5, .5).positionAt(frontWall, -0.5, 0.5, 13)
  wall(0.5, 2, 11.5).positionAt(frontWall, 32.5, 0.5, 1)
//   wood(0.5, 0.5, 12).positionAt(frontWall, 33, 0.5, 1)

  const railing_height = 1;
  const railing_lift = 2.5;
  const first_bar = vertical_bar(railing_height)
  first_bar.positionAt(gfSlab, 0.5, railing_lift, 43.5)
  x_railing(17, true, first_bar, railing_height, 2)
  
  const first_dummy_bar_east = cubeWithTexture(0, 0, 0, '')
  first_dummy_bar_east.positionAt(frontWall, 0.5, railing_lift, 0.5)
  z_railing(6, false, first_dummy_bar_east, railing_height, 2)
  
  const first_dummy_bar_west = cubeWithTexture(0, 0, 0, '')
  first_dummy_bar_west.positionAt(frontWall, 32.5, railing_lift, 0.5)
  z_railing(6, false, first_dummy_bar_west, railing_height, 2)
}

export function fgfrontPlantPot(frontWall: any){
	wall(20, 2, 0.5).positionAt(frontWall, 1, -2, 3) // north
	wall(0.5, 2, 2).positionAt(frontWall, 1, -2, 1) // east
	wall(0.5, 2, 2).positionAt(frontWall, 20.5, -2, 1) // west
	const gltfLoader = new GLTFLoader();
	// mud
	cubeWithTexture(19, 0.1, 2, 'ground clay').positionAt(frontWall, 1.5, -0.3, 1)
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
}
