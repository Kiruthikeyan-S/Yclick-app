import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { SelectionChip } from '../../src/components/SelectionChip';
import { CategorySpecificAnswers } from '../../src/types';

export default function CategoryQuestionsScreen() {
  const router = useRouter();
  const { preferences, updatePreferences } = useDesignProject();

  const categoryId = preferences.categoryId;

  // Local states for questions
  const [priority, setPriority] = useState('Comfort & Ambience');
  const [capacity, setCapacity] = useState('');
  const [productOrRoomType, setProductOrRoomType] = useState('');
  const [extraDetails, setExtraDetails] = useState('');

  const handleContinue = () => {
    const categoryAnswers: CategorySpecificAnswers = {
      primaryPriority: priority,
      approxCapacity: capacity,
      subType: productOrRoomType,
      productType: productOrRoomType,
      notes: extraDetails,
    };

    updatePreferences({ categoryAnswers });
    router.push('/design/review');
  };

  const renderQuestionsForCategory = () => {
    switch (categoryId) {
      case 'restaurants-cafes':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What is your top commercial priority?</Text>
              <View style={styles.chipGrid}>
                {['Maximizing Seating', 'Smooth Customer Movement', 'Warm Cafe Ambience', 'High Counter Visibility'].map(opt => (
                  <SelectionChip
                    key={opt}
                    label={opt}
                    selected={priority === opt}
                    onPress={() => setPriority(opt)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Input
                label="Approximate Desired Seating Capacity"
                placeholder="e.g. 24 guests, 6 dining tables"
                value={capacity}
                onChangeText={setCapacity}
              />
            </View>
          </>
        );

      case 'offices':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What is your primary workplace goal?</Text>
              <View style={styles.chipGrid}>
                {['Acoustic Privacy & Focus', 'Team Collaboration', 'Ergonomic Desk Layout', 'Smart Organized Storage'].map(opt => (
                  <SelectionChip
                    key={opt}
                    label={opt}
                    selected={priority === opt}
                    onPress={() => setPriority(opt)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Input
                label="Approximate Desks / Workstations Needed"
                placeholder="e.g. 8 desks, 1 conference table"
                value={capacity}
                onChangeText={setCapacity}
              />
            </View>
          </>
        );

      case 'hotels':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Primary Hospitality Experience</Text>
              <View style={styles.chipGrid}>
                {['Guest Comfort & Sleep', 'Luxury Boutique Aesthetic', 'Spacious Luggage Storage', 'Calm Indirect Lighting'].map(opt => (
                  <SelectionChip
                    key={opt}
                    label={opt}
                    selected={priority === opt}
                    onPress={() => setPriority(opt)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Input
                label="Specific Hospitality Feature or Need"
                placeholder="e.g. King-size bed placement, minibar integration"
                value={productOrRoomType}
                onChangeText={setProductOrRoomType}
              />
            </View>
          </>
        );

      case 'shops':
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Retail Display Focus</Text>
              <View style={styles.chipGrid}>
                {['High Product Visibility', 'Wide Browsing Aisles', 'Prominent Checkout Counter', 'Accent Shelving Displays'].map(opt => (
                  <SelectionChip
                    key={opt}
                    label={opt}
                    selected={priority === opt}
                    onPress={() => setPriority(opt)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Input
                label="Type of Merchandise / Goods Sold"
                placeholder="e.g. Apparel, specialty coffee, pottery, electronics"
                value={productOrRoomType}
                onChangeText={setProductOrRoomType}
              />
            </View>
          </>
        );

      case 'home-rooms':
      default:
        return (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What should feel significantly better?</Text>
              <View style={styles.chipGrid}>
                {['More Comfortable & Relaxing', 'Better Everyday Lighting', 'Ample Concealed Storage', 'Cleaner Room Decoration'].map(opt => (
                  <SelectionChip
                    key={opt}
                    label={opt}
                    selected={priority === opt}
                    onPress={() => setPriority(opt)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Input
                label="Specific Furniture that must remain"
                placeholder="e.g. Wooden master bed, study desk"
                value={productOrRoomType}
                onChangeText={setProductOrRoomType}
              />
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Space-Specific Questions" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerArea}>
          <Text style={styles.heading}>Fine-tune your layout</Text>
          <Text style={styles.subtitle}>
            These tailored questions help our AI model prioritize the most practical layout for your {preferences.categoryId.replace('-', ' ')}.
          </Text>
        </View>

        {renderQuestionsForCategory()}

        <View style={styles.section}>
          <Input
            label="Any other specific layout detail? (Optional)"
            placeholder="e.g. Need space for a pram, prefer neutral walls..."
            value={extraDetails}
            onChangeText={setExtraDetails}
          />
        </View>

        <Button
          title="Review Design Request"
          onPress={handleContinue}
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
  headerArea: {
    marginBottom: Spacing.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  submitBtn: {
    width: '100%',
    marginTop: Spacing.lg,
  },
});
