# 🎰 Casino API Documentation

Полная документация REST API для казино-приложения.

## 📋 Содержание

- [Базовая информация](#базовая-информация)
- [Аутентификация](#аутентификация)
- [Эндпоинты](#эндпоинты)
  - [Регистрация и вход](#регистрация-и-вход)
  - [Пользователь](#пользователь)
  - [Игры](#игры)
- [Обработка ошибок](#обработка-ошибок)
- [Ограничение частоты запросов](#ограничение-частоты-запросов)

## Базовая информация

**Base URL**: `http://localhost:3000/api`

**Content-Type**: `application/json`

**Формат ответов**: Все ответы возвращаются в формате JSON

## Аутентификация

API использует JWT (JSON Web Tokens) для аутентификации. После успешной регистрации или входа вы получите токен, который нужно включать в заголовок `Authorization` всех защищенных запросов.

**Формат заголовка**:
```
Authorization: Bearer <ваш_jwt_токен>
```

**Срок действия токена**: 24 часа

---

## Эндпоинты

### Регистрация и вход

#### Регистрация нового пользователя

Создает новый аккаунт пользователя с начальным балансом $1000.

**Endpoint**: `POST /api/auth/register`

**Аутентификация**: Не требуется

**Тело запроса**:
```json
{
  "username": "player123",
  "password": "securePassword123"
}
```

**Параметры**:
- `username` (string, required): Имя пользователя (3-20 символов, только буквы, цифры и подчеркивание)
- `password` (string, required): Пароль (минимум 6 символов, максимум 100)

**Успешный ответ** (200 OK):
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

**Возможные ошибки**:
- `400 Bad Request`: Неверные данные или пользователь уже существует
  ```json
  {
    "error": "Username already exists"
  }
  ```
- `400 Bad Request`: Неверный формат имени пользователя
  ```json
  {
    "error": "Username must be between 3 and 20 characters"
  }
  ```
- `400 Bad Request`: Неверный формат пароля
  ```json
  {
    "error": "Password must be at least 6 characters"
  }
  ```

---

#### Вход в систему

Аутентифицирует пользователя и возвращает JWT токен.

**Endpoint**: `POST /api/auth/login`

**Аутентификация**: Не требуется

**Тело запроса**:
```json
{
  "username": "player123",
  "password": "securePassword123"
}
```

**Параметры**:
- `username` (string, required): Имя пользователя
- `password` (string, required): Пароль

**Успешный ответ** (200 OK):
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

**Возможные ошибки**:
- `400 Bad Request`: Отсутствуют обязательные поля
  ```json
  {
    "error": "Username and password are required"
  }
  ```
- `401 Unauthorized`: Неверные учетные данные
  ```json
  {
    "error": "Invalid credentials"
  }
  ```

---

### Пользователь

#### Получить профиль пользователя

Возвращает информацию о профиле текущего пользователя и его баланс.

**Endpoint**: `GET /api/user/profile`

**Аутентификация**: Требуется

**Заголовки**:
```
Authorization: Bearer <your_jwt_token>
```

**Успешный ответ** (200 OK):
```json
{
  "user": {
    "id": 1,
    "username": "player123",
    "balance": 950.5
  }
}
```

**Возможные ошибки**:
- `401 Unauthorized`: Токен отсутствует
  ```json
  {
    "error": "Access token required"
  }
  ```
- `403 Forbidden`: Недействительный или истекший токен
  ```json
  {
    "error": "Invalid or expired token"
  }
  ```
- `404 Not Found`: Пользователь не найден
  ```json
  {
    "error": "User not found"
  }
  ```

---

#### Получить историю игр

Возвращает последние 50 игр пользователя.

**Endpoint**: `GET /api/user/history`

**Аутентификация**: Требуется

**Заголовки**:
```
Authorization: Bearer <your_jwt_token>
```

**Успешный ответ** (200 OK):
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
      "played_at": "2024-01-15 14:30:22"
    },
    {
      "id": 14,
      "user_id": 1,
      "game_type": "roulette",
      "bet_amount": 100,
      "win_amount": 0,
      "result": "{\"number\":13,\"color\":\"red\",\"isWin\":false}",
      "played_at": "2024-01-15 14:28:15"
    }
  ]
}
```

**Поля истории игр**:
- `id`: Уникальный идентификатор записи
- `user_id`: ID пользователя
- `game_type`: Тип игры (slots, roulette, blackjack, poker, dice, baccarat)
- `bet_amount`: Размер ставки
- `win_amount`: Выигрыш
- `result`: JSON-строка с деталями игры
- `played_at`: Дата и время игры

---

### Игры

Все игровые эндпоинты требуют аутентификации и принимают ставку (`betAmount`).

#### Общие требования для игр

**Аутентификация**: Требуется для всех игровых эндпоинтов

**Заголовки**:
```
Authorization: Bearer <your_jwt_token>
```

**Общие ошибки**:
- `400 Bad Request`: Недостаточно средств
  ```json
  {
    "error": "Insufficient balance"
  }
  ```
- `400 Bad Request`: Неверная сумма ставки
  ```json
  {
    "error": "Bet amount must be greater than 0"
  }
  ```
- `400 Bad Request`: Ставка превышает максимум
  ```json
  {
    "error": "Bet amount cannot exceed $10000"
  }
  ```

---

#### 🎰 Слоты

Классический слот-автомат с тремя барабанами.

**Endpoint**: `POST /api/games/slots`

**Тело запроса**:
```json
{
  "betAmount": 50
}
```

**Параметры**:
- `betAmount` (number, required): Размер ставки (больше 0, максимум 10000)

**Успешный ответ** (200 OK):
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

**Типы выигрышей**:
- `jackpot`: Три 💎 = 10x ставки
- `big_win`: Три 7️⃣ = 7x ставки, Три ⭐ = 5x ставки
- `win`: Три одинаковых символа = 3x ставки
- `small_win`: Два одинаковых символа = 1.5x ставки
- `loss`: Проигрыш

**Символы**:
- 💎 (Алмаз): x10
- 7️⃣ (Семерка): x7
- ⭐ (Звезда): x5
- 🍒, 🍋, 🍊, 🍉 (Фрукты): x3 за три одинаковых

---

#### 🎡 Рулетка

Европейская рулетка с числами от 0 до 36.

**Endpoint**: `POST /api/games/roulette`

**Тело запроса**:
```json
{
  "betAmount": 100,
  "betType": "color",
  "betValue": "red"
}
```

**Параметры**:
- `betAmount` (number, required): Размер ставки
- `betType` (string, required): Тип ставки
  - `number`: Ставка на конкретное число (0-36)
  - `color`: Ставка на цвет (red/black)
  - `even_odd`: Ставка на четность (even/odd)
  - `low_high`: Ставка на диапазон (low: 1-18, high: 19-36)
- `betValue` (string/number, required): Значение ставки в зависимости от типа

**Примеры запросов**:

Ставка на число:
```json
{
  "betAmount": 50,
  "betType": "number",
  "betValue": 17
}
```

Ставка на цвет:
```json
{
  "betAmount": 100,
  "betType": "color",
  "betValue": "red"
}
```

Ставка на четность:
```json
{
  "betAmount": 75,
  "betType": "even_odd",
  "betValue": "even"
}
```

Ставка на диапазон:
```json
{
  "betAmount": 150,
  "betType": "low_high",
  "betValue": "high"
}
```

**Успешный ответ** (200 OK):
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

**Выплаты**:
- Конкретное число: x36
- Цвет (красный/черный): x2
- Четность (четное/нечетное): x2
- Диапазон (низкий/высокий): x2

**Возможные ошибки**:
- `400 Bad Request`: Неверный тип ставки
  ```json
  {
    "error": "Invalid bet type"
  }
  ```

---

#### 🃏 Блэкджек

Классическая карточная игра - попытайтесь набрать 21 или ближе к 21, чем дилер.

**Endpoint**: `POST /api/games/blackjack`

**Игра состоит из нескольких действий (actions)**:
- `start`: Начать новую игру
- `hit`: Взять карту
- `stand`: Остановиться

##### Начать игру

**Тело запроса**:
```json
{
  "betAmount": 100,
  "action": "start"
}
```

**Успешный ответ** (200 OK) - игра продолжается:
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

**Успешный ответ** (200 OK) - немедленный блэкджек:
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

##### Взять карту (Hit)

**Тело запроса**:
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

**Примечание**: `gameState` должен быть тем же, что вернул предыдущий запрос.

**Успешный ответ** (200 OK) - игра продолжается:
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

**Успешный ответ** (200 OK) - перебор:
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

##### Остановиться (Stand)

**Тело запроса**:
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

**Успешный ответ** (200 OK):
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

**Возможные исходы (outcome)**:
- `blackjack`: Блэкджек у игрока (21 с первых двух карт) = 2.5x ставки
- `win`: Игрок победил = 2x ставки
- `dealer_bust`: Дилер перебрал = 2x ставки
- `push`: Ничья = возврат ставки (1x)
- `bust`: Игрок перебрал = проигрыш
- `loss`: Дилер победил = проигрыш

**Правила**:
- Игрок может брать карты пока не наберет 21 или не перебрет
- Дилер обязан брать карты до 17 или выше
- Туз может быть 1 или 11
- Фигуры (J, Q, K) считаются как 10

---

#### 🃏 Покер (Texas Hold'em)

Упрощенная версия Техасского Холдема - получите лучшую комбинацию из 5 карт.

**Endpoint**: `POST /api/games/poker`

**Тело запроса**:
```json
{
  "betAmount": 100
}
```

**Успешный ответ** (200 OK):
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

**Комбинации и выплаты**:
- `Four of a Kind` (Каре): x10
- `Full House` (Фулл-хаус): x8
- `Flush` (Флеш): x6
- `Three of a Kind` (Тройка): x4
- `Two Pair` (Две пары): x2.5
- `Pair` (Пара): x1.5
- `High Card` (Старшая карта): проигрыш

---

#### 🎲 Кости (Craps)

Бросьте две кости и ставьте на различные исходы.

**Endpoint**: `POST /api/games/dice`

**Тело запроса**:
```json
{
  "betAmount": 50,
  "betType": "seven"
}
```

**Параметры**:
- `betAmount` (number, required): Размер ставки
- `betType` (string, required): Тип ставки
  - `seven`: Ставка на сумму 7
  - `eleven`: Ставка на сумму 11
  - `high`: Ставка на высокие числа (8-12)
  - `low`: Ставка на низкие числа (2-6)
  - `even`: Ставка на четную сумму
  - `odd`: Ставка на нечетную сумму

**Успешный ответ** (200 OK):
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

**Выплаты**:
- Seven (7): x5
- Eleven (11): x8
- High (8-12): x2
- Low (2-6): x2
- Even (четное): x2
- Odd (нечетное): x2

**Возможные ошибки**:
- `400 Bad Request`: Неверный тип ставки
  ```json
  {
    "error": "Invalid bet type"
  }
  ```

---

#### 💎 Баккара

Классическая карточная игра - ставьте на Игрока, Банкира или Ничью.

**Endpoint**: `POST /api/games/baccarat`

**Тело запроса**:
```json
{
  "betAmount": 100,
  "side": "player"
}
```

**Параметры**:
- `betAmount` (number, required): Размер ставки
- `side` (string, required): Сторона для ставки
  - `player`: Ставка на игрока
  - `banker`: Ставка на банкира
  - `tie`: Ставка на ничью

**Успешный ответ** (200 OK):
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

**Выплаты**:
- Player (Игрок): x2
- Banker (Банкир): x1.95 (комиссия казино)
- Tie (Ничья): x9
- При ничье ставки на Player/Banker возвращаются

**Правила**:
- Цель: набрать сумму ближе к 9
- Туз = 1, 2-9 = номинал, 10/J/Q/K = 0
- Сумма по модулю 10 (например, 15 = 5)
- Правило третьей карты применяется автоматически

**Возможные ошибки**:
- `400 Bad Request`: Неверная сторона ставки
  ```json
  {
    "error": "Invalid betting side"
  }
  ```

---

## Обработка ошибок

API использует стандартные HTTP коды состояния:

### Коды успеха
- `200 OK`: Запрос выполнен успешно

### Коды ошибок клиента
- `400 Bad Request`: Неверные параметры запроса
- `401 Unauthorized`: Требуется аутентификация
- `403 Forbidden`: Недействительный токен
- `404 Not Found`: Ресурс не найден

### Коды ошибок сервера
- `500 Internal Server Error`: Внутренняя ошибка сервера

### Формат ошибки

Все ошибки возвращаются в следующем формате:

```json
{
  "error": "Описание ошибки"
}
```

---

## Ограничение частоты запросов

API защищено от злоупотреблений с помощью ограничения частоты запросов (rate limiting).

### Общие эндпоинты
- **Лимит**: 100 запросов за 15 минут на IP-адрес
- **Применяется к**: Все `/api/*` эндпоинты

### Эндпоинты аутентификации
- **Лимит**: 5 запросов за 15 минут на IP-адрес
- **Применяется к**: `/api/auth/*` эндпоинты (register, login)

### Заголовки ответа

При каждом запросе сервер возвращает следующие заголовки:

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1642345678
```

### Ошибка превышения лимита

При превышении лимита вы получите ответ `429 Too Many Requests`:

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Примеры использования

### JavaScript (Fetch API)

#### Регистрация
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
    // Сохраните токен для дальнейших запросов
    localStorage.setItem('token', data.token);
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

#### Вход
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

#### Получить профиль
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

#### Сыграть в слоты
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
    console.log('Барабаны:', data.result.reels);
    console.log('Выигрыш:', data.winAmount);
    console.log('Новый баланс:', data.balance);
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

#### Сыграть в рулетку
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
    console.log('Число:', data.result.number);
    console.log('Цвет:', data.result.color);
    console.log('Выигрыш:', data.winAmount);
    return data;
  } else {
    throw new Error(data.error);
  }
};

// Пример использования
playRoulette(100, 'color', 'red');
```

#### Сыграть в блэкджек (полный цикл)
```javascript
const playBlackjack = async (betAmount) => {
  const token = localStorage.getItem('token');
  
  // Начать игру
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
    console.log('Игра завершена сразу!');
    return data;
  }
  
  console.log('Ваши карты:', data.gameState.playerHand);
  console.log('Ваша сумма:', data.playerValue);
  
  // Взять карту если нужно
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
  
  // Остановиться
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
  
  console.log('Результат:', data.result.outcome);
  console.log('Выигрыш:', data.winAmount);
  return data;
};
```

### cURL

#### Регистрация
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player123","password":"securePassword123"}'
```

#### Вход
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player123","password":"securePassword123"}'
```

#### Получить профиль
```bash
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Сыграть в слоты
```bash
curl -X POST http://localhost:3000/api/games/slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"betAmount":50}'
```

#### Сыграть в рулетку
```bash
curl -X POST http://localhost:3000/api/games/roulette \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"betAmount":100,"betType":"color","betValue":"red"}'
```

---

## Безопасность

### Рекомендации по безопасности

1. **Токены**: Всегда храните JWT токены в безопасном месте (например, httpOnly cookies или localStorage с осторожностью)
2. **HTTPS**: В продакшене всегда используйте HTTPS для шифрования данных
3. **Переменные окружения**: Установите `JWT_SECRET` как переменную окружения для защиты токенов
4. **Пароли**: Используйте надежные пароли (минимум 6 символов, рекомендуется 12+)
5. **Rate Limiting**: Учитывайте лимиты частоты запросов при разработке клиента

### Переменные окружения

```bash
# .env файл
JWT_SECRET=ваш_секретный_ключ_здесь
PORT=3000
```

---

## Техническая поддержка

Если у вас возникли вопросы или проблемы с API, пожалуйста:

1. Проверьте, что вы используете правильные заголовки и формат данных
2. Убедитесь, что ваш JWT токен действителен и не истек
3. Проверьте, что вы не превысили лимиты частоты запросов
4. Убедитесь, что у вас достаточно средств для игры

---

## Версионирование

**Текущая версия**: v1.0.0

API может обновляться с добавлением новых функций. Мы стараемся сохранять обратную совместимость, но критические изменения будут объявлены заранее.

---

**Последнее обновление документации**: 2024-01-15

