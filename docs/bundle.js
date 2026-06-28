(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/scripts/view/standee/standee-animation-texture-base.ts
  var SPRITESHEET_WIDTH = 256;
  var SPRITESHEET_HEIGHT = 512;
  var FRAME_WIDTH = 48;
  var FRAME_HEIGHT = 72;
  var FILES_TO_PRELOAD = 3;
  var StandeeAnimationTextureWrapper = class {
    constructor(texture) {
      __publicField(this, "texture");
      this.texture = texture;
    }
  };
  var StandeeAnimationTextureBase = class {
    constructor() {
      __publicField(this, "textures");
      __publicField(this, "loadedCount");
      __publicField(this, "currentTextureIdx");
      this.textures = [];
      this.loadedCount = 0;
      this.currentTextureIdx = 0;
    }
    preload(signalThatOneTextureWasLoaded) {
      let textureLoadedHandler = (texture) => {
        texture.repeat.set(
          FRAME_WIDTH / SPRITESHEET_WIDTH,
          FRAME_HEIGHT / SPRITESHEET_HEIGHT
        );
        this.textures.push(texture);
        this.loadedCount++;
        signalThatOneTextureWasLoaded(true);
      };
      let errorHandler = () => {
        signalThatOneTextureWasLoaded(false);
      };
      let textureLoader = new THREE.TextureLoader();
      textureLoader.load("fall-student.png", textureLoadedHandler, void 0, errorHandler);
      textureLoader.load("fall-student2.png", textureLoadedHandler, void 0, errorHandler);
      textureLoader.load("fall-student3.png", textureLoadedHandler, void 0, errorHandler);
      return FILES_TO_PRELOAD;
    }
    newInstance() {
      let idx = this.getNextTextureIdx();
      let texture = this.textures[idx].clone();
      texture.needsUpdate = true;
      return new StandeeAnimationTextureWrapper(texture);
    }
    getNextTextureIdx() {
      this.currentTextureIdx++;
      if (this.currentTextureIdx >= FILES_TO_PRELOAD) {
        this.currentTextureIdx = 0;
      }
      return this.currentTextureIdx;
    }
  };
  var standeeAnimationTextureBase = new StandeeAnimationTextureBase();

  // src/scripts/view/lighting/building-preloader.ts
  var FILES_TO_PRELOAD2 = 2;
  var BuildingPreloader = class {
    constructor() {
      __publicField(this, "instances");
      __publicField(this, "instancesRequested");
      this.instances = [];
      this.instancesRequested = 0;
    }
    preload(signalOneFileLoaded) {
      let mtlLoader = new THREE.MTLLoader();
      mtlLoader.setPath("");
      mtlLoader.load("green-building.mtl", (materials) => {
        materials.preload();
        signalOneFileLoaded(true);
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath("");
        objLoader.load("green-building.obj", (obj) => {
          this.instances.push(obj);
          signalOneFileLoaded(true);
        }, void 0, () => {
          signalOneFileLoaded(false);
        });
      }, void 0, () => {
        signalOneFileLoaded(false);
      });
      return FILES_TO_PRELOAD2;
    }
    getInstance() {
      let instance;
      if (this.instancesRequested === 0) {
        instance = this.instances[0];
      } else {
        instance = this.instances[0].clone();
        this.instances.push(instance);
      }
      this.instancesRequested++;
      return instance;
    }
  };
  var buildingPreloader = new BuildingPreloader();

  // src/scripts/view/world/ground.ts
  var FILES_TO_PRELOAD3 = 1;
  var Ground = class {
    constructor() {
      __publicField(this, "group");
      __publicField(this, "grass");
      __publicField(this, "treesSpawned");
      __publicField(this, "treeTexture");
      this.group = new THREE.Object3D();
      let geometry = new THREE.PlaneGeometry(300, 300);
      let material = new THREE.MeshLambertMaterial({ emissive: 138499, emissiveIntensity: 1 });
      this.grass = new THREE.Mesh(geometry, material);
      this.grass.rotation.x = Math.PI * 3 / 2;
      this.grass.position.set(0, 0, 0);
      this.treesSpawned = false;
      this.treeTexture = null;
    }
    start() {
      this.group.add(this.grass);
    }
    step(elapsed) {
      if (this.treesSpawned === false && this.treeTexture != null) {
        this.spawnTree(-2, 1);
        this.spawnTree(9.5, 1);
        this.spawnTree(14, 7);
        this.treesSpawned = true;
      }
    }
    preload(signalThatTextureWasLoaded) {
      let textureLoadedHandler = (texture) => {
        this.treeTexture = texture;
        signalThatTextureWasLoaded(true);
      };
      let errorHandler = () => {
        signalThatTextureWasLoaded(false);
      };
      let textureLoader = new THREE.TextureLoader();
      textureLoader.load("tree.png", textureLoadedHandler, void 0, errorHandler);
      return FILES_TO_PRELOAD3;
    }
    spawnTree(x, z) {
      let material = new THREE.SpriteMaterial({ map: this.treeTexture });
      let sprite = new THREE.Sprite(material);
      sprite.scale.set(2.5, 2.5, 2.5);
      sprite.position.set(x, 1.1, z);
      sprite.material.color.setRGB(0.5, 0.5, 0.5);
      this.group.add(sprite);
    }
  };
  var ground = new Ground();

  // src/scripts/event/event-bus.ts
  var AbstractEvent = class {
  };
  var EventBus = class {
    constructor() {
      __publicField(this, "handlersByType");
      this.handlersByType = /* @__PURE__ */ new Map();
    }
    register(type, handler) {
      if (!type) {
      }
      if (!handler) {
      }
      let handlers = this.handlersByType.get(type);
      if (handlers === void 0) {
        handlers = [];
        this.handlersByType.set(type, handlers);
      }
      handlers.push(handler);
    }
    // TODO: unregister(). And remove the map key if zero handlers left for it.
    // TODO: Prevent infinite fire()?
    fire(event) {
      let handlers = this.handlersByType.get(event.getType());
      if (handlers !== void 0) {
        for (let handler of handlers) {
          handler(event);
        }
      }
    }
  };
  var eventBus = new EventBus();
  var deadEventBus = new EventBus();

  // src/scripts/event/game-state-changed-event.ts
  var GameStateChangedEvent = class extends AbstractEvent {
    constructor(type) {
      super();
      __publicField(this, "gameStateType");
      this.gameStateType = type;
    }
    getType() {
      return 5 /* GameStateChangedType */;
    }
  };

  // src/scripts/game-state.ts
  var GameState = class {
    constructor() {
      __publicField(this, "current");
      this.current = 0 /* Initializing */;
    }
    getCurrent() {
      return this.current;
    }
    setCurrent(current) {
      this.current = current;
      eventBus.fire(new GameStateChangedEvent(current));
    }
  };
  var gameState = new GameState();

  // src/scripts/domain/constants.ts
  var PANEL_COUNT_PER_FLOOR = 10;
  var TIME_UNTIL_EVERYONE_ON_SCREEN = 105 * 1e3;
  var AMBIENCE_NIGHT = "AMBIENCE_NIGHT";
  var MUSIC_OPENING = "MUSIC_OPENING";
  var MUSIC_MAIN = "MUSIC_MAIN";
  var MUSIC_MAIN_VOX = "MUSIC_MAIN_VOX";
  var STUDENTS_TALKING = "STUDENTS_TALKING";
  var CHEERING = "CHEERING";
  var CLAPPING = "CLAPPING";

  // src/scripts/sound/sound-manager.ts
  var SOUND_KEY = "129083190-falling-sound";
  var MUSIC_FADE_OUT_TIME_MS = 15 * 1e3;
  var SoundManager = class {
    constructor() {
      __publicField(this, "soundToggleSection");
      __publicField(this, "soundToggleElement");
      __publicField(this, "howls");
      // any = Howl
      __publicField(this, "crowdNoiseElapsed");
      __publicField(this, "crowdVolume");
      __publicField(this, "musicEndingTtl");
      __publicField(this, "musicVolume");
      this.soundToggleSection = document.getElementById("sound-toggle-section");
      this.soundToggleElement = document.getElementById("sound-toggle");
      this.soundToggleElement.onclick = () => {
        this.updateSoundSetting(!this.soundToggleElement.checked);
      };
      this.howls = /* @__PURE__ */ new Map();
      this.crowdNoiseElapsed = 0;
      this.crowdVolume = 0;
      this.musicEndingTtl = MUSIC_FADE_OUT_TIME_MS;
      this.musicVolume = 0;
    }
    /**
     * Should occur before preloading so the player sees the right option immediately.
     */
    attach() {
      this.updateSoundSetting();
      this.unlockAudioOnFirstGesture();
    }
    /**
     * Modern browsers start the Web Audio context in a "suspended" state and
     * refuse to play audio until the user interacts with the page. The upgrade
     * to Howler 2.2.4 is the primary fix: its built-in autoUnlock resumes the
     * context (and un-defers sounds that were queued while suspended) on the
     * first click / keydown / touch. The old vendored Howler 2.0.1 only unlocked
     * on iOS touch events, so on desktop the context stayed suspended forever.
     *
     * This explicit resume is kept as a belt-and-suspenders fallback and also
     * covers the context being auto-suspended again after a long idle period.
     */
    unlockAudioOnFirstGesture() {
      let resume = () => {
        try {
          if (Howler.ctx && Howler.ctx.state === "suspended") {
            let resumed = Howler.ctx.resume();
            if (resumed && resumed.catch) {
              resumed.catch(() => {
              });
            }
          }
        } catch (e) {
        }
        window.removeEventListener("pointerdown", resume);
        window.removeEventListener("touchend", resume);
        window.removeEventListener("keydown", resume);
      };
      window.addEventListener("pointerdown", resume);
      window.addEventListener("touchend", resume);
      window.addEventListener("keydown", resume);
    }
    start() {
      eventBus.register(5 /* GameStateChangedType */, (event) => {
        switch (event.gameStateType) {
          case 2 /* Intro */:
            this.cueIntroSounds();
            break;
          case 3 /* Playing */:
            this.cuePlayingSounds();
            break;
          case 4 /* Ended */:
            this.fadeOutSounds();
            break;
        }
      });
      eventBus.register(2 /* BoardFilledEventType */, (event) => {
        if (gameState.getCurrent() === 3 /* Playing */) {
          this.playBoardFilledReaction(event.playerType);
        }
      });
    }
    step(elapsed) {
      if (gameState.getCurrent() === 3 /* Playing */) {
        let studentsTalkingHowl = this.howls.get(STUDENTS_TALKING);
        if (studentsTalkingHowl != null) {
          if (studentsTalkingHowl.playing()) {
            this.crowdNoiseElapsed += elapsed;
            this.crowdVolume = this.crowdNoiseElapsed / (TIME_UNTIL_EVERYONE_ON_SCREEN / 2) * 0.4;
            if (this.crowdVolume > 0.4) {
              this.crowdVolume = 0.4;
            }
            studentsTalkingHowl.volume(this.crowdVolume);
          }
        }
        this.musicVolume = 0.7;
      } else if (gameState.getCurrent() === 4 /* Ended */) {
        this.musicEndingTtl -= elapsed;
        if (this.musicEndingTtl < 0) {
          this.musicEndingTtl = 0;
        }
        this.musicVolume = this.musicEndingTtl / MUSIC_FADE_OUT_TIME_MS * 0.7;
        let musicMainHowl = this.howls.get(MUSIC_MAIN);
        if (musicMainHowl != null) {
          musicMainHowl.volume(this.musicVolume);
        }
        let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);
        if (musicMainHowlVox != null) {
          musicMainHowlVox.volume(this.musicVolume);
        }
      }
    }
    cacheHowl(key, value) {
      this.howls.set(key, value);
    }
    /**
     * Part 2 is done off the main execution path, in case the user has client-side storage turned off.
     */
    updateSoundSetting(mute) {
      if (mute == null) {
        this.soundToggleElement.checked = true;
      } else {
        let soundValue;
        if (mute) {
          soundValue = "off";
        } else {
          soundValue = "on";
        }
        Howler.mute(mute);
      }
      setTimeout(() => {
        this.soundToggleElement.removeAttribute("disabled");
        if (mute == null) {
          let soundValue = sessionStorage.getItem(SOUND_KEY);
          if (soundValue === "off") {
            this.soundToggleElement.checked = false;
            Howler.mute(true);
          }
        } else {
          let soundValue;
          if (mute) {
            soundValue = "off";
          } else {
            soundValue = "on";
          }
          sessionStorage.setItem(SOUND_KEY, soundValue);
        }
      }, 0);
    }
    cueIntroSounds() {
      let ambienceNightHowl = this.howls.get(AMBIENCE_NIGHT);
      ambienceNightHowl.loop(true);
      ambienceNightHowl.play();
      let musicOpeningHowl = this.howls.get(MUSIC_OPENING);
      musicOpeningHowl.loop(true);
      musicOpeningHowl.play();
    }
    /**
     * Once loaded, have the main music play after the intro music completes its current loop.
     * Also have the students talking start to play.
     */
    cuePlayingSounds() {
      let musicMainHowl = this.howls.get(MUSIC_MAIN);
      let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);
      if (musicMainHowl != null && musicMainHowlVox != null) {
        let musicOpeningHowl = this.howls.get(MUSIC_OPENING);
        musicOpeningHowl.loop(false);
        musicOpeningHowl.once("end", () => {
          musicOpeningHowl.unload();
          this.chainMusicMain();
          this.cueStudentsTalkingSounds();
        });
      } else {
        setTimeout(() => this.cuePlayingSounds(), 1e3);
      }
    }
    /**
     * Start this at a zero volume and gradually increase to about half volume.
     */
    cueStudentsTalkingSounds() {
      let studentsTalkingHowl = this.howls.get(STUDENTS_TALKING);
      if (studentsTalkingHowl != null) {
        studentsTalkingHowl.loop(true);
        studentsTalkingHowl.play();
      } else {
        setTimeout(() => this.cueStudentsTalkingSounds(), 1e3);
      }
    }
    chainMusicMain() {
      let musicMainHowl = this.howls.get(MUSIC_MAIN);
      let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);
      musicMainHowl.volume(this.musicVolume);
      musicMainHowl.play();
      musicMainHowl.once("end", () => this.chainMusicMainVox());
    }
    chainMusicMainVox() {
      let musicMainHowl = this.howls.get(MUSIC_MAIN);
      let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);
      musicMainHowlVox.volume(this.musicVolume);
      musicMainHowlVox.play();
      musicMainHowlVox.once("end", () => this.chainMusicMain());
    }
    playBoardFilledReaction(playerType) {
      const maxVolume = 0.9;
      if (playerType === 1 /* Ai */) {
        let cheeringHowl = this.howls.get(CHEERING);
        if (cheeringHowl != null) {
          let volume = this.crowdNoiseElapsed / (TIME_UNTIL_EVERYONE_ON_SCREEN / 2) * maxVolume;
          if (volume > maxVolume) {
            volume = maxVolume;
          }
          cheeringHowl.volume(volume);
          cheeringHowl.play();
        }
      } else {
        let clappingHowl = this.howls.get(CLAPPING);
        if (clappingHowl != null) {
          let volume = this.crowdNoiseElapsed / (TIME_UNTIL_EVERYONE_ON_SCREEN / 2) * maxVolume;
          if (volume > maxVolume) {
            volume = maxVolume;
          }
          clappingHowl.volume(volume);
          clappingHowl.play();
        }
      }
    }
    /**
     * Quick hack just to get it done.
     */
    fadeOutSounds() {
      let studentsTalkingHowl = this.howls.get(STUDENTS_TALKING);
      if (studentsTalkingHowl != null) {
        studentsTalkingHowl.fade(this.crowdVolume, 0, 30 * 1e3);
      }
    }
  };
  var soundManager = new SoundManager();

  // src/scripts/sound/sound-loader.ts
  var FILES_TO_PRELOAD4 = 2;
  var SoundLoader = class {
    preload(signalOneFileLoaded) {
      {
        let ambienceNightHowl = new Howl({
          src: ["ambience-night.m4a"],
          volume: 0.33
        });
        ambienceNightHowl.once("load", () => {
          soundManager.cacheHowl(AMBIENCE_NIGHT, ambienceNightHowl);
          signalOneFileLoaded(true);
        });
        ambienceNightHowl.once("loaderror", () => {
          signalOneFileLoaded(false);
        });
      }
      {
        let musicOpeningHowl = new Howl({
          src: ["music-opening.m4a"],
          volume: 0.5
        });
        musicOpeningHowl.once("load", () => {
          soundManager.cacheHowl(MUSIC_OPENING, musicOpeningHowl);
          signalOneFileLoaded(true);
        });
        musicOpeningHowl.once("loaderror", () => {
          signalOneFileLoaded(false);
        });
      }
      return FILES_TO_PRELOAD4;
    }
    deferredLoad() {
      {
        let musicMainHowl = new Howl({
          src: ["music-main.m4a"],
          volume: 0.7
        });
        musicMainHowl.once("load", () => {
          soundManager.cacheHowl(MUSIC_MAIN, musicMainHowl);
        });
      }
      {
        let musicMainVoxHowl = new Howl({
          src: ["music-main-vox.m4a"],
          volume: 0.7
        });
        musicMainVoxHowl.once("load", () => {
          soundManager.cacheHowl(MUSIC_MAIN_VOX, musicMainVoxHowl);
        });
      }
      {
        let studentsTalkingHowl = new Howl({
          src: ["students-talking.m4a"],
          volume: 0
        });
        studentsTalkingHowl.once("load", () => {
          soundManager.cacheHowl(STUDENTS_TALKING, studentsTalkingHowl);
        });
      }
      {
        let cheeringHowl = new Howl({
          src: ["cheering.m4a"],
          volume: 0
        });
        cheeringHowl.once("load", () => {
          soundManager.cacheHowl(CHEERING, cheeringHowl);
        });
      }
      {
        let clappingHowl = new Howl({
          src: ["clapping.m4a"],
          volume: 0
        });
        clappingHowl.once("load", () => {
          soundManager.cacheHowl(CLAPPING, clappingHowl);
        });
      }
    }
  };
  var soundLoader = new SoundLoader();

  // src/scripts/preloader.ts
  var Preloader = class {
    constructor() {
      __publicField(this, "loadingDiv");
      __publicField(this, "loadingMessage");
      __publicField(this, "loadingError");
      __publicField(this, "loadingBar");
      this.loadingDiv = document.getElementById("loading");
      this.loadingMessage = document.getElementById("loading-message");
      this.loadingError = document.getElementById("loading-error");
      this.loadingBar = document.getElementById("loading-bar");
    }
    preload(signalPreloadingComplete) {
      let count = 0;
      let total = 0;
      let callWhenFinished = (success) => {
        if (success) {
          count++;
          this.loadingMessage.textContent = "Loaded " + count + " of " + total + " fixtures...";
          if (count >= total) {
            this.fadeOut();
            signalPreloadingComplete();
            this.deferredLoad();
          }
          this.loadingBar.setAttribute("value", String(count));
        } else {
          this.loadingError.textContent = "Error loading fixtures. Please reload if you would like to retry.";
        }
      };
      total += standeeAnimationTextureBase.preload((success) => {
        callWhenFinished(success);
      });
      total += buildingPreloader.preload((success) => {
        callWhenFinished(success);
      });
      total += ground.preload((success) => {
        callWhenFinished(success);
      });
      total += soundLoader.preload((success) => {
        callWhenFinished(success);
      });
      this.loadingBar.setAttribute("max", String(total));
    }
    fadeOut() {
      this.loadingDiv.style.opacity = "0";
      this.loadingDiv.style.transition = "opacity 1s";
      setTimeout(() => {
        this.loadingDiv.style.display = "none";
      }, 1250);
    }
    /**
     * Load more fixtures that will not be needed immediately.
     */
    deferredLoad() {
      soundLoader.deferredLoad();
    }
  };
  var preloader = new Preloader();

  // src/scripts/event/npc-placed-event.ts
  var NpcPlacedEvent = class extends AbstractEvent {
    constructor(npcId, x, y) {
      super();
      __publicField(this, "npcId");
      __publicField(this, "x");
      __publicField(this, "y");
      this.npcId = npcId;
      this.x = x;
      this.y = y;
    }
    getType() {
      return 10 /* NpcPlacedEventType */;
    }
  };

  // src/scripts/event/npc-movement-changed-event.ts
  var NpcMovementChangedEvent = class extends AbstractEvent {
    constructor(npcId, x, y) {
      super();
      __publicField(this, "npcId");
      __publicField(this, "x");
      __publicField(this, "y");
      this.npcId = npcId;
      this.x = x;
      this.y = y;
    }
    getType() {
      return 9 /* NpcMovementChangedEventType */;
    }
  };

  // src/scripts/event/npc-facing-event.ts
  var NpcFacingEvent = class extends AbstractEvent {
    constructor(npcId, x, y) {
      super();
      __publicField(this, "npcId");
      __publicField(this, "x");
      __publicField(this, "y");
      this.npcId = npcId;
      this.x = x;
      this.y = y;
    }
    getType() {
      return 8 /* NpcFacingEventType */;
    }
  };

  // src/scripts/event/npc-teleported-event.ts
  var NpcTeleportedEvent = class extends AbstractEvent {
    constructor(npcId, x, y) {
      super();
      __publicField(this, "npcId");
      __publicField(this, "x");
      __publicField(this, "y");
      this.npcId = npcId;
      this.x = x;
      this.y = y;
    }
    getType() {
      return 12 /* NpcTeleportedEventType */;
    }
  };

  // src/scripts/model/npc/npc.ts
  var Npc = class {
    constructor(readyForCommandCallback) {
      __publicField(this, "id");
      __publicField(this, "ended");
      __publicField(this, "state");
      __publicField(this, "standingTtl");
      __publicField(this, "waypoints");
      // "Last" as in the last known coordinate, because it could be currently in-motion.
      __publicField(this, "xlast");
      __publicField(this, "ylast");
      __publicField(this, "readyForCommandCallback");
      this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      this.ended = false;
      this.state = 1 /* WaitingForCommand */;
      this.standingTtl = 0;
      this.waypoints = [];
      this.xlast = 0;
      this.ylast = 0;
      this.readyForCommandCallback = readyForCommandCallback;
    }
    start() {
      this.xlast = -5;
      this.ylast = 15;
      eventBus.fire(new NpcPlacedEvent(this.id, this.xlast, this.ylast));
    }
    step(elapsed) {
      switch (this.state) {
        case 0 /* Walking */:
          this.stepWalking();
          break;
        case 2 /* Standing */:
          this.stepStanding(elapsed);
          break;
        case 1 /* WaitingForCommand */:
          this.stepWaitingForCommand();
          break;
        default:
          console.log("should not get here");
      }
    }
    stepWalking() {
    }
    stepStanding(elapsed) {
      this.standingTtl -= elapsed;
      if (this.standingTtl <= 0) {
        this.state = 1 /* WaitingForCommand */;
      }
    }
    stepWaitingForCommand() {
      if (this.waypoints.length > 0) {
        let nextLocation = this.waypoints.shift();
        this.beginWalkingTo(nextLocation);
      } else {
        this.readyForCommandCallback();
      }
    }
    standFacing(focusPoint, standingTtl) {
      this.state = 2 /* Standing */;
      this.standingTtl = standingTtl;
      if (focusPoint === 0 /* BuildingLeft */) {
        eventBus.fire(new NpcFacingEvent(this.id, 5, -3));
      } else if (focusPoint === 1 /* BuildingRight */) {
        eventBus.fire(new NpcFacingEvent(this.id, 15.5, 5));
      }
    }
    addWaypoint(location) {
      this.waypoints.push(location);
    }
    /**
     * Signifies the end of a walk. Does not send an event.
     */
    updatePosition(x, y) {
      this.xlast = x;
      this.ylast = y;
      this.state = 1 /* WaitingForCommand */;
    }
    /**
     * Teleports the NPC to the given location.
     * Sends an event so the standee can be updated.
     */
    teleportTo(location) {
      let x, y;
      [x, y] = this.generateRandomCoordinates(location);
      this.xlast = x;
      this.ylast = y;
      eventBus.fire(new NpcTeleportedEvent(this.id, x, y));
    }
    beginWalkingTo(location) {
      let x, y;
      [x, y] = this.generateRandomCoordinates(location);
      this.state = 0 /* Walking */;
      eventBus.fire(new NpcMovementChangedEvent(this.id, x, y));
    }
    generateRandomCoordinates(location) {
      let x = 0;
      let y = 0;
      switch (location) {
        case 1 /* OffLeft */:
          [x, y] = this.randomWithinRange(-5, 5, 2);
          break;
        case 2 /* OffRight */:
          [x, y] = this.randomWithinRange(10, 15, 2);
          break;
        case 3 /* BuildingLeft */:
          [x, y] = this.randomWithinRange(5, 4.5, 2);
          break;
        case 4 /* BuildingRight */:
          [x, y] = this.randomWithinRange(9, 7.5, 2);
          break;
        case 5 /* BuildingMiddle */:
          [x, y] = this.randomWithinRange(10, 2.5, 2);
          break;
        case 6 /* Middle */:
          [x, y] = this.randomWithinRange(6, 10, 3);
          break;
        default:
          console.log("should not get here");
      }
      return [x, y];
    }
    randomWithinRange(x, y, variance) {
      let xresult = x - variance / 2 + Math.random() * variance;
      let yresult = y - variance / 2 + Math.random() * variance;
      return [xresult, yresult];
    }
  };

  // src/scripts/model/npc/release-timer.ts
  var TOTAL_NPCS = 40;
  var NPCS_PER_SECOND = TIME_UNTIL_EVERYONE_ON_SCREEN / TOTAL_NPCS;
  var TIME_TO_REACT_TO_LEAVE_MS = 5 * 1e3;
  var INTRO_STARTING_COUNT = 5;
  var ReleaseTimer = class {
    constructor() {
      __publicField(this, "introTimeElapsed");
      __publicField(this, "playTimeElapsed");
      __publicField(this, "endTimeElapsed");
      this.introTimeElapsed = 0;
      this.playTimeElapsed = 0;
      this.endTimeElapsed = 0;
    }
    start() {
    }
    step(elapsed) {
      let expectedInPlay = 0;
      switch (gameState.getCurrent()) {
        case 2 /* Intro */:
          expectedInPlay = this.stepIntro(elapsed);
          break;
        case 3 /* Playing */:
          expectedInPlay = this.stepPlaying(elapsed);
          break;
        case 4 /* Ended */:
          expectedInPlay = this.stepEnded(elapsed);
          break;
        default:
          console.log("should not get here");
      }
      return expectedInPlay;
    }
    stepIntro(elapsed) {
      this.introTimeElapsed += elapsed;
      return INTRO_STARTING_COUNT;
    }
    stepPlaying(elapsed) {
      this.playTimeElapsed += elapsed;
      let expectedInPlay = INTRO_STARTING_COUNT + Math.floor(this.playTimeElapsed / NPCS_PER_SECOND);
      if (expectedInPlay > TOTAL_NPCS) {
        expectedInPlay = TOTAL_NPCS;
      }
      return expectedInPlay;
    }
    stepEnded(elapsed) {
      return 0;
    }
  };
  var releaseTimer = new ReleaseTimer();

  // src/scripts/model/npc/crowd-stats.ts
  var CrowdStats = class {
    constructor() {
    }
    start() {
    }
    /**
     * Teleport the NPC somewhere, depending on gameState.
     */
    giveInitialDirection(npc) {
      switch (gameState.getCurrent()) {
        case 3 /* Playing */:
          this.moveNpcOffScreen(npc);
          break;
        case 2 /* Intro */:
          this.introTeleportOntoWalkway(npc);
          break;
        case 4 /* Ended */:
          this.stayOffStage(npc);
          break;
        default:
          console.log("should not get here");
      }
    }
    moveNpcOffScreen(npc) {
      let offscreen = Math.floor(Math.random() * 2);
      if (offscreen == 0) {
        npc.teleportTo(1 /* OffLeft */);
        npc.addWaypoint(3 /* BuildingLeft */);
      } else {
        npc.teleportTo(2 /* OffRight */);
        npc.addWaypoint(4 /* BuildingRight */);
      }
    }
    introTeleportOntoWalkway(npc) {
      let walkway = Math.floor(Math.random() * 3);
      switch (walkway) {
        case 0:
          this.introTeleportOntoBuildingLeft(npc);
          break;
        case 1:
          this.introTeleportOntoBuildingRight(npc);
          break;
        case 2:
          this.introTeleportOntoBuildingMiddle(npc);
          break;
        default:
          console.log("should not get here");
      }
    }
    introTeleportOntoBuildingLeft(npc) {
      npc.teleportTo(3 /* BuildingLeft */);
      let direction = Math.floor(Math.random() * 2);
      if (direction === 0) {
        npc.addWaypoint(1 /* OffLeft */);
      } else {
        npc.addWaypoint(5 /* BuildingMiddle */);
        npc.addWaypoint(2 /* OffRight */);
      }
    }
    introTeleportOntoBuildingRight(npc) {
      npc.teleportTo(4 /* BuildingRight */);
      let direction = Math.floor(Math.random() * 2);
      if (direction === 0) {
        npc.addWaypoint(5 /* BuildingMiddle */);
        npc.addWaypoint(1 /* OffLeft */);
      } else {
        npc.addWaypoint(2 /* OffRight */);
      }
    }
    introTeleportOntoBuildingMiddle(npc) {
      npc.teleportTo(4 /* BuildingRight */);
      let direction = Math.floor(Math.random() * 2);
      if (direction === 0) {
        npc.addWaypoint(1 /* OffLeft */);
      } else {
        npc.addWaypoint(2 /* OffRight */);
      }
    }
    /**
     * Tell a waiting NPC what to do, depending on gameState.
     */
    giveDirection(npc) {
      switch (gameState.getCurrent()) {
        case 2 /* Intro */:
          this.giveDirectionIntro(npc);
          break;
        case 3 /* Playing */:
          this.giveDirectionPlaying(npc);
          break;
        case 4 /* Ended */:
          this.giveDirectionEnded(npc);
          break;
        default:
          console.log("should not get here");
      }
    }
    /**
     * Have an offscreen NPC walk to the middle and them back offscreen.
     */
    giveDirectionIntro(npc) {
      let side = Math.floor(Math.random() * 2);
      if (side === 0) {
        npc.addWaypoint(5 /* BuildingMiddle */);
        npc.addWaypoint(1 /* OffLeft */);
      } else {
        npc.addWaypoint(5 /* BuildingMiddle */);
        npc.addWaypoint(2 /* OffRight */);
      }
    }
    giveDirectionPlaying(npc) {
      let action = Math.floor(Math.random() * 10);
      switch (action) {
        case 0:
        case 1:
        case 2:
        case 3:
          this.giveDirectionPlayingStand(npc);
          break;
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
          this.giveDirectionPlayingMove(npc);
          break;
        default:
          console.log("should not get here");
      }
    }
    giveDirectionPlayingStand(npc) {
      let side = Math.floor(Math.random() * 2);
      if (side === 0) {
        npc.standFacing(1 /* BuildingRight */, 15e3);
      } else {
        npc.standFacing(0 /* BuildingLeft */, 15e3);
      }
    }
    giveDirectionPlayingMove(npc) {
      let where = Math.floor(Math.random() * 26);
      switch (where) {
        case 0:
          npc.addWaypoint(1 /* OffLeft */);
          break;
        case 1:
          npc.addWaypoint(2 /* OffRight */);
          break;
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          npc.addWaypoint(3 /* BuildingLeft */);
          break;
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
          npc.addWaypoint(4 /* BuildingRight */);
          break;
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
          npc.addWaypoint(5 /* BuildingMiddle */);
          break;
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
          npc.addWaypoint(6 /* Middle */);
          break;
        default:
          console.log("should not get here");
      }
    }
    /**
     * Just don't go anywhere
     */
    stayOffStage(npc) {
      npc.teleportTo(1 /* OffLeft */);
    }
    giveDirectionEnded(npc) {
      if (npc.ended === false) {
        npc.ended = true;
        let offscreen = Math.floor(Math.random() * 2);
        if (offscreen == 0) {
          npc.addWaypoint(1 /* OffLeft */);
        } else {
          npc.addWaypoint(2 /* OffRight */);
        }
      } else {
        npc.standFacing(0 /* BuildingLeft */, 2e4);
      }
    }
  };
  var crowdStats = new CrowdStats();

  // src/scripts/model/npc/npc-manager.ts
  var NpcManager = class {
    constructor() {
      __publicField(this, "npcs");
      __publicField(this, "npcsOffscreen");
      __publicField(this, "npcsInPlay");
      this.npcs = /* @__PURE__ */ new Map();
      this.npcsOffscreen = [];
      this.npcsInPlay = [];
    }
    start() {
      eventBus.register(16 /* StandeeMovementEndedEventType */, (event) => {
        this.handleStandeeMovementEndedEvent(event);
      });
      for (let npcIdx = 0; npcIdx < TOTAL_NPCS; npcIdx++) {
        let npc = new Npc(() => {
          crowdStats.giveDirection(npc);
        });
        npc.start();
        this.npcs.set(npc.id, npc);
        this.npcsOffscreen.push(npc);
      }
      releaseTimer.start();
      crowdStats.start();
    }
    step(elapsed) {
      let expectedInPlay = releaseTimer.step(elapsed);
      if (gameState.getCurrent() === 2 /* Intro */ || gameState.getCurrent() === 3 /* Playing */) {
        this.ensureInPlayNpcCount(expectedInPlay);
      }
      this.npcsInPlay.forEach((npc) => {
        npc.step(elapsed);
      });
    }
    ensureInPlayNpcCount(expectedInPlay) {
      if (this.npcsInPlay.length < expectedInPlay) {
        let diff = expectedInPlay - this.npcsInPlay.length;
        for (let count = 0; count < diff; count++) {
          this.sendAnOffscreenNpcIntoPlay();
        }
      }
    }
    sendAnOffscreenNpcIntoPlay() {
      let npc = this.npcsOffscreen.pop();
      if (npc != null) {
        this.npcsInPlay.push(npc);
        crowdStats.giveInitialDirection(npc);
      }
    }
    handleStandeeMovementEndedEvent(event) {
      let npc = this.npcs.get(event.npcId);
      if (npc != null) {
        let x = event.x;
        let y = event.z;
        npc.updatePosition(x, y);
      }
    }
  };
  var npcManager = new NpcManager();

  // src/scripts/domain/cell.ts
  var Cell = class {
    constructor() {
      __publicField(this, "color");
      this.color = 0 /* Empty */;
    }
    setColor(color) {
      this.color = color;
    }
    getColor() {
      return this.color;
    }
  };
  var CellOffset = class {
    constructor(x, y) {
      __publicField(this, "x");
      __publicField(this, "y");
      this.x = x;
      this.y = y;
    }
  };

  // src/scripts/model/board/shape.ts
  var SPAWN_COL = 3;
  var Shape = class {
    constructor() {
      __publicField(this, "currentMatrixIndex");
      __publicField(this, "row");
      __publicField(this, "col");
      this.currentMatrixIndex = 0;
      this.row = 0;
      this.col = SPAWN_COL;
      this.startingEligible = false;
    }
    moveLeft() {
      this.col--;
    }
    moveRight() {
      this.col++;
    }
    moveUp() {
      this.row--;
    }
    moveDown() {
      this.row++;
    }
    /**
     * Used by the AI.
     */
    moveToTop() {
      this.row = 0;
    }
    rotateCounterClockwise() {
      this.currentMatrixIndex -= 1;
      this.ensureArrayBounds();
    }
    rotateClockwise() {
      this.currentMatrixIndex += 1;
      this.ensureArrayBounds();
    }
    getRow() {
      return this.row;
    }
    setRow(row) {
      this.row = row;
    }
    getCol() {
      return this.col;
    }
    setCol(col) {
      this.col = col;
    }
    getRowCount() {
      return Math.ceil(this.getCurrentMatrix().length / this.valuesPerRow);
    }
    getOffsets() {
      let matrix = this.getCurrentMatrix();
      let offsets = [];
      for (let idx = 0; idx < matrix.length; idx++) {
        let value = matrix[idx];
        if (value === 1) {
          let x = idx % this.valuesPerRow;
          let y = Math.floor(idx / this.valuesPerRow);
          let offset = new CellOffset(x, y);
          offsets.push(offset);
        }
      }
      return offsets;
    }
    /**
     * Hacky method used by the AI.
     * "Simple" as in doesn't matter what the current row/col/matrix is.
     */
    cloneSimple() {
      return this.getInstance();
    }
    getCurrentMatrix() {
      return this.matrices[this.currentMatrixIndex];
    }
    ensureArrayBounds() {
      if (this.currentMatrixIndex < 0) {
        this.currentMatrixIndex = this.matrices.length - 1;
      } else if (this.currentMatrixIndex >= this.matrices.length) {
        this.currentMatrixIndex = 0;
      }
    }
  };

  // src/scripts/model/board/shape-factory.ts
  var ShapeI = class _ShapeI extends Shape {
    constructor() {
      super(...arguments);
      __publicField(this, "color", 1 /* Cyan */);
      __publicField(this, "valuesPerRow", 4);
      __publicField(this, "startingEligible", true);
      __publicField(this, "matrices", [
        [
          0,
          0,
          0,
          0,
          1,
          1,
          1,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0
        ],
        [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          1,
          1,
          1,
          0,
          0,
          0,
          0
        ],
        [
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          1,
          0,
          0
        ]
      ]);
    }
    getInstance() {
      return new _ShapeI();
    }
  };
  var ShapeJ = class _ShapeJ extends Shape {
    constructor() {
      super(...arguments);
      __publicField(this, "color", 6 /* Blue */);
      __publicField(this, "valuesPerRow", 3);
      __publicField(this, "startingEligible", true);
      __publicField(this, "matrices", [
        [
          1,
          0,
          0,
          1,
          1,
          1,
          0,
          0,
          0
        ],
        [
          0,
          1,
          1,
          0,
          1,
          0,
          0,
          1,
          0
        ],
        [
          0,
          0,
          0,
          1,
          1,
          1,
          0,
          0,
          1
        ],
        [
          0,
          1,
          0,
          0,
          1,
          0,
          1,
          1,
          0
        ]
      ]);
    }
    getInstance() {
      return new _ShapeJ();
    }
  };
  var ShapeL = class _ShapeL extends Shape {
    constructor() {
      super(...arguments);
      __publicField(this, "color", 7 /* Orange */);
      __publicField(this, "valuesPerRow", 3);
      __publicField(this, "startingEligible", true);
      __publicField(this, "matrices", [
        [
          0,
          0,
          1,
          1,
          1,
          1,
          0,
          0,
          0
        ],
        [
          0,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          1
        ],
        [
          0,
          0,
          0,
          1,
          1,
          1,
          1,
          0,
          0
        ],
        [
          1,
          1,
          0,
          0,
          1,
          0,
          0,
          1,
          0
        ]
      ]);
    }
    getInstance() {
      return new _ShapeL();
    }
  };
  var ShapeO = class _ShapeO extends Shape {
    constructor() {
      super(...arguments);
      __publicField(this, "color", 2 /* Yellow */);
      __publicField(this, "valuesPerRow", 4);
      __publicField(this, "startingEligible", false);
      __publicField(this, "matrices", [
        [
          0,
          1,
          1,
          0,
          0,
          1,
          1,
          0,
          0,
          0,
          0,
          0
        ]
      ]);
    }
    getInstance() {
      return new _ShapeO();
    }
  };
  var ShapeS = class _ShapeS extends Shape {
    constructor() {
      super(...arguments);
      __publicField(this, "color", 4 /* Green */);
      __publicField(this, "valuesPerRow", 3);
      __publicField(this, "startingEligible", false);
      __publicField(this, "matrices", [
        [
          0,
          1,
          1,
          1,
          1,
          0,
          0,
          0,
          0
        ],
        [
          0,
          1,
          0,
          0,
          1,
          1,
          0,
          0,
          1
        ],
        [
          0,
          0,
          0,
          0,
          1,
          1,
          1,
          1,
          0
        ],
        [
          1,
          0,
          0,
          1,
          1,
          0,
          0,
          1,
          0
        ]
      ]);
    }
    getInstance() {
      return new _ShapeS();
    }
  };
  var ShapeT = class _ShapeT extends Shape {
    constructor() {
      super(...arguments);
      __publicField(this, "color", 3 /* Purple */);
      __publicField(this, "valuesPerRow", 3);
      __publicField(this, "startingEligible", true);
      __publicField(this, "matrices", [
        [
          0,
          1,
          0,
          1,
          1,
          1,
          0,
          0,
          0
        ],
        [
          0,
          1,
          0,
          0,
          1,
          1,
          0,
          1,
          0
        ],
        [
          0,
          0,
          0,
          1,
          1,
          1,
          0,
          1,
          0
        ],
        [
          0,
          1,
          0,
          1,
          1,
          0,
          0,
          1,
          0
        ]
      ]);
    }
    getInstance() {
      return new _ShapeT();
    }
  };
  var ShapeZ = class _ShapeZ extends Shape {
    constructor() {
      super(...arguments);
      __publicField(this, "color", 5 /* Red */);
      __publicField(this, "valuesPerRow", 3);
      __publicField(this, "startingEligible", false);
      __publicField(this, "matrices", [
        [
          1,
          1,
          0,
          0,
          1,
          1,
          0,
          0,
          0
        ],
        [
          0,
          0,
          1,
          0,
          1,
          1,
          0,
          1,
          0
        ],
        [
          0,
          0,
          0,
          1,
          1,
          0,
          0,
          1,
          1
        ],
        [
          0,
          1,
          0,
          1,
          1,
          0,
          1,
          0,
          0
        ]
      ]);
    }
    getInstance() {
      return new _ShapeZ();
    }
  };
  var ShapeFactory = class {
    constructor() {
      __publicField(this, "bag");
      this.refillBag(true);
    }
    nextShape(forceBagRefill) {
      if (this.bag.length <= 0 || forceBagRefill === true) {
        this.refillBag(forceBagRefill);
      }
      return this.bag.pop();
    }
    refillBag(startingPieceAsFirst) {
      this.bag = [
        new ShapeI(),
        new ShapeJ(),
        new ShapeL(),
        new ShapeT(),
        new ShapeO(),
        new ShapeS(),
        new ShapeZ()
      ];
      {
        let idx = this.bag.length;
        while (0 !== idx) {
          let rndIdx = Math.floor(Math.random() * idx);
          idx -= 1;
          let tempVal = this.bag[idx];
          this.bag[idx] = this.bag[rndIdx];
          this.bag[rndIdx] = tempVal;
        }
      }
      if (startingPieceAsFirst === true) {
        let lastIdx = this.bag.length - 1;
        if (this.bag[lastIdx].startingEligible === true) {
        } else {
          for (let idx = 0; idx < lastIdx; idx++) {
            if (this.bag[idx].startingEligible === true) {
              let tempVal = this.bag[lastIdx];
              this.bag[lastIdx] = this.bag[idx];
              this.bag[idx] = tempVal;
              break;
            }
          }
        }
      }
    }
  };
  var deadShapeFactory = new ShapeFactory();

  // src/scripts/event/cell-change-event.ts
  var CellChangeEvent = class extends AbstractEvent {
    constructor(cell, row, col, playerType) {
      super();
      __publicField(this, "cell");
      __publicField(this, "row");
      __publicField(this, "col");
      __publicField(this, "playerType");
      this.cell = cell;
      this.row = row;
      this.col = col;
      this.playerType = playerType;
    }
    getType() {
      return 3 /* CellChangeEventType */;
    }
  };

  // src/scripts/event/rows-filled-event.ts
  var RowsFilledEvent = class extends AbstractEvent {
    constructor(filledRowIdxs, playerType) {
      super();
      __publicField(this, "filledRowIdxs");
      __publicField(this, "playerType");
      this.filledRowIdxs = filledRowIdxs.slice(0);
      this.playerType = playerType;
    }
    getType() {
      return 15 /* RowsFilledEventType */;
    }
  };

  // src/scripts/event/active-shape-changed-event.ts
  var ActiveShapeChangedEvent = class extends AbstractEvent {
    constructor(shape, playerType, starting) {
      super();
      __publicField(this, "shape");
      __publicField(this, "playerType");
      __publicField(this, "starting");
      this.shape = shape;
      this.playerType = playerType;
      this.starting = starting;
    }
    getType() {
      return 0 /* ActiveShapeChangedEventType */;
    }
  };

  // src/scripts/event/active-shape-ended-event.ts
  var ActiveShapeEndedEvent = class extends AbstractEvent {
    constructor(playerType, rowIdx) {
      super();
      __publicField(this, "playerType");
      __publicField(this, "rowIdx");
      this.playerType = playerType;
      this.rowIdx = rowIdx;
    }
    getType() {
      return 1 /* ActiveShapeEndedEventType */;
    }
  };

  // src/scripts/event/board-filled-event.ts
  var BoardFilledEvent = class extends AbstractEvent {
    constructor(playerType) {
      super();
      __publicField(this, "playerType");
      this.playerType = playerType;
    }
    getType() {
      return 2 /* BoardFilledEventType */;
    }
  };

  // src/scripts/model/board/win.ts
  var cells = [
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    // Top two are obscured
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", "x", " ", " ", " ", "x", " ", " ", " ", " "],
    [" ", "x", " ", " ", " ", "x", " ", " ", " ", " "],
    [" ", "x", " ", "x", " ", "x", " ", " ", " ", " "],
    [" ", " ", "x", " ", "x", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", "x", "x", "x", " ", " ", " ", " "],
    [" ", " ", " ", " ", "x", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", "x", " ", " ", " ", " ", " "],
    [" ", " ", " ", "x", "x", "x", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", "x", " ", " ", "x", " "],
    [" ", " ", " ", " ", " ", "x", "x", " ", "x", " "],
    [" ", " ", " ", " ", " ", "x", " ", "x", "x", " "],
    [" ", " ", " ", " ", " ", "x", " ", " ", "x", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
  ];
  var Win = class {
    hasCell(rowIdx, colIdx) {
      if (rowIdx < cells.length) {
        let row = cells[rowIdx];
        if (colIdx < row.length) {
          if (cells[rowIdx][colIdx] === "x") {
            return true;
          }
        }
      }
      return false;
    }
  };
  var win = new Win();

  // src/scripts/model/board/board.ts
  var MAX_ROWS = 19;
  var MAX_COLS = PANEL_COUNT_PER_FLOOR;
  var TEMP_DELAY_MS = 500;
  var Board = class _Board {
    constructor(playerType, shapeFactory, eventBus2) {
      __publicField(this, "playerType");
      __publicField(this, "shapeFactory");
      __publicField(this, "eventBus");
      __publicField(this, "boardState");
      __publicField(this, "msTillGravityTick");
      __publicField(this, "currentShape");
      __publicField(this, "matrix");
      __publicField(this, "junkRowHoleColumn");
      __publicField(this, "junkRowHoleDirection");
      __publicField(this, "junkRowColor1");
      __publicField(this, "junkRowColor2");
      __publicField(this, "junkRowColorIdx");
      __publicField(this, "endedStepElapsed");
      __publicField(this, "endedOffset");
      this.playerType = playerType;
      this.shapeFactory = shapeFactory;
      this.eventBus = eventBus2;
      this.boardState = 0 /* Paused */;
      this.msTillGravityTick = TEMP_DELAY_MS;
      this.currentShape = null;
      this.matrix = [];
      for (let rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
        this.matrix[rowIdx] = [];
        for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
          this.matrix[rowIdx][colIdx] = new Cell();
        }
      }
      if (playerType === 0 /* Human */) {
        this.junkRowHoleColumn = 0;
      } else {
        this.junkRowHoleColumn = MAX_COLS - 1;
      }
      this.junkRowHoleDirection = 1;
      this.junkRowColor1 = 8 /* White */;
      this.junkRowColor2 = 8 /* White */;
      this.junkRowColorIdx = 0;
      this.endedStepElapsed = 0;
      this.endedOffset = MAX_ROWS - 1;
    }
    resetAndPlay(play = true) {
      this.clear();
      if (play) {
        this.boardState = 1 /* InPlay */;
        this.startShape(true);
      }
    }
    /**
     * This gives a high level view of the main game loop.
     * This shouldn't be called by the AI.
     */
    step(elapsed) {
      if (this.boardState === 0 /* Paused */) {
        this.msTillGravityTick = 0;
      } else if (this.boardState === 1 /* InPlay */) {
        this.msTillGravityTick -= elapsed;
        if (this.msTillGravityTick <= 0) {
          this.msTillGravityTick = TEMP_DELAY_MS;
          if (this.tryGravity()) {
            this.moveShapeDown();
          } else {
            this.handleEndOfCurrentPieceTasks();
          }
        }
      } else if (this.boardState === 2 /* Win */) {
        this.handleEnded(elapsed);
      } else if (this.boardState === 3 /* Lose */) {
      }
    }
    /**
     * Call this once a shape is known to be in its final resting position.
     */
    handleEndOfCurrentPieceTasks() {
      this.eventBus.fire(new ActiveShapeEndedEvent(this.playerType, this.currentShape.getRow()));
      this.convertShapeToCells();
      if (this.handleFullBoard()) {
      } else {
        if (this.handleAnyFilledLinesPart1()) {
        } else {
          this.startShape(false);
        }
      }
    }
    /**
     * Used by the AI.
     */
    getCurrentShapeColIdx() {
      return this.currentShape.getCol();
    }
    moveShapeLeft() {
      let success;
      if (this.boardState === 1 /* InPlay */) {
        this.currentShape.moveLeft();
        if (this.collisionDetected()) {
          this.currentShape.moveRight();
          success = false;
        } else {
          this.fireActiveShapeChangedEvent();
          success = true;
        }
      } else {
        success = false;
      }
      return success;
    }
    moveShapeRight() {
      let success;
      if (this.boardState === 1 /* InPlay */) {
        this.currentShape.moveRight();
        if (this.collisionDetected()) {
          this.currentShape.moveLeft();
          success = false;
        } else {
          this.fireActiveShapeChangedEvent();
          success = true;
        }
      } else {
        success = false;
      }
      return success;
    }
    moveShapeDown() {
      let success;
      if (this.boardState === 1 /* InPlay */) {
        this.currentShape.moveDown();
        if (this.collisionDetected()) {
          this.currentShape.moveUp();
          success = false;
        } else {
          this.fireActiveShapeChangedEvent();
          success = true;
        }
      } else {
        success = false;
      }
      return success;
    }
    moveShapeDownAllTheWay() {
      let success;
      if (this.boardState === 1 /* InPlay */) {
        do {
          this.currentShape.moveDown();
        } while (!this.collisionDetected());
        this.currentShape.moveUp();
        this.fireActiveShapeChangedEvent();
        success = true;
      } else {
        success = false;
      }
      return success;
    }
    /**
     * Used by the AI.
     */
    moveToTop() {
      this.currentShape.moveToTop();
    }
    rotateShapeClockwise() {
      let success;
      if (this.boardState === 1 /* InPlay */) {
        this.currentShape.rotateClockwise();
        if (this.jiggleRotatedShapeAround() === false) {
          this.currentShape.rotateCounterClockwise();
          success = false;
        } else {
          this.fireActiveShapeChangedEvent();
          success = true;
        }
      } else {
        success = false;
      }
      return success;
    }
    generateRandomWhiteCells() {
      for (let count = 0; count < 10; count++) {
        let rowIdx = Math.floor(Math.random() * MAX_ROWS);
        let colIdx = Math.floor(Math.random() * MAX_COLS);
        this.changeCellColor(rowIdx, colIdx, 8 /* White */);
      }
    }
    /**
     * Return true if a cell was found and cleared.
     * Return false if none was found.
     */
    clearOneWhiteCell() {
      for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
        let row = this.matrix[rowIdx];
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          if (row[colIdx].getColor() === 8 /* White */) {
            this.changeCellColor(rowIdx, colIdx, 0 /* Empty */);
            return true;
          }
        }
      }
      return false;
    }
    displayWin() {
      this.boardState = 2 /* Win */;
    }
    displayLose() {
      this.boardState = 3 /* Lose */;
    }
    handleEnded(elapsed) {
      this.endedStepElapsed += elapsed;
      if (this.endedStepElapsed > 250 && this.endedOffset > 0) {
        this.endedStepElapsed = 0;
        this.endedOffset -= 1;
        this.clear();
        for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
          let relativeRowIdx = rowIdx + this.endedOffset;
          if (relativeRowIdx > MAX_ROWS - 1) {
            continue;
          }
          let row = this.matrix[rowIdx];
          for (let colIdx = 0; colIdx < row.length; colIdx++) {
            if (win.hasCell(rowIdx, colIdx)) {
              this.changeCellColor(relativeRowIdx, colIdx, 8 /* White */);
            }
          }
        }
      }
    }
    /**
     * Returns true if able to successfully rotate the shape alongside anything, if any.
     */
    jiggleRotatedShapeAround() {
      let success = false;
      let originalRow = this.currentShape.getRow();
      let originalCol = this.currentShape.getCol();
      if (this.collisionDetected() === false) {
        success = true;
      } else {
        if (success !== true) {
          success = this.doUpToThreeTimes(originalRow, originalCol, () => {
            this.currentShape.moveLeft();
          });
        }
        if (success !== true) {
          success = this.doUpToThreeTimes(originalRow, originalCol, () => {
            this.currentShape.moveRight();
          });
        }
        ;
        if (success !== true) {
          success = this.doUpToThreeTimes(originalRow, originalCol, () => {
            this.currentShape.moveUp();
          });
        }
      }
      return success;
    }
    /**
     * Used by jiggleRotatedShapeAround().
     * 
     * Sets the current shape to the given original coordinates.
     * Then, runs the given lambda a few times to see if any produce a non-collision state.
     */
    doUpToThreeTimes(originalRow, originalCol, thing) {
      this.currentShape.setRow(originalRow);
      this.currentShape.setCol(originalCol);
      let success = false;
      for (let count = 0; count < 3; count++) {
        thing();
        if (this.collisionDetected() === false) {
          success = true;
          break;
        }
      }
      return success;
    }
    addJunkRows(numberOfRowsToAdd) {
      this.matrix.splice(0, numberOfRowsToAdd);
      for (let idx = 0; idx < numberOfRowsToAdd; idx++) {
        let color = this.getNextJunkRowColor();
        let row = [];
        for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
          let cell2 = new Cell();
          cell2.setColor(color);
          row.push(cell2);
        }
        let cell = row[this.junkRowHoleColumn];
        cell.setColor(0 /* Empty */);
        this.junkRowHoleColumn += this.junkRowHoleDirection;
        if (this.junkRowHoleColumn < 0) {
          this.junkRowHoleColumn = 1;
          this.junkRowHoleDirection *= -1;
        } else if (this.junkRowHoleColumn >= MAX_COLS) {
          this.junkRowHoleColumn = MAX_COLS - 2;
          this.junkRowHoleDirection *= -1;
        }
        this.matrix.push(row);
      }
      for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
        let row = this.matrix[rowIdx];
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          let cell = this.matrix[rowIdx][colIdx];
          this.eventBus.fire(new CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
        }
      }
      for (let count = 0; count < 4; count++) {
        if (this.currentShape.getRow() > 0 && this.collisionDetected() === true) {
          this.currentShape.moveUp();
          this.fireActiveShapeChangedEvent();
        }
      }
    }
    /**
     * Very hacky method just so the AI has a temp copy of the board to experiment with.
     */
    cloneZombie() {
      let copy = new _Board(this.playerType, deadShapeFactory, deadEventBus);
      copy.boardState = 1 /* InPlay */;
      copy.currentShape = this.currentShape.cloneSimple();
      for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
        let row = this.matrix[rowIdx];
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          copy.matrix[rowIdx][colIdx].setColor(row[colIdx].getColor());
        }
      }
      return copy;
    }
    /**
     * Used by the AI.
     */
    calculateAggregateHeight() {
      let colHeights = this.calculateColumnHeights();
      return colHeights.reduce((a, b) => {
        return a + b;
      });
    }
    /**
     * Used by the FallingSequencer.
     */
    calculateHighestColumn() {
      let colHeights = this.calculateColumnHeights();
      return colHeights.reduce((a, b) => {
        return a > b ? a : b;
      });
    }
    /**
     * Used by the AI.
     */
    calculateCompleteLines() {
      let completeLines = 0;
      for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
        let row = this.matrix[rowIdx];
        let count = 0;
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          if (row[colIdx].getColor() !== 0 /* Empty */) {
            count++;
          }
        }
        if (count >= row.length) {
          completeLines++;
        }
      }
      return completeLines;
    }
    /**
     * Used by the AI.
     * Determines holes by scanning each column, highest floor to lowest floor, and
     * seeing how many times it switches from colored to empty (but not the other way around).
     */
    calculateHoles() {
      let totalHoles = 0;
      for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
        let holes = 0;
        let previousCellWasEmpty = true;
        for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
          let cell = this.matrix[rowIdx][colIdx];
          if (previousCellWasEmpty === false) {
            if (cell.getColor() === 0 /* Empty */) {
              holes++;
              previousCellWasEmpty = true;
            } else {
              previousCellWasEmpty = false;
            }
          } else {
            if (cell.getColor() === 0 /* Empty */) {
              previousCellWasEmpty = true;
            } else {
              previousCellWasEmpty = false;
            }
          }
        }
        totalHoles += holes;
      }
      return totalHoles;
    }
    /**
     * Used by the AI.
     */
    calculateBumpiness() {
      let bumpiness = 0;
      let colHeights = this.calculateColumnHeights();
      for (let idx = 0; idx < colHeights.length - 1; idx++) {
        let val1 = colHeights[idx];
        let val2 = colHeights[idx + 1];
        bumpiness += Math.abs(val1 - val2);
      }
      return bumpiness;
    }
    calculateColumnHeights() {
      let colHeights = [];
      for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
        colHeights.push(0);
      }
      for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
        let highest = 0;
        for (let rowIdx = MAX_ROWS - 1; rowIdx >= 0; rowIdx--) {
          let cell = this.matrix[rowIdx][colIdx];
          if (cell.getColor() !== 0 /* Empty */) {
            highest = MAX_ROWS - rowIdx;
          }
        }
        colHeights[colIdx] = highest;
      }
      return colHeights;
    }
    /**
     * The only reason this is not private is so the AI can experiment with it.
     * Work here should able to be be undone by undoConvertShapeToCells.
     */
    convertShapeToCells() {
      for (let offset of this.currentShape.getOffsets()) {
        let rowIdx = offset.y + this.currentShape.getRow();
        let colIdx = offset.x + this.currentShape.getCol();
        if (rowIdx < 0 || rowIdx >= this.matrix.length) {
          continue;
        }
        if (colIdx < 0 || colIdx >= this.matrix[rowIdx].length) {
          continue;
        }
        this.changeCellColor(rowIdx, colIdx, this.currentShape.color);
      }
    }
    /**
     * Used by the AI. Should undo convertShapeToCells().
     */
    undoConvertShapeToCells() {
      for (let offset of this.currentShape.getOffsets()) {
        let rowIdx = offset.y + this.currentShape.getRow();
        let colIdx = offset.x + this.currentShape.getCol();
        if (rowIdx < 0 || rowIdx >= this.matrix.length) {
          continue;
        }
        if (colIdx < 0 || colIdx >= this.matrix[rowIdx].length) {
          continue;
        }
        this.changeCellColor(rowIdx, colIdx, 0 /* Empty */);
      }
    }
    clear() {
      for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
        let row = this.matrix[rowIdx];
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          this.changeCellColor(rowIdx, colIdx, 0 /* Empty */);
        }
      }
      [this.junkRowColor1, this.junkRowColor2] = this.getRandomColors();
    }
    /**
     * Helper method to change a single cell color's and notify subscribers at the same time.
     */
    changeCellColor(rowIdx, colIdx, color) {
      let cell = this.matrix[rowIdx][colIdx];
      cell.setColor(color);
      this.eventBus.fire(new CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
    }
    startShape(forceBagRefill) {
      this.currentShape = this.shapeFactory.nextShape(forceBagRefill);
      this.fireActiveShapeChangedEvent(true);
    }
    tryGravity() {
      let canMoveDown = true;
      this.currentShape.moveDown();
      if (this.collisionDetected()) {
        canMoveDown = false;
      }
      this.currentShape.moveUp();
      return canMoveDown;
    }
    /**
     * Intended for checking of the current position of the current
     * shape has any overlap with existing cells that have color.
     */
    collisionDetected() {
      let collision = false;
      for (let offset of this.currentShape.getOffsets()) {
        let row = offset.y + this.currentShape.getRow();
        let col = offset.x + this.currentShape.getCol();
        if (row < 0 || row >= this.matrix.length) {
          collision = true;
          break;
        }
        if (col < 0 || col >= this.matrix[row].length) {
          collision = true;
          break;
        }
        if (this.matrix[row][col].getColor() !== 0 /* Empty */) {
          collision = true;
          break;
        }
      }
      return collision;
    }
    handleFullBoard() {
      let full = this.isBoardFull();
      if (full) {
        this.boardState = 0 /* Paused */;
        this.eventBus.fire(new BoardFilledEvent(this.playerType));
        full = true;
      }
      return full;
    }
    /**
     * It is considered full if the two obscured rows at the top have colored cells in them.
     */
    isBoardFull() {
      for (let rowIdx = 0; rowIdx < 2; rowIdx++) {
        for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
          let cell = this.matrix[rowIdx][colIdx];
          if (cell.getColor() !== 0 /* Empty */) {
            return true;
          }
        }
      }
      return false;
    }
    /**
     * Handle filled lines method 1 of 2, before animation.
     */
    handleAnyFilledLinesPart1() {
      let filledRowIdxs = this.determineFilledRowIdxs();
      if (filledRowIdxs.length > 0) {
        this.eventBus.fire(new RowsFilledEvent(filledRowIdxs, this.playerType));
        this.boardState = 0 /* Paused */;
      } else {
      }
      return filledRowIdxs.length > 0;
    }
    /**
     * Handle filled lines method 2 of 2, after animation.
     * This is public so that the Model can call it.
     */
    handleAnyFilledLinesPart2() {
      let filledRowIdxs = this.determineFilledRowIdxs();
      for (let filledRowIdx of filledRowIdxs) {
        this.removeAndCollapse(filledRowIdx);
      }
      this.notifyAllCells();
      this.boardState = 1 /* InPlay */;
      this.startShape(false);
    }
    /**
     * Removes only the bottom row.
     */
    removeBottomLine() {
      this.removeAndCollapse(MAX_ROWS - 1);
      this.notifyAllCells();
    }
    notifyAllCells() {
      for (let rowIdx = 0; rowIdx < MAX_ROWS; rowIdx++) {
        let row = this.matrix[rowIdx];
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          let cell = this.matrix[rowIdx][colIdx];
          this.eventBus.fire(new CellChangeEvent(cell, rowIdx, colIdx, this.playerType));
        }
      }
    }
    /**
     * Returns a list of numbers, ascending, that correspond to filled rows.
     */
    determineFilledRowIdxs() {
      let filledRowIdxs = [];
      for (let rowIdx = 0; rowIdx < this.matrix.length; rowIdx++) {
        let row = this.matrix[rowIdx];
        let filled = true;
        for (let cell of row) {
          if (cell.getColor() === 0 /* Empty */) {
            filled = false;
            break;
          }
        }
        if (filled) {
          filledRowIdxs.push(rowIdx);
        }
      }
      return filledRowIdxs;
    }
    /**
     * This removes the old row and puts a new row in its place at position 0, which is the highest visually to the player.
     * Delegates cell notification to the calling method.
     */
    removeAndCollapse(rowIdx) {
      this.matrix.splice(rowIdx, 1);
      this.matrix.splice(0, 0, []);
      for (let colIdx = 0; colIdx < MAX_COLS; colIdx++) {
        this.matrix[0][colIdx] = new Cell();
      }
    }
    fireActiveShapeChangedEvent(starting = false) {
      this.eventBus.fire(new ActiveShapeChangedEvent(this.currentShape, this.playerType, starting));
    }
    getNextJunkRowColor() {
      let color;
      if (this.junkRowColorIdx <= 0) {
        color = this.junkRowColor1;
        this.junkRowColorIdx = 1;
      } else if (this.junkRowColorIdx >= 1) {
        color = this.junkRowColor2;
        this.junkRowColorIdx = 0;
      }
      return color;
    }
    getRandomColors() {
      let rand1 = Math.floor(Math.random() * 7);
      let rand2 = Math.floor(Math.random() * 7);
      if (rand1 === rand2) {
        rand2++;
        if (rand2 > 6) {
          rand2 = 0;
        }
      }
      return [this.colorByNumber(rand1), this.colorByNumber(rand2)];
    }
    colorByNumber(value) {
      let color;
      switch (value) {
        case 0:
          color = 1 /* Cyan */;
          break;
        case 1:
          color = 2 /* Yellow */;
          break;
        case 2:
          color = 3 /* Purple */;
          break;
        case 3:
          color = 4 /* Green */;
          break;
        case 4:
          color = 5 /* Red */;
          break;
        case 5:
          color = 6 /* Blue */;
          break;
        case 6:
          color = 7 /* Orange */;
          break;
        default:
          color = 8 /* White */;
      }
      return color;
    }
  };

  // src/scripts/model/vitals.ts
  var MAX_HP = PANEL_COUNT_PER_FLOOR;
  var Vitals = class {
    constructor() {
      __publicField(this, "humanHitPoints");
      __publicField(this, "aiHitPoints");
      this.humanHitPoints = MAX_HP;
      this.aiHitPoints = MAX_HP;
    }
  };
  var vitals = new Vitals();

  // src/scripts/model/ai/ai.ts
  var MAX_COLS2 = PANEL_COUNT_PER_FLOOR;
  var TIME_DELAY = 500;
  var TIME_BETWEEN_MOVES = 200;
  var TIME_FASTEST_TILL_DROP = 2850;
  var TIME_SLOWEST_TILL_DROP = 4850;
  var RANGE_TIME_TILL_DROP = TIME_SLOWEST_TILL_DROP - TIME_FASTEST_TILL_DROP;
  var TIME_MAX_ADDITIONAL_TIME_BETWEEN_MOVES = 100;
  var Ai = class {
    constructor(realBoard) {
      __publicField(this, "realBoard");
      __publicField(this, "timeUntilNextMove");
      __publicField(this, "delayTtl");
      // How long the current shape should last, if possible, till AI hits the space bar.
      __publicField(this, "timeTillDrop");
      // 0 = no rotation, 1 = one rotation, 2 = two rotations, 3 = three rotations.
      __publicField(this, "targetRotation");
      __publicField(this, "currentRotation");
      __publicField(this, "targetColIdx");
      // Prevent AI from doing anything while the piece is waiting to "lock" into the matrix.
      __publicField(this, "moveCompleted");
      this.realBoard = realBoard;
      this.timeUntilNextMove = this.calculateTimeUntilNextMove();
      this.delayTtl = 0;
      this.timeTillDrop = TIME_SLOWEST_TILL_DROP;
      this.targetRotation = 0;
      this.currentRotation = 0;
      this.targetColIdx = 0;
      this.moveCompleted = false;
    }
    start() {
      eventBus.register(0 /* ActiveShapeChangedEventType */, (event) => {
        this.handleActiveShapeChangedEvent(event);
      });
    }
    step(elapsed) {
      this.timeTillDrop -= elapsed;
      if (this.delayTtl > 0) {
        this.delayTtl -= elapsed;
      } else {
        this.timeUntilNextMove -= elapsed;
        if (this.timeUntilNextMove <= 0) {
          this.timeUntilNextMove = this.calculateTimeUntilNextMove();
          this.advanceTowardsTarget();
        }
      }
    }
    /**
     * This method provides a high-level view of the AI's thought process.
     */
    strategize() {
      {
        let diff = vitals.humanHitPoints - vitals.aiHitPoints;
        let pct = (MAX_HP - diff) / (MAX_HP * 2);
        this.timeTillDrop = TIME_FASTEST_TILL_DROP + pct * RANGE_TIME_TILL_DROP;
      }
      {
        let zombie = this.realBoard.cloneZombie();
        let bestFitness = Number.MIN_SAFE_INTEGER;
        let bestRotation = 0;
        let bestColIdx = 0;
        for (let rotation = 0; rotation < 4; rotation++) {
          while (zombie.moveShapeLeft()) ;
          for (let idx = 0; idx < MAX_COLS2; idx++) {
            zombie.moveShapeDownAllTheWay();
            zombie.convertShapeToCells();
            let fitness = this.calculateFitness(zombie);
            if (fitness > bestFitness) {
              bestFitness = fitness;
              bestRotation = rotation;
              bestColIdx = zombie.getCurrentShapeColIdx();
            }
            zombie.undoConvertShapeToCells();
            zombie.moveToTop();
            let canMoveRight = zombie.moveShapeRight();
            if (canMoveRight === false) {
              break;
            }
          }
          zombie.rotateShapeClockwise();
        }
        this.targetRotation = bestRotation;
        this.currentRotation = 0;
        this.targetColIdx = bestColIdx;
        this.moveCompleted = false;
      }
    }
    handleActiveShapeChangedEvent(event) {
      if (event.playerType === 1 /* Ai */) {
        if (event.starting === true) {
          this.delayTtl = TIME_DELAY;
        }
      } else {
      }
    }
    /**
     * Based on https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/
     */
    calculateFitness(zombie) {
      let aggregateHeight = zombie.calculateAggregateHeight();
      let completeLines = zombie.calculateCompleteLines();
      let holes = zombie.calculateHoles();
      let bumpiness = zombie.calculateBumpiness();
      let fitness = -0.510066 * aggregateHeight + 0.760666 * completeLines + -0.35663 * holes + -0.184483 * bumpiness;
      return fitness;
    }
    advanceTowardsTarget() {
      if (this.moveCompleted === true) {
        return;
      }
      if (this.currentRotation === this.targetRotation && this.realBoard.getCurrentShapeColIdx() === this.targetColIdx) {
        if (this.timeTillDrop <= 0) {
          this.realBoard.moveShapeDownAllTheWay();
          this.currentRotation = 0;
          this.targetColIdx = 0;
          this.moveCompleted = true;
        } else {
        }
      } else {
        if (this.currentRotation < this.targetRotation) {
          this.realBoard.rotateShapeClockwise();
          this.currentRotation++;
        }
        if (this.realBoard.getCurrentShapeColIdx() < this.targetColIdx) {
          this.realBoard.moveShapeRight();
        } else if (this.realBoard.getCurrentShapeColIdx() > this.targetColIdx) {
          this.realBoard.moveShapeLeft();
        }
      }
    }
    calculateTimeUntilNextMove() {
      return Math.floor(TIME_BETWEEN_MOVES + Math.random() * TIME_MAX_ADDITIONAL_TIME_BETWEEN_MOVES);
    }
  };

  // src/scripts/event/hp-changed-event.ts
  var HpChangedEvent = class extends AbstractEvent {
    constructor(hp, playerType, blinkLost = false) {
      super();
      __publicField(this, "hp");
      __publicField(this, "playerType");
      __publicField(this, "blinkLost");
      this.hp = hp;
      this.playerType = playerType;
      this.blinkLost = blinkLost;
    }
    getType() {
      return 6 /* HpChangedEventType */;
    }
  };

  // src/scripts/model/board/falling-sequencer.ts
  var FALL_TIME_MS = 1750;
  var FallGuide = class {
    constructor() {
      __publicField(this, "lastHeight");
      __publicField(this, "tweenedHeight");
      __publicField(this, "elapsed");
    }
  };
  var FallingSequencer = class {
    constructor(board) {
      __publicField(this, "board");
      __publicField(this, "fallTween");
      __publicField(this, "fallTweenElapsed");
      __publicField(this, "fallGuide");
      this.board = board;
      this.fallTween = null;
      this.fallGuide = new FallGuide();
    }
    resetAndPlay(callback) {
      this.fallGuide.lastHeight = this.fallGuide.tweenedHeight = this.board.calculateHighestColumn();
      this.fallGuide.elapsed = 0;
      this.fallTween = new TWEEN.Tween(this.fallGuide).to({ tweenedHeight: 0 }, FALL_TIME_MS).easing(TWEEN.Easing.Linear.None).onComplete(() => {
        this.fallTween = null;
        this.board.resetAndPlay();
        callback();
      }).start(this.fallGuide.elapsed);
    }
    /**
     * Doing this in two parts because onComplete() can set the tween to null.
     */
    step(elapsed) {
      if (this.fallTween != null) {
        this.fallGuide.elapsed += elapsed;
        this.fallTween.update(this.fallGuide.elapsed);
      }
      if (this.fallTween != null) {
        let newHeight = Math.ceil(this.fallGuide.tweenedHeight);
        if (this.fallGuide.lastHeight > newHeight) {
          let diff = this.fallGuide.lastHeight - newHeight;
          for (let idx = 0; idx < diff; idx++) {
            this.board.removeBottomLine();
          }
          this.fallGuide.lastHeight = newHeight;
        }
      }
    }
  };

  // src/scripts/event/falling-sequencer-event.ts
  var FallingSequencerEvent = class extends AbstractEvent {
    constructor(playerType) {
      super();
      __publicField(this, "playerType");
      this.playerType = playerType;
    }
    getType() {
      return 4 /* FallingSequencerEventType */;
    }
  };

  // src/scripts/model/playing-activity.ts
  var PlayingActivity = class {
    constructor() {
      __publicField(this, "humanBoard");
      __publicField(this, "humanFallingSequencer");
      __publicField(this, "aiBoard");
      __publicField(this, "aiFallingSequencer");
      __publicField(this, "ai");
      let humanShapeFactory = new ShapeFactory();
      this.humanBoard = new Board(0 /* Human */, humanShapeFactory, eventBus);
      this.humanFallingSequencer = new FallingSequencer(this.humanBoard);
      let aiShapeFactory = new ShapeFactory();
      this.aiBoard = new Board(1 /* Ai */, aiShapeFactory, eventBus);
      this.aiFallingSequencer = new FallingSequencer(this.aiBoard);
      this.ai = new Ai(this.aiBoard);
    }
    start() {
      eventBus.register(13 /* PlayerMovementEventType */, (event) => {
        this.handlePlayerMovement(event);
      });
      eventBus.register(15 /* RowsFilledEventType */, (event) => {
        this.handleRowsFilledEvent(event);
      });
      eventBus.register(14 /* RowsClearAnimationCompletedEventType */, (event) => {
        this.handleRowClearAnimationCompletedEvent(event);
      });
      eventBus.register(2 /* BoardFilledEventType */, (event) => {
        this.handleBoardFilledEvent(event);
      });
      eventBus.register(0 /* ActiveShapeChangedEventType */, (event) => {
        this.handleActiveShapeChangedEvent(event);
      });
      this.ai.start();
      npcManager.start();
      this.humanBoard.resetAndPlay();
      this.aiBoard.resetAndPlay();
    }
    step(elapsed) {
      this.humanBoard.step(elapsed);
      this.humanFallingSequencer.step(elapsed);
      this.aiBoard.step(elapsed);
      this.aiFallingSequencer.step(elapsed);
      this.ai.step(elapsed);
      npcManager.step(elapsed);
      return 3 /* Playing */;
    }
    /**
     * Quick hack to get it done.
     */
    stepBoardsOnly(elapsed) {
      this.humanBoard.step(elapsed);
      this.aiBoard.step(elapsed);
    }
    /**
     * Called by IntroActivity.
     */
    generateRandomWhiteCells() {
      this.humanBoard.generateRandomWhiteCells();
      this.aiBoard.generateRandomWhiteCells();
    }
    /**
     * Called by IntroActivity.
     */
    clearWhiteCell() {
      let result1 = this.humanBoard.clearOneWhiteCell();
      let result2 = this.aiBoard.clearOneWhiteCell();
      return result1 || result2;
    }
    clearBoards() {
      this.aiBoard.resetAndPlay(false);
      this.humanBoard.resetAndPlay(false);
    }
    displayEnding() {
      if (vitals.aiHitPoints <= 0) {
        this.aiBoard.displayLose();
        this.humanBoard.displayWin();
      } else if (vitals.humanHitPoints <= 0) {
        this.aiBoard.displayWin();
        this.humanBoard.displayLose();
      }
    }
    handlePlayerMovement(event) {
      let board = this.determineBoardFor(event.playerType);
      switch (event.movement) {
        case 1 /* Left */:
          board.moveShapeLeft();
          break;
        case 2 /* Right */:
          board.moveShapeRight();
          break;
        case 3 /* Down */:
          board.moveShapeDown();
          break;
        case 4 /* Drop */:
          if (board.moveShapeDownAllTheWay()) {
            board.handleEndOfCurrentPieceTasks();
          }
          break;
        case 5 /* RotateClockwise */:
          board.rotateShapeClockwise();
          break;
        default:
          console.log("unhandled movement");
          break;
      }
    }
    /**
     * Transfer the filled rows to be junk rows on the opposite player's board.
     */
    handleRowsFilledEvent(event) {
      let board = this.determineBoardForOppositeOf(event.playerType);
      board.addJunkRows(event.filledRowIdxs.length);
    }
    handleRowClearAnimationCompletedEvent(event) {
      let board = this.determineBoardFor(event.playerType);
      board.handleAnyFilledLinesPart2();
    }
    /**
     * Returns the human's board if given the human's type, or AI's board if given the AI. 
     */
    determineBoardFor(playerType) {
      if (playerType === 0 /* Human */) {
        return this.humanBoard;
      } else {
        return this.aiBoard;
      }
    }
    /**
     * If this method is given "Human", it will return the AI's board, and vice versa.
     */
    determineBoardForOppositeOf(playerType) {
      if (playerType === 0 /* Human */) {
        return this.aiBoard;
      } else {
        return this.humanBoard;
      }
    }
    handleBoardFilledEvent(event) {
      let board;
      let fallingSequencer;
      let hp;
      if (event.playerType === 0 /* Human */) {
        board = this.humanBoard;
        fallingSequencer = this.humanFallingSequencer;
        hp = vitals.humanHitPoints -= 2;
      } else {
        board = this.aiBoard;
        fallingSequencer = this.aiFallingSequencer;
        hp = vitals.aiHitPoints -= 2;
      }
      eventBus.fire(new HpChangedEvent(hp, event.playerType, true));
      eventBus.fire(new FallingSequencerEvent(event.playerType));
      fallingSequencer.resetAndPlay(() => {
        this.checkForEndOfGame();
      });
    }
    handleActiveShapeChangedEvent(event) {
      if (event.starting === true && event.playerType === 1 /* Ai */) {
        this.ai.strategize();
      } else {
      }
    }
    checkForEndOfGame() {
      if (vitals.aiHitPoints <= 0 || vitals.humanHitPoints <= 0) {
        gameState.setCurrent(4 /* Ended */);
      }
    }
  };
  var playingActivity = new PlayingActivity();

  // src/scripts/view/camera-wrapper.ts
  var ASPECT_RATIO = 16 / 9;
  var PAN_TIME_MS = 5500;
  var startingFocus = new THREE.Vector3(9, 7.5, 2);
  var playingFocus = new THREE.Vector3(6, 6.5, 2);
  var PanGuide = class {
    constructor() {
      __publicField(this, "elapsed");
      __publicField(this, "panFocus", new THREE.Vector3());
    }
  };
  var CameraWrapper = class {
    constructor() {
      __publicField(this, "camera");
      __publicField(this, "panTween");
      __publicField(this, "panGuide");
      this.camera = new THREE.PerspectiveCamera(60, ASPECT_RATIO, 0.1, 1e3);
      this.panTween = null;
      this.panGuide = new PanGuide();
    }
    start() {
    }
    /**
     * Warning: onComplete() can set the tween to null.
     */
    step(elapsed) {
      if (this.panTween != null) {
        this.panGuide.elapsed += elapsed;
        this.panTween.update(this.panGuide.elapsed);
        this.camera.lookAt(this.panGuide.panFocus);
      }
    }
    updateRendererSize(renderer) {
      let windowAspectRatio = window.innerWidth / window.innerHeight;
      let width, height;
      if (windowAspectRatio > ASPECT_RATIO) {
        width = Math.floor(window.innerHeight * ASPECT_RATIO);
        height = window.innerHeight;
      } else if (windowAspectRatio <= ASPECT_RATIO) {
        width = window.innerWidth;
        height = Math.floor(window.innerWidth / ASPECT_RATIO);
      }
      renderer.setSize(width, height);
      this.camera.updateProjectionMatrix();
    }
    lookAtStartingFocus() {
      this.camera.lookAt(startingFocus);
    }
    panToPlayingFocus() {
      this.panGuide.panFocus.x = startingFocus.x;
      this.panGuide.panFocus.y = startingFocus.y;
      this.panGuide.panFocus.z = startingFocus.z;
      this.panGuide.elapsed = 0;
      this.panTween = new TWEEN.Tween(this.panGuide.panFocus).to({ x: playingFocus.x, y: playingFocus.y, z: playingFocus.z }, PAN_TIME_MS).easing(TWEEN.Easing.Sinusoidal.Out).onComplete(() => {
        this.panTween = null;
        this.camera.lookAt(playingFocus);
      }).start(this.panGuide.elapsed);
    }
  };
  var cameraWrapper = new CameraWrapper();

  // src/scripts/model/intro-activity.ts
  var IntroActivity = class {
    constructor() {
      __publicField(this, "timeInIntro");
      __publicField(this, "playerHasHitAKey");
      __publicField(this, "hpBarsFilledCount");
      __publicField(this, "introIsComplete");
    }
    start() {
      this.timeInIntro = 0;
      this.playerHasHitAKey = false;
      this.hpBarsFilledCount = 0;
      this.introIsComplete = false;
      eventBus.register(5 /* GameStateChangedType */, (event) => {
        if (event.gameStateType === 2 /* Intro */) {
          this.handleGameStateChangedEventIntro();
        }
      });
      eventBus.register(7 /* IntroKeyPressedEventType */, (event) => {
        if (this.playerHasHitAKey === false) {
          this.playerHasHitAKey = true;
          this.transitionIntroToPlaying();
        }
      });
    }
    step(elapsed) {
      this.timeInIntro += elapsed;
      npcManager.step(elapsed);
      if (this.introIsComplete) {
        return 3 /* Playing */;
      } else {
        return 2 /* Intro */;
      }
    }
    /**
     * Set up the board in a way that makes the building look like a normal building.
     */
    handleGameStateChangedEventIntro() {
      playingActivity.generateRandomWhiteCells();
      eventBus.fire(new HpChangedEvent(0, 0 /* Human */));
      eventBus.fire(new HpChangedEvent(0, 1 /* Ai */));
    }
    transitionIntroToPlaying() {
      cameraWrapper.panToPlayingFocus();
      this.removeWhiteCell(() => {
        this.lightUpHpBars();
      });
    }
    removeWhiteCell(callback) {
      let cellsLeft = playingActivity.clearWhiteCell();
      if (cellsLeft) {
        setTimeout(() => this.removeWhiteCell(callback), 250);
      } else {
        callback();
      }
    }
    lightUpHpBars() {
      this.hpBarsFilledCount += 1;
      eventBus.fire(new HpChangedEvent(this.hpBarsFilledCount, 0 /* Human */));
      eventBus.fire(new HpChangedEvent(this.hpBarsFilledCount, 1 /* Ai */));
      if (this.hpBarsFilledCount < PANEL_COUNT_PER_FLOOR) {
        setTimeout(() => this.lightUpHpBars(), 250);
      } else {
        this.introIsComplete = true;
      }
    }
  };
  var introActivity = new IntroActivity();

  // src/scripts/model/ended-activity.ts
  var EndedActivity = class {
    constructor() {
      __publicField(this, "endedStarted");
    }
    start() {
      this.endedStarted = false;
    }
    step(elapsed) {
      npcManager.step(elapsed);
      playingActivity.step(elapsed);
      if (this.endedStarted === false) {
        this.endedStarted = true;
        playingActivity.clearBoards();
        setTimeout(() => {
          this.displayWinner();
        }, 1e3);
      }
      return 4 /* Ended */;
    }
    displayWinner() {
      playingActivity.displayEnding();
      eventBus.fire(new FallingSequencerEvent(1 /* Ai */));
      eventBus.fire(new FallingSequencerEvent(0 /* Human */));
      setTimeout(() => {
        this.displayThanks();
      }, 2500);
    }
    displayThanks() {
      let message = document.getElementById("message");
      message.textContent = "THE END - Thanks for playing all the way through our GitHub Game Off 2016 entry.";
    }
  };
  var endedActivity = new EndedActivity();

  // src/scripts/model/model.ts
  var Model = class {
    start() {
      introActivity.start();
      playingActivity.start();
      endedActivity.start();
    }
    /**
     * Delegate step() to activities.
     * Determine next state from activities.
     */
    step(elapsed) {
      let oldState = gameState.getCurrent();
      let newState;
      switch (oldState) {
        case 2 /* Intro */:
          newState = introActivity.step(elapsed);
          break;
        case 3 /* Playing */:
          newState = playingActivity.step(elapsed);
          break;
        case 4 /* Ended */:
          newState = endedActivity.step(elapsed);
          break;
        default:
          console.log("should not get here");
      }
      if (newState !== oldState) {
        gameState.setCurrent(newState);
      }
    }
  };
  var model = new Model();

  // src/scripts/view/world/sky.ts
  var START_Z_ANGLE = -(Math.PI / 30);
  var END_Z_ANGLE = Math.PI / 30;
  var ROTATION_SPEED = 5e-4;
  var Sky = class {
    constructor() {
      __publicField(this, "group");
      __publicField(this, "dome");
      __publicField(this, "rdz");
      this.group = new THREE.Object3D();
      let geometry = new THREE.SphereGeometry(50, 32, 32);
      let texture = new THREE.Texture(this.generateTexture());
      texture.needsUpdate = true;
      let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      this.dome = new THREE.Mesh(geometry, material);
      this.dome.material.side = THREE.BackSide;
      this.dome.position.set(10, 10, 0);
      this.group.add(this.dome);
      this.rdz = -ROTATION_SPEED;
    }
    start() {
      this.dome.rotation.set(0, 0, START_Z_ANGLE);
    }
    step(elapsed) {
      this.dome.rotation.set(0, 0, this.dome.rotation.z + this.rdz);
      if (this.dome.rotation.z >= END_Z_ANGLE) {
        this.rdz = -ROTATION_SPEED;
      } else if (this.dome.rotation.z <= START_Z_ANGLE) {
        this.rdz = ROTATION_SPEED;
      }
    }
    /**
     * Based on: http://stackoverflow.com/a/19992505
     */
    generateTexture() {
      let size = 512;
      let canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      let ctx = canvas.getContext("2d");
      ctx.rect(0, 0, size, size);
      let gradient = ctx.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, "#000000");
      gradient.addColorStop(0.4, "#131c45");
      gradient.addColorStop(0.75, "#ff9544");
      gradient.addColorStop(0.85, "#131c45");
      gradient.addColorStop(1, "#131c45");
      ctx.fillStyle = gradient;
      ctx.fill();
      return canvas;
    }
  };
  var sky = new Sky();

  // src/scripts/view/lighting/building.ts
  var Building = class {
    constructor() {
      __publicField(this, "group");
      this.group = new THREE.Object3D();
    }
    start() {
      let obj = buildingPreloader.getInstance();
      obj.scale.setScalar(0.25);
      obj.position.set(5, -0.01, 0);
      this.group.add(obj);
      let geometry = new THREE.PlaneGeometry(9, 3);
      let material = new THREE.MeshLambertMaterial({ color: 3420976 });
      let wall = new THREE.Mesh(geometry, material);
      wall.position.set(5, 1, -3.5);
      this.group.add(wall);
    }
    step(elapsed) {
    }
  };

  // src/scripts/view/lighting/curtain.ts
  var MAX_CURTAIN_COUNT = 4;
  var CURTAIN_WIDTH = PANEL_COUNT_PER_FLOOR;
  var CURTAIN_MOVE_TIME = 750;
  var CurtainVertexPosition = class {
    constructor() {
      __publicField(this, "x", 0);
      __publicField(this, "elapsed", 0);
    }
  };
  var Curtain = class {
    constructor() {
      __publicField(this, "group");
      __publicField(this, "curtains");
      __publicField(this, "curtainVertexPosition");
      __publicField(this, "curtainTween");
      this.group = new THREE.Object3D();
      this.curtains = [];
      for (let idx = 0; idx < MAX_CURTAIN_COUNT; idx++) {
        let geometry = new THREE.PlaneGeometry(CURTAIN_WIDTH, 1);
        let material = new THREE.MeshPhongMaterial({ color: 460566 });
        let curtain = new THREE.Mesh(geometry, material);
        this.curtains.push(curtain);
      }
      this.curtainVertexPosition = new CurtainVertexPosition();
      this.curtainTween = null;
    }
    start() {
      for (let curtain of this.curtains) {
        this.group.add(curtain);
      }
      this.group.position.set(5, 4.75, -1.451);
      this.group.scale.set(0.7, 1, 1);
      this.group.visible = false;
    }
    step(elapsed) {
      if (this.curtainTween != null) {
        this.curtainVertexPosition.elapsed += elapsed;
        this.curtainTween.update(this.curtainVertexPosition.elapsed);
      }
    }
    startAnimation(floorIdxs, direction, callback) {
      if (this.curtainTween != null) {
        return;
      }
      this.dropCurtain(floorIdxs);
      let xend;
      if (direction === 2 /* CloseLeftToRight */ || direction === 0 /* OpenLeftToRight */) {
        this.curtainVertexPosition.x = CURTAIN_WIDTH / 2;
        xend = -CURTAIN_WIDTH / 2;
      } else if (direction === 3 /* CloseRightToLeft */ || direction === 1 /* OpenRightToLeft */) {
        this.curtainVertexPosition.x = -CURTAIN_WIDTH / 2;
        xend = CURTAIN_WIDTH / 2;
      }
      this.curtainVertexPosition.elapsed = 0;
      this.curtainTween = new TWEEN.Tween(this.curtainVertexPosition).to({ x: xend }, CURTAIN_MOVE_TIME).easing(TWEEN.Easing.Quartic.InOut).onUpdate(() => {
        let idx1, idx2;
        if (direction === 3 /* CloseRightToLeft */ || direction === 0 /* OpenLeftToRight */) {
          idx1 = 0;
          idx2 = 2;
        } else if (direction === 2 /* CloseLeftToRight */ || direction === 1 /* OpenRightToLeft */) {
          idx1 = 1;
          idx2 = 3;
        }
        for (let curtain of this.curtains) {
          curtain.geometry.vertices[idx1].x = this.curtainVertexPosition.x;
          curtain.geometry.vertices[idx2].x = this.curtainVertexPosition.x;
          curtain.geometry.verticesNeedUpdate = true;
        }
      }).onComplete(() => {
        this.completeAnimation(callback);
      }).start(this.curtainVertexPosition.elapsed);
    }
    /**
     * Make the requested number of curtains visible.
     * Position them on the requested floors.
     */
    dropCurtain(floorIdxs) {
      for (let curtain of this.curtains) {
        curtain.visible = false;
      }
      for (let idx = 0; idx < floorIdxs.length; idx++) {
        let floorIdx = floorIdxs[idx];
        let curtain = this.curtains[idx];
        curtain.position.set(0, floorIdx, 0);
        curtain.geometry.vertices[0].x = -CURTAIN_WIDTH / 2;
        curtain.geometry.vertices[1].x = CURTAIN_WIDTH / 2;
        curtain.geometry.vertices[2].x = -CURTAIN_WIDTH / 2;
        curtain.geometry.vertices[3].x = CURTAIN_WIDTH / 2;
        curtain.geometry.verticesNeedUpdate = true;
        curtain.visible = true;
      }
      this.group.visible = true;
    }
    completeAnimation(callback) {
      this.group.visible = false;
      this.curtainTween = null;
      if (callback) {
        callback();
      }
    }
  };

  // src/scripts/view/lighting/hp-panels.ts
  var HpPanels = class {
    constructor(hpOrientation) {
      __publicField(this, "group");
      __publicField(this, "panels");
      this.group = new THREE.Object3D();
      this.panels = [];
      for (let idx = 0; idx < PANEL_COUNT_PER_FLOOR; idx++) {
        let geometry = new THREE.PlaneGeometry(0.6, 0.6);
        let material = new THREE.MeshPhongMaterial();
        let panel = new THREE.Mesh(geometry, material);
        let x;
        if (hpOrientation === 0 /* DecreasesRightToLeft */) {
          x = idx;
        } else {
          x = PANEL_COUNT_PER_FLOOR - idx - 1;
        }
        let y = 0;
        let z = 0;
        panel.position.set(x, y, z);
        panel.visible = false;
        panel.material.emissive.setHex(15658496);
        panel.material.emissiveIntensity = 0.5;
        this.panels.push(panel);
      }
    }
    start() {
      for (let panel of this.panels) {
        this.group.add(panel);
      }
      this.group.position.set(1.85, 3.55, -1.5);
      this.group.scale.set(0.7, 1.9, 1);
      this.updateHp(PANEL_COUNT_PER_FLOOR, false);
    }
    step(elapsed) {
    }
    /**
     * HP bar can go from right-to-left or left-to-right, like a fighting game HP bar.
     * "blinkLost" means to animate the loss of the HP panels directly above.
     */
    updateHp(hp, blinkLost) {
      if (hp > PANEL_COUNT_PER_FLOOR) {
        hp = PANEL_COUNT_PER_FLOOR;
      }
      for (let idx = 0; idx < this.panels.length; idx++) {
        let panel = this.panels[idx];
        if (idx < hp) {
          panel.visible = true;
        } else {
          panel.visible = false;
        }
      }
      if (blinkLost === true && hp >= 0 && hp < this.panels.length - 1) {
        let idx = hp;
        let panel1 = this.panels[idx];
        let panel2 = this.panels[idx + 1];
        let count = 0;
        let blinkHandle = setInterval(() => {
          count++;
          if (count > 15) {
            panel1.visible = false;
            panel2.visible = false;
            clearInterval(blinkHandle);
          } else {
            panel1.visible = !panel1.visible;
            panel2.visible = !panel2.visible;
          }
        }, 200);
      }
    }
  };

  // src/scripts/view/lighting/lighting-grid.ts
  var FLOOR_COUNT = 17;
  var ACTIVE_SHAPE_LIGHT_COUNT = 4;
  var PANEL_SIZE = 0.7;
  var EmissiveIntensity = class {
    constructor() {
      __publicField(this, "value");
    }
  };
  var LightingGrid = class {
    constructor(hpOrientation, rowClearDirection) {
      __publicField(this, "group");
      __publicField(this, "panelGroup");
      __publicField(this, "building");
      __publicField(this, "rowClearDirection");
      __publicField(this, "rowClearCurtain");
      __publicField(this, "junkRowCurtain");
      __publicField(this, "hpPanels");
      __publicField(this, "panels");
      __publicField(this, "shapeLights");
      __publicField(this, "currentShapeLightIdx");
      __publicField(this, "highlighter");
      __publicField(this, "pulseTween");
      __publicField(this, "pulseTweenElapsed");
      __publicField(this, "emissiveIntensity");
      this.group = new THREE.Object3D();
      this.panelGroup = new THREE.Object3D();
      this.building = new Building();
      this.rowClearDirection = rowClearDirection;
      this.rowClearCurtain = new Curtain();
      this.junkRowCurtain = new Curtain();
      this.hpPanels = new HpPanels(hpOrientation);
      this.panels = [];
      for (let floorIdx = 0; floorIdx < FLOOR_COUNT; floorIdx++) {
        this.panels[floorIdx] = [];
        for (let panelIdx = 0; panelIdx < PANEL_COUNT_PER_FLOOR; panelIdx++) {
          let geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE);
          let material = new THREE.MeshPhongMaterial({ emissiveIntensity: 1 });
          let panel = new THREE.Mesh(geometry, material);
          panel.visible = false;
          let x = panelIdx;
          let y = floorIdx + 1;
          let z = 0;
          panel.position.set(x, y, z);
          this.panels[floorIdx][panelIdx] = panel;
        }
      }
      this.shapeLights = [];
      for (let count = 0; count < ACTIVE_SHAPE_LIGHT_COUNT; count++) {
        let geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE);
        let material = new THREE.MeshPhongMaterial({ emissiveIntensity: 1 });
        let shapeLight = new THREE.Mesh(geometry, material);
        this.shapeLights.push(shapeLight);
      }
      this.currentShapeLightIdx = 0;
      this.highlighter = new THREE.PointLight(16711935, 3.5, 3);
      this.pulseTween = null;
      this.pulseTweenElapsed = 0;
      this.emissiveIntensity = new EmissiveIntensity();
    }
    start() {
      this.group.add(this.building.group);
      this.group.add(this.rowClearCurtain.group);
      this.group.add(this.junkRowCurtain.group);
      this.group.add(this.hpPanels.group);
      this.group.add(this.panelGroup);
      this.building.start();
      this.rowClearCurtain.start();
      this.junkRowCurtain.start();
      this.hpPanels.start();
      for (let floor of this.panels) {
        for (let panel of floor) {
          this.panelGroup.add(panel);
        }
      }
      for (let shapeLight of this.shapeLights) {
        this.panelGroup.add(shapeLight);
      }
      this.panelGroup.add(this.highlighter);
      this.panelGroup.position.set(1.85, 3.8, -1.55);
      this.panelGroup.scale.set(0.7, 1, 1);
      this.emissiveIntensity.value = 0.33;
      this.pulseTweenElapsed = 0;
      this.pulseTween = new TWEEN.Tween(this.emissiveIntensity).to({ value: 1 }, 750).easing(TWEEN.Easing.Sinusoidal.InOut).yoyo(true).repeat(Infinity).start(this.pulseTweenElapsed);
    }
    step(elapsed) {
      this.stepPulse(elapsed);
      this.rowClearCurtain.step(elapsed);
      this.junkRowCurtain.step(elapsed);
      this.hpPanels.step(elapsed);
    }
    switchRoomOff(floorIdx, panelIdx) {
      let panel = this.panels[floorIdx][panelIdx];
      panel.visible = false;
    }
    switchRoomOn(floorIdx, panelIdx, color) {
      let panel = this.panels[floorIdx][panelIdx];
      panel.visible = true;
      panel.material.color.setHex(color);
      panel.material.emissive.setHex(color);
    }
    sendActiveShapeLightTo(floorIdx, panelIdx, color) {
      let shapeLight = this.getNextShapeLight();
      shapeLight.material.color.setHex(color);
      shapeLight.material.emissive.setHex(color);
      if (floorIdx >= FLOOR_COUNT) {
        shapeLight.visible = false;
      } else {
        shapeLight.visible = true;
      }
      let x = panelIdx;
      let y = floorIdx + 1;
      let z = 0;
      shapeLight.position.set(x, y, z);
    }
    getActiveShapeLightPosition() {
      return this.highlighter.position;
    }
    sendHighlighterTo(floorIdx, panelIdx, color) {
      if (floorIdx >= FLOOR_COUNT) {
        this.highlighter.visible = false;
      } else {
        this.highlighter.visible = true;
        this.highlighter.color.setHex(color);
      }
      let x = panelIdx;
      let y = floorIdx + 1;
      let z = 0;
      this.highlighter.position.set(x, y, z);
    }
    updateHp(hp, blinkLost) {
      this.hpPanels.updateHp(hp, blinkLost);
    }
    startRowClearingAnimation(floorIdxs, callback) {
      let curtainDirection;
      if (this.rowClearDirection === 0 /* LeftToRight */) {
        curtainDirection = 0 /* OpenLeftToRight */;
      } else {
        curtainDirection = 1 /* OpenRightToLeft */;
      }
      this.rowClearCurtain.startAnimation(floorIdxs, curtainDirection, callback);
    }
    startJunkRowCurtainAnimation(floorCount) {
      if (floorCount > 4) {
        floorCount = 4;
      } else if (floorCount < 0) {
        floorCount = 0;
      }
      let floorIdxs = [0, 1, 2, 3].slice(0, floorCount);
      let curtainDirection;
      if (this.rowClearDirection === 0 /* LeftToRight */) {
        curtainDirection = 3 /* CloseRightToLeft */;
      } else {
        curtainDirection = 2 /* CloseLeftToRight */;
      }
      this.junkRowCurtain.startAnimation(floorIdxs, curtainDirection);
    }
    hideShapeLightsAndHighlighter() {
      for (let shapeLight of this.shapeLights) {
        shapeLight.visible = false;
      }
      this.highlighter.visible = false;
    }
    getNextShapeLight() {
      let shapeLight = this.shapeLights[this.currentShapeLightIdx];
      this.currentShapeLightIdx++;
      if (this.currentShapeLightIdx >= ACTIVE_SHAPE_LIGHT_COUNT) {
        this.currentShapeLightIdx = 0;
      }
      return shapeLight;
    }
    stepPulse(elapsed) {
      if (this.pulseTween != null) {
        this.pulseTweenElapsed += elapsed;
        this.pulseTween.update(this.pulseTweenElapsed);
      }
      for (let floor of this.panels) {
        for (let panel of floor) {
          panel.material.emissiveIntensity = this.emissiveIntensity.value;
        }
      }
    }
  };

  // src/scripts/event/rows-clear-animation-completed-event.ts
  var RowsClearAnimationCompletedEvent = class extends AbstractEvent {
    constructor(playerType) {
      super();
      __publicField(this, "playerType");
      this.playerType = playerType;
    }
    getType() {
      return 14 /* RowsClearAnimationCompletedEventType */;
    }
  };

  // src/scripts/view/lighting/switchboard.ts
  var Switchboard = class {
    constructor(lightingGrid, playerType) {
      __publicField(this, "lightingGrid");
      __publicField(this, "playerType");
      this.lightingGrid = lightingGrid;
      this.playerType = playerType;
    }
    start() {
      eventBus.register(0 /* ActiveShapeChangedEventType */, (event) => {
        if (this.playerType === event.playerType) {
          this.handleActiveShapeChangedEvent(event);
        }
      });
      eventBus.register(3 /* CellChangeEventType */, (event) => {
        if (this.playerType === event.playerType) {
          this.handleCellChangeEvent(event);
        }
      });
      eventBus.register(15 /* RowsFilledEventType */, (event) => {
        if (this.playerType === event.playerType) {
          this.animateRowClearing(event.filledRowIdxs);
        } else {
          this.animateJunkRowAdding(event.filledRowIdxs.length);
        }
      });
      eventBus.register(6 /* HpChangedEventType */, (event) => {
        if (this.playerType === event.playerType) {
          this.handleHpChangedEvent(event);
        }
      });
      eventBus.register(4 /* FallingSequencerEventType */, (event) => {
        if (this.playerType === event.playerType) {
          this.handleFallingSequencerEvent(event);
        }
      });
    }
    step(elapsed) {
    }
    handleActiveShapeChangedEvent(event) {
      let floorIdx = this.convertRowToFloor(event.shape.getRow());
      let panelIdx = event.shape.getCol();
      let color = this.convertColor(event.shape.color);
      let yTotalOffset = 0;
      let xTotalOffset = 0;
      let offsets = event.shape.getOffsets();
      for (let offset of offsets) {
        let offsetFloorIdx = floorIdx - offset.y;
        let offsetPanelIdx = panelIdx + offset.x;
        this.lightingGrid.sendActiveShapeLightTo(offsetFloorIdx, offsetPanelIdx, color);
        yTotalOffset += offset.y;
        xTotalOffset += offset.x;
      }
      let yoff = yTotalOffset / offsets.length - 2;
      let xoff = xTotalOffset / offsets.length;
      this.lightingGrid.sendHighlighterTo(floorIdx + yoff, panelIdx + xoff, color);
      if (this.playerType === 0 /* Human */) {
        let activeShapeLightPosition = this.lightingGrid.getActiveShapeLightPosition();
      }
    }
    handleCellChangeEvent(event) {
      let floorIdx = this.convertRowToFloor(event.row);
      if (floorIdx >= FLOOR_COUNT) {
        return;
      }
      let panelIdx = event.col;
      if (event.cell.getColor() === 0 /* Empty */) {
        this.lightingGrid.switchRoomOff(floorIdx, panelIdx);
      } else {
        let color = this.convertColor(event.cell.getColor());
        this.lightingGrid.switchRoomOn(floorIdx, panelIdx, color);
      }
    }
    animateRowClearing(filledRowIdxs) {
      let floorIdxs = [];
      for (let filledRowIdx of filledRowIdxs) {
        let floorIdx = this.convertRowToFloor(filledRowIdx);
        floorIdxs.push(floorIdx);
      }
      this.lightingGrid.startRowClearingAnimation(floorIdxs, () => {
        eventBus.fire(new RowsClearAnimationCompletedEvent(this.playerType));
      });
    }
    /**
     * Remember that the junk rows have already been added on the board.
     * 
     * Do not need to fire an event at the end of this animation because the board
     * does not need to listen for it (it listens for the clearing animation instead).
    */
    animateJunkRowAdding(junkRowCount) {
      this.lightingGrid.startJunkRowCurtainAnimation(junkRowCount);
    }
    handleHpChangedEvent(event) {
      this.lightingGrid.updateHp(event.hp, event.blinkLost);
    }
    handleFallingSequencerEvent(event) {
      this.lightingGrid.hideShapeLightsAndHighlighter();
    }
    /**
     * Convert cell row/col coordinates to floor/panel coordinates.
     * Account for the two floors that are obstructed from view. (?)
     */
    convertRowToFloor(row) {
      let thing = FLOOR_COUNT - row + 1;
      return thing;
    }
    convertColor(color) {
      let value;
      switch (color) {
        case 1 /* Cyan */:
          value = 3394764;
          break;
        case 2 /* Yellow */:
          value = 16777045;
          break;
        case 3 /* Purple */:
          value = 10494112;
          break;
        case 4 /* Green */:
          value = 2138144;
          break;
        case 5 /* Red */:
          value = 16724787;
          break;
        case 6 /* Blue */:
          value = 4474060;
          break;
        case 7 /* Orange */:
          value = 15652144;
          break;
        case 8 /* White */:
          value = 16777215;
          break;
        // Default or missing case is black.
        case 0 /* Empty */:
        default:
          value = 0;
          break;
      }
      return value;
    }
  };

  // src/scripts/event/standee-movement-ended-event.ts
  var StandeeMovementEndedEvent = class extends AbstractEvent {
    constructor(npcId, x, z) {
      super();
      __publicField(this, "npcId");
      __publicField(this, "x");
      __publicField(this, "z");
      this.npcId = npcId;
      this.x = x;
      this.z = z;
    }
    getType() {
      return 16 /* StandeeMovementEndedEventType */;
    }
  };

  // src/scripts/view/standee/standee-sprite-wrapper.ts
  var STANDARD_DELAY = 225;
  var WALK_UP_OR_DOWN_DELAY = Math.floor(STANDARD_DELAY * (2 / 3));
  var scratchVector1 = new THREE.Vector3();
  var scratchVector2 = new THREE.Vector3();
  var StandeeAnimationFrame = class {
    constructor(row, col) {
      __publicField(this, "row");
      __publicField(this, "col");
      this.row = row;
      this.col = col;
    }
  };
  var StandeeAnimation = class {
    constructor(type, next) {
      __publicField(this, "type");
      __publicField(this, "next");
      // Probably not going to be used for this game
      __publicField(this, "frames");
      __publicField(this, "delays");
      __publicField(this, "currentFrameIdx");
      __publicField(this, "currentFrameTimeElapsed");
      __publicField(this, "finished");
      this.type = type;
      if (next) {
        this.next = next;
      } else {
        this.next = type;
      }
      this.frames = [];
      this.delays = [];
      this.currentFrameIdx = 0;
      this.currentFrameTimeElapsed = 0;
      this.finished = false;
    }
    push(frame, delay = STANDARD_DELAY) {
      this.frames.push(frame);
      this.delays.push(delay);
    }
    step(elapsed) {
      this.currentFrameTimeElapsed += elapsed;
      if (this.currentFrameTimeElapsed >= this.delays[this.currentFrameIdx]) {
        this.currentFrameTimeElapsed = 0;
        this.currentFrameIdx++;
        if (this.currentFrameIdx >= this.frames.length) {
          this.currentFrameIdx = 0;
          this.finished = true;
        }
      }
    }
    isFinished() {
      return this.finished;
    }
    getCurrentFrame() {
      return this.frames[this.currentFrameIdx];
    }
  };
  var StandeeSpriteWrapper = class {
    constructor() {
      __publicField(this, "group");
      __publicField(this, "sprite");
      __publicField(this, "textureWrapper");
      __publicField(this, "currentAnimation");
      this.group = new THREE.Object3D();
      this.textureWrapper = standeeAnimationTextureBase.newInstance();
      let material = new THREE.SpriteMaterial({ map: this.textureWrapper.texture });
      this.sprite = new THREE.Sprite(material);
      this.sprite.scale.set(1, 1.5, 1);
      this.group.add(this.sprite);
      this.group.scale.set(0.5, 0.5, 0.5);
      this.group.position.set(0, -0.4, 0);
      this.currentAnimation = createStandDown();
    }
    start() {
    }
    step(elapsed) {
      this.adjustLighting(elapsed);
      this.stepAnimation(elapsed);
    }
    /**
     * Only switches if the given animation is different from the current one.
     */
    switchAnimation(type) {
      let animation = determineAnimation(type);
      if (this.currentAnimation.type !== animation.type) {
        this.currentAnimation = animation;
      }
    }
    adjustLighting(elapsed) {
      this.sprite.getWorldPosition(scratchVector1);
      cameraWrapper.camera.getWorldPosition(scratchVector2);
      let distanceSquared = scratchVector1.distanceToSquared(scratchVector2);
      let value = Math.max(0.2, 1 - Math.min(1, distanceSquared / 225));
      this.sprite.material.color.setRGB(value, value, value);
    }
    stepAnimation(elapsed) {
      if (this.currentAnimation == null) {
        return;
      }
      this.currentAnimation.step(elapsed);
      if (this.currentAnimation.isFinished()) {
        this.currentAnimation = determineAnimation(this.currentAnimation.next);
      }
      let frame = this.currentAnimation.getCurrentFrame();
      let xpct = frame.col * FRAME_WIDTH / SPRITESHEET_WIDTH;
      let ypct = (SPRITESHEET_HEIGHT / FRAME_HEIGHT - 1 - frame.row) * FRAME_HEIGHT / SPRITESHEET_HEIGHT;
      this.textureWrapper.texture.offset.set(xpct, ypct);
    }
  };
  function determineAnimation(type) {
    let animation;
    switch (type) {
      case 0 /* StandUp */:
        animation = createStandUp();
        break;
      case 4 /* WalkUp */:
        animation = createWalkUp();
        break;
      case 1 /* StandDown */:
        animation = createStandDown();
        break;
      case 5 /* WalkDown */:
        animation = createWalkDown();
        break;
      case 2 /* StandLeft */:
        animation = createStandLeft();
        break;
      case 6 /* WalkLeft */:
        animation = createWalkLeft();
        break;
      case 3 /* StandRight */:
        animation = createStandRight();
        break;
      case 7 /* WalkRight */:
        animation = createWalkRight();
        break;
      case 8 /* CheerUp */:
        animation = createCheerUp();
        break;
      case 9 /* PanicUp */:
        animation = createPanicUp();
        break;
      case 10 /* PanicDown */:
        animation = createPanicDown();
        break;
      default:
        console.log("Should not get here");
    }
    return animation;
  }
  var standUpFrame1 = new StandeeAnimationFrame(2, 0);
  function createStandUp() {
    let animation = new StandeeAnimation(0 /* StandUp */);
    animation.push(standUpFrame1);
    return animation;
  }
  var walkUpFrame1 = new StandeeAnimationFrame(2, 0);
  var walkUpFrame2 = new StandeeAnimationFrame(2, 1);
  var walkUpFrame3 = new StandeeAnimationFrame(2, 2);
  var walkUpFrame4 = new StandeeAnimationFrame(3, 3);
  var walkUpFrame5 = new StandeeAnimationFrame(4, 3);
  var walkUpFrame6 = new StandeeAnimationFrame(5, 3);
  function createWalkUp() {
    let animation = new StandeeAnimation(4 /* WalkUp */);
    animation.push(walkUpFrame1, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame2, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame3, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame4, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame5, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame6, WALK_UP_OR_DOWN_DELAY);
    return animation;
  }
  var standDownFrame1 = new StandeeAnimationFrame(0, 0);
  function createStandDown() {
    let animation = new StandeeAnimation(1 /* StandDown */);
    animation.push(standDownFrame1);
    return animation;
  }
  var walkDownFrame1 = new StandeeAnimationFrame(0, 0);
  var walkDownFrame2 = new StandeeAnimationFrame(0, 1);
  var walkDownFrame3 = new StandeeAnimationFrame(0, 2);
  var walkDownFrame4 = new StandeeAnimationFrame(0, 3);
  var walkDownFrame5 = new StandeeAnimationFrame(1, 3);
  var walkDownFrame6 = new StandeeAnimationFrame(2, 3);
  function createWalkDown() {
    let animation = new StandeeAnimation(5 /* WalkDown */);
    animation.push(walkDownFrame1, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame2, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame3, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame4, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame5, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame6, WALK_UP_OR_DOWN_DELAY);
    return animation;
  }
  var standLeftFrame1 = new StandeeAnimationFrame(1, 1);
  function createStandLeft() {
    let animation = new StandeeAnimation(2 /* StandLeft */);
    animation.push(standLeftFrame1);
    return animation;
  }
  var walkLeftFrame1 = new StandeeAnimationFrame(1, 1);
  var walkLeftFrame2 = new StandeeAnimationFrame(1, 0);
  var walkLeftFrame3 = new StandeeAnimationFrame(1, 1);
  var walkLeftFrame4 = new StandeeAnimationFrame(1, 2);
  function createWalkLeft() {
    let animation = new StandeeAnimation(6 /* WalkLeft */);
    animation.push(walkLeftFrame1);
    animation.push(walkLeftFrame2);
    animation.push(walkLeftFrame3);
    animation.push(walkLeftFrame4);
    return animation;
  }
  var standRightFrame1 = new StandeeAnimationFrame(1, 4);
  function createStandRight() {
    let animation = new StandeeAnimation(3 /* StandRight */);
    animation.push(standRightFrame1);
    return animation;
  }
  var walkRightFrame1 = new StandeeAnimationFrame(1, 4);
  var walkRightFrame2 = new StandeeAnimationFrame(2, 4);
  var walkRightFrame3 = new StandeeAnimationFrame(1, 4);
  var walkRightFrame4 = new StandeeAnimationFrame(0, 4);
  function createWalkRight() {
    let animation = new StandeeAnimation(7 /* WalkRight */);
    animation.push(walkRightFrame1);
    animation.push(walkRightFrame2);
    animation.push(walkRightFrame3);
    animation.push(walkRightFrame4);
    return animation;
  }
  var cheerUpFrame1 = new StandeeAnimationFrame(2, 0);
  var cheerUpFrame2 = new StandeeAnimationFrame(3, 0);
  var cheerUpFrame3 = new StandeeAnimationFrame(3, 1);
  var cheerUpFrame4 = new StandeeAnimationFrame(3, 0);
  function createCheerUp() {
    let animation = new StandeeAnimation(8 /* CheerUp */);
    animation.push(cheerUpFrame1);
    animation.push(cheerUpFrame2);
    animation.push(cheerUpFrame3);
    animation.push(cheerUpFrame4);
    return animation;
  }
  var panicUpFrame1 = new StandeeAnimationFrame(2, 0);
  var panicUpFrame2 = new StandeeAnimationFrame(3, 2);
  var panicUpFrame3 = new StandeeAnimationFrame(4, 0);
  var panicUpFrame4 = new StandeeAnimationFrame(3, 2);
  function createPanicUp() {
    let animation = new StandeeAnimation(9 /* PanicUp */);
    animation.push(panicUpFrame1);
    animation.push(panicUpFrame2);
    animation.push(panicUpFrame3);
    animation.push(panicUpFrame4);
    return animation;
  }
  var panicDownFrame1 = new StandeeAnimationFrame(0, 0);
  var panicDownFrame2 = new StandeeAnimationFrame(4, 1);
  var panicDownFrame3 = new StandeeAnimationFrame(4, 2);
  var panicDownFrame4 = new StandeeAnimationFrame(4, 1);
  function createPanicDown() {
    let animation = new StandeeAnimation(10 /* PanicDown */);
    animation.push(panicDownFrame1);
    animation.push(panicDownFrame2);
    animation.push(panicDownFrame3);
    animation.push(panicDownFrame4);
    return animation;
  }

  // src/scripts/view/standee/standee.ts
  var Standee = class {
    // Faces in the vector of which way the NPC is walking, was walking before stopping, or was set to.
    constructor(npcId) {
      __publicField(this, "npcId");
      __publicField(this, "group");
      __publicField(this, "spriteWrapper");
      __publicField(this, "walkTweenElapsed");
      __publicField(this, "walkTween");
      __publicField(this, "facing");
      this.npcId = npcId;
      this.group = new THREE.Object3D();
      this.spriteWrapper = new StandeeSpriteWrapper();
      this.group.add(this.spriteWrapper.group);
      this.walkTweenElapsed = 0;
      this.walkTween = null;
      this.facing = new THREE.Vector3();
    }
    start() {
      this.group.position.set(-200, 0, -200);
    }
    step(elapsed) {
      this.stepWalk(elapsed);
      this.ensureCorrectAnimation();
      this.spriteWrapper.step(elapsed);
    }
    /**
     * Immediately set standee on given position.
     */
    moveTo(x, z) {
      this.group.position.set(x, 0, z);
    }
    /**
     * Set standee in motion towards given position.
     * Speed dimension is 1 unit/sec.
     */
    walkTo(x, z, speed) {
      let vector = new THREE.Vector3(x, 0, z).sub(this.group.position);
      let distance = vector.length();
      let time = distance / speed * 1e3;
      this.walkTweenElapsed = 0;
      this.walkTween = new TWEEN.Tween(this.group.position).to({ x, z }, time).onComplete(() => {
        this.stopWalk();
      }).start(this.walkTweenElapsed);
      this.facing.setX(x - this.group.position.x);
      this.facing.setZ(z - this.group.position.z);
    }
    lookAt(x, z) {
      this.facing.setX(x - this.group.position.x);
      this.facing.setZ(z - this.group.position.z);
    }
    stepWalk(elapsed) {
      if (this.walkTween != null) {
        this.walkTweenElapsed += elapsed;
        this.walkTween.update(this.walkTweenElapsed);
      }
    }
    stopWalk() {
      this.walkTweenElapsed = 0;
      this.walkTween = null;
      eventBus.fire(
        new StandeeMovementEndedEvent(
          this.npcId,
          this.group.position.x,
          this.group.position.z
        )
      );
    }
    ensureCorrectAnimation() {
      let worldDirection = cameraWrapper.camera.getWorldDirection();
      let angle = Math.atan2(this.facing.z, this.facing.x) - Math.atan2(worldDirection.z, worldDirection.x);
      if (angle < 0) angle += 2 * Math.PI;
      angle *= 180 / Math.PI;
      if (this.walkTween != null) {
        if (angle < 60 || angle >= 300) {
          this.spriteWrapper.switchAnimation(4 /* WalkUp */);
        } else if (angle >= 60 && angle < 120) {
          this.spriteWrapper.switchAnimation(7 /* WalkRight */);
        } else if (angle >= 120 && angle < 240) {
          this.spriteWrapper.switchAnimation(5 /* WalkDown */);
        } else if (angle >= 240 && angle < 300) {
          this.spriteWrapper.switchAnimation(6 /* WalkLeft */);
        }
      } else {
        if (angle < 60 || angle >= 300) {
          this.spriteWrapper.switchAnimation(0 /* StandUp */);
        } else if (angle >= 60 && angle < 120) {
          this.spriteWrapper.switchAnimation(3 /* StandRight */);
        } else if (angle >= 120 && angle < 240) {
          this.spriteWrapper.switchAnimation(1 /* StandDown */);
        } else if (angle >= 240 && angle < 300) {
          this.spriteWrapper.switchAnimation(2 /* StandLeft */);
        }
      }
    }
  };

  // src/scripts/view/standee/standee-manager.ts
  var Y_OFFSET = 0.75;
  var STANDEE_SPEED = 0.5;
  var StandeeManager = class {
    constructor() {
      __publicField(this, "group");
      __publicField(this, "standees");
      this.group = new THREE.Object3D();
      this.standees = /* @__PURE__ */ new Map();
    }
    start() {
      this.group.position.setY(Y_OFFSET);
      eventBus.register(10 /* NpcPlacedEventType */, (event) => {
        this.handleNpcPlacedEvent(event);
      });
      eventBus.register(12 /* NpcTeleportedEventType */, (event) => {
        this.handleNpcTeleportedEvent(event);
      });
      eventBus.register(9 /* NpcMovementChangedEventType */, (event) => {
        this.handleNpcMovementChangedEvent(event);
      });
      eventBus.register(8 /* NpcFacingEventType */, (event) => {
        this.handleNpcFacingEvent(event);
      });
    }
    step(elapsed) {
      this.standees.forEach((standee) => {
        standee.step(elapsed);
      });
    }
    handleNpcPlacedEvent(event) {
      let standee = new Standee(event.npcId);
      standee.start();
      this.group.add(standee.group);
      this.standees.set(standee.npcId, standee);
      let x = event.x;
      let z = event.y;
      this.moveToPosition(standee, x, z);
    }
    handleNpcTeleportedEvent(event) {
      let standee = this.standees.get(event.npcId);
      if (standee != null) {
        let x = event.x;
        let z = event.y;
        this.moveToPosition(standee, x, z);
      }
    }
    moveToPosition(standee, x, z) {
      standee.moveTo(x, z);
    }
    handleNpcMovementChangedEvent(event) {
      let standee = this.standees.get(event.npcId);
      if (standee != null) {
        let x = event.x;
        let z = event.y;
        standee.walkTo(x, z, STANDEE_SPEED);
      }
    }
    handleNpcFacingEvent(event) {
      let standee = this.standees.get(event.npcId);
      if (standee != null) {
        let x = event.x;
        let z = event.y;
        standee.lookAt(x, z);
      }
    }
  };
  var standeeManager = new StandeeManager();

  // src/scripts/view/view.ts
  var View = class {
    constructor() {
      __publicField(this, "canvas");
      __publicField(this, "scene");
      __publicField(this, "renderer");
      __publicField(this, "humanGrid");
      __publicField(this, "humanSwitchboard");
      __publicField(this, "aiGrid");
      __publicField(this, "aiSwitchboard");
      this.canvas = document.getElementById("canvas");
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
      this.humanGrid = new LightingGrid(0 /* DecreasesRightToLeft */, 1 /* RightToLeft */);
      this.humanSwitchboard = new Switchboard(this.humanGrid, 0 /* Human */);
      this.aiGrid = new LightingGrid(1 /* DecreasesLeftToRight */, 0 /* LeftToRight */);
      this.aiSwitchboard = new Switchboard(this.aiGrid, 1 /* Ai */);
    }
    start() {
      this.humanGrid.start();
      this.humanSwitchboard.start();
      this.aiGrid.start();
      this.aiSwitchboard.start();
      this.doStart();
      cameraWrapper.start();
      sky.start();
      ground.start();
      standeeManager.start();
      this.canvas.style.opacity = "1";
      this.canvas.style.transition = "opacity 2s";
    }
    step(elapsed) {
      cameraWrapper.step(elapsed);
      sky.step(elapsed);
      ground.step(elapsed);
      this.humanSwitchboard.step(elapsed);
      this.humanGrid.step(elapsed);
      this.aiGrid.step(elapsed);
      this.humanSwitchboard.step(elapsed);
      standeeManager.step(elapsed);
      this.renderer.render(this.scene, cameraWrapper.camera);
    }
    doStart() {
      this.scene.add(sky.group);
      this.scene.add(ground.group);
      this.scene.add(standeeManager.group);
      this.scene.add(this.humanGrid.group);
      this.scene.add(this.aiGrid.group);
      this.aiGrid.group.position.setX(12);
      this.aiGrid.group.position.setZ(-2);
      this.aiGrid.group.rotation.y = -Math.PI / 3.5;
      let spotLightColor = 10066414;
      let spotLight = new THREE.SpotLight(spotLightColor);
      spotLight.position.set(-3, 0.75, 20);
      spotLight.target = this.aiGrid.group;
      this.scene.add(spotLight);
      cameraWrapper.camera.position.set(5, 0.4, 15);
      cameraWrapper.lookAtStartingFocus();
      cameraWrapper.updateRendererSize(this.renderer);
      window.addEventListener("resize", () => {
        cameraWrapper.updateRendererSize(this.renderer);
      });
    }
    // private addDebugBox() {
    //     let geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    //     let material = new THREE.MeshLambertMaterial({emissive: 0xff00ff});
    //     let mesh = new THREE.Mesh(geometry, material);
    //     mesh.position.set(15.5, 0, 2.0);
    //     this.scene.add(mesh);
    // }
  };
  var view = new View();

  // src/scripts/controller/keyboard.ts
  var KEY_REPEAT_DELAY_INITIAL = 550;
  var KEY_REPEAT_DELAY_CONTINUE = 200;
  var Keyboard = class {
    constructor() {
      __publicField(this, "keyState");
      __publicField(this, "previousKeyCode");
      __publicField(this, "currentKeyCode");
      __publicField(this, "keyHeldElapsed");
      __publicField(this, "keyHeldInitial");
      this.keyState = /* @__PURE__ */ new Map();
      this.previousKeyCode = -1;
      this.currentKeyCode = -1;
      this.keyHeldElapsed = 0;
      this.keyHeldInitial = true;
    }
    start() {
      window.addEventListener("keydown", (event) => {
        this.eventToState(event, 0 /* Down */);
      });
      window.addEventListener("keyup", (event) => {
        this.eventToState(event, 1 /* Up */);
      });
      window.onblur = () => {
        this.keyState = /* @__PURE__ */ new Map();
        this.previousKeyCode = -1;
        this.currentKeyCode = -1;
        this.keyHeldElapsed = 0;
        this.keyHeldInitial = false;
      };
    }
    /**
     * All this does is handle if the player is holding down a key for a certain amount of time.
     * If so, determine whether or not to emulate their having pressed the key during this frame.
     */
    step(elapsed) {
      if (this.currentKeyCode !== this.previousKeyCode) {
        this.keyHeldElapsed += elapsed;
        let updateState;
        if (this.keyHeldInitial === true && this.keyHeldElapsed >= KEY_REPEAT_DELAY_INITIAL) {
          this.keyHeldInitial = false;
          this.keyHeldElapsed = 0;
          updateState = true;
        } else if (this.keyHeldInitial === false && this.keyHeldElapsed >= KEY_REPEAT_DELAY_CONTINUE) {
          this.keyHeldElapsed = 0;
          updateState = true;
        }
        if (updateState === true) {
          let key = this.keyCodeToKey(this.currentKeyCode);
          this.setState(key, 0 /* Down */, true);
        }
      } else {
        this.keyHeldElapsed = 0;
        this.keyHeldInitial = true;
      }
    }
    /**
     * Return if given key is 'Down'.
     */
    isDown(key) {
      return this.keyState.get(key) === 0 /* Down */;
    }
    /**
     * Return if given key is 'down'. Also sets the key from 'Down' to 'Handling'.
     */
    isDownAndUnhandled(key) {
      if (this.isDown(key)) {
        this.keyState.set(key, 2 /* Handling */);
        return true;
      } else {
        return false;
      }
    }
    /**
     * TODO: Not sure if this would work in this game with the key delay capturing.
     * 
     * Returns if any key is 'down'. Also set all 'Down' keys to 'Handling'.
     */
    isAnyKeyDownAndUnhandled() {
      let anyKeyDown = false;
      this.keyState.forEach((state, key) => {
        if (state === 0 /* Down */) {
          this.keyState.set(key, 2 /* Handling */);
          anyKeyDown = true;
        }
      });
      return anyKeyDown;
    }
    eventToState(event, state) {
      if (state === 0 /* Down */) {
        this.currentKeyCode = event.keyCode;
      } else if (state == 1 /* Up */) {
        if (event.keyCode === this.currentKeyCode) {
          this.currentKeyCode = -1;
          this.previousKeyCode = -1;
        }
      }
      let key = this.keyCodeToKey(event.keyCode);
      this.keyToState(key, state, event);
    }
    keyCodeToKey(keyCode) {
      let key = 6 /* Other */;
      switch (keyCode) {
        // Directionals --------------------------------------------------
        case 65:
        // 'a'
        case 37:
          key = 0 /* Left */;
          break;
        case 87:
        // 'w'
        case 38:
          key = 1 /* Up */;
          break;
        case 68:
        // 'd'
        case 39:
          key = 3 /* Right */;
          break;
        case 83:
        // 's'
        case 40:
          key = 2 /* Down */;
          break;
        case 32:
          key = 4 /* Drop */;
          break;
        // Pause ---------------------------------------------------------
        case 80:
        // 'p'
        case 27:
        // esc
        case 13:
          key = 5 /* Pause */;
          break;
        // Ignore certain keys -------------------------------------------
        case 82:
        // 'r'
        case 18:
        // alt
        case 224:
        // apple command (firefox)
        case 17:
        // apple command (opera)
        case 91:
        // apple command, left (safari/chrome)
        case 93:
        // apple command, right (safari/chrome)
        case 84:
        // 't' (i.e., open a new tab)
        case 78:
        // 'n' (i.e., open a new window)
        case 219:
        // left brackets
        case 221:
          key = 7 /* Ignore */;
          break;
        // Prevent some unwanted behaviors -------------------------------
        case 191:
        // forward slash (page find)
        case 9:
        // tab (can lose focus)
        case 16:
          key = 8 /* Prevent */;
          break;
        // All other keys ------------------------------------------------
        default:
          key = 6 /* Other */;
      }
      return key;
    }
    keyToState(key, state, event) {
      let preventDefault = false;
      switch (key) {
        case 0 /* Left */:
          this.setState(0 /* Left */, state);
          preventDefault = true;
          break;
        case 1 /* Up */:
          this.setState(1 /* Up */, state);
          break;
        case 3 /* Right */:
          this.setState(3 /* Right */, state);
          preventDefault = true;
          break;
        case 2 /* Down */:
          this.setState(2 /* Down */, state);
          preventDefault = true;
          break;
        case 4 /* Drop */:
          this.setState(4 /* Drop */, state);
          preventDefault = true;
          break;
        case 5 /* Pause */:
          this.setState(5 /* Pause */, state);
          preventDefault = true;
          break;
        // TODO: Maybe add a debug key here ('f')
        case 7 /* Ignore */:
          break;
        case 8 /* Prevent */:
          preventDefault = true;
          break;
        case 6 /* Other */:
        default:
          this.setState(6 /* Other */, state);
          break;
      }
      if (event != null && preventDefault === true) {
        event.preventDefault();
      }
    }
    setState(key, state, force = false) {
      if (state === 1 /* Up */) {
        this.keyState.set(key, state);
      } else if (state === 0 /* Down */) {
        if (this.keyState.get(key) !== 2 /* Handling */ || force === true) {
          this.keyState.set(key, state);
        }
      }
    }
  };
  var keyboard = new Keyboard();

  // src/scripts/event/intro-key-pressed-event.ts
  var IntroKeyPressedEvent = class extends AbstractEvent {
    getType() {
      return 7 /* IntroKeyPressedEventType */;
    }
  };

  // src/scripts/controller/intro-handler.ts
  var IntroHandler = class {
    start() {
    }
    step(elapsed) {
      keyboard.step(elapsed);
      if (keyboard.isAnyKeyDownAndUnhandled()) {
        eventBus.fire(new IntroKeyPressedEvent());
      }
    }
  };
  var introHandler = new IntroHandler();

  // src/scripts/event/player-movement-event.ts
  var PlayerMovementEvent = class extends AbstractEvent {
    constructor(movement, playerType) {
      super();
      __publicField(this, "movement");
      __publicField(this, "playerType");
      this.movement = movement;
      this.playerType = playerType;
    }
    getType() {
      return 13 /* PlayerMovementEventType */;
    }
  };

  // src/scripts/controller/playing-handler.ts
  var PlayingHandler = class {
    start() {
    }
    step(elapsed) {
      keyboard.step(elapsed);
      if (keyboard.isDownAndUnhandled(1 /* Up */)) {
        eventBus.fire(new PlayerMovementEvent(5 /* RotateClockwise */, 0 /* Human */));
      }
      if (keyboard.isDownAndUnhandled(0 /* Left */)) {
        eventBus.fire(new PlayerMovementEvent(1 /* Left */, 0 /* Human */));
      }
      if (keyboard.isDownAndUnhandled(3 /* Right */)) {
        eventBus.fire(new PlayerMovementEvent(2 /* Right */, 0 /* Human */));
      }
      if (keyboard.isDownAndUnhandled(2 /* Down */)) {
        eventBus.fire(new PlayerMovementEvent(3 /* Down */, 0 /* Human */));
      }
      if (keyboard.isDownAndUnhandled(4 /* Drop */)) {
        eventBus.fire(new PlayerMovementEvent(4 /* Drop */, 0 /* Human */));
      }
    }
  };
  var playingHandler = new PlayingHandler();

  // src/scripts/controller/controller.ts
  var Controller = class {
    start() {
      keyboard.start();
      playingHandler.start();
    }
    step(elapsed) {
      switch (gameState.getCurrent()) {
        case 2 /* Intro */:
          introHandler.step(elapsed);
          break;
        case 3 /* Playing */:
          playingHandler.step(elapsed);
          break;
        case 4 /* Ended */:
          break;
        default:
          console.log("should not get here");
      }
    }
  };
  var controller = new Controller();

  // src/scripts/main.ts
  document.addEventListener("DOMContentLoaded", (event) => {
    gameState.setCurrent(0 /* Initializing */);
    soundManager.attach();
    preloader.preload(() => {
      main();
    });
  });
  function main() {
    soundManager.start();
    controller.start();
    view.start();
    model.start();
    gameState.setCurrent(2 /* Intro */);
    let step = () => {
      requestAnimationFrame(step);
      let elapsed = calculateElapsed();
      controller.step(elapsed);
      view.step(elapsed);
      model.step(elapsed);
      soundManager.step(elapsed);
    };
    step();
  }
  var lastStep = Date.now();
  function calculateElapsed() {
    let now = Date.now();
    let elapsed = now - lastStep;
    if (elapsed > 100) {
      elapsed = 100;
    }
    lastStep = now;
    return elapsed;
  }
})();
