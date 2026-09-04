import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UIController } from '../src/ui.ts';

if (typeof window === 'undefined') {
  (global as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false }),
  };
}

if (typeof document === 'undefined') {
  (global as any).document = {
    createElement: () => {
      const makeBtn = (id: string) => {
        const btnListeners: Record<string, Function[]> = {};
        const btn = {
          id,
          textContent: '',
          disabled: false,
          setAttribute: () => {},
          getAttribute: () => null,
          addEventListener: (evt: string, fn: Function) => {
            if (!btnListeners[evt]) btnListeners[evt] = [];
            btnListeners[evt].push(fn);
          },
          click: () => {
            if (btnListeners['click']) {
              btnListeners['click'].forEach((f) => f());
            }
          },
        };
        return btn;
      };

      const prevBtn = makeBtn('prev-room-btn');
      const nextBtn = makeBtn('next-room-btn');
      const motionBtn = makeBtn('motion-toggle-btn');
      const roomLabel = { textContent: '' };
      const dotTabs = Array.from({ length: 8 }, (_, i) => {
        const tab = makeBtn(`dot-${i}`);
        return tab;
      });

      const el: any = {
        style: {},
        innerHTML: '',
        querySelector: (sel: string) => {
          if (sel === '#prev-room-btn') return prevBtn;
          if (sel === '#next-room-btn') return nextBtn;
          if (sel === '#motion-toggle-btn') return motionBtn;
          if (sel === '#room-label') return roomLabel;
          return null;
        },
        querySelectorAll: (sel: string) => {
          if (sel === '.dot-tab') return dotTabs;
          return [];
        },
      };
      return el;
    },
  };
}

describe('UIController Navigation & Accessibility', () => {
  it('initializes and handles room navigation', () => {
    let changedRoom = -1;

    const mockContainer: any = {
      appendChild: () => {},
      innerHTML: '',
    };

    const ui = new UIController(mockContainer, {
      roomCount: 8,
      initialRoom: 0,
      onRoomChange: (idx) => { changedRoom = idx; },
      onMotionToggle: () => {},
    });

    assert.strictEqual(ui.isMotionEnabled, true);

    // Navigate next
    ui.goToRoom(1);
    assert.strictEqual(changedRoom, 1);

    ui.destroy();
  });
});
