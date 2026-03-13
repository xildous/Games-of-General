const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const COLS = 8;
const ROWS = 9;

const RANKS = {
  FIVE_STAR_GENERAL: 1,
  FOUR_STAR_GENERAL: 2,
  THREE_STAR_GENERAL: 3,
  TWO_STAR_GENERAL: 4,
  ONE_STAR_GENERAL: 5,
  COLONEL: 6,
  LT_COLONEL: 7,
  MAJOR: 8,
  CAPTAIN: 9,
  FIRST_LIEUTENANT: 10,
  SECOND_LIEUTENANT: 11,
  SERGEANT: 12,
  PRIVATE: 13,
  SPY: 14,
  FLAG: 15
};

const PIECE_SET = [
  { name: "Five-Star General", rank: RANKS.FIVE_STAR_GENERAL, count: 1 },
  { name: "Four-Star General", rank: RANKS.FOUR_STAR_GENERAL, count: 1 },
  { name: "Three-Star General", rank: RANKS.THREE_STAR_GENERAL, count: 1 },
  { name: "Two-Star General", rank: RANKS.TWO_STAR_GENERAL, count: 1 },
  { name: "One-Star General", rank: RANKS.ONE_STAR_GENERAL, count: 1 },
  { name: "Colonel", rank: RANKS.COLONEL, count: 1 },
  { name: "Lieutenant Colonel", rank: RANKS.LT_COLONEL, count: 1 },
  { name: "Major", rank: RANKS.MAJOR, count: 1 },
  { name: "Captain", rank: RANKS.CAPTAIN, count: 1 },
  { name: "First Lieutenant", rank: RANKS.FIRST_LIEUTENANT, count: 1 },
  { name: "Second Lieutenant", rank: RANKS.SECOND_LIEUTENANT, count: 1 },
  { name: "Sergeant", rank: RANKS.SERGEANT, count: 1 },
  { name: "Private", rank: RANKS.PRIVATE, count: 6 },
  { name: "Spy", rank: RANKS.SPY, count: 2 },
  { name: "Flag", rank: RANKS.FLAG, count: 1 }
];

const PIECE_SPEC_BY_NAME = new Map(PIECE_SET.map((spec) => [spec.name, spec]));

const rooms = new Map();

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function sanitizeText(input, fallback) {
  if (typeof input !== "string") return fallback;
  const trimmed = input.trim();
  return trimmed || fallback;
}

function sanitizeProfile(profile) {
  return {
    id: sanitizeText(profile?.id, `guest-${Math.random().toString(36).slice(2, 8)}`).slice(0, 40),
    name: sanitizeText(profile?.name, "Guest").slice(0, 20),
    avatar: sanitizeText(profile?.avatar, "[?]").slice(0, 2)
  };
}

function createArmy(owner, rows) {
  const slots = [];
  const pieces = [];

  for (const row of rows) {
    for (let col = 0; col < COLS; col += 1) {
      slots.push({ row, col });
    }
  }

  shuffle(slots);

  let idNo = 0;
  for (const spec of PIECE_SET) {
    for (let i = 0; i < spec.count; i += 1) {
      const pos = slots.pop();
      pieces.push({
        id: `${owner}-${idNo}`,
        owner,
        name: spec.name,
        imageKey: spec.name,
        rank: spec.rank,
        row: pos.row,
        col: pos.col,
        alive: true,
        deployed: true
      });
      idNo += 1;
    }
  }

  return pieces;
}

function buildGameState() {
  return {
    currentPlayer: 1,
    status: "playing",
    winnerOwner: null,
    pieces: [...createArmy(1, [6, 7, 8]), ...createArmy(2, [0, 1, 2])]
  };
}

function buildGameStateFromSetups(setupByOwner) {
  const pieces = [];
  for (const owner of [1, 2]) {
    let idNo = 0;
    for (const placement of setupByOwner[owner]) {
      const spec = PIECE_SPEC_BY_NAME.get(placement.imageKey);
      pieces.push({
        id: `${owner}-${idNo}`,
        owner,
        name: spec.name,
        imageKey: spec.name,
        rank: spec.rank,
        row: placement.row,
        col: placement.col,
        alive: true,
        deployed: true
      });
      idNo += 1;
    }
  }

  return {
    currentPlayer: 1,
    status: "playing",
    winnerOwner: null,
    pieces
  };
}

