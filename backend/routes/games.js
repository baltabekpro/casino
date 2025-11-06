const express = require('express');
const { getDb } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation helper
const validateBetAmount = (betAmount, maxBet = 10000) => {
  if (!betAmount || typeof betAmount !== 'number') {
    return { valid: false, error: 'Bet amount is required and must be a number' };
  }
  if (betAmount <= 0) {
    return { valid: false, error: 'Bet amount must be greater than 0' };
  }
  if (betAmount > maxBet) {
    return { valid: false, error: `Bet amount cannot exceed $${maxBet}` };
  }
  if (!Number.isFinite(betAmount)) {
    return { valid: false, error: 'Invalid bet amount' };
  }
  return { valid: true };
};

// Helper function to update user balance and record game
const recordGame = (userId, gameType, betAmount, winAmount, result, callback) => {
  const db = getDb();
  const balanceChange = winAmount - betAmount;

  db.run('BEGIN TRANSACTION', (err) => {
    if (err) return callback(err);

    db.run(
      'UPDATE users SET balance = balance + ? WHERE id = ?',
      [balanceChange, userId],
      (err) => {
        if (err) {
          db.run('ROLLBACK');
          return callback(err);
        }

        db.run(
          'INSERT INTO game_history (user_id, game_type, bet_amount, win_amount, result) VALUES (?, ?, ?, ?, ?)',
          [userId, gameType, betAmount, winAmount, JSON.stringify(result)],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return callback(err);
            }

            db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
              if (err) {
                db.run('ROLLBACK');
                return callback(err);
              }

              db.run('COMMIT', (err) => {
                if (err) return callback(err);
                callback(null, user.balance);
              });
            });
          }
        );
      }
    );
  });
};

// Slots game
router.post('/slots', authenticateToken, (req, res) => {
  const { betAmount } = req.body;
  const userId = req.user.id;

  // Validate bet amount
  const validation = validateBetAmount(betAmount);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const db = getDb();

  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Slot machine logic - 3 reels with symbols
    const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎', '7️⃣'];
    const reels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];

    let winAmount = 0;
    let winType = 'loss';

    // Check for wins
    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      // Three of a kind
      if (reels[0] === '💎') {
        winAmount = betAmount * 10;
        winType = 'jackpot';
      } else if (reels[0] === '7️⃣') {
        winAmount = betAmount * 7;
        winType = 'big_win';
      } else if (reels[0] === '⭐') {
        winAmount = betAmount * 5;
        winType = 'big_win';
      } else {
        winAmount = betAmount * 3;
        winType = 'win';
      }
    } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
      // Two of a kind
      winAmount = betAmount * 1.5;
      winType = 'small_win';
    }

    const result = { reels, winType };

    recordGame(userId, 'slots', betAmount, winAmount, result, (err, newBalance) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to record game' });
      }

      res.json({
        result,
        winAmount,
        balance: newBalance
      });
    });
  });
});

// Roulette game
router.post('/roulette', authenticateToken, (req, res) => {
  const { betAmount, betType, betValue } = req.body;
  const userId = req.user.id;

  // Validate bet amount
  const validation = validateBetAmount(betAmount);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  if (!betType || typeof betType !== 'string') {
    return res.status(400).json({ error: 'Invalid bet type' });
  }

  const validBetTypes = ['number', 'color', 'even_odd', 'low_high'];
  if (!validBetTypes.includes(betType)) {
    return res.status(400).json({ error: 'Invalid bet type' });
  }

  const db = getDb();

  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Roulette spin - numbers 0-36
    const number = Math.floor(Math.random() * 37);
    const color = number === 0 ? 'green' : (number % 2 === 0 ? 'black' : 'red');
    const isEven = number !== 0 && number % 2 === 0;
    const isLow = number >= 1 && number <= 18;

    let winAmount = 0;
    let isWin = false;

    // Check win conditions based on bet type
    switch (betType) {
      case 'number':
        if (number === betValue) {
          winAmount = betAmount * 36;
          isWin = true;
        }
        break;
      case 'color':
        if (color === betValue) {
          winAmount = betAmount * 2;
          isWin = true;
        }
        break;
      case 'even_odd':
        if ((betValue === 'even' && isEven) || (betValue === 'odd' && !isEven && number !== 0)) {
          winAmount = betAmount * 2;
          isWin = true;
        }
        break;
      case 'low_high':
        if ((betValue === 'low' && isLow) || (betValue === 'high' && !isLow && number !== 0)) {
          winAmount = betAmount * 2;
          isWin = true;
        }
        break;
    }

    const result = { number, color, isWin };

    recordGame(userId, 'roulette', betAmount, winAmount, result, (err, newBalance) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to record game' });
      }

      res.json({
        result,
        winAmount,
        balance: newBalance
      });
    });
  });
});

