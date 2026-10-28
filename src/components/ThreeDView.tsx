import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../theme/colors';
import { ThreeDSceneSettings } from '../types';

interface ThreeDViewProps {
  settings: ThreeDSceneSettings;
  isWalkthrough?: boolean;
  style?: ViewStyle;
}

export const ThreeDView: React.FC<ThreeDViewProps> = ({
  settings,
  isWalkthrough = false,
  style,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Generate self-contained HTML with Three.js via CDN
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background: #F7F8F4; font-family: sans-serif; }
    canvas { width: 100vw; height: 100vh; display: block; }
    #info {
      position: absolute; bottom: 8px; left: 8px;
      background: rgba(36, 76, 62, 0.85); color: #FFF;
      font-size: 11px; padding: 4px 8px; border-radius: 6px;
      pointer-events: none;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="info">Drag to rotate • Pinch to zoom</div>
  <script>
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF7F8F4);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(${isWalkthrough ? '0, 1.6, 2' : '4, 3.5, 4.5'});

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 12;
    ${isWalkthrough ? 'controls.target.set(0, 1.4, -2);' : 'controls.target.set(0, 0.8, 0);'}

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff6e6, 0.8);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(6, 6);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: ${settings.floorType === 'wood' ? '0xC2A278' : settings.floorType === 'tile' ? '0xE5E7EB' : '0x9CA3AF'},
      roughness: 0.6 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: '${settings.wallColor}', roughness: 0.8 });
    
    // Back Wall
    const backWallGeo = new THREE.BoxGeometry(6, 3, 0.15);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 1.5, -3);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left Wall with Window Cutout
    const leftWallGeo = new THREE.BoxGeometry(0.15, 3, 6);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-3, 1.5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Window frame
    const windowFrameGeo = new THREE.BoxGeometry(0.2, 1.4, 2.0);
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x244C3E, roughness: 0.5 });
    const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
    windowFrame.position.set(-2.95, 1.7, 0);
    scene.add(windowFrame);

    // Furniture Group
    const furnitureGroup = new THREE.Group();
    scene.add(furnitureGroup);

    // Sofa / Bed
    if (${settings.furnitureVisible.seating}) {
      const sofaGroup = new THREE.Group();
      const seatGeo = new THREE.BoxGeometry(2.2, 0.4, 0.9);
      const fabricMat = new THREE.MeshStandardMaterial({ color: 0x557367, roughness: 0.7 });
      const seat = new THREE.Mesh(seatGeo, fabricMat);
      seat.position.set(0, 0.35, -2.1);
      seat.castShadow = true;
      sofaGroup.add(seat);

      const backGeo = new THREE.BoxGeometry(2.2, 0.7, 0.3);
      const back = new THREE.Mesh(backGeo, fabricMat);
      back.position.set(0, 0.8, -2.4);
      back.castShadow = true;
      sofaGroup.add(back);

      furnitureGroup.add(sofaGroup);
    }

    // Coffee Table / Desk
    if (${settings.furnitureVisible.tables}) {
      const tableGeo = new THREE.BoxGeometry(1.2, 0.4, 0.6);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x785A3C, roughness: 0.5 });
      const table = new THREE.Mesh(tableGeo, woodMat);
      table.position.set(0, 0.2, -1.0);
      table.castShadow = true;
      table.receiveShadow = true;
      furnitureGroup.add(table);
    }

    // Storage / Wardrobe
    if (${settings.furnitureVisible.storage}) {
      const wardrobeGeo = new THREE.BoxGeometry(1.0, 2.2, 0.6);
      const wardrobeMat = new THREE.MeshStandardMaterial({ color: 0xE1E6DF, roughness: 0.6 });
      const wardrobe = new THREE.Mesh(wardrobeGeo, wardrobeMat);
      wardrobe.position.set(2.2, 1.1, -2.4);
      wardrobe.castShadow = true;
      wardrobe.receiveShadow = true;
      furnitureGroup.add(wardrobe);
    }

    // Standing Floor Lamp
    if (${settings.furnitureVisible.lighting}) {
      const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8);
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x244C3E, metalness: 0.6 });
      const pole = new THREE.Mesh(poleGeo, metalMat);
      pole.position.set(-2.2, 0.9, -2.2);
      furnitureGroup.add(pole);

      const shadeGeo = new THREE.ConeGeometry(0.25, 0.3, 16);
      const shadeMat = new THREE.MeshStandardMaterial({ color: 0xFFF3D6, roughness: 0.4 });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.set(-2.2, 1.7, -2.2);
      furnitureGroup.add(shade);
    }

    // Rug
    const rugGeo = new THREE.PlaneGeometry(2.4, 1.8);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0xDCD6C8, roughness: 0.9 });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.01, -1.4);
    rug.receiveShadow = true;
    scene.add(rug);

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
  `;

  const WebViewComponent = WebView as any;

  return (
    <View style={[styles.container, style]}>
      <WebViewComponent
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F7F8F4',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  webview: {
    flex: 1,
    backgroundColor: '#F7F8F4',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
