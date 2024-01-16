from math import inf
import random
import math
import time
from copy import deepcopy

# turns
PLAYER1_TURN = False
PLAYER2_TURN = True


# pieces represented as numbers
PLAYER1_PIECE = 1
PLAYER2_PIECE = 2
class ConnectFourBoard:
    def __init__(self):
        self.rows = 6
        self.cols = 7
        self.board = [[0] * self.cols for _ in range(self.rows)]

    def drawBoard(self):
        for row in self.board:
            print("|".join(map(str, row)))
        print("-" * (self.cols * 2 - 1))

    def getPossibleMoves(self):
        available_moves = []
        for col in range(len(self.board[0])):
            for row in range(len(self.board) - 1, -1, -1):
                if self.board[row][col] == 0:
                    available_moves.append((row, col))
                    break      
        return available_moves
    def make_human_move(self, column,player):
        if self.is_valid_move(column):
            piece = PLAYER2_PIECE if player == PLAYER2_TURN  else PLAYER1_PIECE
            for row in range(self.rows - 1, -1, -1):
                if self.board[row][column] == 0:
                    self.board[row][column] = piece
                    break
        else: print("invalid move")        
    def makeMove(self, row, col, player):
        if player == PLAYER1_TURN:
            self.board[row][col] = PLAYER1_PIECE
        else: self.board[row][col] = PLAYER2_PIECE    
    def is_valid_move(self, column):
        return 0 <= column < self.cols and self.board[0][column] == 0
    
    def win(self, player):
        piece = PLAYER2_PIECE if player == PLAYER2_TURN  else PLAYER1_PIECE
        # Check for a win horizontally
        for row in range(self.rows):
            for col in range(self.cols - 3):
                if all(self.board[row][col + i] == piece for i in range(4)):
                    return True 

        # Check for a win vertically
        for col in range(self.cols):
            for row in range(self.rows - 3):
                if all(self.board[row + i][col] == piece for i in range(4)):
                    return True

        # Check for a win diagonally
        for row in range(self.rows - 3):
            for col in range(self.cols - 3):
                if all(self.board[row + i][col + i] == piece for i in range(4)):
                    return True

        # Check for a win anti-diagonally
        for row in range(3, self.rows):
            for col in range(self.cols - 3):
                if all(self.board[row - i][col + i] == piece for i in range(4)):
                    return True

        return False

    def gameOver(self):
        return self.win(PLAYER1_TURN) or self.win(PLAYER2_TURN) or all(self.board[0][col] != 0 for col in range(self.cols))
    def getOutcome(self,player):
        if self.win(player):
            return 1
        if self.win(not player):
            return 2
        return 0
    def copy_from(self, other):
        self.board = [row[:] for row in other.board]

    def heuristicEval(self,player):
        if self.win(PLAYER2_TURN): return 99999999999999999
        elif self.win(PLAYER1_TURN): return -99999999999999999
        else: return 3.14*self.count_blocks(player,3)+1.41*self.center_heuristic(player)+2.72*self.countAlignedPieces(player)


    def center_heuristic(self, player):
        piece = PLAYER2_PIECE if player == PLAYER2_TURN else PLAYER1_PIECE
        center_bonus = [1, 2, 5, 10, 5, 2, 1]  # Higher scores for center columns

        score = 0
        def count_piece_in_column(col, piece):
            count = 0
            for row in range(self.rows):
                if self.board[row][col] == piece:
                    count += 1
            return count
        for col in range(self.cols):
            score += center_bonus[col] * (count_piece_in_column(col, piece) + 1)

        return score
    
    def count_blocks(self, player, length):
        block_count = 0
        piece = PLAYER2_PIECE if player == PLAYER2_TURN else PLAYER1_PIECE
        opp_piece = PLAYER1_PIECE if player == PLAYER1_TURN else PLAYER2_PIECE

        # Check for potential horizontal blocks
        for row in range(self.rows):
            for col in range(self.cols - length):
                if all(self.board[row][col + i] == opp_piece for i in range(length)) and \
                        self.board[row][col + length] == piece:
                    block_count += length*(block_count+1)

        # Check for potential vertical blocks
        for col in range(self.cols):
            for row in range(length , self.rows):
                if all(self.board[row - i][col] == opp_piece for i in range(length)) and \
                        self.board[row-length][col] == piece:
                    block_count += length*(block_count+1)

        # Check for potential diagonal blocks
        for row in range(length, self.rows):
            for col in range(length,self.cols):
                if all(self.board[row - i][col - i] == opp_piece for i in range(length)) and \
                        self.board[row -length][col - length] == piece:
                    block_count += length*(block_count+1)

        # Check for potential anti-diagonal blocks
        for row in range(length, self.rows):
            for col in range(self.cols - length):
                if all(self.board[row - i][col + i] == opp_piece for i in range(length)) and \
                        self.board[row -length][col + length] == piece:
                    block_count += length*(block_count+1)

        return block_count

    def AlignedPieces(self,line,player):
        score = 0
        piece = PLAYER2_PIECE if player == PLAYER2_TURN else PLAYER1_PIECE
        opp_piece = PLAYER1_PIECE if player == PLAYER1_TURN else PLAYER2_PIECE

        if line.count(piece) == 4:
            score += 100
        elif line.count(piece) == 3 and line.count(0) == 1:
            score += 25
        elif line.count(piece) == 2 and line.count(0) == 2:
            score += 5

        # or decrese it if the oponent has 3 in a row
        if line.count(opp_piece) == 3 and line.count(0) == 1:
            score -= 24  
        return score

        
    def countAlignedPieces(self,player):
        count = 0
        # count horizontal
        for r in range(self.rows):
            row_array = row_array = [i for i in self.board[r]]
            for c in range(self.cols - 3):
                line = row_array[c:c + 4]
                count += self.AlignedPieces(line, player)

        # count vertical
        for c in range(self.cols):
            col_array = [int(row[c]) for row in self.board]
            for r in range(self.rows-3):
                line = col_array[r:r+4]
                count += self.AlignedPieces(line, player)

        # count positively sloped diagonals
        for r in range(3,self.rows):
            for c in range(self.cols - 3):
                line = [self.board[r-i][c+i] for i in range(4)]
                count += self.AlignedPieces(line, player)

        # count negatively sloped diagonals
        for r in range(3,self.rows):
            for c in range(3,self.cols):
                line = [self.board[r-i][c-i] for i in range(4)]
                count += self.AlignedPieces(line, player)
        return count  
