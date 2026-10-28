import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function AddPhotoScreen() {
  const router = useRouter();
  const { preferences, setPhotoUri } = useDesignProject();
  const [loading, setLoading] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Access Required',
          'YClick requires gallery permissions to select room photos. Please grant access in your device settings.'
        );
        return;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      setLoading(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        router.push('/design/preview');
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Selection Error', err.message || 'Could not select photo.');
    }
  };

  const handleUseSamplePhoto = () => {
    // Curated high quality room photo for testing when running on emulator without a physical camera
    const sampleUri = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
    setPhotoUri(sampleUri);
    router.push('/design/preview');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Add Space Photo" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerArea}>
          <Text style={styles.heading}>Capture your space</Text>
          <Text style={styles.subtitle}>
            Take a new photo or select one from your gallery. We'll use this photo to visualize redesigns and generate improvement recommendations.
          </Text>
        </View>

        {/* Action Options */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push('/design/camera')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Take Photo</Text>
            <Text style={styles.actionSubtitle}>Use camera to photograph your room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={handlePickFromGallery}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="images-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Upload from Gallery</Text>
            <Text style={styles.actionSubtitle}>Select an existing image from your phone</Text>
          </TouchableOpacity>
        </View>

        {/* Photography Tips Card */}
        <Card style={styles.tipsCard} variant="subtle">
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
            <Text style={styles.tipsTitle}>Tips for Best AI Results</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Stand in a corner: </Text>
              Capturing two adjacent walls and the floor provides the best spatial depth.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Natural daylight: </Text>
              Open curtains and turn on room lights to avoid dark, grainy shadows.
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>Eye-level angle: </Text>
              Hold your phone level with your chest rather than tilting downward.
            </Text>
          </View>
        </Card>

        {/* Emulator/Desktop Testing Shortcut */}
        <TouchableOpacity style={styles.sampleButton} onPress={handleUseSamplePhoto}>
          <Text style={styles.sampleButtonText}>
            Or use a sample room photo (recommended for emulator testing)
          </Text>
        </TouchableOpacity>
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
    paddingBottom: Spacing.xl,
  },
  headerArea: {
    marginBottom: Spacing.lg,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tipsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 6,
    lineHeight: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tipBold: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sampleButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  sampleButtonText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
