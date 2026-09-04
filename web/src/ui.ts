export interface UIControllerOptions {
  roomCount: number;
  initialRoom: number;
  onRoomChange: (newIndex: number) => void;
  onMotionToggle: (enabled: boolean) => void;
}

export class UIController {
  private container: HTMLElement;
  private uiWrapper!: HTMLDivElement;
  private roomCount: number;
  private currentRoom: number;
  private onRoomChange: (newIndex: number) => void;
  private onMotionToggle: (enabled: boolean) => void;

  private prevBtn!: HTMLButtonElement;
  private nextBtn!: HTMLButtonElement;
  private dotTabs: HTMLButtonElement[] = [];
  private roomLabel!: HTMLElement;
  private motionToggleBtn!: HTMLButtonElement;
  
  public isMotionEnabled: boolean;

  private touchStartX: number = 0;
  private touchEndX: number = 0;

  constructor(container: HTMLElement, options: UIControllerOptions) {
    this.container = container;
    this.roomCount = options.roomCount;
    this.currentRoom = options.initialRoom;
    this.onRoomChange = options.onRoomChange;
    this.onMotionToggle = options.onMotionToggle;

    // Check prefers-reduced-motion default
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.isMotionEnabled = !prefersReducedMotion;

    this.renderUI();
    this.attachEventListeners();
    this.updateState(this.currentRoom);
  }

  private renderUI() {
    this.uiWrapper = document.createElement('div');
    this.uiWrapper.className = 'museum-ui-overlay';
    this.uiWrapper.style.position = 'absolute';
    this.uiWrapper.style.inset = '0';
    this.uiWrapper.style.pointerEvents = 'none';

    this.uiWrapper.innerHTML = `
      <style>
        .museum-ui {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, sans-serif;
          color: #111111;
        }

        .museum-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: auto;
        }

        .museum-title {
          font-size: 1.25rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.85);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .ui-btn {
          min-width: 44px;
          min-height: 44px;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #333333;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          pointer-events: auto;
          outline-offset: 3px;
        }

        .ui-btn:focus-visible, .dot-tab:focus-visible {
          outline: 3px solid #005fcc;
        }

        .museum-nav-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.85);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          align-self: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .tab-list {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .dot-tab {
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          outline-offset: 3px;
        }

        .dot-icon {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #808080;
          transition: transform 0.2s, background 0.2s;
        }

        .dot-tab[aria-selected="true"] .dot-icon {
          background: #000000;
          transform: scale(1.3);
        }

        .room-counter {
          font-weight: 600;
          font-size: 1rem;
          min-width: 80px;
          text-align: center;
        }
      </style>

      <div class="museum-ui">
        <header class="museum-header">
          <div class="museum-title">Virtual Museum</div>
          <button id="motion-toggle-btn" class="ui-btn" aria-label="Toggle Animation">
            ${this.isMotionEnabled ? 'Motion: ON' : 'Motion: OFF'}
          </button>
        </header>

        <nav class="museum-nav-bar" aria-label="Museum Room Navigation">
          <button id="prev-room-btn" class="ui-btn" aria-label="Previous Room">
            &larr; Back
          </button>

          <div class="tab-list" role="tablist" aria-label="Room Tabs">
            ${Array.from({ length: this.roomCount })
              .map(
                (_, idx) => `
              <button
                class="dot-tab"
                role="tab"
                data-index="${idx}"
                aria-label="Room ${idx + 1}"
                aria-selected="${idx === this.currentRoom}"
                tabindex="${idx === this.currentRoom ? '0' : '-1'}"
              >
                <span class="dot-icon"></span>
              </button>
            `
              )
              .join('')}
          </div>

          <span id="room-label" class="room-counter" aria-live="polite">
            Room ${this.currentRoom + 1} / ${this.roomCount}
          </span>

          <button id="next-room-btn" class="ui-btn" aria-label="Next Room">
            Next &rarr;
          </button>
        </nav>
      </div>
    `;

    this.container.appendChild(this.uiWrapper);

    this.prevBtn = this.uiWrapper.querySelector('#prev-room-btn')!;
    this.nextBtn = this.uiWrapper.querySelector('#next-room-btn')!;
    this.motionToggleBtn = this.uiWrapper.querySelector('#motion-toggle-btn')!;
    this.roomLabel = this.uiWrapper.querySelector('#room-label')!;
    this.dotTabs = Array.from(this.uiWrapper.querySelectorAll('.dot-tab'));
  }

  private attachEventListeners() {
    this.prevBtn.addEventListener('click', () => this.navigateRelative(-1));
    this.nextBtn.addEventListener('click', () => this.navigateRelative(1));

    this.motionToggleBtn.addEventListener('click', () => {
      this.isMotionEnabled = !this.isMotionEnabled;
      this.motionToggleBtn.textContent = this.isMotionEnabled ? 'Motion: ON' : 'Motion: OFF';
      this.onMotionToggle(this.isMotionEnabled);
    });

    this.dotTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const idx = parseInt(tab.getAttribute('data-index') || '0', 10);
        this.goToRoom(idx);
      });
    });

    // Keyboard navigation
    window.addEventListener('keydown', this.handleKeyDown);

    // Touch swipe support
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      this.navigateRelative(-1);
    } else if (e.key === 'ArrowRight') {
      this.navigateRelative(1);
    }
  };

  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    if (e.changedTouches.length > 0) {
      this.touchEndX = e.changedTouches[0].clientX;
      const diffX = this.touchEndX - this.touchStartX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.navigateRelative(-1); // Swipe right -> prev
        } else {
          this.navigateRelative(1);  // Swipe left -> next
        }
      }
    }
  };

  public navigateRelative(delta: number) {
    this.goToRoom(this.currentRoom + delta);
  }

  public goToRoom(index: number) {
    if (index < 0 || index >= this.roomCount) return;
    this.currentRoom = index;
    this.updateState(this.currentRoom);
    this.onRoomChange(this.currentRoom);
  }

  private updateState(roomIndex: number) {
    this.currentRoom = roomIndex;
    this.roomLabel.textContent = `Room ${roomIndex + 1} / ${this.roomCount}`;

    this.prevBtn.disabled = roomIndex === 0;
    this.nextBtn.disabled = roomIndex === this.roomCount - 1;

    this.dotTabs.forEach((tab, idx) => {
      const isSelected = idx === roomIndex;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });
  }

  public renderFallbackUI(message: string) {
    this.container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #B0B0B0;
        font-family: system-ui, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <img src="fallback.png" alt="Museum Preview Fallback" style="max-width: 400px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
        <h2 style="margin-top: 1.5rem; color: #111111;">${message}</h2>
      </div>
    `;
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
    if (this.uiWrapper && this.uiWrapper.parentNode) {
      this.uiWrapper.parentNode.removeChild(this.uiWrapper);
    }
  }
}
