import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { MuseumGallery, ROOM_SPACING } from '../src/museum.ts';

if (typeof window === 'undefined') {
  (global as any).window = {
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe('MuseumGallery Room Windowing', () => {
  const seeds = [10, 20, 30, 40, 50, 60, 70, 80];
  const container = {
    appendChild: () => {},
  } as any;

  it('initializes with 3-room window (rooms 0, 1)', () => {
    const gallery = new MuseumGallery(container, seeds);
    gallery.setRoom(0);

    const sceneChildrenCount = gallery.scene.children.filter(
      (c) => c.type === 'Group'
    ).length;
    
    assert.strictEqual(sceneChildrenCount, 2);
    assert.strictEqual(gallery.camera.position.z, 3);
    gallery.destroy();
  });

  it('updates room window on navigation and caps active rooms at 3', () => {
    const gallery = new MuseumGallery(container, seeds);
    
    gallery.setRoom(3);
    const sceneChildrenCount = gallery.scene.children.filter(
      (c) => c.type === 'Group'
    ).length;

    assert.strictEqual(sceneChildrenCount, 3);
    assert.strictEqual(gallery.camera.position.z, -3 * ROOM_SPACING + 3);

    gallery.destroy();
  });
});
