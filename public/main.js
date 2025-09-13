import { DigGameSession } from '../models/DigGameSession.js';
import { VisualManager } from './VisualManager.js'
import { initI18n } from './lang/i18n.js';






// session.runDigGameSession();


async function main() {
  await initI18n();
  const canvas = document.getElementById('canvas');
  const vm = new VisualManager(canvas);

  vm.resizeCanvas();

  window.addEventListener('resize', () => vm.resizeCanvas());
  const session = new DigGameSession();
}

main();