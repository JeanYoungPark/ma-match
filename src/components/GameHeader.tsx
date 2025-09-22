import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { GameStats } from '../types';

interface GameHeaderProps {
  stats: GameStats;
}

const GameHeader: React.FC<GameHeaderProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match-3 Puzzle</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{stats.score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Moves</Text>
          <Text style={styles.statValue}>{stats.moves}</Text>
        </View>
        {stats.combo > 1 && (
          <View style={[styles.statBox, styles.comboBox]}>
            <Text style={styles.comboText}>COMBO x{stats.combo}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  comboBox: {
    backgroundColor: 'rgba(245, 87, 108, 0.8)',
  },
  comboText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default GameHeader;