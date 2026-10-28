import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function GeneratingDesignScreen() {
  const router = useRouter();
  const { startGeneration, status, errorMessage } = useDesignProject();

  const [phaseMessage, setPhaseMessage] = useState('Analyzing spatial boundaries and room geometry...');
  const isStarted = useRef(false);

  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;

    // Progression of descriptive activity phases
    const t1 = setTimeout(() => {
      setPhaseMessage('Extracting architectural features, windows & light sources...');
    }, 1500);

    const t2 = setTimeout(() => {
      setPhaseMessage('Generating 3 distinctive design directions: Budget, Balanced & Premium...');
    }, 3200);

    const t3 = setTimeout(() => {
      setPhaseMessage('Formulating practical improvement advice & matching products...');
    }, 4800);

    // Call generation
    const execute = async () => {
      const success = await startGeneration();
      if (success) {
        router.replace('/design/results');
      } else {
        router.replace('/design/error');
      }
    };

    execute();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Card style={styles.card} variant="elevated">
          <View style={styles.spinnerWrapper}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>

          <Text style={styles.title}>Designing Your Space</Text>
          <Text style={styles.statusText}>{phaseMessage}</Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.secondary} />
            <Text style={styles.infoText}>
              High-resolution spatial synthesis can take a few moments. Please keep the app open.
            </Text>
          </View>

          <Button
            title="Cancel Generation"
            variant="ghost"
            onPress={() => router.replace('/(tabs)')}
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  spinnerWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statusText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    minHeight: 40,
    lineHeight: 20,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.subtleBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  cancelBtn: {
    marginTop: Spacing.xs,
  },
});