function validateSetupPieces(owner, setupPieces) {
  if (!Array.isArray(setupPieces)) {
    return { ok: false, error: "Invalid setup payload." };
  }

  const expectedTotal = PIECE_SET.reduce((sum, spec) => sum + spec.count, 0);
  if (setupPieces.length !== expectedTotal) {
    return { ok: false, error: "Setup must include exactly 21 pieces." };
  }

  const allowedRows = owner === 1 ? new Set([6, 7, 8]) : new Set([0, 1, 2]);
  const usedCells = new Set();
  const countsByName = new Map();

  const normalized = [];

  for (const piece of setupPieces) {
    const imageKey = sanitizeText(piece?.imageKey, "");
    const spec = PIECE_SPEC_BY_NAME.get(imageKey);
    const row = Number(piece?.row);
    const col = Number(piece?.col);

    if (!spec) {
      return { ok: false, error: "Invalid piece type in setup." };
    }

    if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || row >= ROWS || col < 0 || col >= COLS) {
      return { ok: false, error: "Invalid piece coordinates in setup." };
    }

    if (!allowedRows.has(row)) {
      return { ok: false, error: "All setup pieces must stay in your 3 starting rows." };
    }

    const coordKey = `${row},${col}`;
    if (usedCells.has(coordKey)) {
      return { ok: false, error: "Setup has duplicate board coordinates." };
    }
    usedCells.add(coordKey);
    countsByName.set(spec.name, (countsByName.get(spec.name) || 0) + 1);

    normalized.push({ imageKey: spec.name, row, col });
  }

  for (const spec of PIECE_SET) {
    if ((countsByName.get(spec.name) || 0) !== spec.count) {
      return { ok: false, error: `Invalid count for ${spec.name}.` };
    }
  }

  return { ok: true, setup: normalized };
}

function getPieceAt(state, row, col) {
  return state.pieces.find((piece) => piece.alive && piece.row === row && piece.col === col) || null;
}

function isValidMove(state, piece, toRow, toCol) {
  if (!piece || !piece.alive) return false;
  if (toRow < 0 || toRow >= ROWS || toCol < 0 || toCol >= COLS) return false;

  const dRow = Math.abs(piece.row - toRow);
  const dCol = Math.abs(piece.col - toCol);
  if (dRow + dCol !== 1) return false;

  const occupant = getPieceAt(state, toRow, toCol);
  if (occupant && occupant.owner === piece.owner) return false;

  if (piece.rank === RANKS.FLAG && occupant && occupant.owner !== piece.owner && occupant.rank !== RANKS.FLAG) {
    return false;
  }

  return true;
}

function computeBattleResult(attacker, defender) {
  if (defender.rank === RANKS.FLAG) return "attacker";
  if (attacker.rank === RANKS.FLAG && defender.rank === RANKS.FLAG) return "attacker";

  if (attacker.rank === RANKS.SPY) {
    if (defender.rank === RANKS.PRIVATE) return "defender";
    if (defender.rank === RANKS.SPY) return "both";
    return "attacker";
  }

  if (defender.rank === RANKS.SPY) {
    if (attacker.rank === RANKS.PRIVATE) return "attacker";
    return "defender";
  }

  if (attacker.rank === RANKS.PRIVATE) {
    if (defender.rank === RANKS.PRIVATE) return "both";
    return "defender";
  }

  if (defender.rank === RANKS.PRIVATE) return "attacker";

  if (attacker.rank < defender.rank) return "attacker";
  if (attacker.rank > defender.rank) return "defender";
  return "both";
}

function applyMove(state, owner, move) {
  if (state.status !== "playing") return { ok: false, error: "Game already ended." };
  if (owner !== state.currentPlayer) return { ok: false, error: "Not your turn." };

  const piece = getPieceAt(state, move.fromRow, move.fromCol);
  if (!piece || piece.owner !== owner) return { ok: false, error: "Invalid source piece." };
  if (!isValidMove(state, piece, move.toRow, move.toCol)) return { ok: false, error: "Invalid move." };

  const defender = getPieceAt(state, move.toRow, move.toCol);

  if (!defender) {
    piece.row = move.toRow;
    piece.col = move.toCol;
    state.currentPlayer = owner === 1 ? 2 : 1;
    return {
      ok: true,
      event: {
        kind: "move",
        pieceIds: [piece.id]
      }
    };
  }

  const result = computeBattleResult(piece, defender);

  if (result === "attacker") {
    defender.alive = false;
    piece.row = move.toRow;
    piece.col = move.toCol;

    if (defender.rank === RANKS.FLAG) {
      state.status = "ended";
      state.winnerOwner = owner;
      return {
        ok: true,
        event: {
          kind: "win",
          pieceIds: [piece.id, defender.id],
          winnerOwner: owner
        }
      };
    }

    state.currentPlayer = owner === 1 ? 2 : 1;
    return {
      ok: true,
      event: {
        kind: "battle",
        pieceIds: [piece.id, defender.id]
      }
    };
  }

  if (result === "defender") {
    piece.alive = false;
    state.currentPlayer = owner === 1 ? 2 : 1;
    return {
      ok: true,
      event: {
        kind: "battle",
        pieceIds: [piece.id, defender.id]
      }
    };
  }

  piece.alive = false;
  defender.alive = false;
  state.currentPlayer = owner === 1 ? 2 : 1;
  return {
    ok: true,
    event: {
      kind: "battle",
      pieceIds: [piece.id, defender.id]
    }
  };
}

