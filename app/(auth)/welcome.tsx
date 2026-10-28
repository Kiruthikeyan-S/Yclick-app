import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { BrandLogo } from '../../src/components/BrandLogo';

export default function WelcomeScreen() {
  const router = useRouter();

  const benefits = [
    {
      icon: 'eye-outline' as const,
      title: 'Visualize',
      description: 'Upload a photo of your actual space and see three realistic redesign options.',
    },
    {
      icon: 'construct-outline' as const,
      title: 'Improve',
      description: 'Receive practical, prioritized advice on lighting, furniture arrangement, and storage.',
    },
    {
      icon: 'compass-outline' as const,
      title: 'Plan',
      description: 'Explore your space in interactive 3D and discover curated matching products.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <BrandLogo size={74} />
          <Text style={styles.title}>YClick</Text>
          <Text style={styles.subtitle}>Photograph real spaces. Redesign with AI.</Text>
        </View>

        {/* 3 Main Benefits */}
        <View style={styles.benefitsContainer}>
          {benefits.map((item, index) => (
            <Card key={index} style={styles.benefitCard} variant="outlined">
              <View style={styles.benefitIconCircle}>
                <Ionicons name={item.icon} size={22} color={Colors.primary} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{item.title}</Text>
                <Text style={styles.benefitDesc}>{item.description}</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/signup')}
            style={styles.actionButton}
          />
          <Button
            title="Sign In"
            variant="outline"
            onPress={() => router.push('/(auth)/login')}
            style={styles.actionButton}
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
    flexGrow: 1,
    padding: Spacing.screenPadding,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  benefitsContainer: {
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  benefitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
});