class Node:
    def __init__(self, state, parent,player,move):
        self.state = state  # Game state (ConnectFourBoard instance)
        self.parent = parent
        self.move = move
        self.children = []  # Child nodes
        self.visits = 0
        self.wins = 0
        self.player = player

    def select_child(self, exploration_weight=2.71):
        if self.visits == 0 :
            return 9999999999999
        else:
            #return max(self.children, key=lambda child: child.wins / child.visits + exploration_weight * math.sqrt(math.log(self.visits) / child.visits))  
            return  self.wins / self.visits + exploration_weight * math.sqrt(math.log(self.visits) / self.visits +1)      
class MCTS:
    def __init__(self,state, exploration_weight=2.71):
        self.root = Node(state,None,PLAYER1_TURN,None)
        self.exploration_weight = exploration_weight

    def select(self, root):
        node  = root
        while len(node.children) != 0:
           max_value = max(node.children, key=lambda n: n.select_child()).select_child()
           max_nodes = [n for n in node.children if n.select_child() == max_value]
           node = random.choice(max_nodes)

        if self.expand(node):
            node = random.choice(node.children)
        return node        

    def expand(self, node):
        if node.state.gameOver():
            return False
        possible_moves = node.state.getPossibleMoves()
        for move in possible_moves:
            new_state = ConnectFourBoard()  # Create a new board
            new_state.copy_from(node.state)  # Copy the current state
            new_state.makeMove(move[0], move[1], node.player)  # Make the move on the new state
            node.children.append(Node(new_state, parent=node,player = not node.player,move=(move[0], move[1])))      
        return True    

    def simulate(self, node):
        turn = node.player
        while not node.state.gameOver():
            possible_moves = node.state.getPossibleMoves()
            ran_move = random.choice(possible_moves)
            node.state.makeMove(ran_move[0],ran_move[1],turn)
            turn = not turn  
        return node.state.getOutcome(PLAYER1_TURN)    
    def backpropagate(self, node,outcome):
        while node is not None:
            node.visits += 1
            if outcome == 1:
                node.wins += 1
            if outcome == 2:
                node.wins -= 10
            else: node.wins += 0        
            #print(node.player,outcome,node.wins)
            node = node.parent        

    def search(self,num_simulations=16000):
        for i in range(num_simulations):
            node = self.select(self.root)
            outcome = self.simulate(node)
            self.backpropagate(node,outcome)
            #print("iteration number:",i+1)
            #print(self.root.wins)
   
    def best_move(self):
        max_value = max(self.root.children, key=lambda n: n.select_child()).select_child()
        max_nodes = [n for n in self.root.children if n.select_child() == max_value]
        node = random.choice(max_nodes)
        print(max_value)
        return node.move

