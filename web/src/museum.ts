import * as THREE from 'three';
import { generateStaticParams, draw, PALETTES, type StaticParams } from './art.ts';

export const ROOM_SPACING = 20;

export interface RoomInstance {
  index: number;
  seed: number;
  params: StaticParams;
  group: THREE.Group;
  artGroup: THREE.Group;
  spotLight: THREE.SpotLight;
}

export class MuseumGallery {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer | null = null;
  
  private container: HTMLElement;
  private sharedGeometries: THREE.BufferGeometry[] = [];
  private sharedMaterials: Map<string, THREE.Material> = new Map();
  
  private rooms: Map<number, RoomInstance> = new Map();
  private seeds: number[];
  public currentRoomIndex: number = 0;
  private isAnimating: boolean = true;
  private animationFrameId: number | null = null;
  private startTime: number = performance.now();

  constructor(container: HTMLElement, seeds: number[]) {
    this.container = container;
    this.seeds = seeds;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#B0B0B0');

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    // 3. Shared geometries / materials for reuse
    this.initSharedResources();

    // 4. WebGL Renderer
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);
    } catch {
      this.renderer = null;
    }

    // Ambient light for calm gallery mood
    const ambientLight = new THREE.AmbientLight('#FFFFFF', 1.2);
    this.scene.add(ambientLight);

    // Directional light for gallery illumination
    const dirLight = new THREE.DirectionalLight('#FFFFFF', 1.5);
    dirLight.position.set(2, 8, 5);
    this.scene.add(dirLight);

    // Window resize handler
    window.addEventListener('resize', this.onWindowResize);

    // Initial room window build
    if (this.renderer) {
      this.setRoom(0);
      this.startAnimationLoop();
    }
  }

  private initSharedResources() {
    this.sharedGeometries.push(
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.IcosahedronGeometry(0.6, 1),
      new THREE.TorusGeometry(0.5, 0.2, 16, 32)
    );

    // Wall material
    this.sharedMaterials.set('wall', new THREE.MeshStandardMaterial({
      color: '#B0B0B0',
      roughness: 0.8,
    }));

    // Floor material
    this.sharedMaterials.set('floor', new THREE.MeshStandardMaterial({
      color: '#333333',
      roughness: 0.5,
    }));

    // Art mono materials
    PALETTES.forEach((hexColor, idx) => {
      this.sharedMaterials.set(`art-${idx}`, new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.3,
        metalness: 0.2,
      }));
    });
  }

  public setRoom(index: number) {
    if (index < 0 || index >= this.seeds.length) return;
    this.currentRoomIndex = index;

    // Camera positioning directly facing the art at (0, 1.8, targetZ - 4)
    const targetZ = -index * ROOM_SPACING;
    this.camera.position.set(0, 1.8, targetZ + 3);
    this.camera.lookAt(0, 1.8, targetZ - 4);

    // 3-room windowing: keep index-1, index, index+1
    const activeIndices = new Set([index - 1, index, index + 1]);

    // Unmount out-of-window rooms
    for (const [roomIdx, room] of this.rooms.entries()) {
      if (!activeIndices.has(roomIdx)) {
        this.scene.remove(room.group);
        this.rooms.delete(roomIdx);
      }
    }

    // Mount missing active window rooms
    for (const activeIdx of activeIndices) {
      if (activeIdx >= 0 && activeIdx < this.seeds.length && !this.rooms.has(activeIdx)) {
        const room = this.buildRoom(activeIdx);
        this.rooms.set(activeIdx, room);
        this.scene.add(room.group);
      }
    }
  }

  private buildRoom(index: number): RoomInstance {
    const seed = this.seeds[index];
    const params = generateStaticParams(seed);
    const roomGroup = new THREE.Group();
    const roomZ = -index * ROOM_SPACING;
    roomGroup.position.set(0, 0, roomZ);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(12, 16);
    const floorMesh = new THREE.Mesh(floorGeo, this.sharedMaterials.get('floor'));
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, -2);
    roomGroup.add(floorMesh);

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(12, 8);
    const wallMesh = new THREE.Mesh(wallGeo, this.sharedMaterials.get('wall'));
    wallMesh.position.set(0, 4, -6);
    roomGroup.add(wallMesh);

    // Gallery Spot Light focused directly on artwork
    const spotLight = new THREE.SpotLight('#FFFFFF', 20.0);
    spotLight.position.set(0, 5, -1);
    spotLight.target.position.set(0, 1.8, -4);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    roomGroup.add(spotLight);
    roomGroup.add(spotLight.target);

    // Art Pedestal & Geometry Group
    const artGroup = new THREE.Group();
    artGroup.position.set(0, 1.8, -4);

    const artMaterial = this.sharedMaterials.get(`art-${params.paletteIdx}`);

    for (let i = 0; i < params.count; i++) {
      const geoIdx = i % this.sharedGeometries.length;
      const mesh = new THREE.Mesh(this.sharedGeometries[geoIdx], artMaterial);

      const scale = (params.scales[i] || 1.0) * 0.8;
      mesh.scale.set(scale, scale, scale);

      const angle = (i / params.count) * Math.PI * 2 + params.twist;
      const radius = 1.0;
      mesh.position.set(
        Math.cos(angle) * radius,
        (i - params.count / 2) * 0.2,
        Math.sin(angle) * radius
      );
      artGroup.add(mesh);
    }

    roomGroup.add(artGroup);

    return {
      index,
      seed,
      params,
      group: roomGroup,
      artGroup,
      spotLight,
    };
  }

  public setAnimationEnabled(enabled: boolean) {
    this.isAnimating = enabled;
  }

  private startAnimationLoop() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      
      if (!this.renderer) return;

      const elapsed = (performance.now() - this.startTime) / 1000;

      // Render & update only active room if animation enabled
      const currentRoom = this.rooms.get(this.currentRoomIndex);
      if (currentRoom && this.isAnimating) {
        const frame = draw(currentRoom.params, elapsed);
        currentRoom.artGroup.rotation.y = frame.rotationY;
        currentRoom.artGroup.scale.setScalar(frame.scaleFactor);
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  private onWindowResize = () => {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
