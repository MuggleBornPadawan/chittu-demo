import { parseTourUrl, buildTourUrl } from './url.ts';
import { MuseumGallery } from './museum.ts';
import { UIController } from './ui.ts';

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const tourState = parseTourUrl(window.location.search);

  // WebGL Fallback Check
  if (!isWebGLAvailable()) {
    const ui = new UIController(appContainer, {
      roomCount: tourState.seeds.length,
      initialRoom: tourState.roomIndex,
      onRoomChange: () => {},
      onMotionToggle: () => {},
    });
    ui.renderFallbackUI('WebGL needed for 3D tour');
    return;
  }

  // 3D Museum Gallery instantiation
  const gallery = new MuseumGallery(appContainer, tourState.seeds);
  gallery.setRoom(tourState.roomIndex);

  // Accessible UI Controller instantiation
  const ui = new UIController(appContainer, {
    roomCount: tourState.seeds.length,
    initialRoom: tourState.roomIndex,
    onRoomChange: (newRoomIndex) => {
      gallery.setRoom(newRoomIndex);
      const newUrl = buildTourUrl(tourState.seeds, tourState.artVersion, newRoomIndex);
      window.history.replaceState(null, '', newUrl);
    },
    onMotionToggle: (enabled) => {
      gallery.setAnimationEnabled(enabled);
    },
  });

  // Apply initial motion setting from UI controller (respects prefers-reduced-motion)
  gallery.setAnimationEnabled(ui.isMotionEnabled);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
