import * as THREE from 'three';
import gsap from './node_modules/gsap/all.js';

const boardSize = 7;
const cellSize = 0.5;
const board = new THREE.Group();

function createBoard(){
    for (let j = 0; j < 7; j++) {
        for (let i = 0; i < 6; i++) {
          const cellGeometry = new THREE.BoxGeometry(cellSize, cellSize, 0.3);
          const cellMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent:true, opacity: 0});
          const cell = new THREE.Mesh(cellGeometry, cellMaterial);
          cell.position.set(1.15*j - 6 / 2 + 20.5, 0.95*i - 7 / 2 + 1, 42.5);
          board.add(cell);
        }
      }
    return board
}

const coinRadius = 0.4;
const coinGeometry = new THREE.CylinderGeometry(coinRadius, coinRadius, 0.35);

const players = [0xff0000, 0xffff00]



function addCoin(scene, board, row, col, player) {
  const coinMaterial = new THREE.MeshBasicMaterial({ color: players[player - 1] });
  const coin = new THREE.Mesh(coinGeometry, coinMaterial);
  coin.position.set(1.15*(col-1) - 6 / 2 + 20.5, 3, 42.5); // Start the coin above the board

  // Add the coin to the scene initially so that it's visible during the animation
  coin.rotation.x = Math.PI / 2;
  scene.add(coin);

  // Calculate the final position of the coin
  const finalPosition = new THREE.Vector3(
      board.children[((col - 1) * 6) + (6 - row)].position.x,
      board.children[((col - 1) * 6) + (6 - row)].position.y,
      board.children[((col - 1) * 6) + (6 - row)].position.z
  );

  // GSAP animation for dropping the coin
  gsap.to(coin.position, {
      duration: 1,
      x: finalPosition.x,
      y: finalPosition.y,
      z: finalPosition.z,
      ease: 'bounce.out', // You can adjust the easing function as needed
      onComplete: () => {
          // Animation complete, remove the coin from the scene if needed
          // scene.remove(coin);
      }
  });


}




  // Example: Add a red coin to column 3
//   addCoin(3, 1); // red color

export {createBoard, addCoin}