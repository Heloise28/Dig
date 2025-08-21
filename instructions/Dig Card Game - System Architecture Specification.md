# Dig Card Game - System Architecture Specification

## Architecture Overview

The system follows a hierarchical, object-oriented design with clear separation of concerns. Each component has a single responsibility and communicates through well-defined interfaces.

```
Main
├── SessionManager
│   └── Session (Table)
│       ├── Game (Current game instance)
│       │   ├── Rules (DigGameRules)
│       │   ├── GameState
│       │   └── ScoreKeeper
│       └── Players[]
│           ├── HumanPlayer
│           │   └── UIController (buttons, clicks)
│           └── ComputerPlayer
│               └── AIEngine (strategy, probability)
```

---

## 1. Main Class (Application Entry Point)

**Responsibilities:**
- Initialize the entire application
- Manage global application state
- Handle server startup and configuration
- Coordinate between different subsystems

**Key Methods:**
```javascript
class Main {
  constructor()           // Initialize application
  startServer()          // Start Express + Socket.IO server
  initializeRoutes()     // Set up HTTP endpoints
  handleConnections()    // Manage Socket.IO connections
  shutdown()             // Clean shutdown process
}
```

**Properties:**
- `sessionManager`: Manages all active sessions
- `server`: Express server instance
- `io`: Socket.IO instance
- `config`: Application configuration

---

## 2. SessionManager Class

**Responsibilities:**
- Create and destroy sessions
- Assign unique session codes
- Route players to appropriate sessions
- Clean up empty sessions

**Key Methods:**
```javascript
class SessionManager {
  createSession(hostPlayer)        // Create new session with room code
  joinSession(sessionCode, player) // Add player to existing session
  removePlayer(sessionId, playerId) // Remove player from session
  getSession(sessionCode)         // Retrieve session by code
  cleanupEmptySessions()          // Remove sessions with no players
  getAllActiveSessions()          // Get list of active sessions
}
```

**Properties:**
- `sessions`: Map of sessionCode -> Session instances
- `playerSessionMap`: Map of playerId -> sessionCode for quick lookup

---

## 3. Session Class (Game Table)

**Responsibilities:**
- Manage a game table where players can play multiple rounds
- Handle player joining/leaving
- Maintain session state and history
- Coordinate game lifecycle

**Key Methods:**
```javascript
class Session {
  constructor(sessionCode, maxPlayers = 3)
  addPlayer(player)              // Add player to session
  removePlayer(playerId)         // Remove player (pause/end session)
  startNewGame()                 // Begin a new game round
  endCurrentGame()               // Finish current game, update scores
  canStartGame()                 // Check if enough players to start
  pauseSession()                 // Pause when player leaves mid-game
  resumeSession(returningPlayer) // Resume when player reconnects
  endSession()                   // Terminate session (all players left)
  broadcastToAllPlayers(event, data) // Send message to all players
}
```

**Properties:**
- `sessionCode`: Unique identifier (e.g., "ABC123")
- `players[]`: Array of Player instances (max 3)
- `currentGame`: Current Game instance (null if no active game)
- `gameHistory[]`: Record of completed games
- `sessionState`: "waiting", "playing", "paused", "ended"
- `createdAt`: Session creation timestamp
- `lastActivity`: For cleanup of inactive sessions

**State Management:**
- **waiting**: Waiting for players to join
- **playing**: Game in progress
- **paused**: Game paused due to player leaving
- **ended**: Session terminated

---

## 4. Game Class (Single Game Round)

**Responsibilities:**
- Manage one complete game of Dig
- Enforce game rules through Rules class
- Handle turn management
- Track game state and progress
- Coordinate player actions

**Key Methods:**
```javascript
class Game {
  constructor(players[], rules)
  initializeGame()               // Set up new game (deal cards, etc.)
  startBiddingPhase()           // Begin bidding phase
  processBid(playerId, bidAmount) // Handle player bid
  startPlayingPhase()           // Begin card playing phase
  playCard(playerId, card)      // Process card play
  validateMove(playerId, action) // Check if move is legal
  nextTurn()                    // Advance to next player
  checkWinCondition()           // Check if game is complete
  endGame()                     // Finish game, calculate scores
  getGameState(forPlayerId)     // Get current state for specific player
  getCurrentPlayer()            // Get player whose turn it is
}
```

