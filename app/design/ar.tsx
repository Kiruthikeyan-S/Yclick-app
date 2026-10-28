import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';

export default function ARScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [activeTab, setActiveTab] = useState<'info' | 'live'>('info');
  const [selectedFurniture, setSelectedFurniture] = useState('Nordic Accent Chair');

  const furnitureList = [
    { id: '1', name: 'Nordic Accent Chair', dimensions: '80cm x 75cm x 85cm' },
    { id: '2', name: 'Minimalist Floor Lamp', dimensions: '40cm x 40cm x 160cm' },
    { id: '3', name: 'Solid Oak Coffee Table', dimensions: '110cm x 60cm x 45cm' },
    { id: '4', name: 'Modular Floating Shelf', dimensions: '90cm x 22cm x 30cm' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Augmented Reality (AR)"
        subtitle="Real-world furniture placement"
        onBackPress={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Device & Technology Status Card */}
        <Card style={styles.statusCard} variant="elevated">
          <View style={styles.statusHeader}>
            <View style={styles.statusDot} />
            <Text style={styles.statusTitle}>Android ARCore Native Capability</Text>
          </View>
          <Text style={styles.statusBody}>
            Full native plane detection and surface anchor tracking requires Google Play Services for AR (ARCore) on a certified Android device with an EAS Development Build.
          </Text>
          <View style={styles.tagWrap}>
            <Badge label="Expo Go: Guidance & 3D Mode" variant="secondary" />
            <Badge label="Dev Build: Native ARCore" variant="primary" />
          </View>
        </Card>

        {/* Selected Virtual Furniture */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Item for Surface Placement</Text>
          <View style={styles.furnitureList}>
            {furnitureList.map((item) => {
              const isSelected = selectedFurniture === item.name;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedFurniture(item.name)}
                  style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons
                      name="cube-outline"
                      size={20}
                      color={isSelected ? Colors.primary : Colors.textSecondary}
                    />
                    <View>
                      <Text style={[styles.itemName, isSelected && styles.itemNameActive]}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemDim}>{item.dimensions}</Text>
                    </View>
                  </View>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* AR Guidance Steps */}
        <Card style={styles.guideCard} variant="subtle">
          <Text style={styles.guideHeading}>Floor Surface Placement Guidelines</Text>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>1.</Text>
            <Text style={styles.stepText}>
              Ensure the room is brightly lit without direct sunlight glare on reflective floor tiles.
            </Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>2.</Text>
            <Text style={styles.stepText}>
              Point the camera at an open floor area and pan slowly in circular motions to detect anchor points.
            </Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>3.</Text>
            <Text style={styles.stepText}>
              Tap the detected grid to anchor {selectedFurniture} at full 1:1 physical scale.
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Launch Camera Surface Detection"
            icon={<Ionicons name="camera-outline" size={18} color={Colors.textLight} />}
            onPress={async () => {
              if (!permission?.granted) {
                const res = await requestPermission();
                if (!res.granted) {
                  Alert.alert('Permission Required', 'Camera permission is needed for AR.');
                  return;
                }
              }
              Alert.alert(
                'AR Surface Scanner',
                `Ready to place "${selectedFurniture}". In development builds with ARCore, this renders a native GL plane anchor. Tap OK to explore in 3D preview.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open 3D Model', onPress: () => router.push('/design/three-d') },
                ]
              );
            }}
            style={styles.actionBtn}
          />

          <Button
            title="Open Interactive 3D Room Instead"
            variant="outline"
            icon={<Ionicons name="cube-outline" size={18} color={Colors.primary} />}
            onPress={() => router.push('/design/three-d')}
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
  statusCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  tagWrap: {
    flexDirection: 'row',
    gap: Spacing.xs,
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
  furnitureList: {
    gap: Spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  itemCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.subtleBackground,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemNameActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  itemDim: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guideCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  guideHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    width: 18,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actions: {
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
