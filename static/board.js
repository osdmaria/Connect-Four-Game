import * as THREE from 'three';

const boardSize = 7;
const cellSize = 0.5;
const board = new THREE.Group();

function createBoard(){
    for (let j = 0; j < 7; j++) {
        for (let i = 0; i < 6; i++) {
          const cellGeometry = new THREE.BoxGeometry(cellSize, cellSize, 0.3);
          const cellMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent:true, opacity: 0});
          const cell = new THREE.Mesh(cellGeometry, cellMaterial);
          cell.position.set(1.15*j - 6 / 2 + 20.5, 0.95*i - 7 / 2 + 1, 39.5);
          board.add(cell);
        }
      }
      console.log("added")
    console.log(board)
    return board
}

const coinRadius = 0.4;
const coinGeometry = new THREE.CylinderGeometry(coinRadius, coinRadius, 0.35);

const players = [0xff0000, 0xffff00]


function addCoin(scene,board, row, col, player) {
    const coinMaterial = new THREE.MeshBasicMaterial({ color:players[player-1] });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    console.log(board.position)
    coin.position.set( board.children[((col-1)*6)+(6-row)].position.x, board.children[((col-1)*6)+(6-row)].position.y, board.children[((col-1)*6)+(6-row)].position.z);
    coin.rotation.x = Math.PI / 2;
    console.log(board.children[2].position.x)
    scene.add(coin);
    console.log(coin.position)
  }

  // Example: Add a red coin to column 3
//   addCoin(3, 1); // red color

export {addCoin, createBoard}