// Blackjack game
router.post('/blackjack', authenticateToken, (req, res) => {
  const { betAmount, action, gameState } = req.body;
  const userId = req.user.id;

  // Validate bet amount
  const validation = validateBetAmount(betAmount);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Validate action
  const validActions = ['start', 'hit', 'stand'];
  if (!action || !validActions.includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const db = getDb();

  // Helper functions for blackjack
  const createDeck = () => {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
    return deck.sort(() => Math.random() - 0.5);
  };

  const getCardValue = (card) => {
    if (card.value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value);
  };

  const getHandValue = (hand) => {
    let value = 0;
    let aces = 0;
    for (let card of hand) {
      value += getCardValue(card);
      if (card.value === 'A') aces++;
    }
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value;
  };

  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (user.balance < betAmount && action === 'start') {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    if (action === 'start') {
      // Start new game
      const deck = createDeck();
      const playerHand = [deck.pop(), deck.pop()];
      const dealerHand = [deck.pop(), deck.pop()];

      const playerValue = getHandValue(playerHand);
      const dealerValue = getHandValue(dealerHand);

      // Check for immediate blackjack
      if (playerValue === 21) {
        const winAmount = dealerValue === 21 ? betAmount : betAmount * 2.5;
        const result = { playerHand, dealerHand, playerValue, dealerValue, outcome: dealerValue === 21 ? 'push' : 'blackjack' };
        
        recordGame(userId, 'blackjack', betAmount, winAmount, result, (err, newBalance) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to record game' });
          }

          res.json({
            result,
            winAmount,
            balance: newBalance,
            gameOver: true
          });
        });
      } else {
        res.json({
          gameState: {
            deck,
            playerHand,
            dealerHand,
            betAmount
          },
          playerValue,
          dealerValue: getCardValue(dealerHand[0]), // Only show first dealer card
          gameOver: false
        });
      }
    } else if (action === 'hit') {
      // Player hits
      const { deck, playerHand, dealerHand } = gameState;
      playerHand.push(deck.pop());
      const playerValue = getHandValue(playerHand);

      if (playerValue > 21) {
        // Player busts
        const result = { playerHand, dealerHand, playerValue, dealerValue: getHandValue(dealerHand), outcome: 'bust' };
        
        recordGame(userId, 'blackjack', betAmount, 0, result, (err, newBalance) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to record game' });
          }

          res.json({
            result,
            winAmount: 0,
            balance: newBalance,
            gameOver: true
          });
        });
      } else {
        res.json({
          gameState: { deck, playerHand, dealerHand, betAmount },
          playerValue,
          dealerValue: getCardValue(dealerHand[0]),
          gameOver: false
        });
      }
    } else if (action === 'stand') {
      // Dealer plays
      const { deck, playerHand, dealerHand } = gameState;
      let dealerValue = getHandValue(dealerHand);

      while (dealerValue < 17) {
        dealerHand.push(deck.pop());
        dealerValue = getHandValue(dealerHand);
      }

      const playerValue = getHandValue(playerHand);
      let winAmount = 0;
      let outcome = '';

      if (dealerValue > 21) {
        outcome = 'dealer_bust';
        winAmount = betAmount * 2;
      } else if (playerValue > dealerValue) {
        outcome = 'win';
        winAmount = betAmount * 2;
      } else if (playerValue === dealerValue) {
        outcome = 'push';
        winAmount = betAmount;
      } else {
        outcome = 'loss';
        winAmount = 0;
      }

      const result = { playerHand, dealerHand, playerValue, dealerValue, outcome };

      recordGame(userId, 'blackjack', betAmount, winAmount, result, (err, newBalance) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to record game' });
        }

        res.json({
          result,
          winAmount,
          balance: newBalance,
          gameOver: true
        });
      });
    }
  });
});

// Poker game (Texas Hold'em - simplified)
router.post('/poker', authenticateToken, (req, res) => {
  const { betAmount } = req.body;
  const userId = req.user.id;

  // Validate bet amount
  const validation = validateBetAmount(betAmount);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const db = getDb();

  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create deck
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
    deck.sort(() => Math.random() - 0.5);

    // Deal cards
    const playerHand = [deck.pop(), deck.pop()];
    const communityCards = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];

    // Evaluate hand (simplified)
    const evaluateHand = (hand, community) => {
      const allCards = [...hand, ...community];
      const values = allCards.map(c => c.value);
      const suits = allCards.map(c => c.suit);
      
      // Count value frequencies
      const valueCounts = {};
      values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
      const counts = Object.values(valueCounts).sort((a, b) => b - a);
      
      // Count suit frequencies
      const suitCounts = {};
      suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
      const hasFlush = Object.values(suitCounts).some(c => c >= 5);
      
      // Simplified hand evaluation
      if (hasFlush && counts[0] === 1) return { rank: 'Flush', multiplier: 6 };
      if (counts[0] === 4) return { rank: 'Four of a Kind', multiplier: 10 };
      if (counts[0] === 3 && counts[1] === 2) return { rank: 'Full House', multiplier: 8 };
      if (hasFlush) return { rank: 'Flush', multiplier: 6 };
      if (counts[0] === 3) return { rank: 'Three of a Kind', multiplier: 4 };
      if (counts[0] === 2 && counts[1] === 2) return { rank: 'Two Pair', multiplier: 2.5 };
      if (counts[0] === 2) return { rank: 'Pair', multiplier: 1.5 };
      return { rank: 'High Card', multiplier: 0 };
    };

    const { rank, multiplier } = evaluateHand(playerHand, communityCards);
    const winAmount = multiplier > 0 ? betAmount * multiplier : 0;
    const won = winAmount > 0;

    const result = { playerHand, communityCards, handRank: rank };

    recordGame(userId, 'poker', betAmount, winAmount, result, (err, newBalance) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to record game' });
      }

      res.json({
        playerHand,
        communityCards,
        handRank: rank,
        won,
        winAmount,
        newBalance
      });
    });
  });
});

