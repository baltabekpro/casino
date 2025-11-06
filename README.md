# 🎰 Casino Royale

A full-stack casino website with multiple games including Slots, Roulette, and Blackjack.

## Features

### Backend
- Node.js/Express REST API
- User authentication (JWT)
- SQLite database for data persistence
- Game logic for multiple casino games
- Balance management system
- Game history tracking

### Frontend
- Responsive web design
- Modern UI with animations
- Real-time balance updates
- Three playable games:
  - **Slots** - Classic slot machine with various symbols
  - **Roulette** - Bet on numbers, colors, even/odd, and high/low
  - **Blackjack** - Classic card game with hit/stand options
- Game history viewer

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

### Slots
- Bet any amount up to your balance
- Three matching symbols = Big Win!
- Two matching symbols = Small Win
- Diamond (💎) = 10x payout
- Seven (7️⃣) = 7x payout
- Star (⭐) = 5x payout
- Other matches = 3x payout

### Roulette
- Bet on specific numbers (0-36) for 36x payout
- Bet on colors (Red/Black) for 2x payout
- Bet on Even/Odd for 2x payout
- Bet on Low (1-18) or High (19-36) for 2x payout

### Blackjack
- Try to get closer to 21 than the dealer
- Blackjack (21 with first two cards) pays 2.5x
- Hit to draw another card
- Stand to end your turn
- Dealer must hit until 17 or higher

## Technology Stack

- **Backend**: Node.js, Express, SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing

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

## License

ISC