import { Tile, TileType, Position } from '../types';

const BOARD_SIZE = 8;
const TILE_TYPES = 7;

export const createInitialBoard = (): Tile[][] => {
  const board: Tile[][] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = {
        id: `${row}-${col}`,
        row,
        col,
        type: Math.floor(Math.random() * TILE_TYPES) as TileType,
        isMatched: false,
        isSelected: false,
      };
    }
  }

  // Remove initial matches
  while (findMatches(board).length > 0) {
    const matches = findMatches(board);
    matches.forEach(match => {
      match.forEach(pos => {
        board[pos.row][pos.col].type = Math.floor(Math.random() * TILE_TYPES) as TileType;
      });
    });
  }

  return board;
};

export const findMatches = (board: Tile[][]): Position[][] => {
  const matches: Position[][] = [];
  const checked = new Set<string>();

  // Check horizontal matches
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      const type = board[row][col].type;
      if (type === null) continue;

      let matchLength = 1;
      while (col + matchLength < BOARD_SIZE && board[row][col + matchLength].type === type) {
        matchLength++;
      }

      if (matchLength >= 3) {
        const match: Position[] = [];
        for (let i = 0; i < matchLength; i++) {
          const key = `${row}-${col + i}`;
          if (!checked.has(key)) {
            match.push({ row, col: col + i });
            checked.add(key);
          }
        }
        if (match.length > 0) matches.push(match);
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      const type = board[row][col].type;
      if (type === null) continue;

      let matchLength = 1;
      while (row + matchLength < BOARD_SIZE && board[row + matchLength][col].type === type) {
        matchLength++;
      }

      if (matchLength >= 3) {
        const match: Position[] = [];
        for (let i = 0; i < matchLength; i++) {
          const key = `${row + i}-${col}`;
          if (!checked.has(key)) {
            match.push({ row: row + i, col });
            checked.add(key);
          }
        }
        if (match.length > 0) matches.push(match);
      }
    }
  }

  return matches;
};

export const isAdjacent = (pos1: Position, pos2: Position): boolean => {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

export const swapTiles = (board: Tile[][], pos1: Position, pos2: Position): Tile[][] => {
  const newBoard = board.map(row => [...row]);
  const temp = newBoard[pos1.row][pos1.col];
  newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col];
  newBoard[pos2.row][pos2.col] = temp;

  // Update row and col properties
  newBoard[pos1.row][pos1.col].row = pos1.row;
  newBoard[pos1.row][pos1.col].col = pos1.col;
  newBoard[pos2.row][pos2.col].row = pos2.row;
  newBoard[pos2.row][pos2.col].col = pos2.col;

  return newBoard;
};

export const removeMatches = (board: Tile[][], matches: Position[][]): Tile[][] => {
  const newBoard = board.map(row => [...row]);

  matches.forEach(match => {
    match.forEach(pos => {
      newBoard[pos.row][pos.col].type = null;
      newBoard[pos.row][pos.col].isMatched = true;
    });
  });

  return newBoard;
};

export const fillBoard = (board: Tile[][]): Tile[][] => {
  const newBoard = board.map(row => [...row]);

  for (let col = 0; col < BOARD_SIZE; col++) {
    // Move tiles down
    let emptyRow = BOARD_SIZE - 1;

    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col].type !== null) {
        if (row !== emptyRow) {
          newBoard[emptyRow][col] = newBoard[row][col];
          newBoard[emptyRow][col].row = emptyRow;
          newBoard[row][col] = {
            ...newBoard[row][col],
            type: null,
            row,
          };
        }
        emptyRow--;
      }
    }

    // Fill empty spaces with new tiles
    for (let row = emptyRow; row >= 0; row--) {
      newBoard[row][col] = {
        id: `${row}-${col}`,
        row,
        col,
        type: Math.floor(Math.random() * TILE_TYPES) as TileType,
        isMatched: false,
        isSelected: false,
      };
    }
  }

  return newBoard;
};

export const calculateScore = (matchCount: number, combo: number): number => {
  const baseScore = matchCount * 10;
  return baseScore * combo;
};