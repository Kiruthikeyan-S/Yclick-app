import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACE_CATEGORIES } from '../../src/constants/categories';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { SpaceCategoryId } from '../../src/types';
import { Colors } from '../../src/theme/colors';
import { Spacing, Shadows } from '../../src/theme/spacing';

const CATEGORY_IMAGES: Record<string, string> = {
  'home-rooms': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
  'restaurants-cafes': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80',
  'hotels': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80',
  'offices': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
  'shops': 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80',
};

const CATEGORY_TAGS: Record<string, { count: string; highlight: string }> = {
  'home-rooms': { count: '18 Typologies', highlight: 'Natural Light' },
  'restaurants-cafes': { count: '12 Spaces', highlight: 'Warm Mood' },
  'hotels': { count: '9 Spaces', highlight: 'Resort Calibrated' },
  'offices': { count: '14 Spaces', highlight: 'High Focus' },
  'shops': { count: '8 Spaces', highlight: 'Accent Focus' },
};

export default function CategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { preferences, setCategory } = useDesignProject();

  const initialCatId = (params.categoryId as SpaceCategoryId) || preferences.categoryId || 'home-rooms';
  const [selectedCatId, setSelectedCatId] = useState<SpaceCategoryId>(initialCatId);

  const activeCategory = SPACE_CATEGORIES.find(c => c.id === selectedCatId) || SPACE_CATEGORIES[0];
  const [selectedSubId, setSelectedSubId] = useState<string>(
    preferences.subcategoryId || activeCategory.subcategories[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const activeSubcategory = activeCategory.subcategories.find(s => s.id === selectedSubId) || activeCategory.subcategories[0];

  const handleSubcategorySelect = (subId: string) => {
    setSelectedSubId(subId);
  };

  const handleContinue = () => {
    setCategory(selectedCatId, selectedSubId);
    router.push('/design/photo');
  };

  const filteredCategories = SPACE_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Workspace</Text>
        <TouchableOpacity
          style={styles.headerAvatar}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person" size={16} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Badge */}
        <View style={styles.stepBadge}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText}>Step 1 of 4 • Spatial Setup</Text>
        </View>

        <Text style={styles.mainTitle}>Select Your Space</Text>
        <Text style={styles.mainSubtitle}>
          Choose your architectural canvas to calibrate lighting, acoustic planes, and generative proportions.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search typologies, vibes, or materials..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="options-outline" size={18} color={Colors.primary} />
        </View>

        {/* Typology Cards List */}
        <View style={styles.categoriesList}>
          {filteredCategories.map((cat) => {
            const isSelected = cat.id === selectedCatId;
            const meta = CATEGORY_TAGS[cat.id] || { count: '10 Spaces', highlight: 'Balanced' };
            const imgUri = CATEGORY_IMAGES[cat.id] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80';

            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedCatId(cat.id);
                  const newCategory = SPACE_CATEGORIES.find(c => c.id === cat.id);
                  if (newCategory && newCategory.subcategories.length > 0) {
                    setSelectedSubId(newCategory.subcategories[0].id);
                  }
                }}
                style={[styles.typologyCard, isSelected && styles.typologyCardSelected]}
              >
                <View style={styles.typologyImageWrap}>
                  <Image source={{ uri: imgUri }} style={styles.typologyImage} resizeMode="cover" />
                  <View style={styles.imageOverlay} />
                </View>

                <View style={styles.typologyContent}>
                  <View style={styles.typologyTitleRow}>
                    <Text style={styles.typologyName} numberOfLines={1}>{cat.name}</Text>
                    <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                      <Ionicons
                        name={isSelected ? 'checkmark' : 'add'}
                        size={14}
                        color={isSelected ? Colors.textLight : Colors.textSecondary}
                      />
                    </View>
                  </View>

                  <Text style={styles.typologyDesc} numberOfLines={1}>
                    {cat.subcategories.map(s => s.name).slice(0, 3).join(', ')}
                  </Text>

                  <View style={styles.typologyBadgeRow}>
                    <View style={styles.countPill}>
                      <Ionicons name="home-outline" size={11} color={Colors.primary} />
                      <Text style={styles.countPillText}>{meta.count}</Text>
                    </View>
                    <View style={styles.highlightPill}>
                      <Ionicons name="sunny-outline" size={11} color="#B45309" />
                      <Text style={styles.highlightPillText}>{meta.highlight}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subcategories Section */}
        <View style={styles.subSectionCard}>
          <View style={styles.subHeaderRow}>
            <View style={styles.subHeaderLeft}>
              <View style={styles.subDot} />
              <Text style={styles.subSectionTitle}>
                {activeCategory.name}: Sub-Spaces
              </Text>
            </View>
            <Text style={styles.subMeta}>Select specific focus</Text>
          </View>

          <View style={styles.chipsWrap}>
            {activeCategory.subcategories.map((sub) => {
              const isSubSelected = sub.id === selectedSubId;
              return (
                <TouchableOpacity
                  key={sub.id}
                  activeOpacity={0.75}
                  onPress={() => handleSubcategorySelect(sub.id)}
                  style={[styles.subChip, isSubSelected && styles.subChipSelected]}
                >
                  <Ionicons
                    name={isSubSelected ? 'checkmark-circle' : (sub.iconName as any || 'cube-outline')}
                    size={14}
                    color={isSubSelected ? Colors.textLight : Colors.textSecondary}
                  />
                  <Text style={[styles.subChipText, isSubSelected && styles.subChipTextSelected]}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Smart Biophilic Notice */}
          <View style={styles.lensNotice}>
            <View style={styles.lensNoticeLeft}>
              <Ionicons name="color-wand-outline" size={15} color={Colors.primary} />
              <Text style={styles.lensNoticeText}>Smart Spatial Lens calibrated for this layout</Text>
            </View>
            <Text style={styles.lensMatch}>98% match</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.floatingFooter}>
        <View style={styles.calibrationRow}>
          <View style={styles.calibrationLeft}>
            <Ionicons name="checkmark-circle" size={15} color={Colors.primary} />
            <Text style={styles.calibrationLabel}>Calibrated:</Text>
            <Text style={styles.calibrationValue} numberOfLines={1}>
              {activeCategory.name} • {activeSubcategory?.name || 'Living Room'}
            </Text>
          </View>
          <Text style={styles.calibrationReady}>Auto-exposure ready</Text>
        </View>

        <TouchableOpacity
          style={styles.continueActionBtn}
          activeOpacity={0.88}
          onPress={handleContinue}
        >
          <View style={styles.continueLeft}>
            <Ionicons name="camera-outline" size={19} color={Colors.textLight} />
            <Text style={styles.continueBtnText}>Continue to Photo Capture</Text>
          </View>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={16} color={Colors.textLight} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    height: 56,
    paddingHorizontal: Spacing.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 120,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.subtleBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 8,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusMd,
    borderWidth: 1.2,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingHorizontal: 8,
  },
  categoriesList: {
    gap: 12,
    marginBottom: Spacing.lg,
  },
  typologyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    borderWidth: 1.2,
    borderColor: Colors.border,
    padding: 10,
    ...Shadows.card,
  },
  typologyCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
  },
  typologyImageWrap: {
    width: 86,
    height: 86,
    borderRadius: Spacing.borderRadiusMd,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.subtleBackground,
  },
  typologyImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(36, 76, 62, 0.15)',
  },
  typologyContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  typologyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  typologyName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: Colors.primary,
  },
  typologyDesc: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  typologyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.subtleBackground,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  countPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  highlightPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  subSectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    borderWidth: 1.2,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadows.card,
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subMeta: {
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  subChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: Colors.subtleBackground,
  },
  subChipSelected: {
    backgroundColor: Colors.primary,
  },
  subChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subChipTextSelected: {
    color: Colors.textLight,
    fontWeight: '700',
  },
  lensNotice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.subtleBackground,
    padding: 8,
    borderRadius: Spacing.borderRadiusSm,
    marginTop: 4,
  },
  lensNoticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  lensNoticeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.primary,
  },
  lensMatch: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247, 248, 244, 0.94)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 10,
    paddingBottom: 24,
    ...Shadows.floating,
  },
  calibrationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  calibrationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  calibrationLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  calibrationValue: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  calibrationReady: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: '600',
  },
  continueActionBtn: {
    height: 50,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    ...Shadows.raised,
  },
  continueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueBtnText: {
    color: Colors.textLight,
    fontSize: 13,
    fontWeight: '800',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
