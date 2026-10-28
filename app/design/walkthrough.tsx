import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { ThreeDView } from '../../src/components/ThreeDView';
import { Button } from '../../src/components/Button';

export default function WalkthroughScreen() {
  const router = useRouter();
  const { currentProject } = useDesignProject();

  const [cameraKey, setCameraKey] = useState(1);

  const settings = currentProject?.sceneSettings || {
    wallColor: '#EDF4EE',
    floorType: 'wood',
    lightingPreset: 'daylight',
    furnitureVisible: { seating: true, storage: true, tables: true, plants: true, lighting: true },
    cameraPreset: 'perspective',
  };

  const handleResetCamera = () => {
    setCameraKey(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Walkthrough Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>3D Space Walkthrough</Text>
        <TouchableOpacity style={styles.resetBtn} onPress={handleResetCamera}>
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Fullscreen 3D Scene */}
      <View style={styles.sceneContainer}>
        <ThreeDView
          key={cameraKey}
          settings={settings}
          isWalkthrough
          style={styles.canvas}
        />

        {/* Floating Walkthrough Controller Overlay */}
        <View style={styles.controlsOverlay}>
          <View style={styles.guidanceBox}>
            <Ionicons name="hand-left-outline" size={16} color="#FFFFFF" />
            <Text style={styles.guidanceText}>
              Drag across the screen to look around the room from eye level.
            </Text>
          </View>

          <View style={styles.bottomButtons}>
            <Button
              title="Reset Position"
              variant="outline"
              onPress={handleResetCamera}
              style={styles.btn}
            />
            <Button
              title="Exit Walkthrough"
              variant="primary"
              onPress={() => router.back()}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resetBtn: {
    padding: Spacing.xs,
  },
  sceneContainer: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    flex: 1,
    height: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  guidanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 54, 44, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Spacing.borderRadiusMd,
    gap: Spacing.xs,
  },
  guidanceText: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
  },
});
