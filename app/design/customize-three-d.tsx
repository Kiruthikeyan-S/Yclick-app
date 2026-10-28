import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { SelectionChip } from '../../src/components/SelectionChip';

export default function CustomizeThreeDScreen() {
  const router = useRouter();
  const { currentProject, updateSceneSettings } = useDesignProject();

  const initialSettings = currentProject?.sceneSettings || {
    wallColor: '#EDF4EE',
    floorType: 'wood',
    lightingPreset: 'daylight',
    furnitureVisible: { seating: true, storage: true, tables: true, plants: true, lighting: true },
    cameraPreset: 'perspective',
  };

  const [wallColor, setWallColor] = useState(initialSettings.wallColor);
  const [floorType, setFloorType] = useState(initialSettings.floorType);
  const [lightingPreset, setLightingPreset] = useState(initialSettings.lightingPreset);
  const [furnitureVisible, setFurnitureVisible] = useState(initialSettings.furnitureVisible);

  const wallColors = [
    { label: 'Subtle Sage', hex: '#EDF4EE' },
    { label: 'Warm Cream', hex: '#FDFBF7' },
    { label: 'Linen Beige', hex: '#EAE5D9' },
    { label: 'Deep Forest', hex: '#244C3E' },
    { label: 'Clean White', hex: '#FFFFFF' },
  ];

  const handleToggleFurniture = (key: keyof typeof furnitureVisible) => {
    setFurnitureVisible(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    updateSceneSettings({
      wallColor,
      floorType,
      lightingPreset,
      furnitureVisible,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Customize 3D Scene" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Notice */}
        <Card style={styles.noticeCard} variant="subtle">
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.noticeText}>
            Customizations adjust the 3D exploration preview to help evaluate layout options. They do not edit your original photo.
          </Text>
        </Card>

        {/* Wall Tone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Wall Color Finish</Text>
          <View style={styles.colorRow}>
            {wallColors.map((c) => {
              const isSelected = wallColor === c.hex;
              return (
                <TouchableOpacity
                  key={c.hex}
                  onPress={() => setWallColor(c.hex)}
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

        {/* Floor Material */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Floor Texture & Finish</Text>
          <View style={styles.chipGrid}>
            {[
              { id: 'wood', label: 'Warm Hardwood' },
              { id: 'tile', label: 'Ceramic Light Tile' },
              { id: 'concrete', label: 'Polished Concrete' },
              { id: 'carpet', label: 'Woven Texture Carpet' },
            ].map((f) => (
              <SelectionChip
                key={f.id}
                label={f.label}
                selected={floorType === f.id}
                onPress={() => setFloorType(f.id as any)}
              />
            ))}
          </View>
        </View>

        {/* Lighting Atmosphere */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Ambient Lighting Preset</Text>
          <View style={styles.chipGrid}>
            {[
              { id: 'daylight', label: 'Natural Morning Daylight (5500K)' },
              { id: 'warm-evening', label: 'Warm Evening Ambient (3000K)' },
              { id: 'bright-studio', label: 'Bright Architectural Studio' },
            ].map((l) => (
              <SelectionChip
                key={l.id}
                label={l.label}
                selected={lightingPreset === l.id}
                onPress={() => setLightingPreset(l.id as any)}
              />
            ))}
          </View>
        </View>

        {/* Furniture Visibility Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Toggle Virtual Furniture Elements</Text>
          <Card style={styles.toggleCard} variant="elevated">
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Primary Seating (Sofa / Lounge)</Text>
              <Switch
                value={furnitureVisible.seating}
                onValueChange={() => handleToggleFurniture('seating')}
                thumbColor={furnitureVisible.seating ? Colors.primary : Colors.disabled}
                trackColor={{ false: Colors.border, true: Colors.subtleBackground }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Table & Surface Desk</Text>
              <Switch
                value={furnitureVisible.tables}
                onValueChange={() => handleToggleFurniture('tables')}
                thumbColor={furnitureVisible.tables ? Colors.primary : Colors.disabled}
                trackColor={{ false: Colors.border, true: Colors.subtleBackground }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Storage & Wardrobe Cabinet</Text>
              <Switch
                value={furnitureVisible.storage}
                onValueChange={() => handleToggleFurniture('storage')}
                thumbColor={furnitureVisible.storage ? Colors.primary : Colors.disabled}
                trackColor={{ false: Colors.border, true: Colors.subtleBackground }}
              />
            </View>

            <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.switchLabel}>Floor Lamp & Ambient Fixtures</Text>
              <Switch
                value={furnitureVisible.lighting}
                onValueChange={() => handleToggleFurniture('lighting')}
                thumbColor={furnitureVisible.lighting ? Colors.primary : Colors.disabled}
                trackColor={{ false: Colors.border, true: Colors.subtleBackground }}
              />
            </View>
          </Card>
        </View>

        {/* Save Changes */}
        <Button
          title="Apply & Save to 3D Scene"
          onPress={handleSave}
          style={styles.saveBtn}
        />
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
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleCard: {
    padding: Spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  saveBtn: {
    width: '100%',
    marginTop: Spacing.md,
  },
});