function createRoom() {
  return {
    players: { 1: null, 2: null },
    playerProfiles: { 1: null, 2: null },
    readyOwners: new Set(),
    setupByOwner: { 1: null, 2: null },
    spectators: new Set(),
    spectatorProfiles: new Map(),
    game: null,
    moveHistory: [],
    chatHistory: []
  };
}

function createSnapshot(game, label) {
  return {
    label,
    timestamp: Date.now(),
    phase: game.status === "setup" ? "setup" : "battle",
    currentPlayer: game.currentPlayer,
    setupPlayer: 1,
    gameOver: game.status === "ended",
    pieces: game.pieces.map((piece) => ({ ...piece })),
    capturedByP1: [],
    capturedByP2: []
  };
}

function getLobbyPayload(room) {
  return {
    players: [room.playerProfiles[1], room.playerProfiles[2]],
    spectatorCount: room.spectators.size,
    readyOwners: Array.from(room.readyOwners)
  };
}

function filteredStateForViewer(game, owner, role) {
  const pieces = game.pieces.map((piece) => {
    const sameOwner = owner && piece.owner === owner;
    if (role === "spectator" || !sameOwner) {
      return {
        ...piece,
        name: "Classified",
        rank: 999,
        hiddenFromViewer: true
      };
    }
    return {
      ...piece,
      hiddenFromViewer: false
    };
  });

  return {
    currentPlayer: game.currentPlayer,
    status: game.status,
    winnerOwner: game.winnerOwner,
    pieces
  };
}

function emitLobby(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit("room-lobby", getLobbyPayload(room));
}

function emitRoomState(roomId, eventMeta = null) {
  const room = rooms.get(roomId);
  if (!room || !room.game) return;

  for (const owner of [1, 2]) {
    const socketId = room.players[owner];
    if (!socketId) continue;
    io.to(socketId).emit("room-state", {
      state: filteredStateForViewer(room.game, owner, "player"),
      event: eventMeta,
      history: room.moveHistory
    });
  }

  for (const spectatorId of room.spectators) {
    io.to(spectatorId).emit("room-state", {
      state: filteredStateForViewer(room.game, null, "spectator"),
      event: eventMeta,
      history: room.moveHistory
    });
  }
}

function emitVoicePeerReady(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.players[1] || !room.players[2]) return;
  io.to(room.players[1]).emit("voice-peer-ready", { initiator: true });
  io.to(room.players[2]).emit("voice-peer-ready", { initiator: false });
}

function getOpponentSocketId(room, owner) {
  if (!room || !owner) return null;
  return owner === 1 ? room.players[2] : room.players[1];
}

// Serve frontend files from project root for Render and local runs.
app.use(express.static(__dirname));

