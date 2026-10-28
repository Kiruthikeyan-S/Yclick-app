import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  tagline?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  showText = false,
  tagline,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icon.png')}
        style={[
          styles.logoImage,
          { width: size, height: size, borderRadius: size * 0.28 },
        ]}
        resizeMode="contain"
      />
      {showText ? (
        <View style={styles.textContainer}>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>YClick</Text>
            <Text style={styles.studioTag}>STUDIO</Text>
          </View>
          {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    overflow: 'hidden',
  },
  textContainer: {
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  studioTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
});
