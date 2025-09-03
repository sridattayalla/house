import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class RotationControls {
  private controls: OrbitControls;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.controls = new OrbitControls(camera, renderer.domElement);
    
    this.initializeControls();
    this.setupEventListeners();
  }

  private initializeControls(): void {
    // Enable controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;

    // Set distance limits
    this.controls.minDistance = 20;
    this.controls.maxDistance = 500;

    // Set vertical rotation limits
    this.controls.minPolarAngle = 0; // radians
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Almost horizontal

    // Set initial target (center of basement)
    this.controls.target.set(16.5, 1, 22);

    // Auto rotate for demonstration
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 1.0;

    this.controls.update();
  }

  private setupEventListeners(): void {
    // Keyboard controls for additional functionality
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          this.toggleAutoRotate();
          break;
        case 'KeyR':
          this.resetView();
          break;
        case 'KeyF':
          this.focusOnObjects();
          break;
      }
    });
  }

  public toggleAutoRotate(): void {
    this.controls.autoRotate = !this.controls.autoRotate;
    console.log(`Auto rotation ${this.controls.autoRotate ? 'enabled' : 'disabled'}`);
  }

  public resetView(): void {
    this.camera.position.set(22, 0, 100);
    this.controls.target.set(22, 1, 16.5);
    this.controls.update();
  }

  public focusOnObjects(): void {
    // Focus camera on the general area where objects are placed
    this.camera.position.set(5, 5, 5);
    this.controls.target.set(0, 1, 0);
    this.controls.update();
  }

  public setTarget(x: number, y: number, z: number): void {
    this.controls.target.set(x, y, z);
    this.controls.update();
  }

  public update(): void {
    this.controls.update();
  }

  public dispose(): void {
    this.controls.dispose();
  }

  public getInstructions(): string[] {
    return [
      'Mouse Controls:',
      '  • Left click + drag: Rotate around scene',
      '  • Right click + drag: Pan view',
      '  • Scroll wheel: Zoom in/out',
      '',
      'Keyboard Controls:',
      '  • Space: Toggle auto-rotation',
      '  • R: Reset camera view',
      '  • F: Focus on objects'
    ];
  }
}
