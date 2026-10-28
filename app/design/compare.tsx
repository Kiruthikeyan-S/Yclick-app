import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';

export default function CompareScreen() {
  const router = useRouter();
  const { currentProject, selectVariant } = useDesignProject();

  if (!currentProject) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Comparison" onBackPress={() => router.back()} />
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
      <Header title="Design Comparison" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Compare Renovation Directions</Text>
        <Text style={styles.subheading}>
          Evaluate trade-offs between cost, scope, and visual transformation.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalTable}>
          {currentProject.variants.map((variant) => {
            const isSelected = currentProject.selectedVariantId === variant.id;

            return (
              <Card
                key={variant.id}
                style={[styles.colCard, isSelected ? styles.colCardActive : null]}
                variant="elevated"
              >
                <Image source={{ uri: variant.imageUrl }} style={styles.colImage} resizeMode="cover" />

                <View style={styles.colPadding}>
                  <Badge label={variant.type} variant={isSelected ? 'primary' : 'secondary'} />
                  <Text style={styles.colTitle}>{variant.title}</Text>

                  {/* Budget */}
                  <View style={styles.fieldBox}>
                    <Text style={styles.fieldLabel}>ESTIMATED BUDGET</Text>
                    <Text style={styles.fieldValue}>{variant.estimatedBudgetRange}</Text>
                  </View>

                  {/* Key Alterations */}
                  <View style={styles.fieldBox}>
                    <Text style={styles.fieldLabel}>PRIMARY FOCUS</Text>
                    <Text style={styles.fieldSubvalue}>{variant.summary}</Text>
                  </View>

                  {/* Pros */}
                  <View style={styles.fieldBox}>
                    <Text style={styles.fieldLabel}>ADVANTAGES</Text>
                    {variant.pros.map((p, i) => (
                      <Text key={i} style={styles.bulletItem}>+ {p}</Text>
                    ))}
                  </View>

                  {/* Limitations */}
                  <View style={styles.fieldBox}>
                    <Text style={styles.fieldLabel}>LIMITATIONS</Text>
                    {variant.limitations.map((lim, i) => (
                      <Text key={i} style={styles.bulletItemMuted}>- {lim}</Text>
                    ))}
                  </View>

                  <Button
                    title={isSelected ? 'Selected' : 'Choose Option'}
                    variant={isSelected ? 'primary' : 'outline'}
                    onPress={() => handleSelect(variant.id)}
                    style={styles.chooseBtn}
                  />
                </View>
              </Card>
            );
          })}
        </ScrollView>
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
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subheading: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  horizontalTable: {
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  colCard: {
    width: 270,
    padding: 0,
    overflow: 'hidden',
  },
  colCardActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  colImage: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.subtleBackground,
  },
  colPadding: {
    padding: Spacing.md,
  },
  colTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  fieldBox: {
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  fieldSubvalue: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  bulletItem: {
    fontSize: 12,
    color: Colors.success,
    lineHeight: 16,
    marginTop: 2,
  },
  bulletItemMuted: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  chooseBtn: {
    width: '100%',
    marginTop: Spacing.sm,
  },
});
