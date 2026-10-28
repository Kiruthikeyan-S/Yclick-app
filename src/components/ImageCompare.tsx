import React, { useState } from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  PanResponder, 
  Dimensions, 
  ViewStyle 
} from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, Shadows } from '../theme/spacing';

interface ImageCompareProps {
  originalUri: string;
  redesignedUri: string;
  originalLabel?: string;
  redesignedLabel?: string;
  containerStyle?: ViewStyle;
}

export const ImageCompare: React.FC<ImageCompareProps> = ({
  originalUri,
  redesignedUri,
  originalLabel = 'Original Space',
  redesignedLabel = 'AI Redesign',
  containerStyle,
}) => {
  const [mode, setMode] = useState<'toggle' | 'slider'>('toggle');
  const [showOriginal, setShowOriginal] = useState(false);
  const [sliderPos, setSliderPos] = useState(0.5); // 0.0 to 1.0
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 36);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (containerWidth > 0) {
        const newPos = Math.max(0.05, Math.min(0.95, gestureState.moveX / containerWidth));
        setSliderPos(newPos);
      }
    },
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Mode Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMode('toggle')}
          style={[styles.tabButton, mode === 'toggle' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, mode === 'toggle' && styles.activeTabText]}>
            Tap to Toggle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setMode('slider')}
          style={[styles.tabButton, mode === 'slider' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, mode === 'slider' && styles.activeTabText]}>
            Split Slider
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Image Stage */}
      <View
        style={styles.imageContainer}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {mode === 'toggle' ? (
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => setShowOriginal(!showOriginal)}
            style={styles.fill}
          >
            <Image
              source={{ uri: showOriginal ? originalUri : redesignedUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.badgeContainer}>
              <View style={styles.labelBadge}>
                <Text style={styles.labelText}>
                  {showOriginal ? originalLabel : redesignedLabel}
                </Text>
              </View>
              <Text style={styles.hintText}>Tap image to switch</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.fill} {...panResponder.panHandlers}>
            {/* Background: Redesigned Image */}
            <Image
              source={{ uri: redesignedUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={[styles.labelBadge, styles.rightBadge]}>
              <Text style={styles.labelText}>{redesignedLabel}</Text>
            </View>

            {/* Foreground: Original Image clipped to sliderPos */}
            <View
              style={[
                styles.clipContainer,
                { width: containerWidth * sliderPos },
              ]}
            >
              <Image
                source={{ uri: originalUri }}
                style={[styles.image, { width: containerWidth }]}
                resizeMode="cover"
              />
              <View style={[styles.labelBadge, styles.leftBadge]}>
                <Text style={styles.labelText}>{originalLabel}</Text>
              </View>
            </View>

            {/* Slider Divider Line */}
            <View
              style={[
                styles.sliderDivider,
                { left: containerWidth * sliderPos - 1.5 },
              ]}
            >
              <View style={styles.sliderHandle}>
                <Text style={styles.sliderHandleArrows}>‹ ›</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.disclaimer}>
        Visual architectural synthesis based on your room photo.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.subtleBackground,
    borderRadius: Spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    marginBottom: Spacing.sm,
    alignSelf: 'center',
    ...Shadows.subtle,
  },
  tabButton: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: Spacing.borderRadiusMd,
  },
  activeTabButton: {
    backgroundColor: Colors.cardBackground,
    ...Shadows.subtle,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  imageContainer: {
    width: '100%',
    height: 290,
    borderRadius: Spacing.borderRadiusXl,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    borderWidth: 1.2,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  fill: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  clipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sliderDivider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderHandle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderHandleArrows: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: -2,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelBadge: {
    backgroundColor: 'rgba(32, 54, 44, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Spacing.borderRadiusSm,
  },
  leftBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  rightBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadiusSm,
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
