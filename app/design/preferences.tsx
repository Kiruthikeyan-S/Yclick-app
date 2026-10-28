import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { DESIGN_STYLES, BUDGET_CHOICES, ITEMS_TO_KEEP_OPTIONS, IMPROVEMENT_GOALS_OPTIONS, CONSTRAINT_OPTIONS } from '../../src/constants/preferences';
import { DesignStyle, BudgetChoice } from '../../src/types';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { SelectionChip } from '../../src/components/SelectionChip';

export default function PreferencesScreen() {
  const router = useRouter();
  const { preferences, updatePreferences, setConsent } = useDesignProject();

  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>(preferences.style);
  const [selectedBudget, setSelectedBudget] = useState<BudgetChoice>(preferences.budgetChoice);
  const [customBudgetVal, setCustomBudgetVal] = useState(preferences.customBudget || '');
  const [itemsToKeep, setItemsToKeep] = useState<string[]>(preferences.itemsToKeep);
  const [improvementGoals, setImprovementGoals] = useState<string[]>(preferences.improvementGoals);
  const [constraints, setConstraints] = useState<string[]>(preferences.constraints);
  const [additionalNotes, setAdditionalNotes] = useState(preferences.additionalNotes || '');
  const [measurements, setMeasurements] = useState(preferences.roomMeasurements || '');
  const [cityPincode, setCityPincode] = useState(preferences.cityPincode || '');
  const [consentGiven, setConsentGiven] = useState(preferences.consentGiven);

  const toggleItemToKeep = (item: string) => {
    setItemsToKeep(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleGoal = (goal: string) => {
    setImprovementGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleConstraint = (c: string) => {
    setConstraints(prev =>
      prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c]
    );
  };

  const handleNext = () => {
    if (!consentGiven) {
      Alert.alert(
        'Consent Required',
        'Please confirm your consent to process your room photograph with AI to generate design suggestions.'
      );
      return;
    }

    updatePreferences({
      style: selectedStyle,
      budgetChoice: selectedBudget,
      customBudget: customBudgetVal,
      itemsToKeep,
      improvementGoals,
      constraints,
      additionalNotes,
      roomMeasurements: measurements,
      cityPincode,
      consentGiven: true,
    });
    setConsent(true);

    router.push('/design/category-questions');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Space & Style" subtitle="Step 2 of 4 • Calibrate Parameters" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Space Preview Banner */}
        <View style={styles.previewBanner}>
          <Image
            source={{
              uri: preferences.photoUri || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
            }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.bannerBadge}>
            <Ionicons name="sparkles" size={12} color="#A7F3D0" />
            <Text style={styles.bannerBadgeText}>Active Spatial Canvas</Text>
          </View>
        </View>
        {/* Style Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Preferred Aesthetic / Style</Text>
          <Text style={styles.sectionSubtitle}>Select an aesthetic direction or let AI choose for you:</Text>
          <View style={styles.chipGrid}>
            {DESIGN_STYLES.map((st) => (
              <SelectionChip
                key={st.label}
                label={st.label}
                selected={selectedStyle === st.label}
                onPress={() => setSelectedStyle(st.label)}
              />
            ))}
          </View>
        </View>

        {/* Budget Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Approximate Target Budget</Text>
          <Text style={styles.sectionSubtitle}>
            These ranges help guide recommendations and are not guaranteed renovation fees:
          </Text>
          <View style={styles.chipGrid}>
            {BUDGET_CHOICES.map((b) => (
              <SelectionChip
                key={b}
                label={b}
                selected={selectedBudget === b}
                onPress={() => setSelectedBudget(b)}
              />
            ))}
          </View>
          {selectedBudget === 'Custom budget' ? (
            <Input
              label="Custom Budget Amount (₹)"
              placeholder="e.g. ₹40,000"
              value={customBudgetVal}
              onChangeText={setCustomBudgetVal}
              keyboardType="numeric"
            />
          ) : null}
        </View>

        {/* Items to Keep */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Items to Keep (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            What should remain in place during the redesign?
          </Text>
          <View style={styles.chipGrid}>
            {ITEMS_TO_KEEP_OPTIONS.map((item) => (
              <SelectionChip
                key={item}
                label={item}
                selected={itemsToKeep.includes(item)}
                onPress={() => toggleItemToKeep(item)}
              />
            ))}
          </View>
        </View>

        {/* Improvement Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Priority Goals</Text>
          <Text style={styles.sectionSubtitle}>
            What improvements would make the biggest difference?
          </Text>
          <View style={styles.chipGrid}>
            {IMPROVEMENT_GOALS_OPTIONS.map((goal) => (
              <SelectionChip
                key={goal}
                label={goal}
                selected={improvementGoals.includes(goal)}
                onPress={() => toggleGoal(goal)}
              />
            ))}
          </View>
        </View>

        {/* Constraints */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Practical Conditions & Constraints</Text>
          <View style={styles.chipGrid}>
            {CONSTRAINT_OPTIONS.map((c) => (
              <SelectionChip
                key={c}
                label={c}
                selected={constraints.includes(c)}
                onPress={() => toggleConstraint(c)}
              />
            ))}
          </View>
        </View>

        {/* Optional Room Measurements & City */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Optional Room Dimensions & Location</Text>
          <Text style={styles.sectionSubtitle}>
            Used for 3D scale accuracy and local cost estimates. You can leave these blank:
          </Text>
          <Input
            label="Approximate Dimensions (Optional)"
            placeholder="e.g. 12ft x 14ft or 15 sqm"
            value={measurements}
            onChangeText={setMeasurements}
          />
          <Input
            label="City or PIN Code (Optional)"
            placeholder="e.g. Mumbai, 400001"
            value={cityPincode}
            onChangeText={setCityPincode}
          />
        </View>

        {/* Additional Instructions */}
        <View style={styles.section}>
          <Input
            label="Additional Notes for the AI Architect"
            placeholder="e.g. We love indoor plants, need kid-friendly corners, and prefer soft warm lighting."
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={3}
            containerStyle={{ minHeight: 90 }}
          />
        </View>

        {/* Consent Checkbox */}
        <Card style={styles.consentCard} variant="outlined">
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => setConsentGiven(!consentGiven)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, consentGiven && styles.checkboxActive]}>
              {consentGiven ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <View style={styles.consentTextWrap}>
              <Text style={styles.consentTitle}>Explicit Photo Processing Consent</Text>
              <Text style={styles.consentDesc}>
                I authorize YClick to securely process my uploaded room photo with AI to create redesign options and practical recommendations. Photos remain private to my account.
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Continue Button */}
        <Button
          title="Generate 3 Spatial Concepts →"
          onPress={handleNext}
          style={styles.submitBtn}
        />
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
  previewBanner: {
    width: '100%',
    height: 160,
    borderRadius: Spacing.borderRadiusLg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  bannerBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10, 25, 20, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  bannerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  consentCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.subtleBackground,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  consentTextWrap: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  consentDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  submitBtn: {
    width: '100%',
    marginTop: Spacing.md,
  },
});