**Properties:**
- `gameId`: Unique identifier for this game
- `players[]`: Reference to session players
- `rules`: DigGameRules instance
- `gameState`: GameState instance
- `scoreKeeper`: ScoreKeeper instance
- `phase`: "bidding", "playing", "finished"
- `currentPlayerIndex`: Whose turn it is
- `startTime`: When game started
- `lastMoveTime`: For timeout handling

---

## 5. Rules Class (DigGameRules)

**Responsibilities:**
- Encode all rules of the Dig card game
- Validate moves and game states
- Determine valid actions for current state
- Calculate game outcomes

**Key Methods:**
```javascript
class DigGameRules {
  validateBid(currentBids, newBid, playerHand)  // Check if bid is legal
  validateCardPlay(playedCards, newCard, playerHand) // Check if card play is valid
  determineWinner(playedCards)                  // Who wins the trick
  calculateHandStrength(hand)                   // Evaluate hand for AI bidding
  getValidPlays(hand, currentTrick)            // What cards can be played
  isGameComplete(players)                       // Check win condition
  calculateFinalScores(gameResult, bids)        // Determine point distribution
  getCardRanking()                             // Return card hierarchy (3>2>A>K...)
  canFormStraight(cards)                       // Check if cards form valid straight
  getCardCombinationType(cards)                // Single, pair, triple, etc.
}
```

**Properties:**
- `cardRanking`: Dig-specific card order (3, 2, A, K, Q, J, 10, 9, 8, 7, 6, 5, 4)
- `maxBid`: Maximum bid allowed (3 points)
- `minPlayers`: Minimum players (3)
- `maxPlayers`: Maximum players (3)

---

## 6. GameState Class

**Responsibilities:**
- Store current state of the game
- Track all game variables
- Provide serializable state for networking
- Handle state transitions

**Key Methods:**
```javascript
class GameState {
  constructor()
  serialize()                    // Convert to JSON for network transmission
  deserialize(jsonData)          // Restore from JSON
  updateState(newState)          // Apply state changes
  getPlayerView(playerId)        // Get state visible to specific player
  clone()                        // Create deep copy of current state
}
```

**Properties:**
- `phase`: Current game phase
- `currentPlayer`: Who's turn it is
- `bids[]`: All player bids
- `playedCards[]`: Cards played this trick
- `trickHistory[]`: Previous tricks
- `playerHands[]`: Each player's cards
- `digger`: Who is the digger (from bidding)
- `bottomCards[]`: The 4 bottom cards given to digger

---

## 7. ScoreKeeper Class

**Responsibilities:**
- Track scores across multiple games
- Calculate point changes after each game
- Maintain game statistics
- Handle Dig-specific scoring rules

**Key Methods:**
```javascript
class ScoreKeeper {
  constructor()
  recordGameResult(winner, digger, bidAmount) // Update scores after game
  getPlayerScore(playerId)                    // Get current score
  getScoreHistory()                          // Get historical scores
  calculatePointChange(gameResult)           // Determine point distribution
  resetScores()                             // Clear all scores
}
```

**Properties:**
- `playerScores{}`: playerId -> current score
- `gameResults[]`: History of game outcomes
- `totalGamesPlayed`: Counter for statistics

---

## 8. Player Class (Abstract Base)

**Responsibilities:**
- Define common player interface
- Handle player identification and state
- Manage player's cards and actions
- Provide base functionality for both human and AI players

**Key Methods:**
```javascript
class Player {
  constructor(id, name, type)
  // Abstract methods (implemented by subclasses)
  makeMove(gameState)           // Decide on action (bid/play card)
  selectCards(options)          // Choose from available cards
  
  // Concrete methods
  receiveCards(cards)           // Add cards to hand
  playCard(card)               // Remove card from hand
  getHand()                    // Get current cards
  canMakeMove(gameState)       // Check if player can act
  disconnect()                 // Handle player leaving
  reconnect()                  // Handle player returning
}
```

**Properties:**
- `playerId`: Unique identifier
- `playerName`: Display name
- `type`: "human" or "computer"
- `hand[]`: Current cards in hand
- `isConnected`: Connection status
- `sessionId`: Which session player belongs to
- `position`: Seat at table (0, 1, 2)

---

## 9. HumanPlayer Class (extends Player)

**Responsibilities:**
- Handle human player interactions
- Process UI inputs (button clicks)
- Manage network communication with client
- Handle connection/disconnection