// Lightweight health endpoint for platform checks.
app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, role, profile }) => {
    const cleanRoom = sanitizeText(roomId, "");
    if (!cleanRoom) {
      socket.emit("room-error", { message: "Invalid room." });
      return;
    }

    if (!rooms.has(cleanRoom)) rooms.set(cleanRoom, createRoom());
    const room = rooms.get(cleanRoom);

    const normalizedProfile = sanitizeProfile(profile);
    const requestedRole = role === "spectator" ? "spectator" : "player";

    let owner = null;
    let finalRole = requestedRole;

    if (requestedRole === "player") {
      // Rejoin on same slot if profile id matches and slot is currently free.
      for (const candidate of [1, 2]) {
        const slotProfile = room.playerProfiles[candidate];
        if (slotProfile && slotProfile.id === normalizedProfile.id && !room.players[candidate]) {
          owner = candidate;
          break;
        }
      }

      if (!owner) {
        if (!room.players[1]) owner = 1;
        else if (!room.players[2]) owner = 2;
      }

      if (!owner) {
        finalRole = "spectator";
      }
    }

    if (finalRole === "spectator") {
      room.spectators.add(socket.id);
      room.spectatorProfiles.set(socket.id, normalizedProfile);
    } else {
      // New join on a seat resets that seat's ready/setup state.
      room.game = null;
      room.moveHistory = [];
      room.readyOwners.clear();
      room.setupByOwner[1] = null;
      room.setupByOwner[2] = null;
      room.readyOwners.delete(owner);
      room.setupByOwner[owner] = null;
      room.players[owner] = socket.id;
      room.playerProfiles[owner] = normalizedProfile;
    }

    socket.data.roomId = cleanRoom;
    socket.data.role = finalRole;
    socket.data.owner = owner;
    socket.data.profile = normalizedProfile;

    socket.join(cleanRoom);

    const waiting = !(room.players[1] && room.players[2]);

    socket.emit("joined-room", {
      roomId: cleanRoom,
      role: finalRole,
      owner,
      waiting,
      gameStarted: !!room.game,
      lobby: getLobbyPayload(room),
      chatHistory: room.chatHistory
    });

    socket.emit("room-chat-history", room.chatHistory);
    emitLobby(cleanRoom);
    emitVoicePeerReady(cleanRoom);

    if (room.game) {
      emitRoomState(cleanRoom);
    }
  });

  socket.on("submit-setup", ({ roomId, setupPieces }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    if (socket.data.role !== "player" || !socket.data.owner) {
      socket.emit("room-error", { message: "Only players can submit setup." });
      return;
    }

    const owner = socket.data.owner;
    const validation = validateSetupPieces(owner, setupPieces);
    if (!validation.ok) {
      socket.emit("room-error", { message: validation.error });
      return;
    }

    room.setupByOwner[owner] = validation.setup;
    room.readyOwners.add(owner);
    emitLobby(roomId);

    if (room.setupByOwner[1] && room.setupByOwner[2]) {
      room.game = buildGameStateFromSetups(room.setupByOwner);
      room.moveHistory = [createSnapshot(room.game, "Battle starts")];
      emitRoomState(roomId, { kind: "setup-complete" });
    }
  });

  socket.on("move-piece", ({ roomId, fromRow, fromCol, toRow, toCol }) => {
    const room = rooms.get(roomId);
    if (!room || !room.game) return;
    if (socket.data.role !== "player" || !socket.data.owner) {
      socket.emit("room-error", { message: "Spectators cannot move pieces." });
      return;
    }

    const owner = socket.data.owner;
    const result = applyMove(room.game, owner, {
      fromRow: Number(fromRow),
      fromCol: Number(fromCol),
      toRow: Number(toRow),
      toCol: Number(toCol)
    });

    if (!result.ok) {
      socket.emit("room-error", { message: result.error });
      return;
    }

    room.moveHistory.push(createSnapshot(room.game, "Turn resolved"));
    if (room.moveHistory.length > 400) room.moveHistory.shift();

    emitRoomState(roomId, result.event);
  });

  socket.on("chat-message", ({ roomId, text, profile }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const cleanText = sanitizeText(text, "").slice(0, 180);
    if (!cleanText) return;

    const normalizedProfile = sanitizeProfile(profile || socket.data.profile || {});
    const payload = {
      profile: normalizedProfile,
      text: cleanText,
      time: Date.now()
    };

    room.chatHistory.push(payload);
    if (room.chatHistory.length > 120) room.chatHistory.shift();

    io.to(roomId).emit("room-chat", payload);
  });

  socket.on("webrtc-offer", ({ roomId, sdp }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.role !== "player") return;
    const target = getOpponentSocketId(room, socket.data.owner);
    if (!target || !sdp) return;
    io.to(target).emit("webrtc-offer", { sdp });
  });

  socket.on("webrtc-answer", ({ roomId, sdp }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.role !== "player") return;
    const target = getOpponentSocketId(room, socket.data.owner);
    if (!target || !sdp) return;
    io.to(target).emit("webrtc-answer", { sdp });
  });

  socket.on("webrtc-ice", ({ roomId, candidate }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.role !== "player") return;
    const target = getOpponentSocketId(room, socket.data.owner);
    if (!target || !candidate) return;
    io.to(target).emit("webrtc-ice", { candidate });
  });

  socket.on("voice-activity", ({ roomId, speaking }) => {
    const room = rooms.get(roomId);
    if (!room || socket.data.role !== "player") return;
    const target = getOpponentSocketId(room, socket.data.owner);
    if (!target) return;
    io.to(target).emit("voice-activity", { speaking: !!speaking });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);

    if (room.players[1] === socket.id) {
      room.players[1] = null;
      room.readyOwners.delete(1);
      room.setupByOwner[1] = null;
    }
    if (room.players[2] === socket.id) {
      room.players[2] = null;
      room.readyOwners.delete(2);
      room.setupByOwner[2] = null;
    }

    room.spectators.delete(socket.id);
    room.spectatorProfiles.delete(socket.id);

    io.to(roomId).emit("opponent-left");
    emitLobby(roomId);

    const anyActive = room.players[1] || room.players[2] || room.spectators.size > 0;
    if (!anyActive) {
      rooms.delete(roomId);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