// Dice game (Craps)
router.post('/dice', authenticateToken, (req, res) => {
  const { betAmount, betType } = req.body;
  const userId = req.user.id;

  // Validate bet amount
  const validation = validateBetAmount(betAmount);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Validate bet type
  const validBetTypes = ['seven', 'eleven', 'high', 'low', 'even', 'odd'];
  if (!betType || !validBetTypes.includes(betType)) {
    return res.status(400).json({ error: 'Invalid bet type' });
  }

  const db = getDb();

  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Roll two dice
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    let winAmount = 0;
    let won = false;

    // Check win conditions
    switch (betType) {
      case 'seven':
        if (total === 7) {
          winAmount = betAmount * 5;
          won = true;
        }
        break;
      case 'eleven':
        if (total === 11) {
          winAmount = betAmount * 8;
          won = true;
        }
        break;
      case 'high':
        if (total >= 8 && total <= 12) {
          winAmount = betAmount * 2;
          won = true;
        }
        break;
      case 'low':
        if (total >= 2 && total <= 6) {
          winAmount = betAmount * 2;
          won = true;
        }
        break;
      case 'even':
        if (total % 2 === 0) {
          winAmount = betAmount * 2;
          won = true;
        }
        break;
      case 'odd':
        if (total % 2 === 1) {
          winAmount = betAmount * 2;
          won = true;
        }
        break;
    }

    const result = { dice1, dice2, total, betType, won };

    recordGame(userId, 'dice', betAmount, winAmount, result, (err, newBalance) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to record game' });
      }

      res.json({
        dice1,
        dice2,
        total,
        won,
        winAmount,
        newBalance
      });
    });
  });
});

// Baccarat game
router.post('/baccarat', authenticateToken, (req, res) => {
  const { betAmount, side } = req.body;
  const userId = req.user.id;

  // Validate bet amount
  const validation = validateBetAmount(betAmount);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Validate side
  const validSides = ['player', 'banker', 'tie'];
  if (!side || !validSides.includes(side)) {
    return res.status(400).json({ error: 'Invalid betting side' });
  }

  const db = getDb();

  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create deck
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
    deck.sort(() => Math.random() - 0.5);

    // Deal cards
    const playerHand = [deck.pop(), deck.pop()];
    const bankerHand = [deck.pop(), deck.pop()];

    // Calculate baccarat values
    const getBaccaratValue = (hand) => {
      let value = 0;
      hand.forEach(card => {
        if (card.value === 'A') value += 1;
        else if (['J', 'Q', 'K'].includes(card.value)) value += 0;
        else value += parseInt(card.value);
      });
      return value % 10;
    };

    let playerValue = getBaccaratValue(playerHand);
    let bankerValue = getBaccaratValue(bankerHand);

    // Third card rules (simplified)
    if (playerValue <= 5 && bankerValue <= 5) {
      playerHand.push(deck.pop());
      playerValue = getBaccaratValue(playerHand);
      
      if (bankerValue <= 5) {
        bankerHand.push(deck.pop());
        bankerValue = getBaccaratValue(bankerHand);
      }
    } else if (playerValue <= 5) {
      playerHand.push(deck.pop());
      playerValue = getBaccaratValue(playerHand);
    } else if (bankerValue <= 5) {
      bankerHand.push(deck.pop());
      bankerValue = getBaccaratValue(bankerHand);
    }

    // Determine winner
    let winner;
    let won = false;
    let winAmount = 0;

    if (playerValue > bankerValue) {
      winner = 'Player';
      if (side === 'player') {
        won = true;
        winAmount = betAmount * 2;
      }
    } else if (bankerValue > playerValue) {
      winner = 'Banker';
      if (side === 'banker') {
        won = true;
        winAmount = betAmount * 1.95; // House commission
      }
    } else {
      winner = 'Tie';
      if (side === 'tie') {
        won = true;
        winAmount = betAmount * 9;
      } else {
        // Push on tie for player/banker bets
        winAmount = betAmount;
      }
    }

    const result = { playerHand, bankerHand, playerValue, bankerValue, winner };

    recordGame(userId, 'baccarat', betAmount, winAmount, result, (err, newBalance) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to record game' });
      }

      res.json({
        playerHand,
        bankerHand,
        playerValue,
        bankerValue,
        winner,
        won,
        winAmount,
        newBalance
      });
    });
  });
});

module.exports = router;
