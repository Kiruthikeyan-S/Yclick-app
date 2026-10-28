import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing, Shadows } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ImageCompare } from '../../src/components/ImageCompare';
import { Badge } from '../../src/components/Badge';

export default function DesignResultsScreen() {
  const router = useRouter();
  const { currentProject, selectVariant, isDemoGeneration } = useDesignProject();

  if (!currentProject) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Design Results" onBackPress={() => router.replace('/(tabs)')} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active design project available.</Text>
          <Button title="Start a New Project" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  const selectedVariant = currentProject.variants.find(v => v.id === currentProject.selectedVariantId) || currentProject.variants[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Redesign Results"
        subtitle="Visual architectural alternatives"
        onBackPress={() => router.replace('/(tabs)')}
        rightAction={
          <TouchableOpacity
            style={styles.actionCircleBtn}
            onPress={() => router.push('/design/export')}
          >
            <Ionicons name="share-outline" size={19} color={Colors.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Selected Variant Header */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <Badge label={selectedVariant.type} variant="primary" />
            <Badge label={currentProject.preferences.style} variant="secondary" />
          </View>
          <Text style={styles.projectTitle}>{currentProject.title}</Text>
          <View style={styles.budgetRow}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
            <Text style={styles.budgetEst}>Estimated Budget Range: {selectedVariant.estimatedBudgetRange}</Text>
          </View>
        </View>

        {/* 3-Tier Selector Tabs */}
        <View style={styles.tierSelectorWrapper}>
          <Text style={styles.tierSelectorHeader}>SELECT DESIGN TIER</Text>
          <View style={styles.tierSelectorRow}>
            {currentProject.variants.map((v) => {
              const isActive = v.id === selectedVariant.id;
              const shortName = v.type === 'Budget Refresh' ? 'Budget' : v.type === 'Balanced Makeover' ? 'Balanced' : 'Premium';
              return (
                <TouchableOpacity
                  key={v.id}
                  activeOpacity={0.75}
                  onPress={() => selectVariant(v.id)}
                  style={[styles.tierTab, isActive && styles.tierTabActive]}
                >
                  <Text style={[styles.tierTabTitle, isActive && styles.tierTabTitleActive]}>
                    {shortName}
                  </Text>
                  <Text style={[styles.tierTabSub, isActive && styles.tierTabSubActive]} numberOfLines={1}>
                    {v.estimatedBudgetRange.split('–')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Before / After Interactive Comparison */}
        <ImageCompare
          originalUri={currentProject.originalPhotoUri}
          redesignedUri={selectedVariant.imageUrl}
          originalLabel="Original Photo"
          redesignedLabel={selectedVariant.title}
        />

        {/* Summary of Proposed Changes */}
        <Card style={styles.card} variant="elevated">
          <Text style={styles.cardHeading}>Key Proposed Alterations</Text>
          <Text style={styles.cardSummary}>{selectedVariant.summary}</Text>

          <View style={styles.changesList}>
            {selectedVariant.proposedChanges.map((change, index) => (
              <View key={index} style={styles.changeItem}>
                <View style={styles.checkIconWrap}>
                  <Ionicons name="checkmark" size={13} color={Colors.primary} />
                </View>
                <Text style={styles.changeText}>{change}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Feature Hub Navigation Grid */}
        <View style={styles.hubGrid}>
          <TouchableOpacity
            style={styles.hubTile}
            activeOpacity={0.8}
            onPress={() => router.push('/design/options')}
          >
            <View style={styles.hubIconCircle}>
              <Ionicons name="layers-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.hubTitle}>Compare 3 Tiers</Text>
            <Text style={styles.hubDesc}>Budget, Balanced, Luxury</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            activeOpacity={0.8}
            onPress={() => router.push('/design/report')}
          >
            <View style={styles.hubIconCircle}>
              <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.hubTitle}>Action Report</Text>
            <Text style={styles.hubDesc}>Step-by-step guidance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            activeOpacity={0.8}
            onPress={() => router.push('/design/three-d')}
          >
            <View style={styles.hubIconCircle}>
              <Ionicons name="cube-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.hubTitle}>3D Room Scene</Text>
            <Text style={styles.hubDesc}>Rotate, customize colors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            activeOpacity={0.8}
            onPress={() => router.push('/design/products')}
          >
            <View style={styles.hubIconCircle}>
              <Ionicons name="pricetag-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.hubTitle}>Matching Products</Text>
            <Text style={styles.hubDesc}>Curated interior catalog</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <Button
            title="View Practical Improvement Report"
            onPress={() => router.push('/design/report')}
            style={styles.actionBtn}
          />
          <Button
            title="Explore Interactive 3D Room"
            variant="outline"
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  actionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: 6,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  budgetEst: {
    fontSize: 12.5,
    color: Colors.primary,
    fontWeight: '700',
  },
  tierSelectorWrapper: {
    marginBottom: Spacing.md,
  },
  tierSelectorHeader: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  tierSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tierTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.2,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  tierTabActive: {
    backgroundColor: Colors.subtleBackground,
    borderColor: Colors.primary,
  },
  tierTabTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tierTabTitleActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  tierTabSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  tierTabSubActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  changesList: {
    gap: Spacing.sm,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  changeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  hubTile: {
    width: '48.5%',
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    padding: Spacing.md,
    borderWidth: 1.2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  hubIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  hubTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  hubDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footerActions: {
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
