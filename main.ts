import { SceneSetup } from './src/utils/SceneSetup.js';
import { RotationControls } from './src/utils/RotationControls.js';
import { cubeWithTexture, createThreeJSMesh } from './src/api/CubeAPI.js';
import { drawHouseStructure } from './house.js';
import './external_bathroom.js'
import './outdoor.js'

class GeometryVisualization {
  private sceneSetup: SceneSetup;
  private rotationControls: RotationControls;

  constructor() {
    this.sceneSetup = new SceneSetup();
	window.scene = this.sceneSetup.getScene();
    this.rotationControls = new RotationControls(
      this.sceneSetup.getCamera(),
      this.sceneSetup.getRenderer()
    );
    
    this.initialize();
    this.setupEventListeners();
    this.animate();
  }

  private initialize(): void {
    console.log('Geometry API initialized');
    this.showControlInstructions();
    this.demoAPI();
  }

  private demoAPI(): void {
    // Draw the house structure
    const houseGroup = drawHouseStructure(this.sceneSetup.getScene());
    
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.sceneSetup.onWindowResize();
    });
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.rotationControls.update();
    this.sceneSetup.render();
  }

  private showControlInstructions(): void {
    const instructions = this.rotationControls.getInstructions();
    console.log('=== Scene Controls ===');
    instructions.forEach(instruction => console.log(instruction));
    console.log('=====================');
  }
}

// Initialize the application
new GeometryVisualization();
