# 🎰 Casino API Documentation

Complete REST API documentation for the Casino application.

## 📋 Table of Contents

- [Basic Information](#basic-information)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Authentication & Registration](#authentication--registration)
  - [User](#user)
  - [Games](#games)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Basic Information

**Base URL**: `http://localhost:3000/api`

**Content-Type**: `application/json`

**Response Format**: All responses are returned in JSON format

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful registration or login, you'll receive a token that must be included in the `Authorization` header for all protected requests.

**Header Format**:
```
Authorization: Bearer <your_jwt_token>
```

**Token Expiration**: 24 hours

---

## Endpoints

### Authentication & Registration

#### Register New User

Creates a new user account with an initial balance of $1000.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "player123",
  "password": "securePassword123"
}
```

**Parameters**:
- `username` (string, required): Username (3-20 characters, alphanumeric and underscore only)
- `password` (string, required): Password (minimum 6 characters, maximum 100)

**Success Response** (200 OK):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "player123",
    "balance": 1000.0
  }
}
```

**Possible Errors**:
- `400 Bad Request`: Invalid data or user already exists
  ```json
  {
    "error": "Username already exists"
  }
  ```
- `400 Bad Request`: Invalid username format
  ```json
  {
    "error": "Username must be between 3 and 20 characters"
  }
  ```
- `400 Bad Request`: Invalid password format
  ```json
  {
    "error": "Password must be at least 6 characters"
  }
  ```

---

#### Login

Authenticates a user and returns a JWT token.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "player123",
  "password": "securePassword123"
}
```

**Parameters**:
- `username` (string, required): Username
- `password` (string, required): Password

**Success Response** (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "player123",
    "balance": 950.5
  }
}
```

**Possible Errors**:
- `400 Bad Request`: Missing required fields
  ```json
  {
    "error": "Username and password are required"
  }
  ```
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

---

### User

#### Get User Profile

Returns the current user's profile information and balance.

**Endpoint**: `GET /api/user/profile`

**Authentication**: Required

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Success Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "username": "player123",
    "balance": 950.5
  }
}
```

**Possible Errors**:
- `401 Unauthorized`: Token missing
  ```json
  {
    "error": "Access token required"
  }
  ```
- `403 Forbidden`: Invalid or expired token
  ```json
  {
    "error": "Invalid or expired token"
  }
  ```
- `404 Not Found`: User not found
  ```json
  {
    "error": "User not found"
  }
  ```

---

#### Get Game History

Returns the user's last 50 games.

**Endpoint**: `GET /api/user/history`

**Authentication**: Required

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Success Response** (200 OK):
```json
{
  "history": [
    {
      "id": 15,
      "user_id": 1,
      "game_type": "slots",
      "bet_amount": 50,
      "win_amount": 150,
      "result": "{\"reels\":[\"💎\",\"💎\",\"💎\"],\"winType\":\"jackpot\"}",
      "played_at": "2025-11-06 14:30:22"
    },
    {
      "id": 14,
      "user_id": 1,
      "game_type": "roulette",
      "bet_amount": 100,
      "win_amount": 0,
      "result": "{\"number\":13,\"color\":\"red\",\"isWin\":false}",
      "played_at": "2025-11-06 14:28:15"
    }
  ]
}
```

**Game History Fields**:
- `id`: Unique record identifier
- `user_id`: User ID
- `game_type`: Game type (slots, roulette, blackjack, poker, dice, baccarat)
- `bet_amount`: Bet amount
- `win_amount`: Win amount
- `result`: JSON string with game details
- `played_at`: Game date and time

---

### Games

All game endpoints require authentication and accept a bet amount (`betAmount`).

#### General Requirements for Games

**Authentication**: Required for all game endpoints

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Common Errors**:
- `400 Bad Request`: Insufficient balance
  ```json
  {
    "error": "Insufficient balance"
  }
  ```
- `400 Bad Request`: Invalid bet amount
  ```json
  {
    "error": "Bet amount must be greater than 0"
  }
  ```
- `400 Bad Request`: Bet exceeds maximum
  ```json
  {
    "error": "Bet amount cannot exceed $10000"
  }
  ```

---

#### 🎰 Slots

Classic three-reel slot machine.

**Endpoint**: `POST /api/games/slots`

**Request Body**:
```json
{
  "betAmount": 50
}
```

**Parameters**:
- `betAmount` (number, required): Bet amount (greater than 0, maximum 10000)

**Success Response** (200 OK):
```json
{
  "result": {
    "reels": ["💎", "💎", "💎"],
    "winType": "jackpot"
  },
  "winAmount": 500,
  "balance": 1450.5
}
```

**Win Types**:
- `jackpot`: Three 💎 = 10x bet
- `big_win`: Three 7️⃣ = 7x bet, Three ⭐ = 5x bet
- `win`: Three matching symbols = 3x bet
- `small_win`: Two matching symbols = 1.5x bet
- `loss`: Loss

**Symbols**:
- 💎 (Diamond): x10
- 7️⃣ (Seven): x7
- ⭐ (Star): x5
- 🍒, 🍋, 🍊, 🍉 (Fruits): x3 for three matching

---

#### 🎡 Roulette

European roulette with numbers from 0 to 36.

**Endpoint**: `POST /api/games/roulette`

**Request Body**:
```json
{
  "betAmount": 100,
  "betType": "color",
  "betValue": "red"
}
```

**Parameters**:
- `betAmount` (number, required): Bet amount
- `betType` (string, required): Bet type
  - `number`: Bet on specific number (0-36)
  - `color`: Bet on color (red/black)
  - `even_odd`: Bet on parity (even/odd)
  - `low_high`: Bet on range (low: 1-18, high: 19-36)
- `betValue` (string/number, required): Bet value depending on type

**Example Requests**:

Bet on number:
```json
{
  "betAmount": 50,
  "betType": "number",
  "betValue": 17
}
```

Bet on color:
```json
{
  "betAmount": 100,
  "betType": "color",
  "betValue": "red"
}
```

Bet on parity:
```json
{
  "betAmount": 75,
  "betType": "even_odd",
  "betValue": "even"
}
```

Bet on range:
```json
{
  "betAmount": 150,
  "betType": "low_high",
  "betValue": "high"
}
```

**Success Response** (200 OK):
```json
{
  "result": {
    "number": 17,
    "color": "red",
    "isWin": true
  },
  "winAmount": 200,
  "balance": 1350.5
}
```

**Payouts**:
- Specific number: x36
- Color (red/black): x2
- Parity (even/odd): x2
- Range (low/high): x2

**Possible Errors**:
- `400 Bad Request`: Invalid bet type
  ```json
  {
    "error": "Invalid bet type"
  }
  ```

---

#### 🃏 Blackjack

Classic card game - try to get 21 or closer to 21 than the dealer.

**Endpoint**: `POST /api/games/blackjack`

**Game consists of multiple actions**:
- `start`: Start a new game
- `hit`: Take a card
- `stand`: Stop taking cards

##### Start Game

**Request Body**:
```json
{
  "betAmount": 100,
  "action": "start"
}
```

**Success Response** (200 OK) - game continues:
```json
{
  "gameState": {
    "deck": [...],
    "playerHand": [{"suit": "♠", "value": "K"}, {"suit": "♥", "value": "7"}],
    "dealerHand": [{"suit": "♦", "value": "A"}, {"suit": "♣", "value": "6"}],
    "betAmount": 100
  },
  "playerValue": 17,
  "dealerValue": 11,
  "gameOver": false
}
```

**Success Response** (200 OK) - immediate blackjack:
```json
{
  "result": {
    "playerHand": [{"suit": "♠", "value": "A"}, {"suit": "♥", "value": "K"}],
    "dealerHand": [{"suit": "♦", "value": "9"}, {"suit": "♣", "value": "8"}],
    "playerValue": 21,
    "dealerValue": 17,
    "outcome": "blackjack"
  },
  "winAmount": 250,
  "balance": 1250.5,
  "gameOver": true
}
```

##### Hit

**Request Body**:
```json
{
  "betAmount": 100,
  "action": "hit",
  "gameState": {
    "deck": [...],
    "playerHand": [...],
    "dealerHand": [...],
    "betAmount": 100
  }
}
```

**Note**: `gameState` must be the same as returned by the previous request.

**Success Response** (200 OK) - game continues:
```json
{
  "gameState": {
    "deck": [...],
    "playerHand": [{"suit": "♠", "value": "K"}, {"suit": "♥", "value": "7"}, {"suit": "♦", "value": "3"}],
    "dealerHand": [{"suit": "♦", "value": "A"}, {"suit": "♣", "value": "6"}],
    "betAmount": 100
  },
  "playerValue": 20,
  "dealerValue": 11,
  "gameOver": false
}
```

**Success Response** (200 OK) - bust:
```json
{
  "result": {
    "playerHand": [...],
    "dealerHand": [...],
    "playerValue": 23,
    "dealerValue": 17,
    "outcome": "bust"
  },
  "winAmount": 0,
  "balance": 1150.5,
  "gameOver": true
}
```

##### Stand

**Request Body**:
```json
{
  "betAmount": 100,
  "action": "stand",
  "gameState": {
    "deck": [...],
    "playerHand": [...],
    "dealerHand": [...],
    "betAmount": 100
  }
}
```

**Success Response** (200 OK):
```json
{
  "result": {
    "playerHand": [...],
    "dealerHand": [...],
    "playerValue": 20,
    "dealerValue": 19,
    "outcome": "win"
  },
  "winAmount": 200,
  "balance": 1350.5,
  "gameOver": true
}
```

**Possible Outcomes**:
- `blackjack`: Player blackjack (21 with first two cards) = 2.5x bet
- `win`: Player won = 2x bet
- `dealer_bust`: Dealer bust = 2x bet
- `push`: Tie = bet returned (1x)
- `bust`: Player bust = loss
- `loss`: Dealer won = loss

**Rules**:
- Player can hit until reaching 21 or busting
- Dealer must hit until 17 or higher
- Ace can be 1 or 11
- Face cards (J, Q, K) count as 10

---

#### 🃏 Poker (Texas Hold'em)

Simplified Texas Hold'em - get the best 5-card hand.

**Endpoint**: `POST /api/games/poker`

**Request Body**:
```json
{
  "betAmount": 100
}
```

**Success Response** (200 OK):
```json
{
  "playerHand": [
    {"suit": "♠", "value": "A"},
    {"suit": "♥", "value": "K"}
  ],
  "communityCards": [
    {"suit": "♠", "value": "K"},
    {"suit": "♦", "value": "K"},
    {"suit": "♣", "value": "7"},
    {"suit": "♥", "value": "3"},
    {"suit": "♦", "value": "2"}
  ],
  "handRank": "Three of a Kind",
  "won": true,
  "winAmount": 400,
  "newBalance": 1400.5
}
```

**Hand Rankings and Payouts**:
- `Four of a Kind`: x10
- `Full House`: x8
- `Flush`: x6
- `Three of a Kind`: x4
- `Two Pair`: x2.5
- `Pair`: x1.5
- `High Card`: loss

---

#### 🎲 Dice (Craps)

Roll two dice and bet on various outcomes.

**Endpoint**: `POST /api/games/dice`

**Request Body**:
```json
{
  "betAmount": 50,
  "betType": "seven"
}
```

**Parameters**:
- `betAmount` (number, required): Bet amount
- `betType` (string, required): Bet type
  - `seven`: Bet on total of 7
  - `eleven`: Bet on total of 11
  - `high`: Bet on high numbers (8-12)
  - `low`: Bet on low numbers (2-6)
  - `even`: Bet on even total
  - `odd`: Bet on odd total

**Success Response** (200 OK):
```json
{
  "dice1": 4,
  "dice2": 3,
  "total": 7,
  "won": true,
  "winAmount": 250,
  "newBalance": 1250.5
}
```

**Payouts**:
- Seven (7): x5
- Eleven (11): x8
- High (8-12): x2
- Low (2-6): x2
- Even: x2
- Odd: x2

**Possible Errors**:
- `400 Bad Request`: Invalid bet type
  ```json
  {
    "error": "Invalid bet type"
  }
  ```

---

#### 💎 Baccarat

Classic card game - bet on Player, Banker, or Tie.

**Endpoint**: `POST /api/games/baccarat`

**Request Body**:
```json
{
  "betAmount": 100,
  "side": "player"
}
```

**Parameters**:
- `betAmount` (number, required): Bet amount
- `side` (string, required): Betting side
  - `player`: Bet on player
  - `banker`: Bet on banker
  - `tie`: Bet on tie

**Success Response** (200 OK):
```json
{
  "playerHand": [
    {"suit": "♠", "value": "7"},
    {"suit": "♥", "value": "2"}
  ],
  "bankerHand": [
    {"suit": "♦", "value": "5"},
    {"suit": "♣", "value": "3"}
  ],
  "playerValue": 9,
  "bankerValue": 8,
  "winner": "Player",
  "won": true,
  "winAmount": 200,
  "newBalance": 1300.5
}
```

**Payouts**:
- Player: x2
- Banker: x1.95 (house commission)
- Tie: x9
- On tie, Player/Banker bets are returned

**Rules**:
- Goal: get sum closer to 9
- Ace = 1, 2-9 = face value, 10/J/Q/K = 0
- Sum modulo 10 (e.g., 15 = 5)
- Third card rule applied automatically

**Possible Errors**:
- `400 Bad Request`: Invalid betting side
  ```json
  {
    "error": "Invalid betting side"
  }
  ```

---

## Error Handling

The API uses standard HTTP status codes:

### Success Codes
- `200 OK`: Request successful

### Client Error Codes
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Invalid token
- `404 Not Found`: Resource not found

### Server Error Codes
- `500 Internal Server Error`: Internal server error

### Error Format

All errors are returned in the following format:

```json
{
  "error": "Error description"
}
```

---

## Rate Limiting

The API is protected against abuse using rate limiting.

### General Endpoints
- **Limit**: 100 requests per 15 minutes per IP address
- **Applies to**: All `/api/*` endpoints

### Authentication Endpoints
- **Limit**: 5 requests per 15 minutes per IP address
- **Applies to**: `/api/auth/*` endpoints (register, login)

### Response Headers

With each request, the server returns the following headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1642345678
```

### Rate Limit Exceeded Error

When the limit is exceeded, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Usage Examples

### JavaScript (Fetch API)

#### Register
```javascript
const register = async (username, password) => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (response.ok) {
    // Save token for future requests
    localStorage.setItem('token', data.token);
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

#### Login
```javascript
const login = async (username, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

#### Get Profile
```javascript
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  if (response.ok) {
    return data.user;
  } else {
    throw new Error(data.error);
  }
};
```

#### Play Slots
```javascript
const playSlots = async (betAmount) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/games/slots', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ betAmount })
  });
  
  const data = await response.json();
  if (response.ok) {
    console.log('Reels:', data.result.reels);
    console.log('Win:', data.winAmount);
    console.log('New balance:', data.balance);
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

#### Play Roulette
```javascript
const playRoulette = async (betAmount, betType, betValue) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/games/roulette', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ betAmount, betType, betValue })
  });
  
  const data = await response.json();
  if (response.ok) {
    console.log('Number:', data.result.number);
    console.log('Color:', data.result.color);
    console.log('Win:', data.winAmount);
    return data;
  } else {
    throw new Error(data.error);
  }
};

// Example usage
playRoulette(100, 'color', 'red');
```

#### Play Blackjack (full cycle)
```javascript
const playBlackjack = async (betAmount) => {
  const token = localStorage.getItem('token');
  
  // Start game
  let response = await fetch('http://localhost:3000/api/games/blackjack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ betAmount, action: 'start' })
  });
  
  let data = await response.json();
  
  if (data.gameOver) {
    console.log('Game finished immediately!');
    return data;
  }
  
  console.log('Your cards:', data.gameState.playerHand);
  console.log('Your total:', data.playerValue);
  
  // Hit if needed
  if (data.playerValue < 17) {
    response = await fetch('http://localhost:3000/api/games/blackjack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        betAmount, 
        action: 'hit',
        gameState: data.gameState
      })
    });
    
    data = await response.json();
  }
  
  // Stand
  if (!data.gameOver) {
    response = await fetch('http://localhost:3000/api/games/blackjack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        betAmount, 
        action: 'stand',
        gameState: data.gameState
      })
    });
    
    data = await response.json();
  }
  
  console.log('Result:', data.result.outcome);
  console.log('Win:', data.winAmount);
  return data;
};
```

### cURL

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player123","password":"securePassword123"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player123","password":"securePassword123"}'
```

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Play Slots
```bash
curl -X POST http://localhost:3000/api/games/slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"betAmount":50}'
```

#### Play Roulette
```bash
curl -X POST http://localhost:3000/api/games/roulette \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"betAmount":100,"betType":"color","betValue":"red"}'
```

---

## Security

### Security Recommendations

1. **Tokens**: Always store JWT tokens securely (e.g., httpOnly cookies or localStorage with caution)
2. **HTTPS**: In production, always use HTTPS to encrypt data
3. **Environment Variables**: Set `JWT_SECRET` as an environment variable to protect tokens
4. **Passwords**: Use strong passwords (minimum 6 characters, recommended 12+)
5. **Rate Limiting**: Consider rate limits when developing clients

### Environment Variables

```bash
# .env file
JWT_SECRET=your_secret_key_here
PORT=3000
```

---

## Support

If you have questions or problems with the API, please:

1. Check that you're using the correct headers and data format
2. Ensure your JWT token is valid and hasn't expired
3. Verify you haven't exceeded rate limits
4. Make sure you have sufficient balance to play

---

## Versioning

**Current Version**: v1.0.0

The API may be updated with new features. We strive to maintain backward compatibility, but breaking changes will be announced in advance.

---

**Last Documentation Update**: 2025-11-06
