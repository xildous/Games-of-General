const COLS = 8;
const ROWS = 9;
const LEVEL_STORAGE_KEY = "gog_max_unlocked_level";
const SELECTED_LEVEL_STORAGE_KEY = "gog_selected_battle_level";
const AI_DIFFICULTY_STORAGE_KEY = "gog_ai_difficulty";
const THEME_STORAGE_KEY = "gog_theme";
const PROFILE_STORAGE_KEY = "gog_profile";
const PROFILE_ID_STORAGE_KEY = "gog_profile_id";
const PIECE_ALIAS_STORAGE_KEY = "gog_piece_alias";

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

const PIECE_IMAGE_BY_NAME = {
  "Five-Star General": "image-1773366361313.png",
  "Four-Star General": "image-1773366418601.png",
  "Three-Star General": "image-1773366432565.png",
  "Two-Star General": "image-1773366446160.png",
  "One-Star General": "image-1773366463512.png",
  Colonel: "image-1773366477836.png",
  "Lieutenant Colonel": "image-1773366492279.png",
  Major: "image-1773366504580.png",
  Captain: "image-1773366517436.png",
  "First Lieutenant": "image-1773366530844.png",
  "Second Lieutenant": "image-1773366543028.png",
  Sergeant: "image-1773366557676.png",
  Spy: "image-1773366575432.png",
  Private: "image-1773366587708.png",
  Flag: "image-1773366600131.png"
};

class GameOfGenerals {
  constructor() {
    this.boardEl = document.getElementById("board");
    this.turnIndicatorEl = document.getElementById("turnIndicator");
    this.battleMessageEl = document.getElementById("battleMessage");
    this.capturedByP1El = document.getElementById("capturedByP1");
    this.capturedByP2El = document.getElementById("capturedByP2");

    this.restartBtn = document.getElementById("restartBtn");
    this.modeSelectEl = document.getElementById("modeSelect");
    this.difficultySelectEl = document.getElementById("difficultySelect");
    this.levelSelectEl = document.getElementById("levelSelect");
    this.colorSelectEl = document.getElementById("colorSelect");
    this.themeSelectEl = document.getElementById("themeSelect");

    this.roomInputEl = document.getElementById("roomInput");
    this.connectBtnEl = document.getElementById("connectBtn");
    this.submitSetupBtnEl = document.getElementById("submitSetupBtn");
    this.inviteBtnEl = document.getElementById("inviteBtn");
    this.spectateBtnEl = document.getElementById("spectateBtn");
    this.connectionStatusEl = document.getElementById("connectionStatus");
    this.lobbyStatusEl = document.getElementById("lobbyStatus");
    this.onlineControlsEl = document.getElementById("onlineControls");
    this.muteBtnEl = document.getElementById("muteBtn");
    this.voiceStatusEl = document.getElementById("voiceStatus");
    this.localSpeakingDotEl = document.getElementById("localSpeakingDot");
    this.peerSpeakingDotEl = document.getElementById("peerSpeakingDot");

    this.autoDeployBtn = document.getElementById("autoDeployBtn");
    this.reserveTrayEl = document.getElementById("reserveTray");
    this.setupStatusEl = document.getElementById("setupStatus");
    this.setupTitleEl = document.getElementById("setupTitle");

    this.undoBtnEl = document.getElementById("undoBtn");
    this.prevMoveBtnEl = document.getElementById("prevMoveBtn");
    this.playReplayBtnEl = document.getElementById("playReplayBtn");
    this.nextMoveBtnEl = document.getElementById("nextMoveBtn");
    this.shareReplayBtnEl = document.getElementById("shareReplayBtn");
    this.loadReplayBtnEl = document.getElementById("loadReplayBtn");
    this.historyStatusEl = document.getElementById("historyStatus");

    this.chatSectionEl = document.getElementById("chatSection");
    this.chatLogEl = document.getElementById("chatLog");
    this.chatInputEl = document.getElementById("chatInput");
    this.sendChatBtnEl = document.getElementById("sendChatBtn");

    this.avatarInputEl = document.getElementById("avatarInput");
    this.displayNameInputEl = document.getElementById("displayNameInput");
    this.pieceNameSelectEl = document.getElementById("pieceNameSelect");
    this.pieceAliasInputEl = document.getElementById("pieceAliasInput");
    this.saveAliasBtnEl = document.getElementById("saveAliasBtn");

    this.currentPlayer = 1;
    this.setupPlayer = 1;
    this.phase = "setup";
    this.selectedPieceId = null;
    this.selectedReserveId = null;
    this.gameOver = false;

    this.gameMode = "pvp";
    this.aiDifficulty = "normal";
    this.battleLevel = 1;
    this.maxUnlockedLevel = 1;
    this.humanColor = "white";
    this.humanOwner = 1;
    this.cpuOwner = 2;

    this.dragPayload = null;
    this.draggedElement = null;
    this.socket = null;
    this.onlineRoomId = "";
    this.onlineOwner = null;
    this.onlineConnected = false;
    this.onlineGameStarted = false;
    this.onlineRole = "none";
    this.onlineSetupSubmitted = false;

    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.remoteAudioEl = null;
    this.isMuted = false;
    this.voicePeerReady = false;
    this.voiceOfferSent = false;
    this.speakingTimer = null;
    this.lastSpeakingState = false;

    this.theme = "military";
    this.profile = { id: "", name: "Commander", avatar: "[C]" };
    this.pieceAliasByBaseName = {};

    this.moveHistory = [];
    this.historyIndex = -1;
    this.isReplayPlaying = false;
    this.replayTimer = null;
    this.lastCpuMove = null;
    this.cpuSamePieceStreak = 0;
    this.swapSourceRow = null;
    this.swapSourceCol = null;

    this.revealFlashIds = new Set();
    this.audioCtx = null;

    this.pieces = [];
    this.cellMap = new Map();
    this.capturedByP1 = [];
    this.capturedByP2 = [];

    this.chatMessages = [];

    this.init();
  }

  init() {
    this.loadLevelProgress();
    this.loadSavedBattleLevel();
    this.loadSavedAIDifficulty();
    this.loadTheme();
    this.loadProfile();
    this.loadPieceAliases();
    this.applyTheme();
    this.populateLevelOptions();
    this.applySavedSelections();
    this.populatePieceAliasSelect();
    this.hydrateProfileInputs();
    this.applyInviteFromQuery();
    this.setupVoiceAudioElement();

    this.buildBoard();
    this.bindEvents();
    this.bindTouchDrag();
    window.addEventListener("beforeunload", () => this.teardownVoice(true));
    this.setupNewGame();
    this.loadReplayFromHash();
    this.render();
  }

  applyInviteFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      this.modeSelectEl.value = "online";
      this.roomInputEl.value = room;
    }
  }

  loadTheme() {
    try {
      const theme = window.localStorage.getItem(THEME_STORAGE_KEY) || "military";
      this.theme = ["military", "night", "classic"].includes(theme) ? theme : "military";
    } catch {
      this.theme = "military";
    }
    if (this.themeSelectEl) this.themeSelectEl.value = this.theme;
  }

  saveTheme() {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, this.theme);
    } catch {
      // Ignore storage errors.
    }
  }

  applyTheme() {
    document.body.classList.remove("theme-night", "theme-classic");
    if (this.theme === "night") document.body.classList.add("theme-night");
    if (this.theme === "classic") document.body.classList.add("theme-classic");
  }

  loadProfile() {
    try {
      const id = window.localStorage.getItem(PROFILE_ID_STORAGE_KEY) || this.randomId();
      window.localStorage.setItem(PROFILE_ID_STORAGE_KEY, id);
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      this.profile = {
        id,
        name: (parsed.name || "Commander").slice(0, 20),
        avatar: (parsed.avatar || "[C]").slice(0, 2)
      };
    } catch {
      this.profile = { id: this.randomId(), name: "Commander", avatar: "[C]" };
    }
  }

  saveProfile() {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        name: this.profile.name,
        avatar: this.profile.avatar
      }));
    } catch {
      // Ignore storage errors.
    }
  }

  persistProfileFromInputs() {
    if (this.avatarInputEl) this.profile.avatar = (this.avatarInputEl.value || "[C]").slice(0, 2);
    if (this.displayNameInputEl) this.profile.name = (this.displayNameInputEl.value || "Commander").slice(0, 20);
    this.saveProfile();
  }

  hydrateProfileInputs() {
    if (this.avatarInputEl) this.avatarInputEl.value = this.profile.avatar;
    if (this.displayNameInputEl) this.displayNameInputEl.value = this.profile.name;
  }

  loadPieceAliases() {
    try {
      const raw = window.localStorage.getItem(PIECE_ALIAS_STORAGE_KEY);
      this.pieceAliasByBaseName = raw ? JSON.parse(raw) : {};
    } catch {
      this.pieceAliasByBaseName = {};
    }
  }

  savePieceAliases() {
    try {
      window.localStorage.setItem(PIECE_ALIAS_STORAGE_KEY, JSON.stringify(this.pieceAliasByBaseName));
    } catch {
      // Ignore storage errors.
    }
  }

  populatePieceAliasSelect() {
    if (!this.pieceNameSelectEl) return;
    this.pieceNameSelectEl.innerHTML = "";
    for (const spec of PIECE_SET) {
      const option = document.createElement("option");
      option.value = spec.name;
      option.textContent = spec.name;
      this.pieceNameSelectEl.appendChild(option);
    }
    this.syncAliasInput();
  }

  syncAliasInput() {
    if (!this.pieceNameSelectEl || !this.pieceAliasInputEl) return;
    const baseName = this.pieceNameSelectEl.value;
    this.pieceAliasInputEl.value = this.pieceAliasByBaseName[baseName] || "";
  }

  loadLevelProgress() {
    try {
      const saved = Number(window.localStorage.getItem(LEVEL_STORAGE_KEY) || "1");
      this.maxUnlockedLevel = Number.isFinite(saved) && saved >= 1 && saved <= 100 ? Math.floor(saved) : 1;
    } catch {
      this.maxUnlockedLevel = 1;
    }
  }

  loadSavedBattleLevel() {
    try {
      const saved = Number(window.localStorage.getItem(SELECTED_LEVEL_STORAGE_KEY) || "1");
      this.battleLevel = Number.isFinite(saved) && saved >= 1 && saved <= 100 ? Math.floor(saved) : 1;
    } catch {
      this.battleLevel = 1;
    }
  }

  saveSelectedBattleLevel() {
    try {
      window.localStorage.setItem(SELECTED_LEVEL_STORAGE_KEY, String(this.battleLevel));
    } catch {
      // Ignore storage errors.
    }
  }

  loadSavedAIDifficulty() {
    try {
      const saved = window.localStorage.getItem(AI_DIFFICULTY_STORAGE_KEY) || "normal";
      this.aiDifficulty = ["normal", "medium", "hard", "pro"].includes(saved) ? saved : "normal";
    } catch {
      this.aiDifficulty = "normal";
    }
  }

  saveAIDifficulty() {
    try {
      window.localStorage.setItem(AI_DIFFICULTY_STORAGE_KEY, this.aiDifficulty);
    } catch {
      // Ignore storage errors.
    }
  }

  applySavedSelections() {
    if (this.difficultySelectEl) this.difficultySelectEl.value = this.aiDifficulty;
    if (this.levelSelectEl) {
      const clamped = Math.min(this.battleLevel, this.maxUnlockedLevel);
      this.battleLevel = Math.max(1, clamped);
      this.levelSelectEl.value = String(this.battleLevel);
    }
  }

  saveLevelProgress() {
    try {
      window.localStorage.setItem(LEVEL_STORAGE_KEY, String(this.maxUnlockedLevel));
    } catch {
      // Ignore storage errors.
    }
  }

  populateLevelOptions() {
    if (!this.levelSelectEl) return;
    this.levelSelectEl.innerHTML = "";
    const selectedLevel = Math.min(Math.max(1, this.battleLevel), this.maxUnlockedLevel);
    for (let level = 1; level <= 100; level += 1) {
      const option = document.createElement("option");
      option.value = String(level);
      option.textContent = level > this.maxUnlockedLevel ? `Level ${level} (Locked)` : `Level ${level}`;
      option.disabled = level > this.maxUnlockedLevel;
      if (level === selectedLevel) option.selected = true;
      this.levelSelectEl.appendChild(option);
    }
  }

  refreshLevelOptions() {
    if (!this.levelSelectEl) return;
    for (const option of this.levelSelectEl.options) {
      const level = Number(option.value);
      const locked = level > this.maxUnlockedLevel;
      option.disabled = locked;
      option.textContent = locked ? `Level ${level} (Locked)` : `Level ${level}`;
    }
  }

  buildBoard() {
    this.boardEl.innerHTML = "";
    this.cellMap.clear();
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        this.cellMap.set(this.key(row, col), cell);
        this.boardEl.appendChild(cell);
      }
    }
  }

  setupNewGame() {
    this.stopReplay();
    this.gameMode = this.modeSelectEl.value;

    if (this.gameMode !== "online") {
      this.teardownVoice(true);
      this.voicePeerReady = false;
      this.updateVoiceStatus("Voice: idle");
    }

    if (this.gameMode === "online") {
      this.teardownVoice(false);
      this.phase = "setup";
      this.currentPlayer = 1;
      this.setupPlayer = 1;
      this.selectedPieceId = null;
      this.selectedReserveId = null;
      this.gameOver = false;
      this.pieces = [];
      this.capturedByP1 = [];
      this.capturedByP2 = [];
      this.onlineGameStarted = false;
      this.onlineRole = "none";
      this.onlineOwner = null;
      this.onlineSetupSubmitted = false;
      this.voicePeerReady = false;
      this.voiceOfferSent = false;
      this.turnIndicatorEl.textContent = "Online: connect to room";
      this.updateOnlineStatus("Offline");
      this.updateVoiceStatus("Voice: waiting room");
      this.setMessage("");
      this.resetHistory("Online waiting room");
      this.render();
      return;
    }

    this.aiDifficulty = this.difficultySelectEl.value;
    this.battleLevel = Number(this.levelSelectEl.value || "1");
    if (this.gameMode === "cpu" && this.battleLevel > this.maxUnlockedLevel) {
      this.battleLevel = this.maxUnlockedLevel;
      this.levelSelectEl.value = String(this.maxUnlockedLevel);
    }
    this.saveAIDifficulty();
    this.saveSelectedBattleLevel();

    this.humanColor = this.colorSelectEl.value;
    this.humanOwner = this.gameMode === "cpu" ? (this.humanColor === "white" ? 1 : 2) : 1;
    this.cpuOwner = this.humanOwner === 1 ? 2 : 1;

    this.currentPlayer = 1;
    this.setupPlayer = this.gameMode === "cpu" ? this.humanOwner : 1;
    this.phase = "setup";
    this.selectedPieceId = null;
    this.selectedReserveId = null;
    this.gameOver = false;

    this.pieces = [...this.createArmyBlueprint(1), ...this.createArmyBlueprint(2)];
    this.capturedByP1 = [];
    this.capturedByP2 = [];

    this.setMessage("");
    this.updateTurnLabel();
    this.lastCpuMove = null;
    this.cpuSamePieceStreak = 0;
    this.swapSourceRow = null;
    this.swapSourceCol = null;
    this.resetHistory("Setup started");

    if (this.gameMode === "cpu") {
      if (this.humanOwner === 2) {
        this.setupPlayer = 1;
        this.autoDeployCurrentSetupPlayer();
      }
    }
  }

  bindTouchDrag() {
    let ghostEl = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;

    const setupGhost = (sourceEl, touch) => {
      const rect = sourceEl.getBoundingClientRect();
      touchOffsetX = touch.clientX - rect.left;
      touchOffsetY = touch.clientY - rect.top;
      ghostEl = document.createElement("div");
      ghostEl.style.cssText = [
        "position:fixed", "pointer-events:none", "z-index:9999",
        `width:${rect.width}px`, `height:${rect.height}px`,
        `left:${touch.clientX - touchOffsetX}px`,
        `top:${touch.clientY - touchOffsetY}px`,
        "background:rgba(200,160,64,0.28)",
        "border:2px solid rgba(200,160,64,0.75)",
        "border-radius:6px", "opacity:0.9"
      ].join(";");
      document.body.appendChild(ghostEl);
    };

    const onTouchStart = (e) => {
      if (this.gameOver) return;
      const touch = e.touches[0];

      const chip = touch.target.closest(".reserve-chip");
      if (chip && this.phase === "setup") {
        const piece = this.getPieceById(chip.dataset.pieceId);
        if (!piece || piece.owner !== this.setupPlayer || piece.deployed) return;
        this.dragPayload = { type: "reserve", pieceId: piece.id };
        setupGhost(chip, touch);
        e.preventDefault();
        return;
      }

      const pieceEl = touch.target.closest(".piece");
      if (!pieceEl) return;
      const row = Number(pieceEl.dataset.row);
      const col = Number(pieceEl.dataset.col);
      const piece = this.getPieceAt(row, col);
      if (!piece) return;

      if (this.phase === "setup") {
        if (piece.owner !== this.setupPlayer) return;
        this.dragPayload = { type: "setup-piece", pieceId: piece.id };
      } else {
        if (piece.owner !== this.currentPlayer) return;
        if (this.gameMode === "cpu" && this.currentPlayer === this.cpuOwner) return;
        this.dragPayload = { type: "battle-piece", pieceId: piece.id };
      }
      setupGhost(pieceEl, touch);
      e.preventDefault();
    };

    const onTouchMove = (e) => {
      if (!this.dragPayload || !ghostEl) return;
      const touch = e.touches[0];
      ghostEl.style.left = `${touch.clientX - touchOffsetX}px`;
      ghostEl.style.top = `${touch.clientY - touchOffsetY}px`;
      e.preventDefault();
    };

    const onTouchEnd = (e) => {
      if (!this.dragPayload) return;
      const touch = e.changedTouches[0];
      if (ghostEl) { ghostEl.remove(); ghostEl = null; }
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el) {
        const cell = el.closest(".cell");
        if (cell) {
          const row = Number(cell.dataset.row);
          const col = Number(cell.dataset.col);
          this.applyDropMove(row, col);
        }
      }
      this.handleDragEnd();
      this.render();
    };

    this.boardEl.addEventListener("touchstart", onTouchStart, { passive: false });
    this.reserveTrayEl.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
  }

  bindEvents() {
    this.boardEl.addEventListener("dragstart", (event) => this.handleDragStart(event));
    this.boardEl.addEventListener("dragend", () => this.handleDragEnd());
    this.boardEl.addEventListener("dragover", (event) => this.handleBoardDragOver(event));
    this.boardEl.addEventListener("dragleave", (event) => this.handleBoardDragLeave(event));
    this.boardEl.addEventListener("drop", (event) => this.handleBoardDrop(event));

    this.reserveTrayEl.addEventListener("dragstart", (event) => this.handleDragStart(event));
    this.reserveTrayEl.addEventListener("dragend", () => this.handleDragEnd());

    this.boardEl.addEventListener("click", (event) => {
      const cell = event.target.closest(".cell");
      if (!cell || this.gameOver) return;
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      if (this.phase === "setup") this.handleSetupCellClick(row, col);
      else this.handleBattleCellClick(row, col);
    });

    this.reserveTrayEl.addEventListener("click", (event) => {
      const chip = event.target.closest(".reserve-chip");
      if (!chip || this.phase !== "setup" || this.gameOver) return;
      const piece = this.getPieceById(chip.dataset.pieceId);
      if (!piece || piece.owner !== this.setupPlayer || piece.deployed) return;
      this.selectedReserveId = piece.id;
      this.selectedPieceId = null;
      this.swapSourceRow = null;
      this.swapSourceCol = null;
      this.render();
    });

    this.autoDeployBtn.addEventListener("click", () => {
      if (this.phase !== "setup" || this.gameOver) return;
      if (this.gameMode === "cpu" && this.setupPlayer === this.cpuOwner) return;
      this.autoDeployCurrentSetupPlayer();
      this.render();
    });

    this.restartBtn.addEventListener("click", () => {
      this.setupNewGame();
      this.render();
    });

    this.modeSelectEl.addEventListener("change", () => {
      this.setupNewGame();
      this.render();
    });

    this.difficultySelectEl.addEventListener("change", () => {
      this.setupNewGame();
      this.render();
    });

    this.levelSelectEl.addEventListener("change", () => {
      this.setupNewGame();
      this.render();
    });

    this.colorSelectEl.addEventListener("change", () => {
      this.setupNewGame();
      this.render();
    });

    this.themeSelectEl.addEventListener("change", () => {
      this.theme = this.themeSelectEl.value;
      this.applyTheme();
      this.saveTheme();
      this.playSound("move");
    });

    this.avatarInputEl.addEventListener("change", () => this.persistProfileFromInputs());
    this.avatarInputEl.addEventListener("input", () => this.persistProfileFromInputs());

    this.displayNameInputEl.addEventListener("change", () => this.persistProfileFromInputs());
    this.displayNameInputEl.addEventListener("input", () => this.persistProfileFromInputs());

    this.pieceNameSelectEl.addEventListener("change", () => this.syncAliasInput());

    this.saveAliasBtnEl.addEventListener("click", () => {
      const baseName = this.pieceNameSelectEl.value;
      const alias = (this.pieceAliasInputEl.value || "").trim();
      if (!alias) {
        delete this.pieceAliasByBaseName[baseName];
      } else {
        this.pieceAliasByBaseName[baseName] = alias.slice(0, 18);
      }
      this.savePieceAliases();
      this.setupNewGame();
      this.render();
    });

    this.connectBtnEl.addEventListener("click", () => {
      if (this.gameMode !== "online") return;
      this.connectOnlineRoom(false);
    });

    this.submitSetupBtnEl.addEventListener("click", () => {
      if (this.gameMode !== "online") return;
      this.submitOnlineSetup();
    });

    this.spectateBtnEl.addEventListener("click", () => {
      if (this.gameMode !== "online") return;
      this.connectOnlineRoom(true);
    });

    this.inviteBtnEl.addEventListener("click", async () => {
      const roomId = (this.roomInputEl.value || "").trim();
      if (!roomId) return;
      const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
      try {
        await navigator.clipboard.writeText(url);
        this.updateOnlineStatus("Invite link copied");
      } catch {
        this.updateOnlineStatus(`Invite: ${url}`);
      }
    });

    this.undoBtnEl.addEventListener("click", () => this.undoMove());
    this.prevMoveBtnEl.addEventListener("click", () => this.stepReplay(-1));
    this.nextMoveBtnEl.addEventListener("click", () => this.stepReplay(1));
    this.playReplayBtnEl.addEventListener("click", () => this.toggleReplay());
    this.shareReplayBtnEl.addEventListener("click", () => this.shareReplay());
    this.loadReplayBtnEl.addEventListener("click", () => this.loadReplayPrompt());

    this.sendChatBtnEl.addEventListener("click", () => this.sendChatMessage());
    this.muteBtnEl.addEventListener("click", () => this.toggleMute());
    this.chatInputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") this.sendChatMessage();
    });

    for (const emojiBtn of document.querySelectorAll(".emoji-btn")) {
      emojiBtn.addEventListener("click", () => {
        const emoji = emojiBtn.dataset.emoji || "";
        this.chatInputEl.value += emoji;
        this.chatInputEl.focus();
      });
    }
  }

  resetHistory(label) {
    this.moveHistory = [this.createSnapshot(label)];
    this.historyIndex = 0;
    this.updateHistoryStatus();
  }

  createSnapshot(label) {
    return {
      label,
      timestamp: Date.now(),
      phase: this.phase,
      currentPlayer: this.currentPlayer,
      setupPlayer: this.setupPlayer,
      gameOver: this.gameOver,
      pieces: this.pieces.map((piece) => ({ ...piece })),
      capturedByP1: this.capturedByP1.map((piece) => ({ ...piece })),
      capturedByP2: this.capturedByP2.map((piece) => ({ ...piece }))
    };
  }

  recordSnapshot(label) {
    if (this.historyIndex < this.moveHistory.length - 1) {
      this.moveHistory = this.moveHistory.slice(0, this.historyIndex + 1);
    }
    this.moveHistory.push(this.createSnapshot(label));
    this.historyIndex = this.moveHistory.length - 1;
    this.updateHistoryStatus();
  }

  applySnapshot(snapshot) {
    if (!snapshot) return;
    this.phase = snapshot.phase;
    this.currentPlayer = snapshot.currentPlayer;
    this.setupPlayer = snapshot.setupPlayer;
    this.gameOver = snapshot.gameOver;
    this.pieces = snapshot.pieces.map((piece) => ({ ...piece }));
    this.capturedByP1 = snapshot.capturedByP1.map((piece) => ({ ...piece }));
    this.capturedByP2 = snapshot.capturedByP2.map((piece) => ({ ...piece }));
    this.selectedPieceId = null;
    this.selectedReserveId = null;
    this.lastCpuMove = null;
    this.cpuSamePieceStreak = 0;
    this.swapSourceRow = null;
    this.swapSourceCol = null;
    this.updateTurnLabel();
    this.render();
  }

  updateHistoryStatus() {
    if (!this.historyStatusEl) return;
    if (this.moveHistory.length <= 1) {
      this.historyStatusEl.textContent = "No moves yet";
    } else {
      this.historyStatusEl.textContent = `Move ${this.historyIndex + 1} / ${this.moveHistory.length}`;
    }
    this.playReplayBtnEl.textContent = this.isReplayPlaying ? "Pause" : "Play";
    const canBack = this.historyIndex > 0;
    const canForward = this.historyIndex < this.moveHistory.length - 1;
    this.prevMoveBtnEl.disabled = !canBack;
    this.nextMoveBtnEl.disabled = !canForward;
    this.undoBtnEl.disabled = this.gameMode === "online" || this.historyIndex <= 0;
  }

  undoMove() {
    if (this.gameMode === "online") {
      this.updateOnlineStatus("Undo disabled in online mode");
      return;
    }
    if (this.historyIndex <= 0) return;
    this.stopReplay();
    this.historyIndex -= 1;
    this.moveHistory = this.moveHistory.slice(0, this.historyIndex + 1);
    this.applySnapshot(this.moveHistory[this.historyIndex]);
    this.updateHistoryStatus();
  }

  stepReplay(step) {
    if (!this.moveHistory.length) return;
    this.stopReplay();
    const nextIndex = Math.max(0, Math.min(this.moveHistory.length - 1, this.historyIndex + step));
    this.historyIndex = nextIndex;
    this.applySnapshot(this.moveHistory[this.historyIndex]);
    this.updateHistoryStatus();
  }

  toggleReplay() {
    if (this.isReplayPlaying) {
      this.stopReplay();
      return;
    }
    if (this.moveHistory.length < 2) return;
    this.isReplayPlaying = true;
    this.updateHistoryStatus();
    this.replayTimer = window.setInterval(() => {
      if (this.historyIndex >= this.moveHistory.length - 1) {
        this.stopReplay();
        return;
      }
      this.historyIndex += 1;
      this.applySnapshot(this.moveHistory[this.historyIndex]);
      this.updateHistoryStatus();
    }, 900);
  }

  stopReplay() {
    if (this.replayTimer) {
      window.clearInterval(this.replayTimer);
      this.replayTimer = null;
    }
    this.isReplayPlaying = false;
    this.updateHistoryStatus();
  }

  async shareReplay() {
    if (!this.moveHistory.length) return;
    try {
      const payload = { v: 1, history: this.moveHistory };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const link = `${window.location.origin}${window.location.pathname}#replay=${encoded}`;
      await navigator.clipboard.writeText(link);
      this.updateOnlineStatus("Replay link copied");
    } catch {
      this.updateOnlineStatus("Unable to share replay");
    }
  }

  loadReplayPrompt() {
    const input = window.prompt("Paste replay link or replay payload:");
    if (!input) return;
    const encoded = this.extractReplayPayload(input.trim());
    this.loadReplayData(encoded);
  }

  loadReplayFromHash() {
    const hash = window.location.hash || "";
    if (!hash.startsWith("#replay=")) return;
    this.loadReplayData(hash.slice(8));
  }

  extractReplayPayload(input) {
    const hashPos = input.indexOf("#replay=");
    if (hashPos >= 0) return input.slice(hashPos + 8);
    return input;
  }

  loadReplayData(encodedPayload) {
    try {
      const json = decodeURIComponent(escape(atob(encodedPayload)));
      const payload = JSON.parse(json);
      if (!payload || !Array.isArray(payload.history) || payload.history.length === 0) {
        throw new Error("Invalid replay payload");
      }
      this.moveHistory = payload.history;
      this.historyIndex = 0;
      this.applySnapshot(this.moveHistory[0]);
      this.updateHistoryStatus();
      this.updateOnlineStatus("Replay loaded");
    } catch {
      this.updateOnlineStatus("Failed to load replay");
    }
  }

  randomId() {
    return `id-${Math.random().toString(36).slice(2, 10)}`;
  }

  createArmyBlueprint(owner) {
    const pieces = [];
    let pieceNo = 0;
    for (const spec of PIECE_SET) {
      const alias = this.pieceAliasByBaseName[spec.name];
      for (let i = 0; i < spec.count; i += 1) {
        pieces.push({
          id: `${owner}-piece-${pieceNo}`,
          name: alias || spec.name,
          imageKey: spec.name,
          rank: spec.rank,
          owner,
          row: null,
          col: null,
          alive: true,
          deployed: false
        });
        pieceNo += 1;
      }
    }
    return pieces;
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  key(row, col) {
    return `${row},${col}`;
  }

  getSetupRows(owner) {
    return owner === 1 ? [6, 7, 8] : [0, 1, 2];
  }

  shouldFlipBoard() {
    if (this.phase !== "setup") return false;
    if (this.gameMode === "online") {
      return this.onlineOwner === 2 && this.onlineRole === "player";
    }
    return this.setupPlayer === 2;
  }

  isCellInSetupZone(row, owner) {
    return this.getSetupRows(owner).includes(row);
  }

  getPieceAt(row, col) {
    return this.pieces.find((piece) => piece.alive && piece.deployed && piece.row === row && piece.col === col) || null;
  }

  getPieceById(pieceId) {
    return this.pieces.find((piece) => piece.id === pieceId && piece.alive) || null;
  }

  getUndeployedPieces(owner) {
    return this.pieces.filter((piece) => piece.owner === owner && piece.alive && !piece.deployed);
  }

  allDeployed(owner) {
    return this.getUndeployedPieces(owner).length === 0;
  }

  handleSetupCellClick(row, col) {
    if (this.gameMode === "online") {
      if (this.onlineRole !== "player" || !this.onlineOwner || this.onlineSetupSubmitted) return;
      this.setupPlayer = this.onlineOwner;
    }
    const occupant = this.getPieceAt(row, col);

    if (occupant && occupant.owner === this.setupPlayer) {
      // Swap: already have a board-picked piece selected → swap the two positions
      if (this.selectedReserveId && this.swapSourceRow !== null) {
        const reservePiece = this.getPieceById(this.selectedReserveId);
        if (reservePiece) {
          reservePiece.row = row;
          reservePiece.col = col;
          reservePiece.deployed = true;
          occupant.row = this.swapSourceRow;
          occupant.col = this.swapSourceCol;
          this.selectedReserveId = null;
          this.swapSourceRow = null;
          this.swapSourceCol = null;
          this.render();
          return;
        }
      }
      // No piece selected yet → pick this piece up, remembering its board position
      this.swapSourceRow = occupant.row;
      this.swapSourceCol = occupant.col;
      occupant.deployed = false;
      occupant.row = null;
      occupant.col = null;
      this.selectedReserveId = occupant.id;
      this.render();
      return;
    }

    if (!this.selectedReserveId) {
      this.setMessage("Select a reserve piece first", "status-danger");
      return;
    }

    if (!this.isCellInSetupZone(row, this.setupPlayer)) {
      this.setMessage("You can only deploy inside your 3 starting rows", "status-danger");
      return;
    }

    if (occupant) {
      this.setMessage("That setup square is already occupied", "status-danger");
      return;
    }

    const reservePiece = this.getPieceById(this.selectedReserveId);
    if (!reservePiece || reservePiece.owner !== this.setupPlayer) {
      this.selectedReserveId = null;
      return;
    }

    reservePiece.row = row;
    reservePiece.col = col;
    reservePiece.deployed = true;
    this.selectedReserveId = null;
    this.swapSourceRow = null;
    this.swapSourceCol = null;

    if (this.allDeployed(this.setupPlayer)) {
      if (this.gameMode === "online") {
        this.setupStatusEl.textContent = "All pieces deployed. Click Submit Setup.";
      } else {
        this.advanceSetupPhase();
      }
    }

    this.render();
  }

  autoDeployCurrentSetupPlayer() {
    const owner = this.setupPlayer;
    const undeployed = this.getUndeployedPieces(owner);
    if (undeployed.length === 0) {
      this.advanceSetupPhase();
      return;
    }

    const slots = [];
    for (const row of this.getSetupRows(owner)) {
      for (let col = 0; col < COLS; col += 1) {
        if (!this.getPieceAt(row, col)) slots.push({ row, col });
      }
    }

    this.shuffle(slots);
    for (const piece of undeployed) {
      const slot = slots.pop();
      if (!slot) break;
      piece.row = slot.row;
      piece.col = slot.col;
      piece.deployed = true;
    }

    this.selectedReserveId = null;
    this.playSound("move");

    if (this.allDeployed(owner)) {
      if (this.gameMode === "online") {
        this.setupStatusEl.textContent = "All pieces deployed. Click Submit Setup.";
      } else {
        this.advanceSetupPhase();
      }
    }
  }

  advanceSetupPhase() {
    if (this.gameMode === "online") {
      return;
    }
    this.selectedReserveId = null;
    if (this.setupPlayer === 1) {
      if (this.gameMode === "cpu") {
        this.setupPlayer = 2;
        this.updateTurnLabel();
        this.autoDeployCurrentSetupPlayer();
        this.render();
        return;
      }
      this.setupPlayer = 2;
      this.updateTurnLabel();
      return;
    }
    this.startBattlePhase();
  }

  startBattlePhase() {
    this.phase = "battle";
    this.currentPlayer = 1;
    this.selectedPieceId = null;
    this.selectedReserveId = null;
    this.updateTurnLabel();
    this.recordSnapshot("Battle starts");

    if (!this.gameOver && this.gameMode === "cpu" && this.currentPlayer === this.cpuOwner) {
      window.setTimeout(() => {
        this.computerMove();
        this.render();
      }, 520);
    }
  }

  isValidMove(piece, toRow, toCol) {
    if (!piece || !piece.alive || !piece.deployed) return false;
    if (toRow < 0 || toRow >= ROWS || toCol < 0 || toCol >= COLS) return false;

    const dRow = Math.abs(piece.row - toRow);
    const dCol = Math.abs(piece.col - toCol);
    if (dRow + dCol !== 1) return false;

    const occupant = this.getPieceAt(toRow, toCol);
    if (occupant && occupant.owner === piece.owner) return false;

    if (piece.rank === RANKS.FLAG && occupant && occupant.owner !== piece.owner && occupant.rank !== RANKS.FLAG) {
      return false;
    }

    return true;
  }

  getValidMoves(piece) {
    const deltas = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 }
    ];

    const moves = [];
    for (const d of deltas) {
      const nr = piece.row + d.r;
      const nc = piece.col + d.c;
      if (this.isValidMove(piece, nr, nc)) moves.push({ row: nr, col: nc });
    }
    return moves;
  }

  handleDragStart(event) {
    if (this.gameOver) return;

    const reserveChip = event.target.closest(".reserve-chip");
    if (reserveChip && this.phase === "setup") {
      const piece = this.getPieceById(reserveChip.dataset.pieceId);
      if (!piece || piece.owner !== this.setupPlayer || piece.deployed) {
        event.preventDefault();
        return;
      }
      this.dragPayload = { type: "reserve", pieceId: piece.id };
      this.draggedElement = reserveChip;
      reserveChip.classList.add("dragging");
      return;
    }

    const pieceEl = event.target.closest(".piece");
    if (!pieceEl) return;

    const row = Number(pieceEl.dataset.row);
    const col = Number(pieceEl.dataset.col);
    const piece = this.getPieceAt(row, col);
    if (!piece) {
      event.preventDefault();
      return;
    }

    if (this.phase === "setup") {
      if (piece.owner !== this.setupPlayer) {
        event.preventDefault();
        return;
      }
      this.dragPayload = { type: "setup-piece", pieceId: piece.id };
    } else {
      if (piece.owner !== this.currentPlayer) {
        event.preventDefault();
        return;
      }
      if (this.gameMode === "cpu" && this.currentPlayer === this.cpuOwner) {
        event.preventDefault();
        return;
      }
      this.dragPayload = { type: "battle-piece", pieceId: piece.id };
    }

    this.draggedElement = pieceEl;
    pieceEl.classList.add("dragging");
  }

  handleDragEnd() {
    if (this.draggedElement) this.draggedElement.classList.remove("dragging");
    for (const cell of this.cellMap.values()) cell.classList.remove("drop-target");
    this.draggedElement = null;
    this.dragPayload = null;
  }

  handleBoardDragOver(event) {
    if (!this.dragPayload || this.gameOver) return;
    const cell = event.target.closest(".cell");
    if (!cell) return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    if (this.canDropOnCell(row, col)) {
      event.preventDefault();
      cell.classList.add("drop-target");
    }
  }

  handleBoardDragLeave(event) {
    const cell = event.target.closest(".cell");
    if (!cell) return;
    cell.classList.remove("drop-target");
  }

  handleBoardDrop(event) {
    if (!this.dragPayload || this.gameOver) return;
    const cell = event.target.closest(".cell");
    if (!cell) return;
    event.preventDefault();

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    cell.classList.remove("drop-target");
    this.applyDropMove(row, col);
  }

  canDropOnCell(row, col) {
    if (!this.dragPayload) return false;
    const occupant = this.getPieceAt(row, col);

    if (this.dragPayload.type === "reserve") {
      return this.isCellInSetupZone(row, this.setupPlayer) && !occupant;
    }

    if (this.dragPayload.type === "setup-piece") {
      const draggedPiece = this.getPieceById(this.dragPayload.pieceId);
      // Allow dropping onto another own piece in the setup zone (swap)
      if (occupant && draggedPiece && occupant.id !== draggedPiece.id && occupant.owner === this.setupPlayer) {
        return this.isCellInSetupZone(row, this.setupPlayer);
      }
      return this.isCellInSetupZone(row, this.setupPlayer) && !occupant;
    }

    if (this.dragPayload.type === "battle-piece") {
      const piece = this.getPieceById(this.dragPayload.pieceId);
      return !!piece && this.isValidMove(piece, row, col);
    }

    return false;
  }

  applyDropMove(row, col) {
    if (!this.dragPayload) return;
    if (!this.canDropOnCell(row, col)) {
      this.handleDragEnd();
      return;
    }

    const payload = this.dragPayload;

    if (payload.type === "reserve") {
      const reservePiece = this.getPieceById(payload.pieceId);
      if (!reservePiece) {
        this.handleDragEnd();
        return;
      }
      this.selectedReserveId = reservePiece.id;
      this.handleSetupCellClick(row, col);
      this.handleDragEnd();
      return;
    }

    if (payload.type === "setup-piece") {
      const piece = this.getPieceById(payload.pieceId);
      if (!piece) {
        this.handleDragEnd();
        return;
      }
      // Swap: dropping onto another own deployed piece
      const targetPiece = this.getPieceAt(row, col);
      if (targetPiece && targetPiece.owner === this.setupPlayer && targetPiece.id !== piece.id) {
        const fromRow = piece.row;
        const fromCol = piece.col;
        piece.row = targetPiece.row;
        piece.col = targetPiece.col;
        targetPiece.row = fromRow;
        targetPiece.col = fromCol;
        this.selectedReserveId = null;
        this.swapSourceRow = null;
        this.swapSourceCol = null;
        this.handleDragEnd();
        this.render();
        return;
      }
      piece.deployed = false;
      piece.row = null;
      piece.col = null;
      this.selectedReserveId = piece.id;
      this.handleSetupCellClick(row, col);
      this.handleDragEnd();
      return;
    }

    if (payload.type === "battle-piece") {
      const piece = this.getPieceById(payload.pieceId);
      if (this.gameMode === "online") {
        if (piece && this.onlineRole === "player" && piece.owner === this.onlineOwner && this.currentPlayer === this.onlineOwner) {
          this.emitOnlineMove(piece.row, piece.col, row, col);
        }
      } else if (piece && this.isValidMove(piece, row, col)) {
        this.executeMove(piece, row, col);
        this.render();
      }
      this.handleDragEnd();
    }
  }

  handleBattleCellClick(row, col) {
    if (this.gameMode === "online") {
      this.handleOnlineBattleClick(row, col);
      return;
    }

    if (this.gameMode === "cpu" && this.currentPlayer === this.cpuOwner) return;

    const clickedPiece = this.getPieceAt(row, col);

    if (!this.selectedPieceId) {
      if (clickedPiece && clickedPiece.owner === this.currentPlayer) {
        this.selectedPieceId = clickedPiece.id;
        this.render();
      }
      return;
    }

    const selectedPiece = this.getPieceById(this.selectedPieceId);
    if (!selectedPiece) {
      this.selectedPieceId = null;
      this.render();
      return;
    }

    if (clickedPiece && clickedPiece.owner === this.currentPlayer) {
      this.selectedPieceId = clickedPiece.id;
      this.render();
      return;
    }

    if (!this.isValidMove(selectedPiece, row, col)) {
      this.setMessage("Invalid move", "status-danger");
      return;
    }

    this.executeMove(selectedPiece, row, col);
    this.render();
  }

  handleOnlineBattleClick(row, col) {
    if (!this.onlineConnected || !this.onlineGameStarted || this.gameOver) return;
    if (this.onlineRole !== "player") return;
    if (this.currentPlayer !== this.onlineOwner) return;

    const clickedPiece = this.getPieceAt(row, col);

    if (!this.selectedPieceId) {
      if (clickedPiece && clickedPiece.owner === this.onlineOwner) {
        this.selectedPieceId = clickedPiece.id;
        this.render();
      }
      return;
    }

    const selectedPiece = this.getPieceById(this.selectedPieceId);
    if (!selectedPiece) {
      this.selectedPieceId = null;
      this.render();
      return;
    }

    if (clickedPiece && clickedPiece.owner === this.onlineOwner) {
      this.selectedPieceId = clickedPiece.id;
      this.render();
      return;
    }

    this.emitOnlineMove(selectedPiece.row, selectedPiece.col, row, col);
    this.selectedPieceId = null;
    this.render();
  }

  executeMove(piece, toRow, toCol) {
    const defender = this.getPieceAt(toRow, toCol);

    if (!defender) {
      piece.row = toRow;
      piece.col = toCol;
      this.playSound("move");
      this.postMoveChecks(piece);
      this.recordSnapshot(`${this.ownerLabel(piece.owner)} moved ${piece.name}`);
      return;
    }

    this.flashPieces([piece.id, defender.id]);

    if (defender.rank === RANKS.FLAG) {
      defender.alive = false;
      this.capturePiece(piece.owner, defender);
      piece.row = toRow;
      piece.col = toCol;
      this.playSound("battle");
      this.endGame(piece.owner, `${this.ownerLabel(piece.owner)} win game: enemy Flag captured.`);
      return;
    }

    const outcome = this.resolveBattle(piece, defender);

    if (outcome.result === "attacker") {
      defender.alive = false;
      this.capturePiece(piece.owner, defender);
      piece.row = toRow;
      piece.col = toCol;
      this.playSound("battle");
      this.postMoveChecks(piece);
      this.recordSnapshot(`${this.ownerLabel(piece.owner)} won battle`);
      return;
    }

    if (outcome.result === "defender") {
      piece.alive = false;
      this.capturePiece(defender.owner, piece);
      this.playSound("battle");
      this.postMoveChecks(defender);
      this.recordSnapshot(`${this.ownerLabel(defender.owner)} defended`);
      return;
    }

    piece.alive = false;
    defender.alive = false;
    this.playSound("battle");
    this.switchTurn();
    this.recordSnapshot("Both pieces eliminated");
  }

  flashPieces(pieceIds) {
    for (const id of pieceIds) this.revealFlashIds.add(id);
    window.setTimeout(() => {
      for (const id of pieceIds) this.revealFlashIds.delete(id);
      this.render();
    }, 520);
  }

  resolveBattle(attacker, defender) {
    const result = this.computeBattleResult(attacker, defender);
    return { result };
  }

  computeBattleResult(attacker, defender) {
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

  capturePiece(captorOwner, piece) {
    if (captorOwner === 1) this.capturedByP1.push(piece);
    else if (captorOwner === 2) this.capturedByP2.push(piece);
  }

  postMoveChecks(movedPiece) {
    if (movedPiece.rank === RANKS.FLAG) {
      if (movedPiece.owner === 1 && movedPiece.row === 0) {
        this.endGame(1, "Player 1 win game: Flag reached enemy back row.");
        return;
      }
      if (movedPiece.owner === 2 && movedPiece.row === ROWS - 1) {
        this.endGame(2, "Player 2 win game: Flag reached enemy back row.");
        return;
      }
    }

    this.switchTurn();
  }

  switchTurn() {
    this.selectedPieceId = null;
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updateTurnLabel();

    if (!this.gameOver && this.gameMode === "cpu" && this.currentPlayer === this.cpuOwner) {
      window.setTimeout(() => {
        this.computerMove();
        this.render();
      }, 520);
    }
  }

  computerMove() {
    if (this.gameOver || this.phase !== "battle" || this.currentPlayer !== this.cpuOwner) return;

    const cpuPieces = this.pieces.filter((piece) => piece.alive && piece.deployed && piece.owner === this.cpuOwner);
    const candidates = [];

    for (const piece of cpuPieces) {
      const moves = this.getValidMoves(piece);
      for (const move of moves) {
        candidates.push({ piece, move, score: this.scoreAIMove(piece, move) });
      }
    }

    if (candidates.length === 0) {
      this.endGame(this.humanOwner, "");
      return;
    }

    const choice = this.pickAIMoveByDifficulty(candidates);
    const fromRow = choice.piece.row;
    const fromCol = choice.piece.col;
    this.executeMove(choice.piece, choice.move.row, choice.move.col);
    this.recordCpuMove(choice.piece.id, fromRow, fromCol, choice.move.row, choice.move.col);
  }

  pickAIMoveByDifficulty(candidates) {
    const levelFactor = (this.battleLevel - 1) / 99;
    const profile = this.getAIDifficultyProfile();
    const ranked = candidates
      .map((entry) => ({
        ...entry,
        score: entry.score + this.evaluatePositionalValue(entry.piece, entry.move)
      }))
      .sort((a, b) => b.score - a.score);

    const topWindow = Math.max(
      profile.minTopWindow,
      Math.round(profile.baseTopWindow - levelFactor * (profile.baseTopWindow - profile.minTopWindow))
    );
    const topMoves = ranked.slice(0, Math.min(topWindow, ranked.length));

    let best = topMoves[0];
    let bestScore = -Infinity;
    for (const move of topMoves) {
      const safety = this.estimateMoveSafety(move.piece, move.move);
      const safetyWeight = profile.baseSafetyWeight + levelFactor * profile.levelSafetyBoost;
      const noiseRange = Math.max(0.2, profile.baseNoise * (1 - levelFactor * 0.85));
      const repetitionPenalty = this.getCpuRepetitionPenalty(move.piece, move.move);
      const decisionScore = move.score + safety * safetyWeight - repetitionPenalty + Math.random() * noiseRange;
      if (decisionScore > bestScore) {
        best = move;
        bestScore = decisionScore;
      }
    }

    return best;
  }

  getCpuRepetitionPenalty(piece, move) {
    if (piece.owner !== this.cpuOwner || !this.lastCpuMove) return 0;

    let penalty = 0;
    const samePieceAsLast = this.lastCpuMove.pieceId === piece.id;

    if (samePieceAsLast) {
      const immediateBacktrack = move.row === this.lastCpuMove.fromRow && move.col === this.lastCpuMove.fromCol;
      if (immediateBacktrack) penalty += 140;

      // Penalize long streaks of moving the same piece to encourage variety.
      penalty += Math.max(0, this.cpuSamePieceStreak - 1) * 14;

      const lateralOscillation = piece.row === this.lastCpuMove.toRow && move.row === piece.row;
      if (lateralOscillation) penalty += 10;
    } else if (this.cpuSamePieceStreak >= 2) {
      // Slightly reward switching pieces when the AI has been repeating.
      penalty -= Math.min(18, this.cpuSamePieceStreak * 4);
    }

    return penalty;
  }

  recordCpuMove(pieceId, fromRow, fromCol, toRow, toCol) {
    if (this.lastCpuMove && this.lastCpuMove.pieceId === pieceId) this.cpuSamePieceStreak += 1;
    else this.cpuSamePieceStreak = 1;

    this.lastCpuMove = {
      pieceId,
      fromRow,
      fromCol,
      toRow,
      toCol
    };
  }

  getAIDifficultyProfile() {
    if (this.aiDifficulty === "pro") {
      return {
        baseTopWindow: 4,
        minTopWindow: 1,
        baseSafetyWeight: 1.4,
        levelSafetyBoost: 2.1,
        baseNoise: 1.4
      };
    }

    if (this.aiDifficulty === "hard") {
      return {
        baseTopWindow: 6,
        minTopWindow: 2,
        baseSafetyWeight: 1.0,
        levelSafetyBoost: 1.6,
        baseNoise: 2.8
      };
    }

    if (this.aiDifficulty === "medium") {
      return {
        baseTopWindow: 9,
        minTopWindow: 3,
        baseSafetyWeight: 0.65,
        levelSafetyBoost: 1.2,
        baseNoise: 4.4
      };
    }

    return {
      baseTopWindow: 13,
      minTopWindow: 6,
      baseSafetyWeight: 0.35,
      levelSafetyBoost: 0.8,
      baseNoise: 7.2
    };
  }

  evaluatePositionalValue(piece, move) {
    let bonus = 0;
    if (piece.rank !== RANKS.FLAG) bonus += move.row * 1.2;
    else bonus += move.row * 0.35;

    const centerDistance = Math.abs(move.col - (COLS - 1) / 2);
    bonus += (3.5 - centerDistance) * 0.6;
    return bonus;
  }

  estimateMoveSafety(piece, move) {
    const enemies = this.pieces.filter((p) => p.alive && p.deployed && p.owner === this.humanOwner);
    let risk = 0;

    for (const enemy of enemies) {
      const manhattan = Math.abs(enemy.row - move.row) + Math.abs(enemy.col - move.col);
      if (manhattan === 1) {
        const result = this.computeBattleResult(enemy, piece);
        if (result === "attacker") risk -= 28;
        else if (result === "both") risk -= 8;
        else risk += 4;
      }
    }

    return risk;
  }

  scoreAIMove(piece, move) {
    const levelFactor = (this.battleLevel - 1) / 99;
    const profile = this.getAIDifficultyProfile();
    const noiseRange = Math.max(0.25, profile.baseNoise * (1 - levelFactor * 0.7));
    let score = Math.random() * noiseRange;
    const target = this.getPieceAt(move.row, move.col);

    if (target && target.owner === this.humanOwner) {
      if (target.rank === RANKS.FLAG) return 10000;
      const result = this.computeBattleResult(piece, target);
      if (result === "attacker") score += 220 + (16 - target.rank) * 6;
      else if (result === "both") score += 90;
      else score += 25;
    } else {
      if (piece.rank !== RANKS.FLAG) score += move.row * 1.4;
      else score += move.row * 0.5;
    }

    return score;
  }

  updateTurnLabel() {
    if (this.gameOver) return;

    if (this.phase === "setup") {
      if (this.gameMode === "online") {
        if (this.onlineRole === "spectator") {
          this.turnIndicatorEl.textContent = "Setup: Spectating";
        } else if (this.onlineSetupSubmitted) {
          this.turnIndicatorEl.textContent = "Setup: Waiting opponent";
        } else {
          this.turnIndicatorEl.textContent = "Setup: You";
        }
        return;
      }
      this.turnIndicatorEl.textContent = this.setupPlayer === this.cpuOwner && this.gameMode === "cpu"
        ? "Setup: Computer"
        : `Setup: ${this.ownerLabel(this.setupPlayer)}`;
      return;
    }

    if (this.gameMode === "online" && this.onlineRole === "spectator") {
      this.turnIndicatorEl.textContent = this.currentPlayer === 1 ? "Turn: Player 1" : "Turn: Player 2";
      return;
    }

    this.turnIndicatorEl.textContent = this.currentPlayer === this.cpuOwner && this.gameMode === "cpu"
      ? "Turn: Computer"
      : `Turn: ${this.ownerLabel(this.currentPlayer)}`;
  }

  ownerLabel(owner) {
    return owner === 1 ? "Player 1" : "Player 2";
  }

  ownerTone(owner) {
    return owner === 1 ? "white" : "black";
  }

  pieceImageUrl(imageKey) {
    return PIECE_IMAGE_BY_NAME[imageKey] || "";
  }

  setupVoiceAudioElement() {
    this.remoteAudioEl = document.createElement("audio");
    this.remoteAudioEl.autoplay = true;
    this.remoteAudioEl.playsInline = true;
    this.remoteAudioEl.style.display = "none";
    document.body.appendChild(this.remoteAudioEl);
  }

  updateVoiceStatus(text) {
    if (!this.voiceStatusEl) return;
    this.voiceStatusEl.textContent = text;
    this.voiceStatusEl.classList.toggle("online", /connected|active|ready|muted|unmuted/i.test(text));
  }

  setSpeakingIndicator(isLocal, active) {
    const dot = isLocal ? this.localSpeakingDotEl : this.peerSpeakingDotEl;
    if (!dot) return;
    dot.classList.toggle("active", !!active);
  }

  async ensureMicrophone() {
    if (this.localStream) return true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.updateVoiceStatus("Voice: mic unsupported");
      return false;
    }
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      this.isMuted = false;
      if (this.muteBtnEl) this.muteBtnEl.textContent = "Mute";
      this.startLocalSpeakingMonitor();
      this.updateVoiceStatus("Voice: mic ready");
      return true;
    } catch {
      this.updateVoiceStatus("Voice: microphone unavailable");
      return false;
    }
  }

  async ensurePeerConnection() {
    if (this.peerConnection) return this.peerConnection;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require"
    });

    this.peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !this.socket || !this.onlineRoomId) return;
      this.socket.emit("webrtc-ice", {
        roomId: this.onlineRoomId,
        candidate: event.candidate
      });
    };

    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        this.remoteAudioEl.srcObject = this.remoteStream;
      }
      this.remoteStream.addTrack(event.track);
      // Some browsers delay autoplay until explicit play() is called.
      this.remoteAudioEl.play().catch(() => {
        this.updateVoiceStatus("Voice: tap Mute/Unmute to start audio");
      });
      this.updateVoiceStatus("Voice: connected");
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === "connected") {
        this.updateVoiceStatus(this.isMuted ? "Voice: muted" : "Voice: active");
      } else if (state === "failed" || state === "disconnected") {
        this.updateVoiceStatus("Voice: reconnecting");
      } else if (state === "closed") {
        this.updateVoiceStatus("Voice: closed");
      }
    };

    const micOk = await this.ensureMicrophone();
    if (micOk && this.localStream) {
      const tracks = this.localStream.getAudioTracks();
      for (const track of tracks) {
        const alreadyAdded = this.peerConnection.getSenders().some((sender) => sender.track === track);
        if (!alreadyAdded) this.peerConnection.addTrack(track, this.localStream);
      }
    }

    return this.peerConnection;
  }

  async maybeStartVoice(isInitiatorHint) {
    if (this.gameMode !== "online" || this.onlineRole !== "player" || !this.onlineConnected || !this.socket || !this.onlineRoomId) {
      return;
    }

    await this.ensurePeerConnection();

    if (!isInitiatorHint || this.voiceOfferSent) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        voiceActivityDetection: true
      });
      await this.peerConnection.setLocalDescription(offer);
      this.socket.emit("webrtc-offer", {
        roomId: this.onlineRoomId,
        sdp: offer
      });
      this.voiceOfferSent = true;
      this.updateVoiceStatus("Voice: negotiating");
    } catch {
      this.updateVoiceStatus("Voice: negotiation failed");
    }
  }

  async handleRemoteOffer(sdp) {
    if (this.onlineRole !== "player") return;
    await this.ensurePeerConnection();
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit("webrtc-answer", {
        roomId: this.onlineRoomId,
        sdp: answer
      });
      this.updateVoiceStatus("Voice: connecting");
    } catch {
      this.updateVoiceStatus("Voice: offer handling failed");
    }
  }

  async handleRemoteAnswer(sdp) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      this.updateVoiceStatus("Voice: connected");
    } catch {
      this.updateVoiceStatus("Voice: answer handling failed");
    }
  }

  async handleRemoteIce(candidate) {
    if (!this.peerConnection || !candidate) return;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      // Ignore transient candidate ordering issues.
    }
  }

  startLocalSpeakingMonitor() {
    if (!this.localStream || this.speakingTimer) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const voiceCtx = new AudioCtx();
    const source = voiceCtx.createMediaStreamSource(this.localStream);
    const analyser = voiceCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    this.speakingTimer = window.setInterval(() => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) sum += data[i];
      const avg = sum / data.length;
      const speaking = !this.isMuted && avg > 16;
      this.setSpeakingIndicator(true, speaking);
      if (speaking !== this.lastSpeakingState && this.socket && this.onlineRoomId) {
        this.socket.emit("voice-activity", {
          roomId: this.onlineRoomId,
          speaking
        });
      }
      this.lastSpeakingState = speaking;
    }, 180);
  }

  stopLocalSpeakingMonitor() {
    if (this.speakingTimer) {
      window.clearInterval(this.speakingTimer);
      this.speakingTimer = null;
    }
    this.lastSpeakingState = false;
    this.setSpeakingIndicator(true, false);
  }

  async toggleMute() {
    if (!this.localStream) {
      const micOk = await this.ensureMicrophone();
      if (!micOk) {
        this.updateVoiceStatus("Voice: microphone unavailable");
        return;
      }
      if (this.gameMode === "online" && this.onlineRole === "player" && this.voicePeerReady) {
        await this.ensurePeerConnection();
      }
      this.updateVoiceStatus("Voice: mic enabled");
      return;
    }
    this.isMuted = !this.isMuted;
    for (const track of this.localStream.getAudioTracks()) {
      track.enabled = !this.isMuted;
    }
    this.muteBtnEl.textContent = this.isMuted ? "Unmute" : "Mute";
    this.updateVoiceStatus(this.isMuted ? "Voice: muted" : "Voice: unmuted");
  }

  teardownVoice(stopStream) {
    this.stopLocalSpeakingMonitor();
    this.setSpeakingIndicator(false, false);

    if (this.peerConnection) {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (stopStream && this.localStream) {
      for (const track of this.localStream.getTracks()) {
        track.stop();
      }
      this.localStream = null;
    }

    if (this.remoteAudioEl) {
      this.remoteAudioEl.srcObject = null;
    }
    this.remoteStream = null;
    this.voiceOfferSent = false;
  }

  connectOnlineRoom(asSpectator) {
    const roomId = (this.roomInputEl.value || "").trim();
    if (!roomId) return;

    if (typeof io === "undefined") {
      this.updateOnlineStatus("Socket.IO unavailable");
      return;
    }

    if (!this.socket) {
      this.socket = io();
      this.bindOnlineSocketEvents();
    }

    this.onlineRoomId = roomId;
    this.onlineRole = asSpectator ? "spectator" : "player";
    this.updateOnlineStatus("Connecting...");

    this.socket.emit("join-room", {
      roomId,
      role: this.onlineRole,
      profile: this.profile
    });
  }

  beginOnlineSetup() {
    if (this.onlineRole !== "player" || !this.onlineOwner) return;
    this.phase = "setup";
    this.setupPlayer = this.onlineOwner;
    this.currentPlayer = 1;
    this.gameOver = false;
    this.selectedPieceId = null;
    this.selectedReserveId = null;
    this.onlineSetupSubmitted = false;
    this.pieces = this.createArmyBlueprint(this.onlineOwner);
    this.capturedByP1 = [];
    this.capturedByP2 = [];
    this.updateTurnLabel();
    this.resetHistory("Online setup started");
    this.render();
  }

  submitOnlineSetup() {
    if (this.gameMode !== "online" || this.onlineRole !== "player" || !this.socket || !this.onlineRoomId) return;
    if (this.phase !== "setup") return;

    const ownPieces = this.pieces.filter((piece) => piece.owner === this.onlineOwner && piece.alive);
    const undeployed = ownPieces.filter((piece) => !piece.deployed);
    if (undeployed.length > 0) {
      this.updateOnlineStatus("Deploy all 21 pieces first");
      return;
    }

    const setupPieces = ownPieces.map((piece) => ({
      imageKey: piece.imageKey || piece.name,
      row: piece.row,
      col: piece.col
    }));

    this.onlineSetupSubmitted = true;
    this.updateTurnLabel();
    this.updateOnlineStatus("Setup submitted. Waiting for opponent...");
    this.socket.emit("submit-setup", {
      roomId: this.onlineRoomId,
      setupPieces
    });
    this.render();
  }

  bindOnlineSocketEvents() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.onlineConnected = true;
      this.updateOnlineStatus(this.onlineRoomId ? `Connected: ${this.onlineRoomId}` : "Connected");
    });

    this.socket.on("disconnect", () => {
      this.onlineConnected = false;
      this.onlineGameStarted = false;
      this.voicePeerReady = false;
      this.teardownVoice(false);
      this.updateOnlineStatus("Disconnected");
      this.updateVoiceStatus("Voice: disconnected");
    });

    this.socket.on("joined-room", (payload) => {
      // Backward compatibility: older servers may omit role.
      this.onlineRole = payload.role || (payload.owner ? "player" : "spectator");
      this.onlineOwner = payload.owner || null;
      this.humanOwner = payload.owner || 1;

      if (payload.role === "spectator") {
        this.turnIndicatorEl.textContent = "Spectating room";
      } else {
        this.turnIndicatorEl.textContent = payload.waiting ? "Waiting for opponent..." : `You are ${this.ownerLabel(payload.owner)}`;
      }

      this.updateLobbyStatus(payload.lobby || null);
      this.updateOnlineStatus(`Room ${payload.roomId} | ${this.onlineRole}`);
      this.chatMessages = payload.chatHistory || [];
      this.renderChatLog();

      const lobby = payload.lobby || { players: [] };
      const bothPlayers = !!(lobby.players && lobby.players[0] && lobby.players[1]);
      this.voicePeerReady = bothPlayers;
      if (this.onlineRole === "player" && bothPlayers) {
        const amInitiator = this.onlineOwner === 1;
        this.maybeStartVoice(amInitiator);
      }

      if (this.onlineRole === "player" && !payload.gameStarted) {
        this.beginOnlineSetup();
      }

      if (this.onlineRole === "player") {
        this.ensureMicrophone();
      }
    });

    this.socket.on("room-state", (payload) => {
      // Backward compatibility: older servers may emit state directly.
      const nextState = payload && payload.state ? payload.state : payload;
      this.applyOnlineState(nextState);

      if (payload && Array.isArray(payload.history) && payload.history.length > 0) {
        this.moveHistory = payload.history;
        this.historyIndex = this.moveHistory.length - 1;
        this.updateHistoryStatus();
      }
      if (payload && payload.event && payload.event.kind === "battle") {
        this.playSound("battle");
        if (Array.isArray(payload.event.pieceIds)) this.flashPieces(payload.event.pieceIds);
      } else if (payload && payload.event && payload.event.kind === "move") {
        this.playSound("move");
      }
      if (payload && payload.event && payload.event.kind === "win") {
        this.playSound("victory");
      }
    });

    this.socket.on("room-lobby", (payload) => {
      this.updateLobbyStatus(payload);
      const bothPlayers = !!(payload?.players?.[0] && payload?.players?.[1]);
      this.voicePeerReady = bothPlayers;
      if (this.onlineRole === "player" && bothPlayers) {
        const amInitiator = this.onlineOwner === 1;
        this.maybeStartVoice(amInitiator);
      }
      if (this.onlineRole === "player" && this.phase === "setup" && payload.readyOwners) {
        const meReady = payload.readyOwners.includes(this.onlineOwner);
        this.onlineSetupSubmitted = meReady;
        this.updateTurnLabel();
      }
    });

    this.socket.on("room-chat", (payload) => {
      this.chatMessages.push(payload);
      this.renderChatLog();
    });

    this.socket.on("room-chat-history", (payload) => {
      this.chatMessages = Array.isArray(payload) ? payload : [];
      this.renderChatLog();
    });

    this.socket.on("room-error", (payload) => {
      if (/setup/i.test(payload.message || "")) {
        this.onlineSetupSubmitted = false;
      }
      this.updateOnlineStatus(payload.message || "Room error");
      this.updateTurnLabel();
    });

    this.socket.on("opponent-left", () => {
      this.onlineGameStarted = false;
      this.turnIndicatorEl.textContent = "Opponent left room";
      this.voicePeerReady = false;
      this.teardownVoice(false);
      this.updateVoiceStatus("Voice: peer left");
    });

    this.socket.on("voice-peer-ready", (payload) => {
      if (this.onlineRole !== "player") return;
      this.voicePeerReady = true;
      this.maybeStartVoice(!!payload?.initiator);
    });

    this.socket.on("webrtc-offer", async (payload) => {
      await this.handleRemoteOffer(payload?.sdp);
    });

    this.socket.on("webrtc-answer", async (payload) => {
      await this.handleRemoteAnswer(payload?.sdp);
    });

    this.socket.on("webrtc-ice", async (payload) => {
      await this.handleRemoteIce(payload?.candidate);
    });

    this.socket.on("voice-activity", (payload) => {
      this.setSpeakingIndicator(false, !!payload?.speaking);
    });
  }

  applyOnlineState(state) {
    if (!state) return;
    this.pieces = state.pieces || [];
    this.currentPlayer = state.currentPlayer || 1;
    this.phase = state.status === "setup" ? "setup" : "battle";
    if (this.phase === "setup" && this.onlineOwner) {
      this.setupPlayer = this.onlineOwner;
    }
    this.selectedPieceId = null;
    this.selectedReserveId = null;
    this.gameOver = state.status === "ended";
    this.onlineGameStarted = state.status === "playing" || state.status === "ended";

    if (state.status === "setup") {
      this.updateTurnLabel();
      this.setMessage("");
      this.render();
      return;
    }

    if (this.gameOver) {
      const win = state.winnerOwner === this.onlineOwner;
      if (this.onlineRole === "spectator") {
        this.turnIndicatorEl.textContent = `Winner: ${this.ownerLabel(state.winnerOwner)}`;
      } else {
        this.turnIndicatorEl.textContent = win ? "Winner: You" : "Winner: Opponent";
      }
      this.setMessage(this.onlineRole === "spectator"
        ? `${this.ownerLabel(state.winnerOwner)} win game.`
        : (win ? "You win game." : "You lose game."), "status-win");
    } else if (this.onlineGameStarted) {
      if (this.onlineRole === "spectator") {
        this.turnIndicatorEl.textContent = `Turn: ${this.ownerLabel(this.currentPlayer)}`;
      } else {
        this.turnIndicatorEl.textContent = this.currentPlayer === this.onlineOwner ? "Turn: You" : "Turn: Opponent";
      }
      this.setMessage("");
    }

    this.render();
  }

  emitOnlineMove(fromRow, fromCol, toRow, toCol) {
    if (!this.socket || !this.onlineRoomId || this.onlineRole !== "player") return;
    this.socket.emit("move-piece", {
      roomId: this.onlineRoomId,
      fromRow,
      fromCol,
      toRow,
      toCol
    });
  }

  updateOnlineStatus(text) {
    if (!this.connectionStatusEl) return;
    this.connectionStatusEl.textContent = text;
    this.connectionStatusEl.classList.toggle("online", /connected|copied/i.test(text));
  }

  updateLobbyStatus(lobby) {
    if (!this.lobbyStatusEl) return;
    if (!lobby) {
      this.lobbyStatusEl.textContent = "Players: -";
      return;
    }
    const p1 = lobby.players?.[0] ? `${lobby.players[0].avatar} ${lobby.players[0].name}` : "Open";
    const p2 = lobby.players?.[1] ? `${lobby.players[1].avatar} ${lobby.players[1].name}` : "Open";
    const ready = Array.isArray(lobby.readyOwners)
      ? ` | Ready: ${lobby.readyOwners.length}/2`
      : "";
    this.lobbyStatusEl.textContent = `P1: ${p1} | P2: ${p2} | Spectators: ${lobby.spectatorCount || 0}${ready}`;
  }

  sendChatMessage() {
    const text = (this.chatInputEl.value || "").trim();
    if (!text) return;

    if (this.gameMode === "online" && this.socket && this.onlineRoomId) {
      this.socket.emit("chat-message", {
        roomId: this.onlineRoomId,
        text,
        profile: this.profile
      });
    } else {
      const localMessage = {
        profile: this.profile,
        text,
        time: Date.now()
      };
      this.chatMessages.push(localMessage);
      this.renderChatLog();
    }

    this.chatInputEl.value = "";
  }

  renderChatLog() {
    if (!this.chatLogEl) return;
    this.chatLogEl.innerHTML = "";
    const feed = this.chatMessages.slice(-60);
    for (const msg of feed) {
      const line = document.createElement("div");
      line.className = "chat-msg";
      const profile = msg.profile || { name: "Guest", avatar: "[?]" };
      line.innerHTML = `<strong>${profile.avatar} ${this.escapeHtml(profile.name)}</strong>: ${this.escapeHtml(msg.text || "")}`;
      this.chatLogEl.appendChild(line);
    }
    this.chatLogEl.scrollTop = this.chatLogEl.scrollHeight;
  }

  escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  setMessage(text, className = "") {
    if (!text) {
      this.battleMessageEl.textContent = "";
      this.battleMessageEl.classList.remove("status-win", "status-danger");
      return;
    }

    const isFinal = className === "status-win" || /win game|lose game/i.test(text);
    if (!isFinal) {
      this.battleMessageEl.textContent = "";
      this.battleMessageEl.classList.remove("status-win", "status-danger");
      return;
    }

    this.battleMessageEl.textContent = text;
    this.battleMessageEl.classList.remove("status-win", "status-danger");
    if (className) this.battleMessageEl.classList.add(className);
  }

  endGame(winnerOwner, text) {
    this.gameOver = true;
    this.selectedPieceId = null;
    this.selectedReserveId = null;

    let finalText = text;
    if (this.gameMode === "cpu") {
      if (winnerOwner === this.humanOwner && this.battleLevel === this.maxUnlockedLevel && this.maxUnlockedLevel < 100) {
        this.maxUnlockedLevel += 1;
        this.saveLevelProgress();
        this.refreshLevelOptions();
      }
      finalText = winnerOwner === this.humanOwner
        ? `You win game at Level ${this.battleLevel}.`
        : `You lose game at Level ${this.battleLevel}.`;
    } else {
      finalText = finalText || `${this.ownerLabel(winnerOwner)} win game.`;
    }

    this.turnIndicatorEl.textContent = winnerOwner === this.cpuOwner && this.gameMode === "cpu"
      ? "Winner: Computer"
      : `Winner: ${this.ownerLabel(winnerOwner)}`;

    this.setMessage(finalText, "status-win");
    if (winnerOwner === this.humanOwner || (this.onlineRole === "spectator" && winnerOwner)) this.playSound("victory");
    else this.playSound("defeat");
    this.recordSnapshot("Game ended");
  }

  shouldRevealPiece(piece) {
    if (this.gameOver) return true;
    if (this.gameMode === "online") {
      if (piece.hiddenFromViewer) return false;
      return this.onlineRole === "spectator" ? false : piece.owner === this.onlineOwner;
    }
    if (this.phase === "setup") return piece.owner === this.setupPlayer;
    if (this.gameMode === "cpu") return piece.owner === this.humanOwner;
    return piece.owner === this.currentPlayer;
  }

  canDragPiece(piece) {
    if (this.gameOver || !piece || !piece.alive || !piece.deployed) return false;
    if (this.phase === "setup") {
      return piece.owner === this.setupPlayer;
    }
    if (this.gameMode === "online") {
      return this.onlineConnected
        && this.onlineGameStarted
        && this.onlineRole === "player"
        && this.currentPlayer === this.onlineOwner
        && piece.owner === this.onlineOwner;
    }
    if (this.gameMode === "cpu" && this.currentPlayer === this.cpuOwner) return false;
    return piece.owner === this.currentPlayer;
  }

  playSound(type) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.audioCtx) this.audioCtx = new AudioCtx();
    const ctx = this.audioCtx;

    const beep = (freq, duration, gain) => {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      amp.gain.value = gain;
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    };

    if (type === "move") beep(420, 0.08, 0.02);
    else if (type === "battle") {
      beep(220, 0.1, 0.03);
      window.setTimeout(() => beep(160, 0.12, 0.03), 80);
    } else if (type === "victory") {
      beep(620, 0.12, 0.03);
      window.setTimeout(() => beep(780, 0.18, 0.03), 110);
    } else if (type === "defeat") {
      beep(220, 0.18, 0.03);
      window.setTimeout(() => beep(140, 0.2, 0.03), 130);
    }
  }

  render() {
    this.boardEl.classList.toggle("flipped", this.shouldFlipBoard());

    for (const [cellKey, cell] of this.cellMap.entries()) {
      cell.classList.remove("selected", "valid-move", "setup-cell", "enemy-zone");
      cell.innerHTML = "";

      if (this.phase === "setup") {
        const [rowStr] = cellKey.split(",");
        const row = Number(rowStr);
        if (this.isCellInSetupZone(row, this.setupPlayer)) {
          cell.classList.add("setup-cell");
        } else if (this.isCellInSetupZone(row, this.setupPlayer === 1 ? 2 : 1)) {
          cell.classList.add("enemy-zone");
        }
      }
    }

    const selectedPiece = this.selectedPieceId ? this.getPieceById(this.selectedPieceId) : null;
    if (selectedPiece && this.phase === "battle") {
      const selectedCell = this.cellMap.get(this.key(selectedPiece.row, selectedPiece.col));
      if (selectedCell) selectedCell.classList.add("selected");
      for (const move of this.getValidMoves(selectedPiece)) {
        const cell = this.cellMap.get(this.key(move.row, move.col));
        if (cell) cell.classList.add("valid-move");
      }
    }

    for (const piece of this.pieces) {
      if (!piece.alive || !piece.deployed) continue;

      const cell = this.cellMap.get(this.key(piece.row, piece.col));
      if (!cell) continue;

      const pieceEl = document.createElement("div");
      pieceEl.className = `piece owner-${piece.owner}`;
      pieceEl.dataset.row = String(piece.row);
      pieceEl.dataset.col = String(piece.col);
      pieceEl.draggable = this.canDragPiece(piece);
      if (pieceEl.draggable) pieceEl.classList.add("draggable");
      if (this.revealFlashIds.has(piece.id)) pieceEl.classList.add("reveal-flash");

      if (this.shouldRevealPiece(piece)) {
        const imageUrl = this.pieceImageUrl(piece.imageKey || piece.name);
        const position = this.ownerTone(piece.owner) === "white" ? "left center" : "right center";
        if (imageUrl) {
          pieceEl.classList.add("piece-image");
          pieceEl.style.backgroundImage = `url("${imageUrl}")`;
          pieceEl.style.backgroundSize = "200% 100%";
          pieceEl.style.backgroundPosition = position;
          pieceEl.style.backgroundRepeat = "no-repeat";
        }
        pieceEl.title = piece.name;
      } else {
        pieceEl.textContent = "CLASSIFIED";
        pieceEl.classList.add("hidden");
      }

      cell.appendChild(pieceEl);
    }

    this.renderReserveTray();
    this.renderCapturedLists();
    this.toggleSetupUI();
    this.updateHistoryStatus();
    this.renderChatLog();
  }

  toggleSetupUI() {
    const isSetup = this.phase === "setup" && !this.gameOver;
    const isOnline = this.gameMode === "online";
    const isOnlineSetupPlayer = isOnline && isSetup && this.onlineRole === "player";

    this.autoDeployBtn.classList.toggle("hidden-ui", !(isSetup && (!isOnline || (this.onlineRole === "player" && !this.onlineSetupSubmitted))));
    this.setupTitleEl.classList.toggle("hidden-ui", isOnline && !isSetup);
    this.setupStatusEl.classList.toggle("hidden-ui", isOnline && !isSetup);
    this.reserveTrayEl.classList.toggle("hidden-ui", !(isSetup && (!isOnline || this.onlineRole === "player")));
    this.onlineControlsEl.classList.toggle("hidden-ui", !isOnline);
    if (this.submitSetupBtnEl) {
      const readyToSubmit = isOnlineSetupPlayer && !!this.onlineOwner && this.allDeployed(this.onlineOwner) && !this.onlineSetupSubmitted;
      this.submitSetupBtnEl.classList.toggle("hidden-ui", !readyToSubmit);
    }
    this.chatSectionEl.classList.toggle("hidden-ui", !(isOnline || this.chatMessages.length > 0));

    if (this.muteBtnEl) {
      const canUseVoice = isOnline && this.onlineRole === "player";
      this.muteBtnEl.disabled = !canUseVoice;
      if (!isOnline) {
        this.muteBtnEl.textContent = "Enable Mic";
        this.updateVoiceStatus("Voice: idle");
      } else if (!canUseVoice) {
        this.muteBtnEl.textContent = "Enable Mic";
        this.updateVoiceStatus("Voice: spectators disabled");
      } else if (!this.localStream) {
        this.muteBtnEl.textContent = "Enable Mic";
      }
    }

    this.setupTitleEl.textContent = isSetup ? "Setup Reserve" : "Reserve";
    this.difficultySelectEl.disabled = this.gameMode !== "cpu";
    this.levelSelectEl.disabled = this.gameMode !== "cpu";
    this.colorSelectEl.disabled = this.gameMode !== "cpu";
  }

  renderReserveTray() {
    if (this.gameMode === "online" && (this.phase !== "setup" || this.onlineRole !== "player")) {
      this.reserveTrayEl.innerHTML = "";
      return;
    }

    this.reserveTrayEl.innerHTML = "";

    if (this.phase !== "setup") {
      this.setupStatusEl.textContent = "Battle phase in progress.";
      this.reserveTrayEl.innerHTML = '<span class="capture-chip">Setup complete</span>';
      return;
    }

    const ownerLabel = this.setupPlayer === this.cpuOwner && this.gameMode === "cpu"
      ? "Computer"
      : this.ownerLabel(this.setupPlayer);

    if (this.gameMode === "online") {
      this.setupStatusEl.textContent = this.onlineSetupSubmitted
        ? "Setup submitted. Waiting for opponent to submit."
        : "Online setup: place your 21 pieces, then submit setup.";
    } else if (this.gameMode === "cpu") {
      const sideLabel = this.humanColor === "white" ? "White (Player 1)" : "Black (Player 2)";
      this.setupStatusEl.textContent = `${ownerLabel} setup. You are ${sideLabel}.`;
    } else {
      this.setupStatusEl.textContent = `${ownerLabel} setup. Select a piece, then click a setup square.`;
    }

    const reserve = this.getUndeployedPieces(this.setupPlayer);
    if (reserve.length === 0) {
      this.reserveTrayEl.innerHTML = '<span class="capture-chip">All pieces deployed</span>';
      return;
    }

    for (const piece of reserve) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "reserve-chip";
      chip.dataset.pieceId = piece.id;
      chip.textContent = piece.name;
      chip.draggable = true;

      const imageUrl = this.pieceImageUrl(piece.imageKey || piece.name);
      const position = this.ownerTone(this.setupPlayer) === "white" ? "left center" : "right center";
      if (imageUrl) {
        chip.style.backgroundImage = `url("${imageUrl}")`;
        chip.style.backgroundSize = "200% 100%";
        chip.style.backgroundPosition = position;
        chip.style.backgroundRepeat = "no-repeat";
        chip.style.minHeight = "54px";
        chip.style.display = "flex";
        chip.style.alignItems = "flex-end";
        chip.style.justifyContent = "center";
        chip.style.textShadow = "0 1px 2px rgba(0,0,0,0.7)";
      }

      if (piece.id === this.selectedReserveId) chip.classList.add("selected");
      this.reserveTrayEl.appendChild(chip);
    }
  }

  renderCapturedLists() {
    this.capturedByP1El.innerHTML = "";
    this.capturedByP2El.innerHTML = "";

    if (this.capturedByP1.length === 0) {
      this.capturedByP1El.innerHTML = '<span class="capture-chip">None</span>';
    } else {
      for (const piece of this.capturedByP1) {
        this.capturedByP1El.appendChild(this.captureChip(`${piece.name} (P2)`));
      }
    }

    if (this.capturedByP2.length === 0) {
      this.capturedByP2El.innerHTML = '<span class="capture-chip">None</span>';
    } else {
      for (const piece of this.capturedByP2) {
        this.capturedByP2El.appendChild(this.captureChip(`${piece.name} (P1)`));
      }
    }
  }

  captureChip(text) {
    const chip = document.createElement("span");
    chip.className = "capture-chip";
    chip.textContent = text;
    return chip;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new GameOfGenerals();
});
