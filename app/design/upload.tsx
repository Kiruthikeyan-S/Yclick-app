import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Header } from '../../src/components/Header';

export default function UploadProgressScreen() {
  const router = useRouter();
  const { preferences } = useDesignProject();

  const [progress, setProgress] = useState(0.2);
  const [statusMessage, setStatusMessage] = useState('Preparing image for analysis...');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Simulated upload progression to backend storage
    const t1 = setTimeout(() => {
      setProgress(0.6);
      setStatusMessage('Optimizing resolution and spatial geometry...');
    }, 700);

    const t2 = setTimeout(() => {
      setProgress(1.0);
      setStatusMessage('Upload complete!');
    }, 1400);

    const t3 = setTimeout(() => {
      router.replace('/design/preferences');
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Photo Upload" showBack={false} />
      <View style={styles.container}>
        <Card style={styles.card} variant="elevated">
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-upload-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Processing Photo</Text>
          <Text style={styles.subtitle}>{statusMessage}</Text>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>

          <Text style={styles.percentageText}>{Math.round(progress * 100)}%</Text>

          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => router.back()}
            style={styles.cancelBtn}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.subtleBackground,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  cancelBtn: {
    marginTop: Spacing.sm,
  },
});
