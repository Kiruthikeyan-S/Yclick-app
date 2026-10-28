import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { preferences, setPhotoUri } = useDesignProject();
  const [rotationDegree, setRotationDegree] = useState(0);

  const photoUri = preferences.photoUri;

  const handleRetake = () => {
    router.replace('/design/camera');
  };

  const handleChooseAnother = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!res.canceled && res.assets && res.assets[0]) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const handleRotate = () => {
    setRotationDegree(prev => (prev + 90) % 360);
  };

  const handleContinue = () => {
    if (!photoUri) {
      Alert.alert('Photo Missing', 'Please select or take a photo first.');
      return;
    }
    // Proceed to preferences setup
    router.push('/design/preferences');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Preview Photo" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Stage */}
        <View style={styles.previewContainer}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={[
                styles.previewImage,
                { transform: [{ rotate: `${rotationDegree}deg` }] },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noPhoto}>
              <Text style={styles.noPhotoText}>No photo selected</Text>
            </View>
          )}

          {/* Quick Edit Overlay */}
          <TouchableOpacity
            style={styles.rotateOverlayBtn}
            onPress={handleRotate}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.rotateText}>Rotate</Text>
          </TouchableOpacity>
        </View>

        {/* Validation Info */}
        <Card style={styles.infoCard} variant="subtle">
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.infoText}>Photo ready for AI spatial analysis.</Text>
          </View>
          <Text style={styles.infoSubtext}>
            Your original photograph is preserved safely. It will not be modified or shared without your permission.
          </Text>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Use This Photo"
            onPress={handleContinue}
            style={styles.primaryAction}
          />

          <View style={styles.secondaryRow}>
            <Button
              title="Retake"
              variant="outline"
              onPress={handleRetake}
              icon={<Ionicons name="camera-outline" size={18} color={Colors.primary} />}
              style={styles.halfBtn}
            />
            <Button
              title="Change Photo"
              variant="outline"
              onPress={handleChooseAnother}
              icon={<Ionicons name="images-outline" size={18} color={Colors.primary} />}
              style={styles.halfBtn}
            />
          </View>
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
    paddingBottom: Spacing.xl,
  },
  previewContainer: {
    width: '100%',
    height: 340,
    borderRadius: Spacing.borderRadiusLg,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noPhoto: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoText: {
    color: '#FFF',
    fontSize: 14,
  },
  rotateOverlayBtn: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(32, 54, 44, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Spacing.borderRadiusSm,
  },
  rotateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionsContainer: {
    gap: Spacing.sm,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
});
