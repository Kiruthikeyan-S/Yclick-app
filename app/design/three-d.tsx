import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ThreeDView } from '../../src/components/ThreeDView';

export default function ThreeDPreviewScreen() {
  const router = useRouter();
  const { currentProject, updateSceneSettings } = useDesignProject();

  const settings = currentProject?.sceneSettings || {
    wallColor: '#EDF4EE',
    floorType: 'wood',
    lightingPreset: 'daylight',
    furnitureVisible: { seating: true, storage: true, tables: true, plants: true, lighting: true },
    cameraPreset: 'perspective',
  };

  const [activeWallColor, setActiveWallColor] = useState(settings.wallColor);

  const wallColors = [
    { label: 'Subtle Sage', hex: '#EDF4EE' },
    { label: 'Warm Cream', hex: '#FDFBF7' },
    { label: 'Earthy Linen', hex: '#EAE5D9' },
    { label: 'Forest Green', hex: '#244C3E' },
    { label: 'Muted Slate', hex: '#D1DCD5' },
  ];

  const handleColorChange = (hex: string) => {
    setActiveWallColor(hex);
    updateSceneSettings({ wallColor: hex });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="3D Room Preview"
        subtitle="Interactive spatial model"
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/design/customize-three-d')}>
            <Ionicons name="options-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Interactive 3D Canvas */}
        <ThreeDView
          settings={{ ...settings, wallColor: activeWallColor }}
          style={styles.canvasContainer}
        />

        {/* Disclaimer */}
        <Card style={styles.disclaimerCard} variant="subtle">
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.disclaimerText}>
            This interactive 3D scene demonstrates layout, proportions, and lighting principles. It is a procedural design model, not a 1:1 reconstruction of your photograph.
          </Text>
        </Card>

        {/* Quick Wall Color Customizer */}
        <View style={styles.colorSection}>
          <Text style={styles.sectionTitle}>Wall Finish & Tone</Text>
          <View style={styles.colorRow}>
            {wallColors.map((c) => {
              const isSelected = activeWallColor === c.hex;
              return (
                <TouchableOpacity
                  key={c.hex}
                  onPress={() => handleColorChange(c.hex)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c.hex },
                    isSelected && styles.colorCircleSelected,
                  ]}
                >
                  {isSelected ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={c.hex === '#244C3E' ? '#FFFFFF' : Colors.primary}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Actions Grid */}
        <View style={styles.actionGrid}>
          <Button
            title="First-Person Walkthrough"
            icon={<Ionicons name="walk-outline" size={18} color={Colors.textLight} />}
            onPress={() => router.push('/design/walkthrough')}
            style={styles.actionBtn}
          />
          <Button
            title="Customize 3D Layout & Furniture"
            variant="outline"
            icon={<Ionicons name="construct-outline" size={18} color={Colors.primary} />}
            onPress={() => router.push('/design/customize-three-d')}
            style={styles.actionBtn}
          />
          <Button
            title="Explore AR Placement (Experimental)"
            variant="ghost"
            icon={<Ionicons name="cube-outline" size={18} color={Colors.primary} />}
            onPress={() => router.push('/design/ar')}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
  },
  canvasContainer: {
    height: 320,
    marginBottom: Spacing.md,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  colorSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  actionGrid: {
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
