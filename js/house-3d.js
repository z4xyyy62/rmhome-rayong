/**
 * RM Home 3D Interactive House Viewer
 * Powered by Three.js & OrbitControls
 * Procedural Luxury Architectural Villa (Nordic & Tropical Modern)
 */

(function () {
  let scene, camera, renderer, controls;
  let animFrameId = null;
  let houseGroup = null;
  let poolWaterMesh = null;
  let interiorLights = [];
  let poolLights = [];
  let sunLight, hemiLight, ambientLight;
  let isNightMode = false;
  let isAutoRotate = true;
  let isInitialized = false;
  let currentHouseData = null;

  // Tween helper for smooth camera transitions
  let cameraTween = null;

  function create3DHouseModel(houseData) {
    const group = new THREE.Group();
    const isNordic = houseData && (
      (houseData.category && houseData.category.includes('นอร์ดิก')) ||
      (houseData.title && houseData.title.toLowerCase().includes('nordic')) ||
      (houseData.id && houseData.id.includes('nordic'))
    );

    // ==========================================
    // 1. Materials (Architectural Palette)
    // ==========================================
    // Concrete / White Render Wall
    const wallWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8f9fa,
      roughness: 0.35,
      metalness: 0.05
    });

    // Dark Charcoal Accent Wall / Feature Stone
    const wallDarkMat = new THREE.MeshStandardMaterial({
      color: 0x242a30,
      roughness: 0.5,
      metalness: 0.15
    });

    // Warm Teak / Oak Wood Slat Texture
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xb57843,
      roughness: 0.6,
      metalness: 0.05
    });

    // Dark Wood / Cedar Siding
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e18,
      roughness: 0.65,
      metalness: 0.05
    });

    // Architectural Glass (Reflective & Transparent)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xa5d8eb,
      roughness: 0.05,
      metalness: 0.2,
      transparent: true,
      opacity: 0.4
    });

    // Dark Aluminum Window Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1a202c,
      roughness: 0.3,
      metalness: 0.8
    });

    // Pool Water Surface (Cyan Tropical Shimmer)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00bcd4,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75
    });

    // Pool Basin (Mosaic Turquoise Tile)
    const poolBasinMat = new THREE.MeshStandardMaterial({
      color: 0x00838f,
      roughness: 0.4,
      metalness: 0.1
    });

    // Lush Emerald Lawn
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.9,
      metalness: 0.0
    });

    // Concrete Paver / Terrace Stone
    const paverMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde1,
      roughness: 0.45,
      metalness: 0.05
    });

    // Warm Interior Glow Floor
    const interiorFloorMat = new THREE.MeshStandardMaterial({
      color: 0xddae7e,
      roughness: 0.3,
      metalness: 0.1
    });

    // Metal Roof / Zinc Fascia
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x2b3238,
      roughness: 0.4,
      metalness: 0.5
    });

    // Gold Luxury Trim (RM Home Signature)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });

    // ==========================================
    // 2. Base Ground & Landscaping
    // ==========================================
    // Main Ground Podium (Stone foundation)
    const groundGeom = new THREE.BoxGeometry(32, 0.4, 26);
    const groundMesh = new THREE.Mesh(groundGeom, paverMat);
    groundMesh.position.y = -0.2;
    groundMesh.receiveShadow = true;
    group.add(groundMesh);

    // Green Lawn Sections
    const lawnLeftGeom = new THREE.BoxGeometry(9, 0.45, 24);
    const lawnLeft = new THREE.Mesh(lawnLeftGeom, grassMat);
    lawnLeft.position.set(-10.5, -0.15, 0);
    lawnLeft.receiveShadow = true;
    group.add(lawnLeft);

    const lawnFrontGeom = new THREE.BoxGeometry(18, 0.45, 6);
    const lawnFront = new THREE.Mesh(lawnFrontGeom, grassMat);
    lawnFront.position.set(4, -0.15, 9);
    lawnFront.receiveShadow = true;
    group.add(lawnFront);

    // Stepping Stones Walkway (Stone pavers leading to entry)
    for (let i = 0; i < 5; i++) {
      const paver = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.48, 0.85), wallWhiteMat);
      paver.position.set(-2.5, -0.12, 4.5 + i * 1.5);
      paver.receiveShadow = true;
      group.add(paver);
    }

    // ==========================================
    // 3. Swimming Pool & Pool Terrace
    // ==========================================
    // Wooden Deck around Pool
    const deckGeom = new THREE.BoxGeometry(8.5, 0.46, 11);
    const deckMesh = new THREE.Mesh(deckGeom, woodMat);
    deckMesh.position.set(9.5, -0.14, 0.5);
    deckMesh.receiveShadow = true;
    group.add(deckMesh);

    // Pool Basin (Hollow inside deck)
    const poolBasin = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.7, 8.5), poolBasinMat);
    poolBasin.position.set(9.5, -0.2, 0.5);
    group.add(poolBasin);

    // Pool Water Surface
    const waterGeom = new THREE.PlaneGeometry(5.6, 8.3);
    poolWaterMesh = new THREE.Mesh(waterGeom, waterMat);
    poolWaterMesh.rotation.x = -Math.PI / 2;
    poolWaterMesh.position.set(9.5, 0.1, 0.5);
    group.add(poolWaterMesh);

    // Minimal Sun Loungers on Pool Deck
    for (let s = -1; s <= 1; s += 2) {
      const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 2.2), wallWhiteMat);
      lounger.position.set(12.5, 0.25, s * 2.2);
      lounger.castShadow = true;
      group.add(lounger);

      // Lounger cushion pillow
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.6), goldMat);
      pillow.position.set(12.5, 0.32, s * 2.2 - 0.8);
      group.add(pillow);
    }

    // ==========================================
    // 4. Ground Floor Architecture
    // ==========================================
    // Ground Floor Main Box (Living & Dining)
    const gFloorWidth = 10;
    const gFloorHeight = 3.0;
    const gFloorDepth = 9;

    // Floor slab with warm interior parquet
    const floorSlab = new THREE.Mesh(new THREE.BoxGeometry(gFloorWidth, 0.2, gFloorDepth), interiorFloorMat);
    floorSlab.position.set(0, 0.1, 0);
    floorSlab.receiveShadow = true;
    group.add(floorSlab);

    // Rear & Side Solid Walls (White architectural concrete)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(gFloorWidth, gFloorHeight, 0.35), wallWhiteMat);
    backWall.position.set(0, gFloorHeight / 2, -gFloorDepth / 2 + 0.175);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, gFloorHeight, gFloorDepth), wallWhiteMat);
    leftWall.position.set(-gFloorWidth / 2 + 0.175, gFloorHeight / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // Dark Accent Feature Wall (TV / Living Room Partition)
    const featureWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, gFloorHeight - 0.4, 4.5), wallDarkMat);
    featureWall.position.set(1.5, (gFloorHeight - 0.4) / 2 + 0.2, -0.5);
    group.add(featureWall);

    // Front Architectural Glass Curtain Wall (Facing Pool & Garden)
    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(gFloorWidth - 3, gFloorHeight - 0.2, 0.1), glassMat);
    frontGlass.position.set(1.2, gFloorHeight / 2, gFloorDepth / 2 - 0.05);
    group.add(frontGlass);

    // Right Glass Wall facing Pool
    const poolGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, gFloorHeight - 0.2, gFloorDepth - 2), glassMat);
    poolGlass.position.set(gFloorWidth / 2 - 0.05, gFloorHeight / 2, 0);
    group.add(poolGlass);

    // Black Aluminum Glass Mullions / Grid Frames
    for (let gx = -2.5; gx <= 3.5; gx += 2) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, gFloorHeight, 0.15), frameMat);
      mullion.position.set(gx, gFloorHeight / 2, gFloorDepth / 2);
      group.add(mullion);
    }
    for (let gz = -3; gz <= 3; gz += 2) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.15, gFloorHeight, 0.08), frameMat);
      mullion.position.set(gFloorWidth / 2, gFloorHeight / 2, gz);
      group.add(mullion);
    }

    // Grand Entrance Door (Dark timber + gold vertical handle)
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.7, 0.3), wallDarkMat);
    doorFrame.position.set(-3.5, 1.35, gFloorDepth / 2);
    group.add(doorFrame);

    const doorWood = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.5, 0.15), darkWoodMat);
    doorWood.position.set(-3.5, 1.25, gFloorDepth / 2 + 0.1);
    group.add(doorWood);

    const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.08), goldMat);
    doorHandle.position.set(-2.9, 1.25, gFloorDepth / 2 + 0.22);
    group.add(doorHandle);

    // Entrance Floating Canopy
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.2, 2.5), roofMat);
    canopy.position.set(-3.5, 2.8, gFloorDepth / 2 + 1.2);
    canopy.castShadow = true;
    group.add(canopy);

    // Interior Furniture Silhouettes (Sofa, Coffee Table, Dining)
    const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.65, 1.4), wallDarkMat);
    sofaMain.position.set(1.5, 0.5, 1.2);
    group.add(sofaMain);

    const sofaChaise = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.65, 2.0), wallDarkMat);
    sofaChaise.position.set(3.2, 0.5, 0.9);
    group.add(sofaChaise);

    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.9), woodMat);
    coffeeTable.position.set(1.5, 0.35, -0.2);
    group.add(coffeeTable);

    // ==========================================
    // 5. Second Floor Cantilever & Master Suite
    // ==========================================
    const sFloorWidth = 10.5;
    const sFloorHeight = 2.8;
    const sFloorDepth = 9.5;
    const sElevation = gFloorHeight + 0.1; // 3.1m

    // Cantilever Floor Slab (Extending forward over terrace)
    const sFloorSlab = new THREE.Mesh(new THREE.BoxGeometry(sFloorWidth, 0.3, sFloorDepth), wallWhiteMat);
    sFloorSlab.position.set(0.5, sElevation + 0.15, 0.6);
    sFloorSlab.castShadow = true;
    sFloorSlab.receiveShadow = true;
    group.add(sFloorSlab);

    // Master Bedroom Volume (Warm wood vertical slats / Dark Charcoal)
    const masterBoxMat = isNordic ? woodMat : wallWhiteMat;
    const masterBox = new THREE.Mesh(new THREE.BoxGeometry(sFloorWidth - 2.8, sFloorHeight, sFloorDepth - 2), masterBoxMat);
    masterBox.position.set(-0.8, sElevation + sFloorHeight / 2 + 0.3, 0);
    masterBox.castShadow = true;
    masterBox.receiveShadow = true;
    group.add(masterBox);

    // Vertical Timber Slats on Accent Box (Nordic aesthetic)
    for (let sl = -3.8; sl <= 2.2; sl += 0.45) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, sFloorHeight, 0.12), darkWoodMat);
      slat.position.set(sl, sElevation + sFloorHeight / 2 + 0.3, (sFloorDepth - 2) / 2 + 0.08);
      group.add(slat);
    }

    // Master Suite Panoramic Balcony (Right side cantilever over pool)
    const balconyWidth = 4.0;
    const balconyDepth = 4.5;
    const balconyX = 4.0;
    const balconyZ = 2.0;

    // Balcony Glass Railing
    const railFront = new THREE.Mesh(new THREE.BoxGeometry(balconyWidth, 1.0, 0.06), glassMat);
    railFront.position.set(balconyX, sElevation + 0.8, balconyZ + balconyDepth / 2);
    group.add(railFront);

    const railSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, balconyDepth), glassMat);
    railSide.position.set(balconyX + balconyWidth / 2, sElevation + 0.8, balconyZ);
    group.add(railSide);

    // Gold Railing Handrail
    const handrailFront = new THREE.Mesh(new THREE.BoxGeometry(balconyWidth + 0.1, 0.08, 0.12), goldMat);
    handrailFront.position.set(balconyX, sElevation + 1.35, balconyZ + balconyDepth / 2);
    group.add(handrailFront);

    const handrailSide = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, balconyDepth + 0.1), goldMat);
    handrailSide.position.set(balconyX + balconyWidth / 2, sElevation + 1.35, balconyZ);
    group.add(handrailSide);

    // Second Floor Sliding Glass Window to Balcony
    const upperGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.3, 3.8), glassMat);
    upperGlass.position.set(balconyX - balconyWidth / 2 + 0.05, sElevation + 1.45, balconyZ);
    group.add(upperGlass);

    // Upper Front Bedroom Window
    const upperFrontGlass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.1), glassMat);
    upperFrontGlass.position.set(-0.5, sElevation + 1.6, (sFloorDepth - 2) / 2 + 0.1);
    group.add(upperFrontGlass);

    // ==========================================
    // 6. Roof Structure (Nordic A-Frame vs Modern Floating Roof)
    // ==========================================
    const totalTopY = sElevation + sFloorHeight + 0.3;

    if (isNordic) {
      // Nordic High-Pitch Gabled Roof Prism
      const roofLength = sFloorDepth + 1.0;
      const roofSpan = sFloorWidth + 0.6;
      const roofPitchH = 2.4;

      const roofShape = new THREE.Shape();
      roofShape.moveTo(-roofSpan / 2, 0);
      roofShape.lineTo(0, roofPitchH);
      roofShape.lineTo(roofSpan / 2, 0);
      roofShape.closePath();

      const extrudeSettings = {
        steps: 1,
        depth: roofLength,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.15,
        bevelSegments: 2
      };

      const roofGeom = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      const nordicRoof = new THREE.Mesh(roofGeom, roofMat);
      nordicRoof.position.set(0, totalTopY, -roofLength / 2);
      nordicRoof.castShadow = true;
      group.add(nordicRoof);

      // Warm Timber Under-Eaves (Gable facade)
      const gableFacade = new THREE.Mesh(roofGeom, woodMat);
      gableFacade.scale.set(0.96, 0.96, 0.02);
      gableFacade.position.set(0, totalTopY, roofLength / 2 - 0.05);
      group.add(gableFacade);
    } else {
      // Modern Minimalist Floating Flat Roof with Overhangs & Wood Soffit
      const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(sFloorWidth + 2.0, 0.45, sFloorDepth + 2.0), roofMat);
      roofSlab.position.set(0.5, totalTopY + 0.22, 0.6);
      roofSlab.castShadow = true;
      group.add(roofSlab);

      // Warm Timber Soffit (Under-ceiling)
      const soffit = new THREE.Mesh(new THREE.BoxGeometry(sFloorWidth + 1.8, 0.08, sFloorDepth + 1.8), woodMat);
      soffit.position.set(0.5, totalTopY - 0.04, 0.6);
      group.add(soffit);

      // Gold Fascia Trim
      const fasciaTrim = new THREE.Mesh(new THREE.BoxGeometry(sFloorWidth + 2.05, 0.1, sFloorDepth + 2.05), goldMat);
      fasciaTrim.position.set(0.5, totalTopY + 0.4, 0.6);
      group.add(fasciaTrim);
    }

    // ==========================================
    // 7. Modern Carport / Pergola (Left Side)
    // ==========================================
    const carportX = -10.5;
    const carportZ = 3.5;
    const carportW = 5.5;
    const carportD = 6.0;
    const carportH = 2.8;

    // Steel Pergola Posts
    for (let px of [-carportW / 2 + 0.2, carportW / 2 - 0.2]) {
      for (let pz of [-carportD / 2 + 0.2, carportD / 2 - 0.2]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, carportH, 0.18), frameMat);
        post.position.set(carportX + px, carportH / 2, carportZ + pz);
        post.castShadow = true;
        group.add(post);
      }
    }

    // Roof Louvers / Horizontal Beams
    for (let b = -carportD / 2; b <= carportD / 2; b += 0.8) {
      const louver = new THREE.Mesh(new THREE.BoxGeometry(carportW, 0.12, 0.25), woodMat);
      louver.position.set(carportX, carportH + 0.1, carportZ + b);
      louver.castShadow = true;
      group.add(louver);
    }

    // Perimeter Frame
    const carportRoofFrame = new THREE.Mesh(new THREE.BoxGeometry(carportW + 0.2, 0.2, carportD + 0.2), frameMat);
    carportRoofFrame.position.set(carportX, carportH + 0.25, carportZ);
    group.add(carportRoofFrame);

    // ==========================================
    // 8. Architectural Landscaping (Trees & Planters)
    // ==========================================
    // Modern Concrete Planter Boxes
    const planter1 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.7, 1.0), wallDarkMat);
    planter1.position.set(-6.5, 0.35, 7.5);
    group.add(planter1);

    const hedge1 = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.9, 0.8), grassMat);
    hedge1.position.set(-6.5, 0.9, 7.5);
    group.add(hedge1);

    // Modern Minimalist Sculptural Tree (Nordic / Tropical Silhouette)
    function createTree(tx, tz, scale = 1) {
      const treeGroup = new THREE.Group();
      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 3.2 * scale, 8), darkWoodMat);
      trunk.position.y = 1.6 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Foliage layers (Clean conical / rounded architectural foliage)
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1e5631, roughness: 0.8 });
      for (let l = 0; l < 3; l++) {
        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry((1.4 - l * 0.3) * scale, (1.6 - l * 0.2) * scale, 7),
          foliageMat
        );
        foliage.position.y = (2.2 + l * 0.9) * scale;
        foliage.castShadow = true;
        treeGroup.add(foliage);
      }
      treeGroup.position.set(tx, 0, tz);
      return treeGroup;
    }

    group.add(createTree(-11.5, -7.5, 1.1));
    group.add(createTree(-12.5, -4.5, 0.85));
    group.add(createTree(-11.0, 9.5, 0.95));

    // RM HOME 3D Acrylic Logo Plaque on Entrance Wall
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.08), wallDarkMat);
    plaque.position.set(-3.5, 3.4, gFloorDepth / 2 + 0.15);
    group.add(plaque);

    const logoTrim = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.68, 0.04), goldMat);
    logoTrim.position.set(-3.5, 3.4, gFloorDepth / 2 + 0.12);
    group.add(logoTrim);

    return group;
  }

  // ==========================================
  // Lighting & Night Mode Controller
  // ==========================================
  function setupLighting(scene) {
    // 1. Sunlight (DirectionalLight with Soft PCF Shadows)
    sunLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    sunLight.position.set(22, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 70;
    const d = 22;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 2. Hemispheric Sky Light
    hemiLight = new THREE.HemisphereLight(0xddeeff, 0x1b4d3e, 0.65);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    // 3. Soft Ambient Fill
    ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // 4. Warm Interior Golden Glow Lights (Visible at night & daytime)
    interiorLights = [];
    const lightGFloor = new THREE.PointLight(0xffb347, 1.2, 12, 1.5);
    lightGFloor.position.set(0, 1.8, 0);
    scene.add(lightGFloor);
    interiorLights.push(lightGFloor);

    const lightMaster = new THREE.PointLight(0xffcc66, 1.0, 10, 1.5);
    lightMaster.position.set(-0.5, 4.5, 0.5);
    scene.add(lightMaster);
    interiorLights.push(lightMaster);

    const lightEntrance = new THREE.PointLight(0xffd700, 0.8, 6, 2);
    lightEntrance.position.set(-3.5, 2.6, 5.0);
    scene.add(lightEntrance);
    interiorLights.push(lightEntrance);

    // 5. Swimming Pool Underwater Glow Lights (Cyan / Aqua)
    poolLights = [];
    const poolLight1 = new THREE.PointLight(0x00e5ff, 1.2, 8, 1.8);
    poolLight1.position.set(9.5, -0.1, -1.5);
    scene.add(poolLight1);
    poolLights.push(poolLight1);

    const poolLight2 = new THREE.PointLight(0x00e5ff, 1.2, 8, 1.8);
    poolLight2.position.set(9.5, -0.1, 2.5);
    scene.add(poolLight2);
    poolLights.push(poolLight2);
  }

  function applyDayNightMode(night) {
    isNightMode = night;
    const btn = document.getElementById('btn3DDayNight');

    if (night) {
      // Night / Dusk Architecture Look
      scene.background = new THREE.Color(0x061118);
      scene.fog = new THREE.FogExp2(0x061118, 0.015);

      sunLight.intensity = 0.2;
      sunLight.color.setHex(0x446688); // Cool moonlight

      hemiLight.intensity = 0.2;
      hemiLight.color.setHex(0x223355);
      hemiLight.groundColor.setHex(0x0a1a12);

      ambientLight.intensity = 0.15;
      ambientLight.color.setHex(0x223344);

      interiorLights.forEach(l => {
        l.intensity = 2.5;
        l.distance = 15;
      });

      poolLights.forEach(l => {
        l.intensity = 3.0;
        l.distance = 10;
      });

      if (btn) {
        btn.innerHTML = '☀️ แสงแดดกลางวัน';
        btn.classList.add('active');
      }
    } else {
      // Crisp Daylight Luxury Architecture
      scene.background = new THREE.Color(0x09261a); // Rich Emerald Dark Backdrop
      scene.fog = new THREE.FogExp2(0x09261a, 0.012);

      sunLight.intensity = 1.4;
      sunLight.color.setHex(0xfff5e6);

      hemiLight.intensity = 0.65;
      hemiLight.color.setHex(0xddeeff);
      hemiLight.groundColor.setHex(0x1b4d3e);

      ambientLight.intensity = 0.35;
      ambientLight.color.setHex(0xffffff);

      interiorLights.forEach(l => {
        l.intensity = 0.9;
        l.distance = 10;
      });

      poolLights.forEach(l => {
        l.intensity = 1.2;
        l.distance = 7;
      });

      if (btn) {
        btn.innerHTML = '🌙 แสงไฟกลางคืน';
        btn.classList.remove('active');
      }
    }
  }

  // ==========================================
  // Camera Tween Helper (Smooth View Angle Shifts)
  // ==========================================
  function smoothMoveCamera(targetPos, targetLookAt = new THREE.Vector3(0, 2.5, 0), duration = 900) {
    if (!camera || !controls) return;

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    cameraTween = function (now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      camera.position.lerpVectors(startPos, targetPos, eased);
      controls.target.lerpVectors(startTarget, targetLookAt, eased);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(cameraTween);
      } else {
        cameraTween = null;
      }
    };

    requestAnimationFrame(cameraTween);
  }

  // ==========================================
  // Public Viewer Initialization
  // ==========================================
  function init3DHouseViewer(mountElement, houseData) {
    if (!mountElement) return;

    // Destroy existing instance cleanly if already mounted
    destroy3DHouseViewer();
    currentHouseData = houseData;

    const width = mountElement.clientWidth || 800;
    const height = mountElement.clientHeight || 460;

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09261a);
    scene.fog = new THREE.FogExp2(0x09261a, 0.012);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(16, 11, 20);

    // 3. Renderer with High-Performance PCF Soft Shadows
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
    renderer.toneMappingExposure = 1.05;
    renderer.outputEncoding = THREE.sRGBEncoding;

    mountElement.innerHTML = '';
    mountElement.appendChild(renderer.domElement);

    // 4. OrbitControls
    if (typeof THREE.OrbitControls === 'function') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 2.5, 0);
      controls.minDistance = 8;
      controls.maxDistance = 45;
      controls.maxPolarAngle = Math.PI / 2 - 0.03; // Prevent dipping beneath foundation
      controls.autoRotate = isAutoRotate;
      controls.autoRotateSpeed = 0.6; // Gentle, elegant rotation speed
    }

    // 5. Lighting
    setupLighting(scene);

    // 6. Build Procedural House Model
    houseGroup = create3DHouseModel(houseData);
    scene.add(houseGroup);

    // 7. Initial Lighting State
    applyDayNightMode(false);

    // 8. Animation Loop
    let clock = new THREE.Clock();

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Subtle water ripple animation
      if (poolWaterMesh) {
        poolWaterMesh.position.y = 0.1 + Math.sin(time * 2.2) * 0.02;
      }

      if (controls) {
        controls.update();
      }

      renderer.render(scene, camera);
    }

    animate();
    isInitialized = true;

    // 9. Resize Handling
    window.addEventListener('resize', onWindowResize);

    // 10. Wire UI Control Buttons
    wireControlButtons();
  }

  function onWindowResize() {
    const mount = document.getElementById('webgl3DCanvasMount');
    if (!mount || !renderer || !camera) return;
    const width = mount.clientWidth;
    const height = mount.clientHeight || 460;
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function wireControlButtons() {
    const btnAutoRotate = document.getElementById('btn3DAutoRotate');
    const btnDayNight = document.getElementById('btn3DDayNight');
    const btnViewFront = document.getElementById('btn3DViewFront');
    const btnViewTop = document.getElementById('btn3DViewTop');
    const btnViewPool = document.getElementById('btn3DViewPool');
    const btnReset = document.getElementById('btn3DReset');

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
      btnDayNight.onclick = () => {
        applyDayNightMode(!isNightMode);
      };
    }

    if (btnViewFront) {
      btnViewFront.onclick = () => {
        if (controls) controls.autoRotate = false;
        if (btnAutoRotate) {
          isAutoRotate = false;
          btnAutoRotate.classList.remove('active');
          btnAutoRotate.innerHTML = '⏸️ หมุนอัตโนมัติ: ปิด';
        }
        smoothMoveCamera(new THREE.Vector3(0, 4.5, 22), new THREE.Vector3(0, 2.5, 0));
      };
    }

    if (btnViewTop) {
      btnViewTop.onclick = () => {
        if (controls) controls.autoRotate = false;
        if (btnAutoRotate) {
          isAutoRotate = false;
          btnAutoRotate.classList.remove('active');
          btnAutoRotate.innerHTML = '⏸️ หมุนอัตโนมัติ: ปิด';
        }
        smoothMoveCamera(new THREE.Vector3(0.5, 26, 16), new THREE.Vector3(0, 1.5, 0));
      };
    }

    if (btnViewPool) {
      btnViewPool.onclick = () => {
        if (controls) controls.autoRotate = false;
        if (btnAutoRotate) {
          isAutoRotate = false;
          btnAutoRotate.classList.remove('active');
          btnAutoRotate.innerHTML = '⏸️ หมุนอัตโนมัติ: ปิด';
        }
        smoothMoveCamera(new THREE.Vector3(19, 5.5, 8), new THREE.Vector3(5, 2.0, 0));
      };
    }

    if (btnReset) {
      btnReset.onclick = () => {
        smoothMoveCamera(new THREE.Vector3(16, 11, 20), new THREE.Vector3(0, 2.5, 0));
      };
    }
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
      scene.traverse(obj => {
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

  // Export to Global Scope
  window.RMHome3D = {
    init: init3DHouseViewer,
    destroy: destroy3DHouseViewer,
    resize: onWindowResize,
    setDayNight: applyDayNightMode
  };
})();
