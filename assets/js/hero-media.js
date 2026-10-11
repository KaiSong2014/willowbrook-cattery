/* The scroll scene owns position/scale; this controller owns decoded media and blends. */
(() => {
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const FRAME_COUNT = 180;
  const START = .015;
  const END = .80;
  const BLEND_MS = 1000;
  const CACHE_LIMIT = 18;
  // Give the ball play and the doorway their own scroll beats.
  const BEATS = [[0, 0], [.18, 55], [.45, 90], [.68, 135], [.95, 170], [1, FRAME_COUNT - 1]];

  class HeroMedia {
    constructor({ canvas, handoff, video, endVideo, reduced = false, onIdleReady }) {
      Object.assign(this, { canvas, handoff, video, endVideo, reduced, onIdleReady });
      this.context = canvas.getContext('2d', { alpha: false });
      this.handoffContext = handoff.getContext('2d', { alpha: false });
      this.cache = new Map();
      this.loading = new Set();
      this.attempts = new Map();
      this.retryAfter = new Map();
      this.timers = new Set();
      this.queue = [];
      this.progress = 0;
      this.target = 19;
      this.shown = -1;
      this.startFrame = 19;
      this.direction = 1;
      this.mode = 'idle';
      this.weights = [0, 1, 0];
      this.visible = true;
      this.endReady = false;
      this.endStarting = false;
      this.generation = 0;
      this.disposed = false;
      this.unlisten = [];
      handoff.classList.remove('is-fading');
      [handoff, video, canvas, endVideo].forEach((element, index) => {
        if (!element) return;
        element.style.zIndex = String(index);
        element.style.transition = 'none';
      });
      handoff.style.opacity = '0';
      this._applyWeights();
      this._status();
      if (reduced) {
        video.pause();
        endVideo?.pause();
        return;
      }

      const markIdleReady = () => {
        if (this.disposed || this.idleReady) return;
        this.idleReady = true;
        this._applyWeights();
        this.onIdleReady?.();
        if (this.mode === 'idle') this._request(19, true);
      };
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(markIdleReady);
      } else {
        this._listen(video, 'playing', () => {
          if (video.readyState >= 2) requestAnimationFrame(() => requestAnimationFrame(markIdleReady));
        });
        if (!video.paused && video.readyState >= 2) {
          requestAnimationFrame(() => requestAnimationFrame(markIdleReady));
        }
      }
      this._listen(video, 'error', () => {
        this.idleFailed = true;
        if (this.hasCanvas && this.mode === 'idle') this._fadeTo([1, 0, 0]);
      });
      if (endVideo) {
        this._listen(endVideo, 'loadeddata', () => this._tryEnd());
        this._listen(endVideo, 'canplay', () => this._tryEnd());
        this._listen(endVideo, 'error', () => {
          this.endFailed = true;
          this.endStarting = false;
          this.endReady = false;
          if (this.mode === 'end') this._fadeTo([1, 0, 0]);
        });
      }
      this._listen(document, 'visibilitychange', () => {
        if (document.hidden) {
          this.hiddenAt = performance.now();
          cancelAnimationFrame(this.raf);
          this.raf = 0;
        } else {
          if (this.blend && this.hiddenAt) this.blend.start += performance.now() - this.hiddenAt;
          this.hiddenAt = 0;
          if (this.blend) this._scheduleBlend();
          this._pump();
          this._tryEnd();
        }
        this._syncPlayback();
      });
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(entries => {
          this.visible = entries[0].isIntersecting;
          this._syncPlayback();
          if (this.visible) {
            this._pump();
            this._tryEnd();
          }
        });
        this.observer.observe(canvas.closest('section') || canvas);
      }
      this._syncPlayback();
    }

    _listen(element, type, handler) {
      element.addEventListener(type, handler);
      this.unlisten.push(() => element.removeEventListener(type, handler));
    }

    _status() {
      this.canvas.dataset.mediaState = this.blend ? `${this.mode}-blending` : this.mode;
      this.canvas.dataset.frameTarget = String(this.target + 1);
      this.canvas.dataset.frameShown = this.shown < 0 ? '' : String(this.shown + 1);
      this.canvas.dataset.frameCache = String(this.cache.size);
    }

    update(progress) {
      if (this.reduced || this.disposed) return;
      const previous = this.progress;
      this.progress = clamp(progress);
      if (Math.abs(progress - previous) > .00001) this.direction = progress >= previous ? 1 : -1;
      if (progress <= .002) {
        if (this.mode !== 'idle') {
          this.generation++;
          this.mode = 'idle';
          this.endStarting = false;
          this.endReady = false;
          this._fadeTo(this.idleFailed ? [1, 0, 0] : [0, 1, 0]);
        }
        if (this.idleReady || this.idleFailed) this._request(19, true);
      } else {
        if (this.mode === 'idle' && progress > START) this._leaveIntro();
        if (this.mode !== 'idle') {
          if (this.mode === 'end' && progress < END - .02) {
            this.generation++;
            this.endStarting = false;
            this.endReady = false;
            this.mode = 'sequence';
            this._fadeTo([1, 0, 0]);
          }
          const position = clamp((progress - START) / (END - START));
          let frame = FRAME_COUNT - 1;
          for (let beat = 1; beat < BEATS.length; beat++) {
            if (position > BEATS[beat][0]) continue;
            const [fromProgress, fromFrame] = BEATS[beat - 1];
            const [toProgress, toFrame] = BEATS[beat];
            const firstFrame = beat === 1 ? this.startFrame : fromFrame;
            frame = firstFrame + (toFrame - firstFrame)
              * (position - fromProgress) / (toProgress - fromProgress);
            break;
          }
          this._request(this.mode === 'end' ? FRAME_COUNT - 1 : frame);
          if (progress >= END && this.mode !== 'end') {
            this.mode = 'end';
            this._ensureEndSource();
            this._tryEnd();
          }
        }
      }
      // A small bounded head start warms the end decoder before the endpoint.
      if (progress > .45 && progress < .94) this._ensureEndSource();
      // A restored scroll position may have decoded the end video while offscreen.
      if (this.mode === 'end' && progress >= END - .02 && progress < .94) this._tryEnd();
      this._syncPlayback();
      this._status();
    }

    _leaveIntro() {
      this.generation++;
      this.mode = 'sequence-pending';
      const duration = Number.isFinite(this.video.duration) ? this.video.duration : 3.125;
      const time = this.video.currentTime || 0;
      // The opening asset plays its first source frames forward, then backward.
      this.startFrame = clamp(Math.round(Math.min(time, Math.max(0, duration - time)) * 12), 0, 19);
      // Keep the living loop running until a matching decoded canvas frame is visible.
    }

    _request(index, warming = false) {
      this.target = clamp(Math.round(index), 0, FRAME_COUNT - 1);
      // Warm the next few action frames only after the loop is visibly playing.
      // Keep the endpoint in the queue for direct anchor jumps.
      const next = warming ? [this.target, this.target + 1, this.target + 2, this.target + 3, FRAME_COUNT - 1] : [this.target];
      const ahead = 9;
      for (let step = 1; step <= ahead; step++) next.push(this.target + step * this.direction);
      for (let step = 1; step <= 3; step++) next.push(this.target - step * this.direction);
      if (this.progress > .60) next.push(FRAME_COUNT - 1);
      this.queue = [...new Set(next.filter(frame => frame >= 0 && frame < FRAME_COUNT))];
      this._paintClosest();
      this._pump();
    }

    _pump() {
      if (this.disposed || document.hidden || !this.visible || this.progress >= .94) return;
      while (this.loading.size < 4) {
        const now = performance.now();
        const index = this.queue.find(frame => !this.cache.has(frame) && !this.loading.has(frame)
          && (this.attempts.get(frame) || 0) < 2 && (this.retryAfter.get(frame) || 0) <= now);
        if (index === undefined) return;
        this.loading.add(index);
        this.attempts.set(index, (this.attempts.get(index) || 0) + 1);
        const image = new Image();
        image.decoding = 'async';
        image.fetchPriority = index === this.target ? 'high' : 'low';
        image.src = `assets/frames/frame_${String(index + 1).padStart(4, '0')}.webp`;
        image.decode().then(() => {
          if (this.disposed) return;
          this.attempts.delete(index);
          this.retryAfter.delete(index);
          this.cache.set(index, image);
          this._evict();
          this._paintClosest();
          this._tryEnd();
        }).catch(() => {
          if (this.disposed || this.attempts.get(index) >= 2) return;
          this.retryAfter.set(index, performance.now() + 600);
          const timer = setTimeout(() => {
            this.timers.delete(timer);
            this._pump();
          }, 620);
          this.timers.add(timer);
        }).finally(() => {
          this.loading.delete(index);
          this._pump();
          this._status();
        });
      }
    }

    _evict() {
      // Keep the current bounded prefetch window, including the endpoint warmup.
      // Evicting a queued success would make _pump download it forever.
      const wanted = new Set(this.queue);
      while (this.cache.size > CACHE_LIMIT) {
        let discard;
        let farthest = -1;
        for (const frame of this.cache.keys()) {
          if (frame === this.shown || frame === this.target || frame === FRAME_COUNT - 1 || wanted.has(frame)) continue;
          const distance = Math.abs(frame - this.target);
          if (distance > farthest) { farthest = distance; discard = frame; }
        }
        if (discard === undefined) break;
        this.cache.delete(discard);
      }
    }

    _paintClosest() {
      if (!this.cache.size || this.disposed) return;
      // Keep the outgoing image intact while reversing all the way to the intro.
      if (this.mode === 'idle' && this.weights[0] > .001) return;
      let nearest = this.cache.has(this.target) ? this.target : -1;
      if (nearest < 0) {
        for (const frame of this.cache.keys()) {
          if (nearest < 0 || Math.abs(frame - this.target) < Math.abs(nearest - this.target)) nearest = frame;
        }
      }
      if (nearest !== this.shown) {
        this.context.drawImage(this.cache.get(nearest), 0, 0, this.canvas.width, this.canvas.height);
        this.shown = nearest;
        this.hasCanvas = true;
      }
      if (this.mode === 'sequence-pending' && Math.abs(this.shown - this.target) <= 1) {
        this.mode = 'sequence';
        this._fadeTo([1, 0, 0]);
      }
      if (this.mode === 'end' && !this.endReady && !this.endStarting && this.shown === FRAME_COUNT - 1) {
        this._fadeTo([1, 0, 0]);
      }
      this._status();
    }

    _ensureEndSource() {
      if (!this.endVideo || this.endLoaded || this.endFailed) return;
      this.endLoaded = true;
      this.endVideo.preload = 'auto';
      if (!this.endVideo.getAttribute('src')) {
        this.endVideo.src = this.endVideo.dataset.src || 'assets/video/hero-end-loop.mp4';
      }
      this.endVideo.load();
    }

    _tryEnd() {
      const video = this.endVideo;
      if (!video || this.disposed || this.mode !== 'end' || this.progress >= .94 || document.hidden
        || !this.visible || this.endFailed || this.endReady || this.endStarting
        || video.readyState < 2 || this.shown !== FRAME_COUNT - 1) return;
      this.endStarting = true;
      const generation = this.generation;
      const current = () => !this.disposed && generation === this.generation && this.mode === 'end';
      const reveal = () => {
        if (!current()) return;
        this.endStarting = false;
        this.endReady = true;
        this._fadeTo([0, 0, 1]);
        this._syncPlayback();
      };
      const play = () => {
        if (!current()) return;
        video.play().then(() => {
          if (!current()) { this._syncPlayback(); return; }
          if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(reveal);
          else requestAnimationFrame(() => requestAnimationFrame(reveal));
        }).catch(() => { if (current()) this.endStarting = false; });
      };
      if (video.currentTime > .04) {
        video.addEventListener('seeked', play, { once: true });
        video.currentTime = 0;
      } else play();
    }

    _captureMatte() {
      const context = this.handoffContext;
      const draw = (source, opacity = 1) => {
        try {
          context.globalAlpha = opacity;
          context.drawImage(source, 0, 0, this.handoff.width, this.handoff.height);
          return true;
        } catch (_) { return false; }
      };
      if (!this.matteReady) {
        if (this.hasCanvas) this.matteReady = draw(this.canvas);
        else if (this.video.readyState >= 2) this.matteReady = draw(this.video);
      }
      if (this.hasCanvas && this.weights[0] > 0) draw(this.canvas, this.weights[0]);
      if (this.video.readyState >= 2 && this.weights[1] > 0) draw(this.video, this.weights[1]);
      if (this.endVideo?.readyState >= 2 && this.weights[2] > 0) draw(this.endVideo, this.weights[2]);
      context.globalAlpha = 1;
      this.handoff.style.opacity = this.matteReady ? '1' : '0';
    }

    _fadeTo(target) {
      if (this.disposed) return;
      if (this.blend?.target.every((value, i) => value === target[i])) return;
      if (!this.blend && target.every((value, i) => value === this.weights[i])) return;
      this.blend = { from: this.weights.slice(), target, start: performance.now() };
      this._scheduleBlend();
      this._status();
    }

    _scheduleBlend() {
      if (this.raf || document.hidden || this.disposed) return;
      this.raf = requestAnimationFrame(time => {
        this.raf = 0;
        const blend = this.blend;
        if (!blend) return;
        const t = clamp((time - blend.start) / BLEND_MS);
        const ease = t * t * (3 - 2 * t);
        this.weights = blend.target.map((value, i) => blend.from[i] + (value - blend.from[i]) * ease);
        this._applyWeights();
        if (t < 1) this._scheduleBlend();
        else {
          this.blend = null;
          this.handoff.style.opacity = '0';
          this.matteReady = false;
          this._syncPlayback();
          this._status();
        }
      });
    }

    _applyWeights() {
      // Each outgoing layer stays opaque behind the incoming one. Two half-opacity
      // layers would expose the scene background at the midpoint of a crossfade.
      this.video.style.opacity = this.idleReady && !this.idleFailed ? '1' : '0';
      this.canvas.style.opacity = String(this.mode === 'end' || this.weights[2] > 0
        ? 1 : this.weights[0]);
      if (this.endVideo) this.endVideo.style.opacity = String(this.weights[2]);
    }

    _syncPlayback() {
      const active = !this.disposed && !this.reduced && !document.hidden && this.visible && this.progress < .94;
      if (active && (this.mode === 'idle' || this.mode === 'sequence-pending'
        || this.weights[1] > .001) && !this.idleFailed) {
        if (this.video.paused) this.video.play().catch(() => {});
      } else this.video.pause();
      if (!this.endVideo) return;
      if (active && (this.mode === 'end' || this.weights[2] > .001)
        && (this.endReady || this.endStarting)) {
        if (this.endVideo.paused) this.endVideo.play().catch(() => {});
      } else this.endVideo.pause();
    }

    destroy() {
      this.disposed = true;
      this.generation++;
      cancelAnimationFrame(this.raf);
      this.observer?.disconnect();
      this.unlisten.forEach(remove => remove());
      this.timers.forEach(clearTimeout);
      this.video.pause();
      this.endVideo?.pause();
      this.queue = [];
      this.cache.clear();
    }
  }

  window.HeroMedia = HeroMedia;
})();
