import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { designTokens } from '../styles/designTokens';

const { height } = Dimensions.get('window');
const DRAWER_HEIGHT = height * 0.5; // 50% of screen height
const DRAWER_HANDLE_HEIGHT = 30;
const SNAP_POINTS = {
  CLOSED: 0,
  PEEK: 80,
  OPEN: DRAWER_HEIGHT,
};

export interface AnimationItem {
  id: string;
  name: string;
  description: string;
  thumbnail?: any; // Image source
  folder: string;
}

interface AnimationDrawerProps {
  animations: AnimationItem[];
  selectedAnimation: string;
  onSelectAnimation: (animationId: string) => void;
}

const AnimationDrawer: React.FC<AnimationDrawerProps> = ({
  animations,
  selectedAnimation,
  onSelectAnimation,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const translateY = useRef(new Animated.Value(SNAP_POINTS.CLOSED)).current;
  const lastGestureDy = useRef(0);

  // Animation to open/close drawer
  const animateDrawer = useCallback((toValue: number) => {
    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      bounciness: 2,
    }).start();
    setDrawerVisible(toValue !== SNAP_POINTS.CLOSED);
  }, [translateY]);

  // Initialize with a peek
  useEffect(() => {
    animateDrawer(SNAP_POINTS.PEEK);
  }, [animateDrawer]);

  // Pan responder for drawer gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(-lastGestureDy.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = -gestureState.dy;
        if (newValue <= SNAP_POINTS.OPEN && newValue >= 0) {
          translateY.setValue(newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const currentValue = -lastGestureDy.current - gestureState.dy;
        
        // Determine which snap point to go to
        if (gestureState.vy > 0.5) {
          // Swiping down with velocity
          animateDrawer(SNAP_POINTS.CLOSED);
        } else if (gestureState.vy < -0.5) {
          // Swiping up with velocity
          animateDrawer(SNAP_POINTS.OPEN);
        } else if (currentValue > DRAWER_HEIGHT / 2) {
          animateDrawer(SNAP_POINTS.OPEN);
        } else if (currentValue > SNAP_POINTS.PEEK / 2) {
          animateDrawer(SNAP_POINTS.PEEK);
        } else {
          animateDrawer(SNAP_POINTS.CLOSED);
        }
        
        lastGestureDy.current = -currentValue;
      },
    })
  ).current;

  const toggleDrawer = () => {
    // Check if drawer is visible and not at peek position
    if (drawerVisible) {
      animateDrawer(SNAP_POINTS.PEEK);
    } else {
      animateDrawer(SNAP_POINTS.OPEN);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.drawer, 
        { transform: [{ translateY: Animated.multiply(translateY, -1) }] }
      ]}
    >
      {/* Drawer handle for dragging */}
      <View 
        style={styles.drawerHandle} 
        {...panResponder.panHandlers}
      >
        <View style={styles.handleBar} />
        <TouchableOpacity onPress={toggleDrawer} style={styles.toggleButton}>
          <Ionicons 
            name={drawerVisible ? "chevron-down" : "chevron-up"} 
            size={24} 
            color={designTokens.colors.darkGray} 
          />
        </TouchableOpacity>
      </View>

      {/* Drawer content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Animation Library</Text>
        <Text style={styles.subtitle}>Select an animation to play</Text>
        
        {animations.map((animation) => (
          <TouchableOpacity
            key={animation.id}
            style={[
              styles.animationItem,
              selectedAnimation === animation.id && styles.selectedItem
            ]}
            onPress={() => {
              onSelectAnimation(animation.id);
              animateDrawer(SNAP_POINTS.PEEK);
            }}
          >
            <View style={styles.thumbnailContainer}>
              {animation.thumbnail ? (
                <Image source={animation.thumbnail} style={styles.thumbnail} />
              ) : (
                <View style={styles.placeholderThumbnail}>
                  <Ionicons name="shapes-outline" size={24} color={designTokens.colors.primary} />
                </View>
              )}
            </View>
            <View style={styles.animationInfo}>
              <Text style={styles.animationName}>{animation.name}</Text>
              <Text style={styles.animationDescription}>{animation.description}</Text>
            </View>
            {selectedAnimation === animation.id && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={designTokens.colors.success} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    bottom: -DRAWER_HEIGHT,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: designTokens.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 1000,
  },
  drawerHandle: {
    height: DRAWER_HANDLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: designTokens.colors.white,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: designTokens.colors.mediumGray,
    marginTop: 10,
  },
  toggleButton: {
    position: 'absolute',
    right: 15,
    top: 5,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.xxl + 20, // Extra padding at bottom
  },
  title: {
    fontSize: designTokens.typography.sizes.xl,
    fontWeight: designTokens.typography.weights.bold,
    color: designTokens.colors.charcoal,
    marginBottom: designTokens.spacing.xs,
  },
  subtitle: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.darkGray,
    marginBottom: designTokens.spacing.lg,
  },
  animationItem: {
    flexDirection: 'row',
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    marginBottom: designTokens.spacing.md,
    backgroundColor: designTokens.colors.white,
    borderWidth: 1,
    borderColor: designTokens.colors.lightGray,
    alignItems: 'center',
  },
  selectedItem: {
    borderColor: designTokens.colors.primary,
    backgroundColor: designTokens.colors.aliceBlue,
  },
  thumbnailContainer: {
    width: 50,
    height: 50,
    borderRadius: designTokens.borderRadius.sm,
    overflow: 'hidden',
    marginRight: designTokens.spacing.md,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: designTokens.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationInfo: {
    flex: 1,
  },
  animationName: {
    fontSize: designTokens.typography.sizes.base,
    fontWeight: designTokens.typography.weights.semibold,
    color: designTokens.colors.charcoal,
    marginBottom: 2,
  },
  animationDescription: {
    fontSize: designTokens.typography.sizes.sm,
    color: designTokens.colors.darkGray,
  },
  selectedIndicator: {
    marginLeft: designTokens.spacing.sm,
  },
});

export default AnimationDrawer;