class Play:
    @staticmethod
    def minimax_alpha_beta(board, depth, alpha, beta, player):
        if depth == 0 or board.gameOver():
            return (depth + 1) * board.heuristicEval(PLAYER2_TURN), None

        moves = board.getPossibleMoves()

        if player:
            max_eval = float('-inf')
            best_move = None
            for move in moves:
                new_board = ConnectFourBoard()
                new_board.board = [row[:] for row in board.board]
                new_board.makeMove(move[0], move[1], player)
                eval, _ = Play.minimax_alpha_beta(new_board, depth - 1, alpha, beta, not player)
                if eval > max_eval:
                    max_eval = eval
                    best_move = (move[0], move[1])
                alpha = max(alpha, eval)
                if beta <= alpha:
                    break
            return max_eval, best_move
        else:
            min_eval = float('inf')
            best_move = None
            for move in moves:
                new_board = ConnectFourBoard()
                new_board.board = [row[:] for row in board.board]
                new_board.makeMove(move[0], move[1], player)
                eval, _ = Play.minimax_alpha_beta(new_board, depth - 1, alpha, beta, not player)
                if eval < min_eval:
                    min_eval = eval
                    best_move = (move[0], move[1])
                beta = min(beta, eval)
                if beta <= alpha:
                    break
            return min_eval, best_move  
    
    @staticmethod
    def computerTurnMinimaxAlphaBetaPruning(board,player):
        eval,best_move = Play.minimax_alpha_beta(board, 5, float('-inf'), float('inf'), player)
        print(best_move,eval)
        board.makeMove(best_move[0],best_move[1], player)
        
        
    @staticmethod
    def HumansTurn(board,player,col):
        board.make_human_move(col,player)  

    @staticmethod
    def computerTurnMCTS(board,player):
        mcts = MCTS(state=board)
        mcts.search()
        best_move = mcts.best_move()
        board.makeMove(best_move[0],best_move[1], player)

        
def main():
    grid = ConnectFourBoard()
    grid.drawBoard()

    while not grid.gameOver():
        print("Player minimax 's turn")
        Play.computerTurnMinimaxAlphaBetaPruning(grid, PLAYER2_TURN)
        grid.drawBoard()

        if grid.win(PLAYER2_TURN):
            print("Player minimax  wins!")
            break
        
        print("Player mcts 's turn")
        #col = int(input("Enter the col number: "))
        Play.computerTurnMCTS(grid, PLAYER1_TURN)
        grid.drawBoard()

        if grid.win(PLAYER1_TURN):
            print("Player mcts wins!")
            break

if __name__ == "__main__":
    main()

# Dear programmer;
# When i wrote this code, only god and I knew how it worked.
# Now , only god knows it!

# Therefore, if you are trying to optimise , change or modify anything and it fails (most likely)
# Please increase this counter as a warning to for the next person 

# Total hours wasted in this project here = 54            

#if you don't understand something please pray god to do so or contact this number : 0778 36 17 47