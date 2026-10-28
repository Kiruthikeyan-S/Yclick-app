import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function GenerationErrorScreen() {
  const router = useRouter();
  const { errorMessage, resetWorkflow } = useDesignProject();

  const displayMessage = errorMessage || 
    'We could not reach the design processing service. Please check your network connection or verify that the backend server is running.';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Card style={styles.card} variant="elevated">
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          </View>

          <Text style={styles.title}>Generation Encountered an Issue</Text>
          <Text style={styles.message}>{displayMessage}</Text>

          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>Troubleshooting:</Text>
            <Text style={styles.helpBullet}>• Ensure your device is connected to the internet.</Text>
            <Text style={styles.helpBullet}>• Ensure the backend FastAPI server is running if testing locally.</Text>
            <Text style={styles.helpBullet}>• Make sure the photo is well lit and shows the room clearly.</Text>
          </View>

          <View style={styles.actionStack}>
            <Button
              title="Retry Generation"
              onPress={() => router.replace('/design/generating')}
              style={styles.actionBtn}
            />
            <Button
              title="Edit Preferences"
              variant="outline"
              onPress={() => router.replace('/design/preferences')}
              style={styles.actionBtn}
            />
            <Button
              title="Return to Home"
              variant="ghost"
              onPress={() => {
                resetWorkflow();
                router.replace('/(tabs)');
              }}
              style={styles.actionBtn}
            />
          </View>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.errorBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  helpBox: {
    width: '100%',
    backgroundColor: Colors.subtleBackground,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadiusMd,
    marginBottom: Spacing.lg,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  helpBullet: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionStack: {
    width: '100%',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
