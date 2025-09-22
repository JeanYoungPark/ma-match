import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import GameBoard from '../components/GameBoard';
import GameHeader from '../components/GameHeader';
import { Tile, Position, GameState, GameStats } from '../types';
import {
  createInitialBoard,
  findMatches,
  isAdjacent,
  swapTiles,
  removeMatches,
  fillBoard,
  calculateScore,
} from '../utils/gameLogic';

const { height } = Dimensions.get('window');

const GameScreen: React.FC = () => {
  const [board, setBoard] = useState<Tile[][]>(() => createInitialBoard());
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    moves: 30,
    combo: 1,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const processMatches = useCallback(async () => {
    let currentBoard = [...board];
    let combo = 1;
    let totalScore = 0;

    while (true) {
      const matches = findMatches(currentBoard);
      if (matches.length === 0) break;

      // Calculate score for this round
      const matchTiles = matches.reduce((acc, match) => acc + match.length, 0);
      totalScore += calculateScore(matchTiles, combo);

      // Remove matches
      currentBoard = removeMatches(currentBoard, matches);
      setBoard(currentBoard);

      // Wait for removal animation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Fill board
      currentBoard = fillBoard(currentBoard);
      setBoard(currentBoard);

      // Wait for falling animation
      await new Promise(resolve => setTimeout(resolve, 400));

      combo++;
    }

    // Update stats
    setStats(prev => ({
      ...prev,
      score: prev.score + totalScore,
      combo: combo - 1,
    }));

    // Reset combo after a delay
    if (combo > 1) {
      setTimeout(() => {
        setStats(prev => ({ ...prev, combo: 1 }));
      }, 1500);
    }
  }, [board]);

  const handleTilePress = useCallback((row: number, col: number) => {
    if (isAnimating || gameState !== 'IDLE') return;

    if (!selectedTile) {
      setSelectedTile({ row, col });
    } else {
      const isAdj = isAdjacent(selectedTile, { row, col });

      if (isAdj) {
        setIsAnimating(true);
        setGameState('SWAPPING');

        // Swap tiles
        const newBoard = swapTiles(board, selectedTile, { row, col });
        setBoard(newBoard);

        // Check for matches after swap
        setTimeout(async () => {
          const matches = findMatches(newBoard);

          if (matches.length > 0) {
            // Valid move - process matches
            setStats(prev => ({ ...prev, moves: prev.moves - 1 }));
            setGameState('MATCHING');
            await processMatches();

            // Check for game over
            if (stats.moves - 1 <= 0) {
              setGameState('GAME_OVER');
              Alert.alert(
                'Game Over!',
                `Final Score: ${stats.score}`,
                [{ text: 'New Game', onPress: resetGame }]
              );
            } else {
              setGameState('IDLE');
            }
          } else {
            // Invalid move - swap back
            const revertBoard = swapTiles(newBoard, selectedTile, { row, col });
            setTimeout(() => {
              setBoard(revertBoard);
              setGameState('IDLE');
            }, 200);
          }

          setIsAnimating(false);
        }, 300);
      }

      setSelectedTile(null);
    }
  }, [selectedTile, board, isAnimating, gameState, stats, processMatches]);

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setSelectedTile(null);
    setGameState('IDLE');
    setStats({
      score: 0,
      moves: 30,
      combo: 1,
    });
    setIsAnimating(false);
  }, []);

  return (
    <View style={styles.container}>
      <GameHeader stats={stats} />

      <View style={styles.boardContainer}>
        <GameBoard
          board={board}
          selectedTile={selectedTile}
          onTilePress={handleTilePress}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={resetGame}>
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default GameScreen;