**Key Methods:**
```javascript
class HumanPlayer extends Player {
  constructor(id, name, socketConnection)
  makeMove(gameState)          // Wait for player input via socket
  sendGameState(gameState)     // Send current state to client
  handleSocketEvent(event, data) // Process client messages
  waitForInput(timeout)        // Wait for player action with timeout
  disconnect()                 // Handle network disconnection
  reconnect(newSocket)         // Restore connection
}
```

**Properties:**
- `socket`: Socket.IO connection to client
- `pendingAction`: What action player needs to take
- `inputTimeout`: Timer for player actions
- `uiController`: Reference to client-side UI

---

## 10. ComputerPlayer Class (extends Player)

**Responsibilities:**
- Simulate AI player behavior
- Make decisions using AIEngine
- Provide varied difficulty levels
- Implement personality traits

**Key Methods:**
```javascript
class ComputerPlayer extends Player {
  constructor(id, aiCharacter)
  makeMove(gameState)          // Use AI to decide action
  makeBid(hand, currentBids)   // AI bidding decision
  playCard(gameState)          // AI card selection
  simulateThinkingDelay()      // Add realistic timing
  updatePersonality(traits)    // Modify AI behavior
}
```

**Properties:**
- `aiEngine`: AIEngine instance for decision making
- `character`: AI personality (difficulty, traits)
- `thinkingTime`: How long AI "thinks" before moves
- `difficultyLevel`: 1-5 star rating

---

## 11. AIEngine Class

**Responsibilities:**
- Implement AI decision-making algorithms
- Calculate probabilities and optimal moves
- Track played cards and remaining cards
- Provide different difficulty levels

**Key Methods:**
```javascript
class AIEngine {
  constructor(difficultyLevel, personality)
  decideBid(hand, currentBids)         // Determine optimal bid
  selectCard(hand, gameState)          // Choose best card to play
  calculateWinProbabilities(gameState) // Compute win chances
  trackPlayedCards(playedCards)        // Update card memory
  evaluateHandStrength(hand)           // Rate hand quality
  simulateGameOutcomes(gameState, iterations) // Monte Carlo simulation
  coordinateWithTeammate(gameState)    // Team strategy vs digger
  makeStrategicMistake()               // Occasional errors for lower difficulty
}
```

**Properties:**
- `difficulty`: 1-5 difficulty level
- `personality`: Behavioral traits (aggression, risk-taking)
- `cardMemory[]`: Tracked played cards
- `probabilityCache{}`: Cached calculations for performance
- `strategyWeights{}`: Decision-making parameters

---

## 12. Communication Flow

### Client-Server Events:
```javascript
// Client → Server
"join-session" (sessionCode, playerName)
"make-bid" (bidAmount)
"play-card" (cardData)
"leave-session" ()

// Server → Client  
"game-state-update" (gameState)
"your-turn" (availableActions)
"game-ended" (results)
"player-joined" (playerInfo)
"player-left" (playerId)
"error" (errorMessage)
```

---

## 13. Error Handling & Edge Cases

**Session Management:**
- Handle duplicate session codes
- Manage session capacity limits
- Clean up abandoned sessions
- Handle rapid join/leave scenarios

**Game Flow:**
- Validate all moves before processing
- Handle player timeouts gracefully
- Manage mid-game disconnections
- Prevent cheating/invalid states

**Network Issues:**
- Implement reconnection logic
- Handle partial data transmission
- Graceful degradation when offline
- State synchronization after reconnection

---

## 14. Data Flow Example

1. **Player joins**: Main → SessionManager → Session
2. **Game starts**: Session → Game → Rules (validate) → GameState
3. **Player bids**: HumanPlayer → Game → Rules (validate) → GameState → broadcast to all players
4. **AI move**: ComputerPlayer → AIEngine → Game → Rules → GameState → broadcast
5. **Game ends**: Game → ScoreKeeper → Session → broadcast results

This architecture ensures clear separation of concerns, maintainable code, and robust multiplayer functionality.


## Extra, CardCombination Class

 - Separate CardCombination Class
Make it a standalone class that takes an array of cards
Methods like getType(), isValid(), compareTo(otherCombo)
This keeps it independent and reusable

 - Part of the Rules Class
Since combination validation is really about game rules
Rules class could have methods like analyzeCards(), validateCombination()
Makes sense because different card games have different valid combinations