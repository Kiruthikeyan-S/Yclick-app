import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Linking, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDesignProject } from '../../src/contexts/DesignProjectContext';
import { Colors } from '../../src/theme/colors';
import { Spacing } from '../../src/theme/spacing';
import { Header } from '../../src/components/Header';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const { currentProject } = useDesignProject();

  const product = currentProject?.products.find(p => p.id === productId) || currentProject?.products[0];

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Product Details" onBackPress={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Product details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleOpenMerchant = async () => {
    try {
      const supported = await Linking.canOpenURL(product.productUrl);
      if (supported) {
        await Linking.openURL(product.productUrl);
      } else {
        Alert.alert('External Link', `Opening retailer site at: ${product.productUrl}`);
      }
    } catch (err: any) {
      Alert.alert('Unable to open link', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Product Details" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <Card style={styles.imageCard} variant="elevated">
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.badgeWrap}>
            <Badge label={product.category} variant="primary" />
            <Badge
              label={product.isEssential ? 'Essential Piece' : 'Accent / Optional'}
              variant={product.isEssential ? 'success' : 'secondary'}
            />
          </View>
        </Card>

        {/* Title & Price */}
        <View style={styles.titleSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>
            {product.price ? `${product.currency || '₹'}${product.price.toLocaleString('en-IN')}` : 'Price on request'}
          </Text>
          <Text style={styles.merchant}>Sourced from: {product.merchant || 'Verified Catalog'}</Text>
        </View>

        {/* Recommendation Rationale */}
        <Card style={styles.reasonCard} variant="subtle">
          <View style={styles.reasonHeader}>
            <Ionicons name="cube-outline" size={18} color={Colors.primary} />
            <Text style={styles.reasonTitle}>Why This Item is Recommended</Text>
          </View>
          <Text style={styles.reasonText}>{product.reason}</Text>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionStack}>
          <Button
            title="View on Retailer Site"
            onPress={handleOpenMerchant}
            icon={<Ionicons name="open-outline" size={18} color={Colors.textLight} />}
            style={styles.actionBtn}
          />
          <Button
            title="Back to All Products"
            variant="outline"
            onPress={() => router.back()}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  imageCard: {
    padding: 0,
    overflow: 'hidden',
    height: 250,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeWrap: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  titleSection: {
    marginBottom: Spacing.md,
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  merchant: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reasonCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  actionStack: {
    gap: Spacing.sm,
  },
  actionBtn: {
    width: '100%',
  },
});
