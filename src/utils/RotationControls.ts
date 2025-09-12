import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class RotationControls {
  private orbitControls: OrbitControls;
  private pointerLockControls: PointerLockControls;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private currentControlMode: 'orbit' | 'pointer' = 'orbit';
  private moveSpeed: number = 2.0;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private direction: THREE.Vector3 = new THREE.Vector3();
  private keys: { [key: string]: boolean } = {};

  constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    this.camera = camera;
    this.renderer = renderer;
    
    // Initialize both control types
    this.orbitControls = new OrbitControls(camera, renderer.domElement);
    this.pointerLockControls = new PointerLockControls(camera, document.body);
    
    this.initializeControls();
    this.setupEventListeners();
  }

  private initializeControls(): void {
    // Initialize OrbitControls
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.enableZoom = true;
    this.orbitControls.enablePan = true;
    this.orbitControls.enableRotate = true;

    // Set distance limits
    this.orbitControls.minDistance = 20;
    this.orbitControls.maxDistance = 500;

    // Set vertical rotation limits
    this.orbitControls.minPolarAngle = 0; // radians
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.1; // Almost horizontal

    // Set initial target (look forward)
    this.orbitControls.target.set(15, 3.7, 50);

    // Auto rotate for demonstration
    this.orbitControls.autoRotate = false;
    this.orbitControls.autoRotateSpeed = 1.0;

    this.orbitControls.update();

    // Initialize PointerLockControls (disabled by default)
    this.pointerLockControls.enabled = false;
    
    // Set up pointer lock event listeners
    this.pointerLockControls.addEventListener('lock', () => {
      console.log('Pointer locked - use WASD to move, mouse to look around');
    });
    
    this.pointerLockControls.addEventListener('unlock', () => {
      console.log('Pointer unlocked');
    });
  }

  private setupEventListeners(): void {
    // Keyboard controls for additional functionality
    document.addEventListener('keydown', (event) => {
      // Handle control switching and general commands
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
        case 'KeyC':
          event.preventDefault();
          this.switchControlMode();
          break;
        case 'Escape':
          if (this.currentControlMode === 'pointer') {
            this.switchControlMode('orbit');
          }
          break;
      }

      // Handle movement keys for pointer lock controls
      if (this.currentControlMode === 'pointer') {
        this.keys[event.code] = true;
      }
    });

    document.addEventListener('keyup', (event) => {
      if (this.currentControlMode === 'pointer') {
        this.keys[event.code] = false;
      }
    });

    // Handle click to enable pointer lock when in pointer mode
    document.addEventListener('click', () => {
      if (this.currentControlMode === 'pointer' && !this.pointerLockControls.isLocked) {
        this.pointerLockControls.lock();
      }
    });
  }

  public switchControlMode(mode?: 'orbit' | 'pointer'): void {
    const newMode = mode || (this.currentControlMode === 'orbit' ? 'pointer' : 'orbit');
    
    if (newMode === this.currentControlMode) return;

    // Disable current controls
    if (this.currentControlMode === 'orbit') {
      this.orbitControls.enabled = false;
    } else {
      this.pointerLockControls.unlock();
      this.pointerLockControls.enabled = false;
      // Reset velocity when switching away from pointer controls
      this.velocity.set(0, 0, 0);
    }

    // Enable new controls
    this.currentControlMode = newMode;
    if (newMode === 'orbit') {
      this.orbitControls.enabled = true;
      console.log('Switched to Orbit Controls - Mouse to rotate/pan/zoom');
    } else {
      this.pointerLockControls.enabled = true;
      console.log('Switched to Pointer Lock Controls - Click to lock pointer, WASD to move');
    }
  }

  public getCurrentControlMode(): 'orbit' | 'pointer' {
    return this.currentControlMode;
  }

  public enableOrbitControls(): void {
    this.switchControlMode('orbit');
  }

  public enablePointerLockControls(): void {
    this.switchControlMode('pointer');
  }

  public toggleAutoRotate(): void {
    if (this.currentControlMode === 'orbit') {
      this.orbitControls.autoRotate = !this.orbitControls.autoRotate;
      console.log(`Auto rotation ${this.orbitControls.autoRotate ? 'enabled' : 'disabled'}`);
    }
  }

  public resetView(): void {
    this.camera.position.set(22, 0, 100);
    if (this.currentControlMode === 'orbit') {
      this.orbitControls.target.set(22, 1, 16.5);
      this.orbitControls.update();
    }
  }

  public focusOnObjects(): void {
    // Focus camera on the general area where objects are placed
    this.camera.position.set(5, 5, 5);
    if (this.currentControlMode === 'orbit') {
      this.orbitControls.target.set(0, 1, 0);
      this.orbitControls.update();
    }
  }

  public setTarget(x: number, y: number, z: number): void {
    if (this.currentControlMode === 'orbit') {
      this.orbitControls.target.set(x, y, z);
      this.orbitControls.update();
    }
  }

  private updatePointerLockMovement(): void {
    const delta = 0.016; // Assuming 60fps
    const moveDistance = this.moveSpeed * delta;
    
    // Simple direct movement without velocity accumulation
    if (this.keys['KeyW']) {
      this.pointerLockControls.moveForward(moveDistance);
    }
    if (this.keys['KeyS']) {
      this.pointerLockControls.moveForward(-moveDistance);
    }
    if (this.keys['KeyA']) {
      this.pointerLockControls.moveRight(-moveDistance);
    }
    if (this.keys['KeyD']) {
      this.pointerLockControls.moveRight(moveDistance);
    }
    if (this.keys['KeyQ']) {
      this.camera.position.y += moveDistance;
    }
    if (this.keys['KeyE']) {
      this.camera.position.y -= moveDistance;
    }
  }

  public update(): void {
    if (this.currentControlMode === 'orbit') {
      this.orbitControls.update();
    } else if (this.currentControlMode === 'pointer' && this.pointerLockControls.isLocked) {
      this.updatePointerLockMovement();
    }
  }

  public dispose(): void {
    this.orbitControls.dispose();
    this.pointerLockControls.dispose();
  }

  public getInstructions(): string[] {
    const baseInstructions = [
      `Current Mode: ${this.currentControlMode === 'orbit' ? 'Orbit Controls' : 'Pointer Lock Controls'}`,
      '',
      'Global Controls:',
      '  • C: Switch between Orbit and Pointer Lock controls',
      '  • R: Reset camera view',
      '  • F: Focus on objects',
      ''
    ];

    if (this.currentControlMode === 'orbit') {
      return [
        ...baseInstructions,
        'Orbit Controls:',
        '  • Left click + drag: Rotate around scene',
        '  • Right click + drag: Pan view',
        '  • Scroll wheel: Zoom in/out',
        '  • Space: Toggle auto-rotation'
      ];
    } else {
      return [
        ...baseInstructions,
        'Pointer Lock Controls:',
        '  • Click anywhere: Lock/unlock pointer',
        '  • Mouse: Look around',
        '  • W/A/S/D: Move forward/left/backward/right',
        '  • Q/E: Move up/down',
        '  • Escape: Switch back to Orbit controls'
      ];
    }
  }
}
