import './attacker-preview.css';
import {mountBoard} from '../pixi/board-runtime.js';
const board=await mountBoard(document);window.__board=board;window.addEventListener('pagehide',()=>board.dispose(),{once:true});
