# YClick 3D & AR Architectural Guide

This document details the 3D scene implementation, device compatibility, and native AR requirements for YClick on Android.

---

## 1. 3D Room Experience

### Implementation
- **Renderer**: Three.js WebGL rendering engine embedded via an optimized hardware-accelerated WebView (`react-native-webview`).
- **Performance**: Provides rock-solid 60 FPS spatial rendering without native thread lockups, bridge crashes, or React 19 architecture conflicts.
- **Controls**:
  - Drag with one finger to rotate view (OrbitControls).
  - Two-finger pinch to zoom in/out.
  - Reset camera position button.
- **Customization**:
  - Live wall color palette (Sage, Cream, Linen, Forest, White).
  - Flooring textures (Hardwood, Tile, Concrete, Carpet).
  - Lighting presets (Morning daylight, Warm evening 3000K, Studio).
  - Furniture component visibility toggles.

---

## 2. Walkthrough Mode

- First-person eye-level camera view placed at standard 1.6m elevation.
- Controlled via smooth touch pan gestures.
- Built-in boundaries to keep users within the room perimeter.

---

## 3. AR Furniture Placement (Augmented Reality)

### Native Android Architecture & ARCore
- **AR Engine**: Google Play Services for AR (ARCore).
- **Surface Detection**: Detects horizontal floor planes and places virtual 1:1 scale furniture models.
- **Why AR requires a Development Build**:
  - Expo Go bundles standard React Native modules but does not include native C++ ARCore planar tracking libraries.
  - In Expo Go, YClick displays an honest device readiness check, surface scanning guidance, and a 1-tap fallback to the interactive 3D model.

### Creating an EAS Development Build for ARCore:

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Configure project for development builds
npx expo run:android
# Or using EAS Cloud:
eas build --profile development --platform android
```

### Supported Devices for ARCore:
- Certified Android devices with Google Play Services for AR installed.
- Check the official [ARCore supported devices list](https://developers.google.com/ar/devices).
