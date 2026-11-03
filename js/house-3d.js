/**
 * RM Home 3D Interactive Virtual Tour
 * Photorealistic Architectural Villa Viewer
 * Powered by Three.js, OrbitControls & GLTFLoader
 */

(function () {
  let scene, camera, renderer, controls;
  let animFrameId = null;
  let currentModelGroup = null;
  let sunLight, hemiLight, ambientLight;
  let interiorLights = [];
  let poolLights = [];
  let poolWaterMesh = null;
  let isNightMode = false;
  let isAutoRotate = true;
  let isInitialized = false;
  let envMapTexture = null;

  // ==========================================
  // 1. Procedural HDR-Style Architectural Environment Map
  // ==========================================
  function createArchitecturalEnvMap(renderer) {
    if (envMapTexture) return envMapTexture;

    // Generate a high-quality panoramic sky gradient canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Sky to ground architectural gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#3a7bd5'); // Deep sky blue
    grad.addColorStop(0.35, '#8bc34a'); // Horizon soft tint
    grad.addColorStop(0.48, '#fff3e0'); // Warm golden sun bounce
    grad.addColorStop(0.52, '#d7ccc8'); // Horizon stone
    grad.addColorStop(0.70, '#1b4d3e'); // Emerald lawn reflection
    grad.addColorStop(1.0, '#0a2318'); // Ground ambient deep tone
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Warm Sun Highlight on horizon
    const sunGrad = ctx.createRadialGradient(512, 240, 10, 512, 240, 180);
    sunGrad.addColorStop(0, 'rgba(255, 255, 230, 0.9)');
    sunGrad.addColorStop(0.3, 'rgba(255, 220, 150, 0.4)');
    sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 1024, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;

    if (typeof THREE.PMREMGenerator === 'function') {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      envMapTexture = pmrem.fromEquirectangular(texture).texture;
      pmrem.dispose();
      texture.dispose();
    } else {
      envMapTexture = texture;
    }

    return envMapTexture;
  }

  // ==========================================
  // 2. High-Resolution PBR Canvas Textures (Eliminates flat play-doh look)
  // ==========================================
  function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base warm teak tone
    ctx.fillStyle = '#b87c4c';
    ctx.fillRect(0, 0, 512, 512);

    // Realistic horizontal wood grain lines & plank grooves
    for (let y = 0; y < 512; y += 32) {
      // Plank seam
      ctx.fillStyle = 'rgba(40, 20, 10, 0.55)';
      ctx.fillRect(0, y, 512, 2.5);

      // Wood grain variations
      for (let i = 0; i < 20; i++) {
        const grainY = y + Math.random() * 30;
        ctx.fillStyle = (Math.random() > 0.5) ? 'rgba(80, 45, 20, 0.18)' : 'rgba(240, 190, 140, 0.18)';
        ctx.fillRect(0, grainY, 512, 1.2);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  function createMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Off-white travertine base
    ctx.fillStyle = '#f4f2ee';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle stone veining
    ctx.strokeStyle = 'rgba(180, 170, 155, 0.25)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = 0;
      ctx.moveTo(x, y);
      while (y < 512) {
        x += (Math.random() - 0.5) * 40;
        y += Math.random() * 50;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }

  function createPaverTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(0, 0, 512, 512);

    // Paver grid grooves
    ctx.fillStyle = 'rgba(70, 80, 90, 0.4)';
    for (let x = 0; x < 512; x += 64) {
      ctx.fillRect(x, 0, 3, 512);
    }
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(0, y, 512, 3);
    }

    // Speckled concrete noise
    for (let n = 0; n < 3000; n++) {
      ctx.fillStyle = (Math.random() > 0.5) ? 'rgba(255,255,255,0.2)' : 'rgba(40,50,60,0.15)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  function createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#225d31';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = (Math.random() > 0.4) ? '#2e7d32' : '#1b5e20';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 3);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }

  // ==========================================
  // 3. Fallback High-Detail Procedural PBR Model
  // ==========================================
  function createHighDetailProceduralVilla(houseData) {
    const group = new THREE.Group();
    const woodTex = createWoodTexture();
    const marbleTex = createMarbleTexture();
    const paverTex = createPaverTexture();
    const grassTex = createGrassTexture();

    const wallWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: marbleTex,
      roughness: 0.35,
      metalness: 0.05,
      envMapIntensity: 1.2
    });

    const wallCharcoalMat = new THREE.MeshStandardMaterial({
      color: 0x212529,
      roughness: 0.45,
      metalness: 0.25,
      envMapIntensity: 1.0
    });

    const woodSlatMat = new THREE.MeshStandardMaterial({
      color: 0xb37644,
      map: woodTex,
      roughness: 0.5,
      metalness: 0.08,
      envMapIntensity: 1.1
    });

    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e18,
      map: woodTex,
      roughness: 0.6,
      metalness: 0.05
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xaee2f7,
      roughness: 0.04,
      metalness: 0.15,
      transparent: true,
      opacity: 0.35,
      envMapIntensity: 2.5
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.88,
      envMapIntensity: 2.2
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x11161b,
      roughness: 0.3,
      metalness: 0.75,
      envMapIntensity: 1.5
    });

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00bcd4,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 2.8
    });

    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      map: grassTex,
      roughness: 0.85,
      metalness: 0.0
    });

    const paverMat = new THREE.MeshStandardMaterial({
      color: 0xdde2e6,
      map: paverTex,
      roughness: 0.45,
      metalness: 0.1
    });

    // Foundation & Landscape
    const ground = new THREE.Mesh(new THREE.BoxGeometry(32, 0.4, 26), paverMat);
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    group.add(ground);

    const lawnL = new THREE.Mesh(new THREE.BoxGeometry(9, 0.45, 24), grassMat);
    lawnL.position.set(-10.5, -0.15, 0);
    lawnL.receiveShadow = true;
    group.add(lawnL);

    const lawnF = new THREE.Mesh(new THREE.BoxGeometry(18, 0.45, 6), grassMat);
    lawnF.position.set(4, -0.15, 9);
    lawnF.receiveShadow = true;
    group.add(lawnF);

    // Pool & Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.46, 11), woodSlatMat);
    deck.position.set(9.5, -0.14, 0.5);
    deck.receiveShadow = true;
    group.add(deck);

    const poolBasin = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.7, 8.5), new THREE.MeshStandardMaterial({ color: 0x00838f }));
    poolBasin.position.set(9.5, -0.2, 0.5);
    group.add(poolBasin);

    poolWaterMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 8.3), waterMat);
    poolWaterMesh.rotation.x = -Math.PI / 2;
    poolWaterMesh.position.set(9.5, 0.1, 0.5);
    group.add(poolWaterMesh);

    // Ground Floor
    const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 9), woodSlatMat);
    floorSlab.position.set(0, 0.1, 0);
    floorSlab.receiveShadow = true;
    group.add(floorSlab);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 3.0, 0.35), wallWhiteMat);
    backWall.position.set(0, 1.5, -4.5 + 0.175);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.0, 9), wallWhiteMat);
    leftWall.position.set(-5 + 0.175, 1.5, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(7, 2.8, 0.1), glassMat);
    frontGlass.position.set(1.2, 1.5, 4.45);
    group.add(frontGlass);

    const poolGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 7), glassMat);
    poolGlass.position.set(4.95, 1.5, 0);
    group.add(poolGlass);

    // Door & Canopy
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.5, 0.15), darkWoodMat);
    door.position.set(-3.5, 1.25, 4.6);
    door.castShadow = true;
    group.add(door);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 2.5), wallCharcoalMat);
    canopy.position.set(-3.5, 2.8, 5.7);
    canopy.castShadow = true;
    group.add(canopy);

    // Second Floor Cantilever & Master Suite
    const sFloorSlab = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.3, 9.5), wallWhiteMat);
    sFloorSlab.position.set(0.5, 3.25, 0.6);
    sFloorSlab.castShadow = true;
    sFloorSlab.receiveShadow = true;
    group.add(sFloorSlab);

    const masterBox = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.8, 7.5), woodSlatMat);
    masterBox.position.set(-0.8, 4.75, 0);
    masterBox.castShadow = true;
    masterBox.receiveShadow = true;
    group.add(masterBox);

    // Floating Architectural Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.45, 11.5), wallCharcoalMat);
    roof.position.set(0.5, 6.4, 0.6);
    roof.castShadow = true;
    group.add(roof);

    const fascia = new THREE.Mesh(new THREE.BoxGeometry(12.55, 0.08, 11.55), goldMat);
    fascia.position.set(0.5, 6.6, 0.6);
    group.add(fascia);

    // Balcony Glass
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.0, 0.06), glassMat);
    railFront.position.set(4.0, 3.9, 4.25);
    group.add(railFront);

    const handrail = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.08, 0.12), goldMat);
    handrail.position.set(4.0, 4.45, 4.25);
    group.add(handrail);

    return group;
  }

  // ==========================================
  // 4. Lighting & Night Mode
  // ==========================================
  function setupLighting(scene) {
    sunLight = new THREE.DirectionalLight(0xfff8eb, 1.6);
    sunLight.position.set(24, 32, 22);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 80;
    const d = 20;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1b4d3e, 0.7);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    interiorLights = [];
    const lightG = new THREE.PointLight(0xffb84d, 1.5, 14, 1.5);
    lightG.position.set(0, 2.0, 0);
    scene.add(lightG);
    interiorLights.push(lightG);

    const lightM = new THREE.PointLight(0xffcc66, 1.2, 12, 1.5);
    lightM.position.set(-0.5, 4.5, 0.5);
    scene.add(lightM);
    interiorLights.push(lightM);

    poolLights = [];
    const poolL = new THREE.PointLight(0x00e5ff, 1.5, 9, 1.8);
    poolL.position.set(9.5, 0.0, 0.5);
    scene.add(poolL);
    poolLights.push(poolL);
  }

  function applyDayNightMode(night) {
    isNightMode = night;
    const btn = document.getElementById('btn3DFullDayNight');

    if (night) {
      scene.background = new THREE.Color(0x040d12);
      scene.fog = new THREE.FogExp2(0x040d12, 0.016);

      sunLight.intensity = 0.2;
      sunLight.color.setHex(0x335577);

      hemiLight.intensity = 0.2;
      hemiLight.color.setHex(0x1a2838);

      ambientLight.intensity = 0.15;
      ambientLight.color.setHex(0x1a2838);

      interiorLights.forEach(l => { l.intensity = 3.0; l.distance = 18; });
      poolLights.forEach(l => { l.intensity = 3.5; l.distance = 12; });

      if (btn) {
        btn.innerHTML = '☀️ แสงแดดกลางวัน';
        btn.classList.add('active');
      }
    } else {
      scene.background = new THREE.Color(0x072217);
      scene.fog = new THREE.FogExp2(0x072217, 0.012);

      sunLight.intensity = 1.6;
      sunLight.color.setHex(0xfff8eb);

      hemiLight.intensity = 0.7;
      hemiLight.color.setHex(0xe0f2fe);

      ambientLight.intensity = 0.45;
      ambientLight.color.setHex(0xffffff);

      interiorLights.forEach(l => { l.intensity = 1.0; l.distance = 12; });
      poolLights.forEach(l => { l.intensity = 1.2; l.distance = 8; });

      if (btn) {
        btn.innerHTML = '🌙 แสงไฟกลางคืน';
        btn.classList.remove('active');
      }
    }
  }

  // ==========================================
  // 5. Camera Animation Helper
  // ==========================================
  function smoothMoveCamera(targetPos, targetLookAt = new THREE.Vector3(0, 2.5, 0), duration = 850) {
    if (!camera || !controls) return;
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function tween(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const e = ease(p);
      camera.position.lerpVectors(startPos, targetPos, e);
      controls.target.lerpVectors(startTarget, targetLookAt, e);
      controls.update();
      if (p < 1) requestAnimationFrame(tween);
    }
    requestAnimationFrame(tween);
  }

  // ==========================================
  // 6. Launch 3D Centered Modal & Load Model
  // ==========================================
  function launch3DHouseModal(houseData) {
    const modal = document.getElementById('house3DFullscreenModal');
    const mount = document.getElementById('webglFullscreenCanvasMount');
    const titleEl = document.getElementById('modal3DHouseTitle');
    const loadingEl = document.getElementById('modal3DLoading');
    const loadingText = document.getElementById('modal3DLoadingText');

    if (!modal || !mount) return;

    if (titleEl && houseData) {
      titleEl.textContent = `แบบบ้าน 3 มิติ: ${houseData.title || 'นอร์ดิก พรีเมียม วิลล่า'}`;
    }

    // Show Loading Ring
    if (loadingEl) {
      loadingEl.classList.remove('hidden');
      if (loadingText) loadingText.textContent = 'กำลังโหลดโมเดลสถาปัตยกรรม 3D ความละเอียดสูง... 0%';
    }

    // Open Modal with Centered Pop Animation
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Initialize WebGL Scene
    destroy3DHouseViewer();

    const width = mount.clientWidth || window.innerWidth * 0.92;
    const height = mount.clientHeight || window.innerHeight * 0.85;

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x072217);
    scene.fog = new THREE.FogExp2(0x072217, 0.012);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(16, 11, 20);

    // 3. Renderer with ACES Filmic Tone Mapping (Photorealistic color grading)
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputEncoding = THREE.sRGBEncoding;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // 4. Environment Reflection Map (PMREM)
    scene.environment = createArchitecturalEnvMap(renderer);

    // 5. OrbitControls
    if (typeof THREE.OrbitControls === 'function') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 2.5, 0);
      controls.minDistance = 7;
      controls.maxDistance = 50;
      controls.maxPolarAngle = Math.PI / 2 - 0.02;
      controls.autoRotate = isAutoRotate;
      controls.autoRotateSpeed = 0.65;
    }

    // 6. Lighting
    setupLighting(scene);

    // 7. Load GLTF / GLB Real 3D Model
    let modelLoaded = false;
    const modelPath = 'assets/models/luxury_villa.glb';

    function finalizeModel(group) {
      if (modelLoaded) return;
      modelLoaded = true;

      currentModelGroup = group;
      scene.add(currentModelGroup);

      // Hide Loading Spinner
      if (loadingEl) {
        loadingEl.classList.add('hidden');
      }

      // Smooth Intro Camera Glide
      smoothMoveCamera(new THREE.Vector3(14, 9, 18), new THREE.Vector3(0, 2.0, 0), 1200);
    }

    if (typeof THREE.GLTFLoader === 'function') {
      const loader = new THREE.GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          const root = gltf.scene;
          // Traverse and upgrade materials for photorealism
          root.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.envMapIntensity = 1.4;
                const matName = (child.material.name || '').toLowerCase();
                if (matName.includes('glass')) {
                  child.material.transparent = true;
                  child.material.opacity = 0.38;
                  child.material.roughness = 0.04;
                  child.material.metalness = 0.12;
                  child.material.envMapIntensity = 2.4;
                } else if (matName.includes('metal') || matName.includes('aluminum')) {
                  child.material.metalness = 0.85;
                  child.material.roughness = 0.22;
                  child.material.envMapIntensity = 2.0;
                }
              }
            }
          });

          // Center and scale to majestic dimensions
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          root.position.x -= center.x;
          root.position.y -= box.min.y; // Sit flat on ground
          root.position.z -= center.z;

          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const scaleFactor = 20 / maxDim;
            root.scale.setScalar(scaleFactor);
          }

          // Add elegant landscaped podium beneath CAD model
          const groundPlatform = new THREE.Mesh(
            new THREE.BoxGeometry(30, 0.3, 26),
            new THREE.MeshStandardMaterial({
              color: 0xdce2e6,
              roughness: 0.45,
              metalness: 0.1,
              envMapIntensity: 1.0
            })
          );
          groundPlatform.position.y = -0.15;
          groundPlatform.receiveShadow = true;

          const combinedGroup = new THREE.Group();
          combinedGroup.add(groundPlatform);
          combinedGroup.add(root);

          finalizeModel(combinedGroup);
        },
        (progress) => {
          if (progress.lengthComputable && loadingText) {
            const pct = Math.round((progress.loaded / progress.total) * 100);
            loadingText.textContent = `กำลังโหลดแบบจำลอง 3 มิติ ความคมชัดสูง... ${pct}%`;
          }
        },
        (err) => {
          console.warn('[3D Viewer] GLB fetch failed, switching to Procedural PBR:', err);
          const fallback = createHighDetailProceduralVilla(houseData);
          finalizeModel(fallback);
        }
      );

      // Safety timeout: if GLB takes more than 4s on slow connections, load procedural immediately
      setTimeout(() => {
        if (!modelLoaded) {
          const fallback = createHighDetailProceduralVilla(houseData);
          finalizeModel(fallback);
        }
      }, 3500);
    } else {
      const fallback = createHighDetailProceduralVilla(houseData);
      finalizeModel(fallback);
    }

    // 8. Animation Loop
    let clock = new THREE.Clock();
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (poolWaterMesh) {
        poolWaterMesh.position.y = 0.1 + Math.sin(time * 2.2) * 0.02;
      }

      if (controls) controls.update();
      renderer.render(scene, camera);
    }
    animate();
    isInitialized = true;

    // 9. Resize & Toolbar Buttons
    window.addEventListener('resize', onWindowResize);
    wireFullscreenToolbar();
  }

  function onWindowResize() {
    const mount = document.getElementById('webglFullscreenCanvasMount');
    if (!mount || !renderer || !camera) return;
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function wireFullscreenToolbar() {
    const btnAutoRotate = document.getElementById('btn3DFullAutoRotate');
    const btnDayNight = document.getElementById('btn3DFullDayNight');
    const btnViewFront = document.getElementById('btn3DFullViewFront');
    const btnViewTop = document.getElementById('btn3DFullViewTop');
    const btnViewPool = document.getElementById('btn3DFullViewPool');
    const btnReset = document.getElementById('btn3DFullReset');
    const btnClose = document.getElementById('btnClose3DFullscreen');
    const modal = document.getElementById('house3DFullscreenModal');

    function pauseAutoRotate() {
      isAutoRotate = false;
      if (controls) controls.autoRotate = false;
      if (btnAutoRotate) {
        btnAutoRotate.classList.remove('active');
        btnAutoRotate.innerHTML = '⏸️ หมุนอัตโนมัติ: ปิด';
      }
    }

    if (btnAutoRotate) {
      btnAutoRotate.onclick = () => {
        isAutoRotate = !isAutoRotate;
        if (controls) controls.autoRotate = isAutoRotate;
        if (isAutoRotate) {
          btnAutoRotate.classList.add('active');
          btnAutoRotate.innerHTML = '🔄 หมุนอัตโนมัติ: เปิด';
        } else {
          btnAutoRotate.classList.remove('active');
          btnAutoRotate.innerHTML = '⏸️ หมุนอัตโนมัติ: ปิด';
        }
      };
    }

    if (btnDayNight) {
      btnDayNight.onclick = () => applyDayNightMode(!isNightMode);
    }

    if (btnViewFront) {
      btnViewFront.onclick = () => {
        pauseAutoRotate();
        smoothMoveCamera(new THREE.Vector3(0, 4.5, 22), new THREE.Vector3(0, 2.0, 0));
      };
    }

    if (btnViewTop) {
      btnViewTop.onclick = () => {
        pauseAutoRotate();
        smoothMoveCamera(new THREE.Vector3(0.5, 26, 16), new THREE.Vector3(0, 1.5, 0));
      };
    }

    if (btnViewPool) {
      btnViewPool.onclick = () => {
        pauseAutoRotate();
        smoothMoveCamera(new THREE.Vector3(18, 5.0, 8), new THREE.Vector3(4, 2.0, 0));
      };
    }

    if (btnReset) {
      btnReset.onclick = () => {
        smoothMoveCamera(new THREE.Vector3(14, 9, 18), new THREE.Vector3(0, 2.0, 0));
      };
    }

    function close3DModal() {
      if (modal) modal.classList.remove('open');
      document.body.style.overflow = '';
      destroy3DHouseViewer();
    }

    if (btnClose) btnClose.onclick = close3DModal;
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) close3DModal();
      };
    }

    // ESC Key to close
    window.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        close3DModal();
        window.removeEventListener('keydown', escHandler);
      }
    });
  }

  function destroy3DHouseViewer() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    window.removeEventListener('resize', onWindowResize);

    if (controls) {
      controls.dispose();
      controls = null;
    }

    if (scene) {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      scene = null;
    }

    if (renderer) {
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer = null;
    }

    isInitialized = false;
  }

  // Global Exports
  window.RMHome3D = {
    openModal: launch3DHouseModal,
    destroy: destroy3DHouseViewer,
    resize: onWindowResize,
    setDayNight: applyDayNightMode
  };
})();
