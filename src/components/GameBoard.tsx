import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Tile from './Tile';
import { Tile as TileType, Position } from '../types';

const { width } = Dimensions.get('window');
const BOARD_SIZE = 8;
const BOARD_WIDTH = width - 40;
const TILE_SIZE = BOARD_WIDTH / BOARD_SIZE;

interface GameBoardProps {
  board: TileType[][];
  selectedTile: Position | null;
  onTilePress: (row: number, col: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedTile,
  onTilePress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <Tile
              key={tile.id}
              type={tile.type}
              row={rowIndex}
              col={colIndex}
              isSelected={
                selectedTile?.row === rowIndex && selectedTile?.col === colIndex
              }
              isMatched={tile.isMatched}
              onPress={() => onTilePress(rowIndex, colIndex)}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: BOARD_WIDTH,
    height: BOARD_WIDTH,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 15,
    position: 'relative',
  },
});

export default GameBoard;