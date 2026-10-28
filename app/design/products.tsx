import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Image, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { ProductCategory, ProductRecommendation } from '../../src/types';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';

const CATEGORIES_FILTER: (ProductCategory | 'All')[] = [
  'All',
  'Furniture',
  'Lighting',
  'Curtains',
  'Decoration',
  'Storage',
  'Paint and materials',
];

export default function ProductsScreen() {
  const router = useRouter();
  const { currentProject } = useDesignProject();

  const [selectedFilter, setSelectedFilter] = useState<ProductCategory | 'All'>('All');

  const products = currentProject?.products || [];

  const filteredProducts = selectedFilter === 'All'
    ? products
    : products.filter(p => p.category === selectedFilter);

  const handleOpenProduct = (product: ProductRecommendation) => {
    router.push({
      pathname: '/design/product-details',
      params: { productId: product.id },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Recommended Products" onBackPress={() => router.back()} />
      <View style={styles.container}>
        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {CATEGORIES_FILTER.map((cat) => {
            const isSelected = selectedFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedFilter(cat)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Demo Data Notice */}
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.secondary} />
          <Text style={styles.demoBannerText}>
            Catalog preview. Prices and availability are indicative. External links will open verified retailer sites.
          </Text>
        </View>

        {/* Product Grid */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.productCard} variant="elevated">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleOpenProduct(item)}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />

                <View style={styles.cardInfo}>
                  <View style={styles.badgeRow}>
                    <Badge label={item.category} variant="secondary" />
                    <Badge
                      label={item.isEssential ? 'Essential' : 'Optional'}
                      variant={item.isEssential ? 'primary' : 'outline'}
                    />
                  </View>

                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.reasonText} numberOfLines={2}>{item.reason}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>
                      {item.price ? `${item.currency || '₹'}${item.price.toLocaleString('en-IN')}` : 'Check retailer'}
                    </Text>
                    <Text style={styles.merchantText}>{item.merchant || 'Retail Catalog'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          )}
        />
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
  },
  filterBar: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Spacing.borderRadiusLg,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.textLight,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.subtleBackground,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadiusMd,
    gap: Spacing.xs,
  },
  demoBannerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  listContent: {
    padding: Spacing.screenPadding,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  productCard: {
    padding: 0,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.subtleBackground,
  },
  cardInfo: {
    padding: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  merchantText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
