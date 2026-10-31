import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
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

  // Self-contained 3D spatial room: WebGL Three.js with automatic Canvas 3D fallback
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #F7F8F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    canvas { width: 100%; height: 100%; display: block; touch-action: none; }
    #badge {
      position: absolute; bottom: 10px; left: 10px;
      background: rgba(36, 76, 62, 0.90); color: #FFF;
      font-size: 11px; font-weight: 500; padding: 5px 10px; border-radius: 8px;
      pointer-events: none; z-index: 100;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
    #reset-btn {
      position: absolute; top: 10px; right: 10px;
      background: #FFFFFF; color: #244C3E; border: 1.5px solid #244C3E;
      font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 8px;
      cursor: pointer; z-index: 100;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="badge">3D Space Model • Drag to Rotate</div>
  <button id="reset-btn" onclick="resetView()">Reset View</button>
  <canvas id="viewCanvas"></canvas>

  <script>
    const settings = {
      wallColor: "${settings.wallColor || '#F5F5DC'}",
      floorType: "${settings.floorType || 'wood'}",
      seating: ${settings.furnitureVisible?.seating !== false},
      tables: ${settings.furnitureVisible?.tables !== false},
      storage: ${settings.furnitureVisible?.storage !== false},
      lighting: ${settings.furnitureVisible?.lighting !== false}
    };

    let controls, camera, renderer, scene;

    function initThree() {
      if (typeof THREE === 'undefined') {
        initFallbackCanvas();
        return;
      }

      try {
        const canvas = document.getElementById('viewCanvas');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xF7F8F4);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(${isWalkthrough ? '0, 1.6, 2' : '3.8, 3.2, 4.2'});

        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        if (THREE.OrbitControls) {
          controls = new THREE.OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.maxPolarAngle = Math.PI / 2 + 0.05;
          controls.minDistance = 1.2;
          controls.maxDistance = 10;
          ${isWalkthrough ? 'controls.target.set(0, 1.4, -2);' : 'controls.target.set(0, 0.7, 0);'}
        }

        // Lighting
        const ambient = new THREE.AmbientLight(0xFFFFFF, 0.7);
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xFFF7EB, 0.85);
        sun.position.set(4, 7, 3);
        sun.castShadow = true;
        scene.add(sun);

        // Floor
        const floorColor = settings.floorType === 'wood' ? 0xC2A278 : (settings.floorType === 'tile' ? 0xE5E7EB : 0x9CA3AF);
        const floorGeo = new THREE.PlaneGeometry(5.5, 5.5);
        const floorMat = new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.6 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Walls
        const wallMat = new THREE.MeshStandardMaterial({ color: settings.wallColor, roughness: 0.85 });
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.8, 0.12), wallMat);
        backWall.position.set(0, 1.4, -2.75);
        backWall.receiveShadow = true;
        scene.add(backWall);

        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 5.5), wallMat);
        leftWall.position.set(-2.75, 1.4, 0);
        leftWall.receiveShadow = true;
        scene.add(leftWall);

        // Window Frame on Left Wall
        const winMat = new THREE.MeshStandardMaterial({ color: 0x244C3E, roughness: 0.4 });
        const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 1.8), winMat);
        windowFrame.position.set(-2.7, 1.6, 0);
        scene.add(windowFrame);

        // Furniture
        const furnitureGroup = new THREE.Group();
        scene.add(furnitureGroup);

        if (settings.seating) {
          const sofaMat = new THREE.MeshStandardMaterial({ color: 0x476355, roughness: 0.7 });
          const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 0.85), sofaMat);
          sofaBase.position.set(0, 0.35, -1.9);
          sofaBase.castShadow = true;
          furnitureGroup.add(sofaBase);

          const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 0.25), sofaMat);
          sofaBack.position.set(0, 0.75, -2.2);
          sofaBack.castShadow = true;
          furnitureGroup.add(sofaBack);
        }

        if (settings.tables) {
          const tableMat = new THREE.MeshStandardMaterial({ color: 0x825E38, roughness: 0.5 });
          const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.6), tableMat);
          table.position.set(0, 0.18, -0.9);
          table.castShadow = true;
          furnitureGroup.add(table);
        }

        if (settings.storage) {
          const storageMat = new THREE.MeshStandardMaterial({ color: 0xE8ECE9, roughness: 0.6 });
          const storageUnit = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.0, 0.55), storageMat);
          storageUnit.position.set(2.0, 1.0, -2.2);
          storageUnit.castShadow = true;
          furnitureGroup.add(storageUnit);
        }

        if (settings.lighting) {
          const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.7), new THREE.MeshStandardMaterial({ color: 0x244C3E }));
          lampPole.position.set(-2.0, 0.85, -2.0);
          furnitureGroup.add(lampPole);

          const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0xFFF2D1, roughness: 0.3 }));
          lampShade.position.set(-2.0, 1.6, -2.0);
          furnitureGroup.add(lampShade);
        }

        // Rug
        const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshStandardMaterial({ color: 0xD6CFC0, roughness: 0.9 }));
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0, 0.015, -1.3);
        rug.receiveShadow = true;
        scene.add(rug);

        function animate() {
          requestAnimationFrame(animate);
          if (controls) controls.update();
          renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
      } catch (e) {
        initFallbackCanvas();
      }
    }

    // High-performance 2.5D Isometric Canvas fallback (zero CDN dependency)
    function initFallbackCanvas() {
      const canvas = document.getElementById('viewCanvas');
      const ctx = canvas.getContext('2d');
      let angle = 0.65;
      let isDragging = false;
      let lastX = 0;

      function resize() {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        draw();
      }

      function draw() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2 + 30;

        ctx.save();
        ctx.translate(cx, cy);

        // Isometric Floor
        ctx.fillStyle = settings.floorType === 'wood' ? '#C2A278' : '#E5E7EB';
        ctx.strokeStyle = '#B39167';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -90);
        ctx.lineTo(160, 0);
        ctx.lineTo(0, 90);
        ctx.lineTo(-160, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Back Wall
        ctx.fillStyle = settings.wallColor;
        ctx.beginPath();
        ctx.moveTo(0, -90);
        ctx.lineTo(160, 0);
        ctx.lineTo(160, -110);
        ctx.lineTo(0, -200);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Left Wall with Window
        ctx.fillStyle = '#E8E4DA';
        ctx.beginPath();
        ctx.moveTo(0, -90);
        ctx.lineTo(-160, 0);
        ctx.lineTo(-160, -110);
        ctx.lineTo(0, -200);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Window
        ctx.fillStyle = '#A7F3D0';
        ctx.beginPath();
        ctx.moveTo(-110, -70);
        ctx.lineTo(-50, -100);
        ctx.lineTo(-50, -50);
        ctx.lineTo(-110, -20);
        ctx.closePath();
        ctx.fill();

        // Sofa
        if (settings.seating) {
          ctx.fillStyle = '#3E5E4E';
          ctx.beginPath();
          ctx.moveTo(-30, -30);
          ctx.lineTo(40, 10);
          ctx.lineTo(20, 25);
          ctx.lineTo(-50, -15);
          ctx.closePath();
          ctx.fill();
        }

        // Table
        if (settings.tables) {
          ctx.fillStyle = '#825E38';
          ctx.fillRect(-15, 10, 30, 15);
        }

        ctx.restore();
      }

      window.addEventListener('resize', resize);
      resize();

      window.addEventListener('pointerdown', (e) => {
        isDragging = true;
        lastX = e.clientX;
      });
      window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        angle += dx * 0.01;
        draw();
      });
      window.addEventListener('pointerup', () => { isDragging = false; });
    }

    function resetView() {
      if (controls && camera) {
        camera.position.set(${isWalkthrough ? '0, 1.6, 2' : '3.8, 3.2, 4.2'});
        ${isWalkthrough ? 'controls.target.set(0, 1.4, -2);' : 'controls.target.set(0, 0.7, 0);'}
        controls.update();
      }
    }

    window.onload = initThree;
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
        allowFileAccess
        mixedContentMode="always"
        androidLayerType="hardware"
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
