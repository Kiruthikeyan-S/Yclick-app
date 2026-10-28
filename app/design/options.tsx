import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing, Shadows } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';

export default function ThreeOptionsScreen() {
  const router = useRouter();
  const { currentProject, selectVariant } = useDesignProject();

  if (!currentProject) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Design Options" onBackPress={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No project loaded.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSelect = (variantId: string) => {
    selectVariant(variantId);
    router.push('/design/results');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Three Design Options"
        subtitle="Compare 3 distinct renovation tiers"
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/design/compare')}>
            <Text style={styles.compareLink}>Side-by-side</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentProject.variants.map((variant) => {
          const isSelected = currentProject.selectedVariantId === variant.id;

          return (
            <Card
              key={variant.id}
              style={[styles.variantCard, isSelected ? styles.selectedVariantCard : null]}
              variant="elevated"
            >
              <Image source={{ uri: variant.imageUrl }} style={styles.variantImage} resizeMode="cover" />

              <View style={styles.cardBody}>
                <View style={styles.badgeRow}>
                  <Badge
                    label={variant.type}
                    variant={variant.type === 'Budget Refresh' ? 'secondary' : variant.type === 'Balanced Makeover' ? 'primary' : 'warning'}
                  />
                  {isSelected ? (
                    <Badge label="Active Selection" variant="success" />
                  ) : null}
                </View>

                <Text style={styles.variantTitle}>{variant.title}</Text>
                <Text style={styles.variantSummary}>{variant.summary}</Text>

                <View style={styles.budgetBox}>
                  <Text style={styles.budgetLabel}>Estimated Budget:</Text>
                  <Text style={styles.budgetAmount}>{variant.estimatedBudgetRange}</Text>
                </View>

                <View style={styles.changesSection}>
                  <Text style={styles.changesTitle}>Key Modifications:</Text>
                  {variant.proposedChanges.map((change, idx) => (
                    <View key={idx} style={styles.changeBulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.changeText}>{change}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.btnRow}>
                  <Button
                    title={isSelected ? 'Selected Active Design' : 'Select This Design'}
                    variant={isSelected ? 'primary' : 'outline'}
                    onPress={() => handleSelect(variant.id)}
                    style={styles.actionBtn}
                  />
                  <Button
                    title="View Report"
                    variant="ghost"
                    onPress={() => router.push('/design/report')}
                    style={styles.reportBtn}
                  />
                </View>
              </View>
            </Card>
          );
        })}
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
    gap: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  compareLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  variantCard: {
    padding: 0,
    overflow: 'hidden',
  },
  selectedVariantCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  variantImage: {
    width: '100%',
    height: 190,
    backgroundColor: Colors.subtleBackground,
  },
  cardBody: {
    padding: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  variantTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  variantSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.subtleBackground,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Spacing.borderRadiusSm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  budgetLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  budgetAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  changesSection: {
    marginBottom: Spacing.md,
  },
  changesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  changeBulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bulletDot: {
    color: Colors.primary,
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  changeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
  },
  reportBtn: {
    paddingHorizontal: Spacing.sm,
  },
});
