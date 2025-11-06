# 🎰 Casino Royale

A professional full-stack casino website with multiple games including Slots, Roulette, Blackjack, Poker, Dice, and Baccarat.

## ✨ Features

### Backend
- Node.js/Express REST API
- User authentication (JWT)
- SQLite database for data persistence
- Game logic for multiple casino games
- Balance management system
- Game history tracking
- Secure password hashing with bcryptjs

### Frontend
- Modern, responsive web design with animations
- Glassmorphism UI with gradient backgrounds
- Real-time balance updates
- Smooth transitions and hover effects
- Six playable games:
  - **🎰 Slots** - Classic slot machine with various symbols and multipliers
  - **🎡 Roulette** - Bet on numbers, colors, even/odd, and high/low
  - **🃏 Blackjack** - Classic card game with hit/stand options
  - **🃏 Poker** - Texas Hold'em with hand ranking system
  - **🎲 Dice** - Craps with multiple betting options
  - **💎 Baccarat** - Classic banker vs player card game
- Comprehensive game history viewer

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

1. **Register/Login** - Create an account or login to start playing
2. **Starting Balance** - New users receive $1000 to start
3. **Choose a Game** - Select from Slots, Roulette, or Blackjack
4. **Place Bets** - Enter your bet amount and play
5. **View History** - Check your game history anytime

## Game Rules

### 🎰 Slots
- Bet any amount up to your balance
- Three matching symbols = Big Win!
- Two matching symbols = Small Win
- Diamond (💎) = 10x payout
- Seven (7️⃣) = 7x payout
- Star (⭐) = 5x payout
- Other matches = 3x payout

### 🎡 Roulette
- Bet on specific numbers (0-36) for 36x payout
- Bet on colors (Red/Black) for 2x payout
- Bet on Even/Odd for 2x payout
- Bet on Low (1-18) or High (19-36) for 2x payout

### 🃏 Blackjack
- Try to get closer to 21 than the dealer
- Blackjack (21 with first two cards) pays 2.5x
- Hit to draw another card
- Stand to end your turn
- Dealer must hit until 17 or higher

### 🃏 Poker (Texas Hold'em)
- Get the best 5-card hand from 2 hole cards + 5 community cards
- Four of a Kind = 10x payout
- Full House = 8x payout
- Flush = 6x payout
- Three of a Kind = 4x payout
- Two Pair = 2.5x payout
- Pair = 1.5x payout

### 🎲 Dice (Craps)
- Roll two dice and bet on the outcome
- Seven = 5x payout
- Eleven = 8x payout
- High (8-12) = 2x payout
- Low (2-6) = 2x payout
- Even/Odd = 2x payout

### 💎 Baccarat
- Bet on Player, Banker, or Tie
- Closest to 9 wins
- Player bet = 2x payout
- Banker bet = 1.95x payout (house commission)
- Tie bet = 9x payout

## Technology Stack

- **Backend**: Node.js, Express, SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript with modern animations
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Deployment**: Heroku-ready with Procfile

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/history` - Get game history

### Games
- `POST /api/games/slots` - Play slots
- `POST /api/games/roulette` - Play roulette
- `POST /api/games/blackjack` - Play blackjack
- `POST /api/games/poker` - Play poker
- `POST /api/games/dice` - Play dice
- `POST /api/games/baccarat` - Play baccarat

## Deployment

### Deploy to Heroku

This app is ready to deploy to Heroku. See [DEPLOY.md](DEPLOY.md) for detailed instructions.

Quick deploy:

```bash
heroku create
git push heroku main
heroku open
```

Or use the one-click deploy button:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Environment Variables

- `PORT` - Server port (automatically set by Heroku)
- `JWT_SECRET` - Secret key for JWT tokens (set this manually)

## License

ISC