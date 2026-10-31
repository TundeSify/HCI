(function () {
  "use strict";

  var companion = document.getElementById("desktop-companion");
  var character = document.getElementById("companion-character");
  var sprite = companion.querySelector(".companion-sprite");
  var toggle = document.getElementById("companion-toggle");
  var hint = document.getElementById("companion-hint");
  var desktop = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var width = 64;
  var x = window.innerWidth * 0.18;
  var y = 0;
  var jumpVelocity = 0;
  var jumpCount = 0;
  var direction = 1;
  var keys = { left: false, right: false };
  var drag = null;
  var wanderTarget = null;
  var animationFrame = null;
  var lastFrameTime = 0;
  var walkFrameTime = 0;
  var idleFrameTimer = 0;
  var idleTimer = 0;
  var stateTimer = 0;
  var jumpTimer = 0;
  var wanderTimer = 0;
  var hintTimer = 0;
  var lastReactionTime = 0;
  var tickleFrame = 0;
  var suppressClickUntil = 0;
  var idleActionFrames = [];
  var idleActionIndex = 0;
  var hidden = false;
  var mounted = false;
  var state = "idle";

  function clampPosition(value) {
    return Math.max(width / 2 + 4, Math.min(window.innerWidth - width / 2 - 4, value));
  }

  function renderPosition() {
    x = clampPosition(x);
    companion.style.left = x + "px";
    companion.style.bottom = (8 + y) + "px";
    character.style.setProperty("--facing", direction);
  }

  function setFrame(frame) {
    sprite.dataset.frame = frame;
  }

  function setState(nextState, frame) {
    state = nextState;
    companion.className = "desktop-companion state-" + nextState;
    if (frame) setFrame(frame);
  }

  function dismissHint() {
    hint.classList.add("is-dismissed");
    window.clearTimeout(hintTimer);
  }

  function clearIdleAction() {
    window.clearTimeout(stateTimer);
    window.clearInterval(idleFrameTimer);
    stateTimer = 0;
    idleFrameTimer = 0;
    idleActionFrames = [];
  }

  function clearIdleTimer() {
    window.clearTimeout(idleTimer);
    idleTimer = 0;
  }

  function clearWander() {
    window.clearTimeout(wanderTimer);
    wanderTimer = 0;
    wanderTarget = null;
  }

  function stopAnimation() {
    if (animationFrame === null) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    lastFrameTime = 0;
  }

  function scheduleAnimation() {
    if (animationFrame === null && desktop.matches && !hidden && !document.hidden) {
      animationFrame = window.requestAnimationFrame(update);
    }
  }

  function scheduleIdle() {
    clearIdleTimer();
    if (reducedMotion.matches || hidden || !desktop.matches || document.hidden || state !== "idle" || keys.left || keys.right) return;
    idleTimer = window.setTimeout(startIdleAction, 6500 + Math.random() * 7500);
  }

  function startIdleAction() {
    if (hidden || document.hidden || state !== "idle" || keys.left || keys.right || jumpCount > 0 || drag) {
      scheduleIdle();
      return;
    }

    var actions = [
      { name: "waving", frames: ["wave-1", "wave-2"], interval: 180, duration: 1100, weight: 4 },
      { name: "looking", frames: ["look", "idle"], interval: 360, duration: 850, weight: 2 },
      { name: "stretching", frames: ["stretch-1", "stretch-2"], interval: 280, duration: 1000, weight: 2 },
      { name: "happy", frames: ["happy", "idle"], interval: 180, duration: 720, weight: 2 },
      { name: "blinking", frames: ["blink", "idle"], interval: 180, duration: 360, weight: 2 }
    ];
    var totalWeight = actions.reduce(function (sum, action) { return sum + action.weight; }, 0);
    var choice = Math.random() * totalWeight;
    var action = actions[0];
    for (var index = 0; index < actions.length; index += 1) {
      choice -= actions[index].weight;
      if (choice < 0) {
        action = actions[index];
        break;
      }
    }

    clearIdleAction();
    setState(action.name, action.frames[0]);
    idleActionFrames = action.frames;
    idleActionIndex = 0;
    idleFrameTimer = window.setInterval(function () {
      idleActionIndex = (idleActionIndex + 1) % idleActionFrames.length;
      setFrame(idleActionFrames[idleActionIndex]);
    }, action.interval);
    stateTimer = window.setTimeout(function () {
      clearIdleAction();
      setState("idle", "idle");
      scheduleIdle();
      scheduleWander();
    }, action.duration);
  }

  function scheduleWander() {
    window.clearTimeout(wanderTimer);
    if (reducedMotion.matches || hidden || document.hidden || !desktop.matches || state !== "idle") return;
    wanderTimer = window.setTimeout(function () {
      if (keys.left || keys.right || drag || jumpCount > 0 || state !== "idle") {
        scheduleWander();
        return;
      }
      var offset = (Math.random() * 2 - 1) * 76;
      wanderTarget = clampPosition(x + offset);
      if (Math.abs(wanderTarget - x) < 12) {
        scheduleWander();
        return;
      }
      clearIdleTimer();
      scheduleAnimation();
    }, 9000 + Math.random() * 7000);
  }

  function settleAfterMotion() {
    if (jumpCount > 0 || y > 0 || jumpVelocity > 0) {
      setState("jumping", jumpVelocity > 0 ? "jump" : "fall");
    } else if (state === "landing") {
      return;
    } else if (drag && drag.moved) {
      setState("dragging", "land");
    } else if (keys.left || keys.right || wanderTarget !== null) {
      setState("walking", "walk-1");
    } else {
      setState("idle", "idle");
      scheduleIdle();
      scheduleWander();
    }
  }

  function update(timestamp) {
    animationFrame = null;
    if (hidden || document.hidden || !desktop.matches) return;

    var elapsed = lastFrameTime ? Math.min((timestamp - lastFrameTime) / 1000, 0.04) : 0;
    lastFrameTime = timestamp;

    var inputDirection = Number(keys.right) - Number(keys.left);
    var movingToWanderTarget = !inputDirection && !drag && wanderTarget !== null;
    var movementDirection = inputDirection || (movingToWanderTarget ? Math.sign(wanderTarget - x) : 0);
    var canMove = state !== "tickled" && state !== "happy" && state !== "waving" && state !== "looking" && state !== "stretching";

    if (movementDirection && !drag && canMove) {
      direction = movementDirection;
      x += movementDirection * (inputDirection ? 270 : 105) * elapsed;
      if (movingToWanderTarget && Math.abs(wanderTarget - x) < 4) {
        x = wanderTarget;
        wanderTarget = null;
      }
    }

    if (!drag && jumpCount > 0 && jumpVelocity !== 0) {
      y += jumpVelocity * elapsed;
      jumpVelocity -= 1450 * elapsed;
      if (y <= 0 && jumpVelocity <= 0) {
        y = 0;
        jumpVelocity = 0;
        jumpCount = 0;
        clearIdleAction();
        setState("landing", "land");
        window.clearTimeout(stateTimer);
        stateTimer = window.setTimeout(function () {
          setState(keys.left || keys.right ? "walking" : "idle", keys.left || keys.right ? "walk-1" : "idle");
          scheduleIdle();
          scheduleWander();
          if (keys.left || keys.right) scheduleAnimation();
        }, 220);
      } else {
        setFrame(jumpVelocity > 0 ? "jump" : "fall");
      }
    }

    if (state === "walking" && movementDirection && !jumpCount && !drag) {
      walkFrameTime += elapsed;
      if (walkFrameTime >= 0.14) {
        walkFrameTime %= 0.14;
        setFrame(sprite.dataset.frame === "walk-1" ? "walk-2" : "walk-1");
      }
    } else if (movementDirection && !jumpCount && !drag && state === "idle") {
      clearIdleTimer();
      setState("walking", "walk-1");
      walkFrameTime = 0;
    }

    renderPosition();

    if (movementDirection || jumpCount > 0 || y > 0) {
      animationFrame = window.requestAnimationFrame(update);
    } else {
      lastFrameTime = 0;
    }
  }

  function jump() {
    if (hidden || drag || state === "landing" || jumpCount >= 2) return;
    dismissHint();
    clearIdleAction();
    clearIdleTimer();
    clearWander();
    jumpCount += 1;

    if (jumpCount === 1) {
      setState("jumping", "crouch");
      window.clearTimeout(jumpTimer);
      jumpTimer = window.setTimeout(function () {
        jumpTimer = 0;
        if (hidden || !jumpCount) return;
        jumpVelocity = 570;
        setFrame("jump");
        scheduleAnimation();
      }, 100);
    } else {
      jumpVelocity = 500;
      setState("jumping", "jump");
      scheduleAnimation();
    }
  }

  function isTypingOrUsingControl(target) {
    if (target === character) return false;
    if (!(target instanceof Element)) return false;
    return target.isContentEditable || Boolean(target.closest("input, textarea, select, button, a, [role='button'], [contenteditable='true']"));
  }

  function cancelIdleForMovement() {
    if (state === "waving" || state === "looking" || state === "stretching" || state === "happy") {
      clearIdleAction();
      setState("idle", "idle");
    }
  }

  function onKeyDown(event) {
    if (!desktop.matches || hidden || event.altKey || event.ctrlKey || event.metaKey || isTypingOrUsingControl(event.target)) return;

    var key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") {
      keys.left = true;
      clearWander();
      clearIdleTimer();
      cancelIdleForMovement();
      dismissHint();
      event.preventDefault();
      if (!jumpCount && !drag && state === "idle") setState("walking", "walk-1");
      scheduleAnimation();
    } else if (key === "d" || key === "arrowright") {
      keys.right = true;
      clearWander();
      clearIdleTimer();
      cancelIdleForMovement();
      dismissHint();
      event.preventDefault();
      if (!jumpCount && !drag && state === "idle") setState("walking", "walk-1");
      scheduleAnimation();
    } else if ((event.code === "Space" || key === "arrowup") && !event.repeat) {
      event.preventDefault();
      jump();
    }
  }

  function onKeyUp(event) {
    var key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") keys.left = false;
    if (key === "d" || key === "arrowright") keys.right = false;
    if (!keys.left && !keys.right && !jumpCount && !drag && state === "walking") {
      setState("idle", "idle");
      scheduleIdle();
      scheduleWander();
    }
  }

  function react() {
    var now = Date.now();
    if (now - lastReactionTime < 100 || jumpCount > 0 || state === "landing" || (drag && drag.moved)) return;
    lastReactionTime = now;
    dismissHint();
    clearIdleAction();
    clearIdleTimer();
    clearWander();
    tickleFrame = 1 - tickleFrame;
    setState("tickled", tickleFrame ? "tickle-1" : "tickle-2");
    idleActionFrames = ["tickle-1", "tickle-2"];
    idleActionIndex = tickleFrame ? 0 : 1;
    idleFrameTimer = window.setInterval(function () {
      idleActionIndex = 1 - idleActionIndex;
      setFrame(idleActionFrames[idleActionIndex]);
    }, 100);
    stateTimer = window.setTimeout(function () {
      clearIdleAction();
      settleAfterMotion();
    }, 720);
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    clearWander();
    dismissHint();
    drag = { pointerId: event.pointerId, startX: event.clientX, startPosition: x, moved: false };
    character.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    var offset = event.clientX - drag.startX;
    if (Math.abs(offset) > 4 && !drag.moved) {
      drag.moved = true;
      clearIdleAction();
      clearIdleTimer();
      clearWander();
      window.clearTimeout(jumpTimer);
      jumpTimer = 0;
      y = 0;
      jumpVelocity = 0;
      jumpCount = 0;
      setState("dragging", "land");
    }
    if (drag.moved) {
      x = clampPosition(drag.startPosition + offset);
      if (offset) direction = Math.sign(offset);
      renderPosition();
    }
  }

  function onPointerUp(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    var wasDragging = drag.moved;
    drag = null;
    if (wasDragging) {
      suppressClickUntil = Date.now() + 250;
      setState("landing", "land");
      window.clearTimeout(stateTimer);
      stateTimer = window.setTimeout(function () {
        setState("happy", "happy");
        stateTimer = window.setTimeout(settleAfterMotion, 420);
      }, 160);
    }
  }

  function onPointerCancel(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag = null;
    settleAfterMotion();
    if (jumpCount > 0) scheduleAnimation();
  }

  function setHidden(nextHidden) {
    hidden = nextHidden;
    companion.hidden = hidden;
    toggle.setAttribute("aria-pressed", String(!hidden));
    toggle.setAttribute("aria-label", "Desktop companion " + (hidden ? "off" : "on"));
    toggle.textContent = hidden ? "pet: off" : "pet: on";
    if (hidden) {
      keys.left = false;
      keys.right = false;
      drag = null;
      y = 0;
      jumpVelocity = 0;
      jumpCount = 0;
      window.clearTimeout(jumpTimer);
      clearIdleAction();
      clearIdleTimer();
      clearWander();
      window.clearTimeout(stateTimer);
      stateTimer = 0;
      stopAnimation();
      setState("idle", "idle");
    } else {
      settleAfterMotion();
      scheduleIdle();
      scheduleWander();
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      keys.left = false;
      keys.right = false;
      clearIdleTimer();
      clearWander();
      stopAnimation();
    } else if (!hidden && desktop.matches) {
      if (jumpCount > 0) scheduleAnimation();
      else if (state === "idle") {
        scheduleIdle();
        scheduleWander();
      }
    }
  }

  function mount() {
    if (mounted) return;
    mounted = true;
    renderPosition();
    companion.hidden = false;
    hintTimer = window.setTimeout(dismissHint, 8000);
    scheduleIdle();
    scheduleWander();
    character.addEventListener("click", function (event) {
      if (Date.now() <= suppressClickUntil) {
        suppressClickUntil = 0;
        event.preventDefault();
        return;
      }
      react();
    });
    character.addEventListener("pointerdown", onPointerDown);
    character.addEventListener("pointermove", onPointerMove);
    character.addEventListener("pointerup", onPointerUp);
    character.addEventListener("pointercancel", onPointerCancel);
    toggle.addEventListener("click", function () { setHidden(!hidden); });
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", function () {
      keys.left = false;
      keys.right = false;
      if (!jumpCount && !drag && state === "walking") {
        setState("idle", "idle");
        scheduleIdle();
      }
    });
    window.addEventListener("resize", renderPosition);
  }

  function onDesktopChange() {
    if (desktop.matches) {
      if (!mounted) mount();
      else if (!hidden) {
        scheduleIdle();
        scheduleWander();
        if (jumpCount > 0) scheduleAnimation();
      }
    } else {
      clearIdleAction();
      clearIdleTimer();
      clearWander();
      window.clearTimeout(jumpTimer);
      stopAnimation();
      drag = null;
      keys.left = false;
      keys.right = false;
      y = 0;
      jumpVelocity = 0;
      jumpCount = 0;
      setState("idle", "idle");
      renderPosition();
    }
  }

  if (desktop.matches) mount();
  desktop.addEventListener("change", onDesktopChange);
  reducedMotion.addEventListener("change", function () {
    if (reducedMotion.matches) {
      clearWander();
      clearIdleTimer();
    } else {
      scheduleIdle();
      scheduleWander();
    }
  });
}());
