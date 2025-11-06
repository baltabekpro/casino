// API Configuration
const API_URL = window.location.origin + '/api';

// State
let token = localStorage.getItem('token');
let user = null;
let currentGame = 'slots';
let blackjackGameState = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        fetchUserProfile();
    } else {
        showAuthModal();
    }
    initializeEventListeners();
});

// Auth Modal
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function hideAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('app').style.display = 'block';
}

// Event Listeners
function initializeEventListeners() {
    // Auth
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const game = e.target.dataset.game;
            switchGame(game);
        });
    });

    // Slots
    document.getElementById('spinBtn').addEventListener('click', playSlots);

    // Roulette
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const betType = e.target.dataset.type;
            const betValue = e.target.dataset.value;
            playRoulette(betType, betValue);
        });
    });
    document.getElementById('betNumberBtn').addEventListener('click', () => {
        const number = parseInt(document.getElementById('rouletteNumberBet').value);
        if (number >= 0 && number <= 36) {
            playRoulette('number', number);
        } else {
            showResult('roulette', 'Please enter a number between 0 and 36', 'loss');
        }
    });

    // Blackjack
    document.getElementById('dealBtn').addEventListener('click', dealBlackjack);
    document.getElementById('hitBtn').addEventListener('click', hitBlackjack);
    document.getElementById('standBtn').addEventListener('click', standBlackjack);

    // Poker
    document.getElementById('pokerDealBtn').addEventListener('click', playPoker);

    // Dice
    document.querySelectorAll('#diceGame .bet-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const betType = e.target.dataset.bet;
            playDice(betType);
        });
    });

    // Baccarat
    document.querySelectorAll('#baccaratGame .bet-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const side = e.target.dataset.side;
            playBaccarat(side);
        });
    });

    // Enter key support
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

