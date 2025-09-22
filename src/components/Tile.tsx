import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const BOARD_SIZE = 8;
const TILE_SIZE = (width - 40) / BOARD_SIZE;

const TILE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Purple
  '#FFB6C1', // Pink
];

interface TileProps {
  type: number | null;
  row: number;
  col: number;
  isSelected: boolean;
  isMatched: boolean;
  onPress: () => void;
}

const Tile: React.FC<TileProps> = ({
  type,
  row,
  col,
  isSelected,
  isMatched,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isMatched) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isMatched]);

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected]);

  if (type === null) return null;

  return (
    <TouchableOpacity
      style={[
        styles.tileContainer,
        {
          left: col * TILE_SIZE,
          top: row * TILE_SIZE,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.tile,
          {
            backgroundColor: TILE_COLORS[type],
            transform: [
              { scale: scaleAnim },
              { translateY },
            ],
            opacity: opacityAnim,
          },
          isSelected && styles.selectedTile,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tileContainer: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    padding: 3,
  },
  tile: {
    flex: 1,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedTile: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
});

export default Tile;