class Match3Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 8;
        this.tileSize = 80;
        this.board = [];
        this.selectedTile = null;
        this.isAnimating = false;
        this.score = 0;
        this.moves = 30;
        this.comboMultiplier = 1;
        this.gameState = 'IDLE'; // IDLE, SWAPPING, MATCHING, FALLING, GAME_OVER

        // Tile types (colors)
        this.tileColors = [
            '#FF6B6B', // Red
            '#4ECDC4', // Teal
            '#45B7D1', // Blue
            '#96CEB4', // Green
            '#FFEAA7', // Yellow
            '#DDA0DD', // Purple
            '#FFB6C1'  // Pink
        ];

        this.init();
    }

    init() {
        this.setupCanvas();
        this.createBoard();
        this.setupEventListeners();
        this.updateUI();
        this.draw();

        // Remove initial matches
        while (this.findMatches().length > 0) {
            this.removeMatchesWithoutScore();
        }
        this.draw();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);
        this.tileSize = Math.floor(rect.width / this.boardSize);
    }

    createBoard() {
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = {
                    type: Math.floor(Math.random() * this.tileColors.length),
                    x: col * this.tileSize,
                    y: row * this.tileSize,
                    targetY: row * this.tileSize,
                    scale: 1,
                    opacity: 1,
                    isMatched: false
                };
            }
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: e.target
            };
            this.handleClick(fakeEvent);
        }, { passive: false });
    }

    handleClick(e) {
        if (this.isAnimating || this.gameState === 'GAME_OVER') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);

        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) return;

        if (!this.selectedTile) {
            this.selectedTile = { row, col };
            this.draw();
        } else {
            const prevRow = this.selectedTile.row;
            const prevCol = this.selectedTile.col;

            // Check if adjacent
            const isAdjacent = (Math.abs(prevRow - row) === 1 && prevCol === col) ||
                               (Math.abs(prevCol - col) === 1 && prevRow === row);

            if (isAdjacent) {
                this.swapTiles(prevRow, prevCol, row, col);
            }

            this.selectedTile = null;
            this.draw();
        }
    }

    async swapTiles(row1, col1, row2, col2) {
        this.isAnimating = true;
        this.gameState = 'SWAPPING';

        // Swap tiles
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;

        // Update positions
        this.board[row1][col1].x = col1 * this.tileSize;
        this.board[row1][col1].y = row1 * this.tileSize;
        this.board[row2][col2].x = col2 * this.tileSize;
        this.board[row2][col2].y = row2 * this.tileSize;

        await this.animate(200);

        // Check for matches
        const matches = this.findMatches();

        if (matches.length > 0) {
            this.moves--;
            await this.handleMatches(matches);
            await this.fillBoard();

            // Continue checking for cascading matches
            while (this.findMatches().length > 0) {
                const cascadeMatches = this.findMatches();
                this.comboMultiplier++;
                await this.handleMatches(cascadeMatches);
                await this.fillBoard();
            }

            this.comboMultiplier = 1;
            this.updateUI();

            if (this.moves <= 0) {
                this.gameOver();
            }
        } else {
            // Swap back if no matches
            const temp = this.board[row1][col1];
            this.board[row1][col1] = this.board[row2][col2];
            this.board[row2][col2] = temp;

            this.board[row1][col1].x = col1 * this.tileSize;
            this.board[row1][col1].y = row1 * this.tileSize;
            this.board[row2][col2].x = col2 * this.tileSize;
            this.board[row2][col2].y = row2 * this.tileSize;

            await this.animate(200);
        }

        this.isAnimating = false;
        this.gameState = 'IDLE';
    }

    findMatches() {
        const matches = [];
        const checked = new Set();

        // Check horizontal matches
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 2; col++) {
                const type = this.board[row][col].type;
                if (type === null) continue;

                let matchLength = 1;
                while (col + matchLength < this.boardSize &&
                       this.board[row][col + matchLength].type === type) {
                    matchLength++;
                }

                if (matchLength >= 3) {
                    const match = [];
                    for (let i = 0; i < matchLength; i++) {
                        const key = `${row},${col + i}`;
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
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize - 2; row++) {
                const type = this.board[row][col].type;
                if (type === null) continue;

                let matchLength = 1;
                while (row + matchLength < this.boardSize &&
                       this.board[row + matchLength][col].type === type) {
                    matchLength++;
                }

                if (matchLength >= 3) {
                    const match = [];
                    for (let i = 0; i < matchLength; i++) {
                        const key = `${row + i},${col}`;
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
    }

    async handleMatches(matches) {
        this.gameState = 'MATCHING';

        // Mark tiles for removal
        let totalTiles = 0;
        for (const match of matches) {
            for (const tile of match) {
                this.board[tile.row][tile.col].isMatched = true;
                this.board[tile.row][tile.col].scale = 0;
                totalTiles++;
            }
        }

        // Calculate score with combo multiplier
        const baseScore = totalTiles * 10;
        const comboScore = baseScore * this.comboMultiplier;
        this.score += comboScore;

        // Show combo indicator
        if (this.comboMultiplier > 1) {
            this.showCombo();
        }

        await this.animate(300);

        // Remove matched tiles
        for (const match of matches) {
            for (const tile of match) {
                this.board[tile.row][tile.col].type = null;
            }
        }
    }

    removeMatchesWithoutScore() {
        const matches = this.findMatches();
        for (const match of matches) {
            for (const tile of match) {
                this.board[tile.row][tile.col].type = Math.floor(Math.random() * this.tileColors.length);
            }
        }
    }

    async fillBoard() {
        this.gameState = 'FALLING';

        // Make tiles fall
        for (let col = 0; col < this.boardSize; col++) {
            let emptyRow = this.boardSize - 1;

            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col].type !== null) {
                    if (row !== emptyRow) {
                        this.board[emptyRow][col] = this.board[row][col];
                        this.board[emptyRow][col].targetY = emptyRow * this.tileSize;
                        this.board[row][col] = {
                            type: null,
                            x: col * this.tileSize,
                            y: row * this.tileSize,
                            targetY: row * this.tileSize,
                            scale: 1,
                            opacity: 1,
                            isMatched: false
                        };
                    }
                    emptyRow--;
                }
            }

            // Fill empty spaces from top
            for (let row = emptyRow; row >= 0; row--) {
                this.board[row][col] = {
                    type: Math.floor(Math.random() * this.tileColors.length),
                    x: col * this.tileSize,
                    y: -this.tileSize * (emptyRow - row + 1),
                    targetY: row * this.tileSize,
                    scale: 1,
                    opacity: 1,
                    isMatched: false
                };
            }
        }

        await this.animate(400);

        // Update actual positions
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col].y = this.board[row][col].targetY;
            }
        }
    }

    animate(duration) {
        return new Promise(resolve => {
            const startTime = Date.now();

            const animationLoop = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Animate falling tiles
                for (let row = 0; row < this.boardSize; row++) {
                    for (let col = 0; col < this.boardSize; col++) {
                        const tile = this.board[row][col];
                        if (tile.y !== tile.targetY) {
                            const diff = tile.targetY - tile.y;
                            tile.y += diff * 0.2;
                        }
                    }
                }

                this.draw();

                if (progress < 1) {
                    requestAnimationFrame(animationLoop);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animationLoop);
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.boardSize * this.tileSize, this.boardSize * this.tileSize);

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.boardSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, this.boardSize * this.tileSize);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(this.boardSize * this.tileSize, i * this.tileSize);
            this.ctx.stroke();
        }

        // Draw tiles
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.board[row][col];
                if (tile.type === null) continue;

                const x = tile.x + this.tileSize / 2;
                const y = tile.y + this.tileSize / 2;
                const radius = (this.tileSize * 0.35) * tile.scale;

                // Draw tile shadow
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowOffsetX = 2;
                this.ctx.shadowOffsetY = 2;

                // Draw tile
                this.ctx.globalAlpha = tile.opacity;
                this.ctx.fillStyle = this.tileColors[tile.type];
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw tile highlight
                const gradient = this.ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.shadowColor = 'transparent';
                this.ctx.globalAlpha = 1;
            }
        }

        // Draw selection highlight
        if (this.selectedTile) {
            const { row, col } = this.selectedTile;
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(
                col * this.tileSize + 4,
                row * this.tileSize + 4,
                this.tileSize - 8,
                this.tileSize - 8
            );
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('comboMultiplier').textContent = this.comboMultiplier;
    }

    showCombo() {
        const comboDisplay = document.getElementById('comboDisplay');
        comboDisplay.classList.add('active');
        setTimeout(() => {
            comboDisplay.classList.remove('active');
        }, 1000);
    }

    gameOver() {
        this.gameState = 'GAME_OVER';
        const overlay = document.getElementById('gameOverlay');
        document.getElementById('finalScore').textContent = this.score;
        overlay.classList.add('active');
    }

    restart() {
        const overlay = document.getElementById('gameOverlay');
        overlay.classList.remove('active');

        this.score = 0;
        this.moves = 30;
        this.comboMultiplier = 1;
        this.gameState = 'IDLE';
        this.selectedTile = null;
        this.isAnimating = false;

        this.createBoard();
        this.updateUI();

        // Remove initial matches
        while (this.findMatches().length > 0) {
            this.removeMatchesWithoutScore();
        }

        this.draw();
    }
}

// Initialize game when page loads
const game = new Match3Game();

// Handle window resize
window.addEventListener('resize', () => {
    game.setupCanvas();
    game.draw();
});