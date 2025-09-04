import * as THREE from 'three';

export function createSpiralStaircase(options = {}) {
  const {
    totalHeight = 10,
    stepHeight = 0.8,
    innerRadius = 1,
    outerRadius = 3,
    stepThickness = 0.15,
    stepCount = Math.floor(totalHeight / stepHeight),
    turns = 1, // Number of full rotations
    poleRadius = 0.3,
    stepMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.4 }),
    poleMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.3 })
  } = options;

  const group = new THREE.Group();
  
  // Create central pole
  const poleGeometry = new THREE.CylinderGeometry(poleRadius, poleRadius, totalHeight, 16);
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = totalHeight / 2;
  group.add(pole);
  
  // Calculate angle per step
  const totalRotation = turns * Math.PI * 2;
  const anglePerStep = totalRotation / stepCount;
  
  // Create steps
  for (let i = 0; i < stepCount; i++) {
    const stepGroup = new THREE.Group();
    
    // Create step geometry - custom shape for better attachment
    const stepWidth = outerRadius - innerRadius;
    const stepGeometry = new THREE.BoxGeometry(stepWidth, stepThickness, 1.5);
    const step = new THREE.Mesh(stepGeometry, stepMaterial);
    
    // Position step so it extends from inner to outer radius
    step.position.x = innerRadius + stepWidth / 2;
    
    stepGroup.add(step);
    
    // Create step support bracket (connects to pole)
    const bracketGeometry = new THREE.BoxGeometry(0.2, stepThickness * 2, 0.3);
    const bracket = new THREE.Mesh(bracketGeometry, stepMaterial);
    bracket.position.x = innerRadius - 0.1; // Slightly overlap with pole
    bracket.position.y = stepThickness / 2;
    stepGroup.add(bracket);
    
    // Position and rotate the step group
    const angle = i * anglePerStep;
    const height = i * stepHeight;
    
    stepGroup.rotation.y = angle;
    stepGroup.position.y = height;
    
    group.add(stepGroup);
  }
  
  // Add simple handrail system - posts and connecting rails
  const handrailHeight = 1.5;
  const handrailRadius = outerRadius - 0.3;
  
  // Add vertical posts at each step
  for (let i = 0; i < stepCount; i++) {
    const angle = -i * anglePerStep;
    const stepHeight_i = i * stepHeight;
    
    // Vertical post
    const postGeometry = new THREE.CylinderGeometry(0.06, 0.06, handrailHeight, 8);
    const post = new THREE.Mesh(postGeometry, stepMaterial);
    
    const x = Math.cos(angle) * handrailRadius;
    const z = Math.sin(angle) * handrailRadius;
    
    post.position.set(x, stepHeight_i + handrailHeight / 2, z);
    group.add(post);
  }
  
  // Add horizontal rail segments connecting posts
  for (let i = 0; i < stepCount - 1; i++) {
    const currentAngle = -i * anglePerStep;
    const nextAngle = -(i + 1) * anglePerStep;
    const currentHeight = i * stepHeight + handrailHeight;
    const nextHeight = (i + 1) * stepHeight + handrailHeight;
    
    // Calculate start and end positions
    const x1 = Math.cos(currentAngle) * handrailRadius;
    const z1 = Math.sin(currentAngle) * handrailRadius;
    const x2 = Math.cos(nextAngle) * handrailRadius;
    const z2 = Math.sin(nextAngle) * handrailRadius;
    
    // Create rail segment
    const distance = Math.sqrt(
      (x2 - x1) ** 2 + (z2 - z1) ** 2 + (nextHeight - currentHeight) ** 2
    );
    
    const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, distance, 8);
    const rail = new THREE.Mesh(railGeometry, stepMaterial);
    
    // Position at midpoint
    rail.position.set(
      (x1 + x2) / 2,
      (currentHeight + nextHeight) / 2,
      (z1 + z2) / 2
    );
    
    // Calculate rotation to align with direction vector
    const direction = new THREE.Vector3(x2 - x1, nextHeight - currentHeight, z2 - z1).normalize();
    const defaultDirection = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDirection, direction);
    rail.setRotationFromQuaternion(quaternion);
    
    group.add(rail);
  }
  
  return group;
}

// Usage example:
export function addSpiralStaircaseToScene(scene) {
  const staircase = createSpiralStaircase({
    totalHeight: 11,
    stepHeight: 0.8,
    innerRadius: 0.5,
    outerRadius: 2.5,
    stepThickness: 0.2,
    turns: 1.5, // 1.5 full rotations
    poleRadius: 0.25
  });
  
  scene.add(staircase);
  return staircase;
}