// API Calls
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(API_URL + endpoint, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Authentication
async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('authError');

    try {
        const data = await apiCall('/auth/login', 'POST', { username, password });
        token = data.token;
        localStorage.setItem('token', token);
        user = data.user;
        updateUserDisplay();
        hideAuthModal();
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

async function handleRegister() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('authError');

    try {
        const data = await apiCall('/auth/register', 'POST', { username, password });
        token = data.token;
        localStorage.setItem('token', token);
        user = data.user;
        updateUserDisplay();
        hideAuthModal();
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

function handleLogout() {
    token = null;
    user = null;
    localStorage.removeItem('token');
    showAuthModal();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

async function fetchUserProfile() {
    try {
        const data = await apiCall('/user/profile');
        user = data.user;
        updateUserDisplay();
        hideAuthModal();
    } catch (error) {
        handleLogout();
    }
}

function updateUserDisplay() {
    document.getElementById('usernameDisplay').textContent = user.username;
    document.getElementById('balance').textContent = user.balance.toFixed(2);
}

// Game Navigation
function switchGame(game) {
    currentGame = game;
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-game="${game}"]`).classList.add('active');

    // Update game display
    document.querySelectorAll('.game').forEach(g => {
        g.classList.remove('active');
    });
    document.getElementById(game + 'Game').classList.add('active');

    // Load history if needed
    if (game === 'history') {
        loadHistory();
    }
}

// Slots Game
async function playSlots() {
    const betAmount = parseFloat(document.getElementById('slotsBet').value);
    const spinBtn = document.getElementById('spinBtn');

    if (betAmount <= 0 || betAmount > user.balance) {
        showResult('slots', 'Invalid bet amount', 'loss');
        return;
    }

    spinBtn.disabled = true;
    showResult('slots', 'Spinning...', '');

    // Animate reels
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣'];
    
    let spins = 0;
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        });
        spins++;
        if (spins > 10) {
            clearInterval(spinInterval);
        }
    }, 100);

    try {
        const data = await apiCall('/games/slots', 'POST', { betAmount });
        
        setTimeout(() => {
            // Display result
            reels[0].textContent = data.result.reels[0];
            reels[1].textContent = data.result.reels[1];
            reels[2].textContent = data.result.reels[2];

            user.balance = data.balance;
            updateUserDisplay();

            if (data.winAmount > 0) {
                showResult('slots', `You won $${data.winAmount.toFixed(2)}! 🎉`, 'win');
            } else {
                showResult('slots', 'Try again!', 'loss');
            }

            spinBtn.disabled = false;
        }, 1200);
    } catch (error) {
        showResult('slots', error.message, 'loss');
        spinBtn.disabled = false;
    }
}

// Roulette Game
async function playRoulette(betType, betValue) {
    const betAmount = parseFloat(document.getElementById('rouletteBet').value);

    if (betAmount <= 0 || betAmount > user.balance) {
        showResult('roulette', 'Invalid bet amount', 'loss');
        return;
    }

    showResult('roulette', 'Spinning...', '');

    // Animate wheel
    const wheel = document.getElementById('rouletteNumber');
    let spins = 0;
    const spinInterval = setInterval(() => {
        wheel.textContent = Math.floor(Math.random() * 37);
        spins++;
        if (spins > 15) {
            clearInterval(spinInterval);
        }
    }, 100);

    try {
        const data = await apiCall('/games/roulette', 'POST', { betAmount, betType, betValue });

        setTimeout(() => {
            const { number, color, isWin } = data.result;
            wheel.textContent = number;
            wheel.style.background = color === 'red' ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' :
                                    color === 'black' ? 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)' :
                                    'linear-gradient(135deg, #27ae60 0%, #229954 100%)';

            user.balance = data.balance;
            updateUserDisplay();

            if (isWin) {
                showResult('roulette', `You won $${data.winAmount.toFixed(2)}! Number: ${number} (${color})`, 'win');
            } else {
                showResult('roulette', `You lost! Number: ${number} (${color})`, 'loss');
            }
        }, 1600);
    } catch (error) {
        showResult('roulette', error.message, 'loss');
    }
}

// Blackjack Game
async function dealBlackjack() {
    const betAmount = parseFloat(document.getElementById('blackjackBet').value);

    if (betAmount <= 0 || betAmount > user.balance) {
        showResult('blackjack', 'Invalid bet amount', 'loss');
        return;
    }

    showResult('blackjack', '', '');

    try {
        const data = await apiCall('/games/blackjack', 'POST', { betAmount, action: 'start' });

        if (data.gameOver) {
            // Immediate blackjack
            displayBlackjackHands(data.result.playerHand, data.result.dealerHand);
            user.balance = data.balance;
            updateUserDisplay();
            
            if (data.result.outcome === 'blackjack') {
                showResult('blackjack', `Blackjack! You won $${data.winAmount.toFixed(2)}! 🎉`, 'win');
            } else {
                showResult('blackjack', 'Push! Bet returned.', '');
            }
            enableBlackjackButtons(true, false, false);
        } else {
            blackjackGameState = data.gameState;
            displayBlackjackHands(data.gameState.playerHand, [data.gameState.dealerHand[0]]);
            document.getElementById('playerValue').textContent = data.playerValue;
            document.getElementById('dealerValue').textContent = data.dealerValue;
            enableBlackjackButtons(false, true, true);
        }
    } catch (error) {
        showResult('blackjack', error.message, 'loss');
    }
}

async function hitBlackjack() {
    try {
        const data = await apiCall('/games/blackjack', 'POST', {
            betAmount: blackjackGameState.betAmount,
            action: 'hit',
            gameState: blackjackGameState
        });

        if (data.gameOver) {
            displayBlackjackHands(data.result.playerHand, data.result.dealerHand);
            user.balance = data.balance;
            updateUserDisplay();
            showResult('blackjack', 'Bust! You lost.', 'loss');
            enableBlackjackButtons(true, false, false);
            blackjackGameState = null;
        } else {
            blackjackGameState = data.gameState;
            displayBlackjackHands(data.gameState.playerHand, [data.gameState.dealerHand[0]]);
            document.getElementById('playerValue').textContent = data.playerValue;
        }
    } catch (error) {
        showResult('blackjack', error.message, 'loss');
    }
}

async function standBlackjack() {
    try {
        const data = await apiCall('/games/blackjack', 'POST', {
            betAmount: blackjackGameState.betAmount,
            action: 'stand',
            gameState: blackjackGameState
        });

        displayBlackjackHands(data.result.playerHand, data.result.dealerHand);
        document.getElementById('playerValue').textContent = data.result.playerValue;
        document.getElementById('dealerValue').textContent = data.result.dealerValue;

        user.balance = data.balance;
        updateUserDisplay();

        let message = '';
        let resultClass = '';
        
        switch(data.result.outcome) {
            case 'win':
                message = `You won $${data.winAmount.toFixed(2)}!`;
                resultClass = 'win';
                break;
            case 'dealer_bust':
                message = `Dealer busted! You won $${data.winAmount.toFixed(2)}!`;
                resultClass = 'win';
                break;
            case 'loss':
                message = 'Dealer wins!';
                resultClass = 'loss';
                break;
            case 'push':
                message = 'Push! Bet returned.';
                resultClass = '';
                break;
        }

        showResult('blackjack', message, resultClass);
        enableBlackjackButtons(true, false, false);
        blackjackGameState = null;
    } catch (error) {
        showResult('blackjack', error.message, 'loss');
    }
}

function displayBlackjackHands(playerHand, dealerHand) {
    const playerCards = document.getElementById('playerCards');
    const dealerCards = document.getElementById('dealerCards');

    playerCards.innerHTML = '';
    dealerCards.innerHTML = '';

    playerHand.forEach(card => {
        playerCards.appendChild(createCardElement(card));
    });

    dealerHand.forEach(card => {
        dealerCards.appendChild(createCardElement(card));
    });
}

function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
    cardDiv.innerHTML = `<div>${card.value}</div><div>${card.suit}</div>`;
    return cardDiv;
}

function enableBlackjackButtons(deal, hit, stand) {
    document.getElementById('dealBtn').disabled = !deal;
    document.getElementById('hitBtn').disabled = !hit;
    document.getElementById('standBtn').disabled = !stand;
}

// Poker
async function playPoker() {
    const betAmount = parseFloat(document.getElementById('pokerBet').value);
    
    if (!betAmount || betAmount <= 0) {
        showResult('poker', 'Please enter a valid bet amount', 'loss');
        return;
    }

    try {
        const data = await apiCall('/games/poker', 'POST', { betAmount });
        
        // Display cards
        displayPokerHands(data.playerHand, data.communityCards);
        
        // Display hand rank
        document.getElementById('pokerHandRank').textContent = `Hand: ${data.handRank}`;
        
        // Display result
        const profit = data.winAmount - betAmount;
        if (data.won) {
            showResult('poker', `You won $${data.winAmount.toFixed(2)}! (${data.handRank})`, 'win');
        } else {
            showResult('poker', `You lost $${betAmount.toFixed(2)}`, 'loss');
        }
        
        // Update balance
        updateBalance(data.newBalance);
    } catch (error) {
        showResult('poker', error.message, 'loss');
    }
}

function displayPokerHands(playerHand, communityCards) {
    const playerCards = document.getElementById('pokerPlayerCards');
    const commCards = document.getElementById('communityCards');
    
    playerCards.innerHTML = '';
    commCards.innerHTML = '';
    
    playerHand.forEach(card => {
        playerCards.appendChild(createCardElement(card));
    });
    
    communityCards.forEach(card => {
        commCards.appendChild(createCardElement(card));
    });
}

// Dice
async function playDice(betType) {
    const betAmount = parseFloat(document.getElementById('diceBet').value);
    
    if (!betAmount || betAmount <= 0) {
        showResult('dice', 'Please enter a valid bet amount', 'loss');
        return;
    }

    try {
        // Animate dice roll
        const dice1 = document.getElementById('dice1');
        const dice2 = document.getElementById('dice2');
        dice1.classList.add('rolling');
        dice2.classList.add('rolling');

        const data = await apiCall('/games/dice', 'POST', { betAmount, betType });
        
        // Display dice after animation
        setTimeout(() => {
            dice1.classList.remove('rolling');
            dice2.classList.remove('rolling');
            
            const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            dice1.textContent = diceSymbols[data.dice1 - 1];
            dice2.textContent = diceSymbols[data.dice2 - 1];
            document.getElementById('diceTotal').textContent = `Total: ${data.total}`;
            
            // Display result
            if (data.won) {
                showResult('dice', `You won $${data.winAmount.toFixed(2)}! Rolled ${data.total}`, 'win');
            } else {
                showResult('dice', `You lost $${betAmount.toFixed(2)}. Rolled ${data.total}`, 'loss');
            }
            
            // Update balance
            updateBalance(data.newBalance);
        }, 500);
    } catch (error) {
        dice1.classList.remove('rolling');
        dice2.classList.remove('rolling');
        showResult('dice', error.message, 'loss');
    }
}

// Baccarat
async function playBaccarat(side) {
    const betAmount = parseFloat(document.getElementById('baccaratBet').value);
    
    if (!betAmount || betAmount <= 0) {
        showResult('baccarat', 'Please enter a valid bet amount', 'loss');
        return;
    }

    try {
        const data = await apiCall('/games/baccarat', 'POST', { betAmount, side });
        
        // Display cards
        displayBaccaratHands(data.playerHand, data.bankerHand);
        
        // Display values
        document.getElementById('baccaratPlayerValue').textContent = data.playerValue;
        document.getElementById('bankerValue').textContent = data.bankerValue;
        
        // Display result
        if (data.won) {
            showResult('baccarat', `${data.winner} wins! You won $${data.winAmount.toFixed(2)}`, 'win');
        } else {
            showResult('baccarat', `${data.winner} wins. You lost $${betAmount.toFixed(2)}`, 'loss');
        }
        
        // Update balance
        updateBalance(data.newBalance);
    } catch (error) {
        showResult('baccarat', error.message, 'loss');
    }
}

function displayBaccaratHands(playerHand, bankerHand) {
    const playerCards = document.getElementById('baccaratPlayerCards');
    const bankerCards = document.getElementById('bankerCards');
    
    playerCards.innerHTML = '';
    bankerCards.innerHTML = '';
    
    playerHand.forEach(card => {
        playerCards.appendChild(createCardElement(card));
    });
    
    bankerHand.forEach(card => {
        bankerCards.appendChild(createCardElement(card));
    });
}

// History
async function loadHistory() {
    try {
        const data = await apiCall('/user/history');
        const historyList = document.getElementById('historyList');
        
        if (data.history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #ffd700;">No game history yet. Start playing!</p>';
            return;
        }

        historyList.innerHTML = data.history.map(item => {
            const profit = item.win_amount - item.bet_amount;
            const profitClass = profit > 0 ? 'win' : profit < 0 ? 'loss' : '';
            const profitText = profit > 0 ? `+$${profit.toFixed(2)}` : profit < 0 ? `-$${Math.abs(profit).toFixed(2)}` : '$0.00';

            return `
                <div class="history-item">
                    <div class="game-type">${item.game_type.toUpperCase()}</div>
                    <div>Bet: $${item.bet_amount.toFixed(2)}</div>
                    <div class="${profitClass}">Profit: ${profitText}</div>
                    <div>${new Date(item.played_at).toLocaleString()}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

// Helper Functions
function updateBalance(newBalance) {
    if (user) {
        user.balance = newBalance;
        document.getElementById('balance').textContent = newBalance.toFixed(2);
    }
}

function showResult(game, message, className) {
    const resultDiv = document.getElementById(game + 'Result');
    resultDiv.textContent = message;
    resultDiv.className = 'result ' + className;
}
