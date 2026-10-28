import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/theme/colors';
import { Spacing, Shadows } from '../../src/theme/spacing';
import { Card } from '../../src/components/Card';
import { CategoryCard } from '../../src/components/CategoryCard';
import { SPACE_CATEGORIES } from '../../src/constants/categories';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { SpaceCategoryId } from '../../src/types';
import { BrandLogo } from '../../src/components/BrandLogo';

const TYPOLOGY_PILLS = [
  { id: 'living', name: 'Living Room', icon: 'home-outline' },
  { id: 'dining', name: 'Dining & Cafe', icon: 'restaurant-outline' },
  { id: 'bedroom', name: 'Bedroom', icon: 'bed-outline' },
  { id: 'workspace', name: 'Workspace', icon: 'laptop-outline' },
  { id: 'commercial', name: 'Shops & Retail', icon: 'cart-outline' },
];

const CURATED_CONCEPTS = [
  {
    id: 'solarium',
    title: 'Solarium Lounge',
    style: 'Nordic Minimal',
    subtitle: 'Light Oak & Linen',
    fit: '96% Fit',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'terracotta',
    title: 'Terracotta Bistro',
    style: 'Warm Biophilic',
    subtitle: 'Lime Plaster & Flora',
    fit: '91% Fit',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sanctuary',
    title: 'Sanctuary Suite',
    style: 'Modern Loft',
    subtitle: 'Ash Timber & Slate',
    fit: '95% Fit',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { savedProjects, setCategory, resetWorkflow, currentProject, loadProjectById } = useDesignProject();
  const [selectedTypology, setSelectedTypology] = useState('living');

  const handleOpenConcept = (conceptId: string) => {
    if (savedProjects.length > 0) {
      loadProjectById(savedProjects[0].id);
      router.push('/design/results');
    } else {
      router.push({
        pathname: '/design/category',
        params: { categoryId: 'home-rooms' },
      });
    }
  };

  const handleSelectCategory = (catId: SpaceCategoryId) => {
    resetWorkflow();
    const category = SPACE_CATEGORIES.find(c => c.id === catId);
    const defaultSub = category?.subcategories[0]?.id || '';
    setCategory(catId, defaultSub);
    router.push({
      pathname: '/design/category',
      params: { categoryId: catId },
    });
  };

  const handleStartScan = () => {
    resetWorkflow();
    router.push('/design/camera');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top App Bar - Stitch Style */}
        <View style={styles.appBar}>
          <BrandLogo size={38} showText={true} />
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.circleActionBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="notifications-outline" size={18} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'S'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Editorial Architectural Hero Canvas */}
        <View style={styles.heroCanvas}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />

          {/* Floating Glassmorphic Tag */}
          <View style={styles.heroTagBadge}>
            <Ionicons name="cube-outline" size={13} color="#A7F3D0" />
            <Text style={styles.heroTagText}>AI SPACE REDESIGN</Text>
          </View>

          {/* Bottom Content Row */}
          <View style={styles.heroBottomRow}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroPreHeading}>GENERATIVE SPATIAL ENGINE</Text>
              <Text style={styles.heroTitle}>Reimagine your space.</Text>
            </View>

            {/* Quick Capture Camera CTA Button */}
            <TouchableOpacity
              style={styles.cameraScanBtn}
              activeOpacity={0.85}
              onPress={handleStartScan}
            >
              <Ionicons name="camera" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Typologies Horizontal Filter Pills */}
        <View style={styles.typologySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionSmallHeading}>TYPOLOGIES</Text>
            <Text style={styles.sectionRightMeta}>Select space</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
            {TYPOLOGY_PILLS.map((pill) => {
              const isSelected = selectedTypology === pill.id;
              return (
                <TouchableOpacity
                  key={pill.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTypology(pill.id)}
                  style={[styles.typologyPill, isSelected && styles.typologyPillActive]}
                >
                  <Ionicons
                    name={pill.icon as any}
                    size={16}
                    color={isSelected ? Colors.textLight : Colors.secondary}
                  />
                  <Text style={[styles.typologyPillText, isSelected && styles.typologyPillTextActive]}>
                    {pill.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Curated Concepts Horizontal Stream */}
        <View style={styles.conceptsSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Curated Concepts</Text>
              <Text style={styles.sectionSubtitle}>High fidelity spatial iterations</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/designs')}>
              <View style={styles.seeAllRow}>
                <Text style={styles.seeAllText}>See all</Text>
                <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.conceptsScroll}>
            {CURATED_CONCEPTS.map((concept) => (
              <TouchableOpacity
                key={concept.id}
                style={styles.conceptCard}
                activeOpacity={0.85}
                onPress={() => handleOpenConcept(concept.id)}
              >
                <View style={styles.conceptImageWrap}>
                  <Image source={{ uri: concept.image }} style={styles.conceptImage} resizeMode="cover" />
                  <View style={styles.conceptStyleTag}>
                    <Text style={styles.conceptStyleText}>{concept.style}</Text>
                  </View>
                  <View style={styles.conceptFitBadge}>
                    <Ionicons name="cube-outline" size={12} color="#A7F3D0" />
                    <Text style={styles.conceptFitText}>3D Spatial • {concept.fit}</Text>
                  </View>
                </View>

                <View style={styles.conceptInfoRow}>
                  <View style={styles.conceptTitleWrap}>
                    <Text style={styles.conceptTitle} numberOfLines={1}>{concept.title}</Text>
                    <Text style={styles.conceptSubtitle}>{concept.subtitle}</Text>
                  </View>
                  <View style={styles.conceptArrowCircle}>
                    <Ionicons name="arrow-forward" size={13} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Draft Mini Drawer */}
        <View style={styles.activeDraftSection}>
          <TouchableOpacity
            style={styles.activeDraftCard}
            activeOpacity={0.85}
            onPress={() => {
              if (currentProject) {
                router.push('/design/results');
              } else {
                handleOpenConcept('solarium');
              }
            }}
          >
            <View style={styles.activeDraftLeft}>
              <Image
                source={{
                  uri: currentProject?.originalPhotoUri || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.activeDraftThumb}
              />
              <View style={styles.activeDraftInfo}>
                <View style={styles.activePulsingRow}>
                  <View style={styles.pulsingDot} />
                  <Text style={styles.activeDraftBadge}>ACTIVE DRAFT</Text>
                </View>
                <Text style={styles.activeDraftTitle} numberOfLines={1}>
                  {currentProject?.title || 'North Lounge • Step 2 of 4'}
                </Text>
              </View>
            </View>

            <View style={styles.resumeBtn}>
              <Text style={styles.resumeBtnText}>Resume</Text>
              <Ionicons name="arrow-forward" size={13} color={Colors.textLight} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Space Typologies Selection List */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Select Space Category</Text>
            <Text style={styles.countBadge}>5 typologies</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Calibrated lighting, acoustics, and furniture layout:</Text>
          {SPACE_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => handleSelectCategory(cat.id)}
            />
          ))}
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
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  brandTextWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  appTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1.2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    ...Shadows.subtle,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '800',
  },
  heroCanvas: {
    width: '100%',
    height: 340,
    borderRadius: Spacing.borderRadiusXl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.lg,
    ...Shadows.floating,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 25, 20, 0.45)',
  },
  heroTagBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroTagText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroBottomRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  heroPreHeading: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  heroTitle: {
    color: Colors.textLight,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  cameraScanBtn: {
    width: 52,
    height: 52,
    borderRadius: Spacing.borderRadiusMd,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.raised,
  },
  typologySection: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionSmallHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.8,
  },
  sectionRightMeta: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pillsScroll: {
    gap: 8,
  },
  typologyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9999,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.2,
    borderColor: Colors.border,
    ...Shadows.subtle,
  },
  typologyPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typologyPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  typologyPillTextActive: {
    color: Colors.textLight,
    fontWeight: '700',
  },
  conceptsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 1,
    marginBottom: Spacing.sm,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  conceptsScroll: {
    gap: 12,
  },
  conceptCard: {
    width: 250,
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    padding: 10,
    borderWidth: 1.2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  conceptImageWrap: {
    width: '100%',
    height: 180,
    borderRadius: Spacing.borderRadiusMd,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.subtleBackground,
  },
  conceptImage: {
    width: '100%',
    height: '100%',
  },
  conceptStyleTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  conceptStyleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  conceptFitBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(10, 25, 20, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conceptFitText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
  },
  conceptInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  conceptTitleWrap: {
    flex: 1,
    marginRight: 6,
  },
  conceptTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  conceptSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  conceptArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.subtleBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDraftSection: {
    marginBottom: Spacing.lg,
  },
  activeDraftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: Spacing.borderRadiusLg,
    padding: 12,
    borderWidth: 1.2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  activeDraftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activeDraftThumb: {
    width: 48,
    height: 48,
    borderRadius: Spacing.borderRadiusSm,
    backgroundColor: Colors.subtleBackground,
  },
  activeDraftInfo: {
    flex: 1,
  },
  activePulsingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  activeDraftBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.6,
  },
  activeDraftTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
  },
  resumeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textLight,
  },
  categoriesSection: {
    marginBottom: Spacing.md,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.subtleBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
});
