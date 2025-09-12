import { DigGameSession } from '../models/DigGameSession.js';
import { VisualManager } from './VisualManager.js'


// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('canvas');

const vm = new VisualManager(canvas);

vm.resizeCanvas();
window.addEventListener('resize', () => vm.resizeCanvas());


const session = new DigGameSession();

// session.runDigGameSession();
