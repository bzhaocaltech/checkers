/* A single square on the checkerboard
 * props:
 * color: "red" or "black"
 * isHighlight: bool; gives the square a little opacity to stand out
 * onClick: function; to be called onClick
 * hasPiece: bool; determines whether or not contains a piece
 * isKing: bool; is the piece a king?
 * pieceColor: "red" or "black"; color of the piece
 * pieceOnClick: function; to be called when the piece is clicked
 */
class Square extends React.Component {
  render() {
  	if (this.props.hasPiece) {
    	var piece = <Piece isKing={this.props.isKing}
      color={this.props.pieceColor}
      onClick={() => this.props.pieceOnClick()}/>;
    }
    let highlight = this.props.isHighlight ? "highlight" : "";

  	return (
  		<div className={"square " + this.props.color + " " + highlight}
        onClick={this.props.onClick}>
        {this.props.hasPiece && piece}
  		</div>
    );
  }
}

/* Represents a piece on the checkerboard
 * props:
 * color: "red" or "black"
 * isKing: bool; is the piece a king?
 * onClick: function; to be called on click event */
function Piece(props) {
  return (
  	<div className={"piece " + props.color}
      onClick={props.onClick}>
  		{props.isKing &&
        <p>K</p>
      }
    </div>
  )
}

/* Represents the checkerboard
 * props:
 * board: 8x8 array of <Square/>'s
 */
class Board extends React.Component {
	render() {
  	return (
      <div className="board">{this.props.board}</div>
    )
  }
}

/* Contains the game state
 * state:
 * pieces: array; The pieces (objects) on the board
 *                object of form {hasPiece, color, onClick, isKing}
 * board: array; Objects to be passed to inner Board object as squares
 *                object of form {color, isHighlight, onClick, key}
 * selectedPiece: int; Index of currently selected piece
 * turn: "red" or "black"; the player whose turn it is
 * hasDoubleJump: bool; can the current player double jump?
 * winner: "red", "black" or null; the player who has won
 */
class Game extends React.Component {
  constructor(props) {
    super(props);

    /* Initialize the variable "board" which will hold
     * all of the squares and the variable "pieces" which
     * will hold all the pieces on the board */
  	let currentColor = "red";
    const board = [];
    const pieces = [];
    for (let i = 0; i < 64; i++) {
      let piece = {hasPiece: false, color: "red", isKing: false,
                  onClick: () => this.pieceOnClick(i)};
      let square = {color: currentColor, isHighlight: false,
                    onClick: () => {}, key: i}
      /* Black squares on first three rows and last three
       * rows contain a piece */
      if (i <= 23 && currentColor === "black") {
        piece.hasPiece = true;
        piece.color = "black";
      }
      if (i >= 40 && currentColor === "black") {
        piece.hasPiece = true;
        piece.color = "red";
      }

      board.push(square);
      pieces.push(piece);

      // Switch the currentColor
      currentColor = currentColor === "red" ? "black" : "red";
      if (i % 8 == 7) {
        currentColor = currentColor === "red" ? "black" : "red";
      }
    }

    this.state = {
      board: board,
      pieces: pieces,
      selectedPiece: null,
      turn: "red",
      hasDoubleJump: false,
      winner: null
    }
  }

  /* Maps row, col to index */
  rcToIndex(row, col) {
    if (row >= 8 || row < 0 || col >= 8 || col < 0) {
      throw "Row/Col pair on checkerboard is out of bounds!";
    }
    return row * 8 + col;
  }

  /* Maps index back to row, col */
  indexToRc(idx) {
    if (idx >= 64 || idx < 0) {
      throw "Index on checkerboard is out of bounds!";
    }
    const row = Math.floor(idx / 8);
    const col = idx % 8;
    return {row: row, col: col};
  }

  /* Determines if the current player can jump a piece. */
  hasJump() {
    // Check the moves for every piece belonging to the player
    for (let i = 0; i < this.state.pieces.length; i++) {
      const piece = this.state.pieces[i];
      if (piece.hasPiece && piece.color === this.state.turn) {
        if (this.getAvailableMoves(i).jump) {
          return true;
        }
      }
    }
    return false;
  }

  /* Determines if the current player can move */
  hasMove() {
    for (let i = 0; i < this.state.pieces.length; i++) {
      const piece = this.state.pieces[i];
      if (piece.hasPiece && piece.color === this.state.turn) {
        if (this.getAvailableMoves(i).moves.length !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  /* Determines if the input player has won and sets this.state.winnder
   * accordingly */
  checkWinner(player) {
    // We should only need to check if the current player has won
    const otherPlayer = player === "red" ? "black" : "red"
    for (let i = 0; i < this.state.pieces.length; i++) {
      const piece = this.state.pieces[i];
      if (piece.hasPiece && piece.color === otherPlayer) {
        return false;
      }
    }
    alert(player + " is the winner!");
    // Remove all onclick functions
    const pieces = this.state.pieces.slice();
    const board = this.state.board.slice();
    for (let i = 0; i < pieces.length; i++) {
      pieces[i].onClick = () => {};
      board[i].onClick = () => {};
    }
    this.setState({
      board: board,
      pieces: pieces,
      winner: player
    });
    return true;
  }

  /* Returns object with the following keys:
   * Moves: an array of ints representing the indices of available
   * moves for the piece at a certain index
   * Jump: if the available moves contain jumps */
  getAvailableMoves(idx) {
    // Invalid idx
    if (idx > 64 || idx < 0) {
      throw "Index of board is out of bounds!";
    }

    // Grab the correct piece
    const piece = this.state.pieces[idx];
    // Throw error if piece does not exist at idx
    if (!piece.hasPiece) {
      throw "Piece does not exist at index!";
    }
    const temp = this.indexToRc(idx);
    const row = temp.row;
    const col = temp.col;

    let jump = false; // Keeps track if we can jump with the piece
    const availableMoves = [];
    // Movement for kings
    if (piece.isKing) {
      // Find indices of simple diagonal moves
      let leftDown = null;
      let rightDown = null;
      let leftUp = null;
      let rightUp = null;
      if (col >= 1 && row <= 6) {
        leftDown = this.rcToIndex(row + 1, col - 1);
      }
      if (col <= 6 && row <= 6) {
        rightDown = this.rcToIndex(row + 1, col + 1);
      }
      if (col >= 1 && row >= 1) {
        leftUp = this.rcToIndex(row - 1, col - 1);
      }
      if (col <= 6 && row >= 1) {
        rightUp = this.rcToIndex(row - 1, col + 1);
      }

      // See if we can take pieces
      if (leftDown !== null &&
          this.state.pieces[leftDown].hasPiece &&
          this.state.pieces[leftDown].color !== piece.color &&
          row <= 5 && col >= 2) {
        const leftDownPass = this.rcToIndex(row + 2, col - 2);
        if (!this.state.pieces[leftDownPass].hasPiece) {
          availableMoves.push(leftDownPass);
          jump = true;
        }
      }
      if (rightDown !== null &&
         this.state.pieces[rightDown].hasPiece &&
         this.state.pieces[rightDown].color !== piece.color &&
         row <= 5 && col <= 5) {
        const rightDownPass = this.rcToIndex(row + 2, col + 2);
        if (!this.state.pieces[rightDownPass].hasPiece) {
          availableMoves.push(rightDownPass);
          jump = true;
        }
      }
      if (leftUp !== null &&
         this.state.pieces[leftUp].hasPiece &&
         this.state.pieces[leftUp].color !== piece.color &&
         row >= 2 && col >= 2) {
        const leftUpPass = this.rcToIndex(row - 2, col - 2);
        if (!this.state.pieces[leftUpPass].hasPiece) {
          availableMoves.push(leftUpPass);
          jump = true;
        }
      }
      if (rightUp !== null &&
         this.state.pieces[rightUp].hasPiece &&
         this.state.pieces[rightUp].color !== piece.color &&
         row >= 2 && col <= 5) {
        const rightUpPass = this.rcToIndex(row - 2, col + 2);
        if (!this.state.pieces[rightUpPass].hasPiece) {
          availableMoves.push(rightUpPass);
          jump = true;
        }
      }

      // If we can't take pieces, check simple diagonal moves
      if (!jump) {
        if (leftDown !== null &&
            !this.state.pieces[leftDown].hasPiece) {
          availableMoves.push(leftDown);
        }
        if (rightDown !== null &&
            !this.state.pieces[rightDown].hasPiece) {
          availableMoves.push(rightDown);
        }
        if (leftUp !== null &&
            !this.state.pieces[leftUp].hasPiece) {
          availableMoves.push(leftUp);
        }
        if (rightUp !== null &&
            !this.state.pieces[rightUp].hasPiece) {
          availableMoves.push(rightUp);
        }
      }
    }
    // Movement for regular pieces
    else {
      // Movement for black pieces
      if (piece.color === "black") {
        // Find indices of simple diagonal moves
        let leftDown = null;
        let rightDown = null;
        if (col >= 1 && row <= 6) {
          leftDown = this.rcToIndex(row + 1, col - 1);
        }
        if (col <= 6 && row <= 6) {
          rightDown = this.rcToIndex(row + 1, col + 1);
        }

        // See if we can take pieces
        if (leftDown !== null &&
           this.state.pieces[leftDown].hasPiece &&
           this.state.pieces[leftDown].color === "red" &&
           row <= 5 && col >= 2) {
          const leftDownPass = this.rcToIndex(row + 2, col - 2);
          if (!this.state.pieces[leftDownPass].hasPiece) {
            availableMoves.push(leftDownPass);
            jump = true;
          }
        }
        if (rightDown !== null &&
           this.state.pieces[rightDown].hasPiece &&
           this.state.pieces[rightDown].color === "red" &&
           row <= 5 && col <= 5) {
          const rightDownPass = this.rcToIndex(row + 2, col + 2);
          if (!this.state.pieces[rightDownPass].hasPiece) {
            availableMoves.push(rightDownPass);
            jump = true;
          }
        }

        // If we can't take pieces, check simple diagonal moves
        if (!jump) {
          if (leftDown !== null &&
              !this.state.pieces[leftDown].hasPiece) {
            availableMoves.push(leftDown);
          }
          if (rightDown !== null &&
              !this.state.pieces[rightDown].hasPiece) {
            availableMoves.push(rightDown);
          }
        }
      }
      // Movement for red pieces
      if (piece.color === "red") {
        // Find indices of simple diagonal moves
        let leftUp = null;
        let rightUp = null;
        if (col >= 1 && row >= 1) {
          leftUp = this.rcToIndex(row - 1, col - 1);
        }
        if (col <= 6 && row >= 1) {
          rightUp = this.rcToIndex(row - 1, col + 1);
        }

        // Check if we can take any pieces first
        if (leftUp !== null &&
           this.state.pieces[leftUp].hasPiece &&
           this.state.pieces[leftUp].color === "black" &&
           row >= 2 && col >= 2) {
          const leftUpPass = this.rcToIndex(row - 2, col - 2);
          if (!this.state.pieces[leftUpPass].hasPiece) {
            availableMoves.push(leftUpPass);
            jump = true;
          }
        }
        if (rightUp !== null &&
           this.state.pieces[rightUp].hasPiece &&
           this.state.pieces[rightUp].color === "black" &&
           row >= 2 && col <= 5) {
          const rightUpPass = this.rcToIndex(row - 2, col + 2);
          if (!this.state.pieces[rightUpPass].hasPiece) {
            availableMoves.push(rightUpPass);
            jump = true;
          }
        }
        // Check simple diagonal moves only if we cannot take pieces
        if (!jump) {
          if (leftUp !== null &&
              !this.state.pieces[leftUp].hasPiece) {
            availableMoves.push(leftUp);
          }
          if (rightUp !== null &&
              !this.state.pieces[rightUp].hasPiece) {
            availableMoves.push(rightUp);
          }
        }
      }
    }

    return {moves: availableMoves, jump: jump};
  }

  /* The function that handles onClick event for a piece. Highlights
   * available moves with the piece clicked. */
  pieceOnClick(idx) {
    // Throw exception if the piece does not exist at idx
    if (!this.state.pieces[idx].hasPiece) {
      throw "Piece does not exist at index!";
    }

    // Return immediately if the piece does not belong to the
    // player who is going
    if (this.state.pieces[idx].color !== this.state.turn) {
      return;
    }

    // Prevent a player from selecting a new piece if the player
    // can double jump
    if (this.state.hasDoubleJump) {
      alert("You must continue jumping!");
      return;
    }

    // Get available moves
    const moveObj = this.getAvailableMoves(idx);
    // If there is no way to jump with the current piece, ensure that
    // there is no way to jump with any piece
    if (!moveObj.jump && this.hasJump()) {
      alert("You must capture a piece if able!");
      return;
    }
    const availableMoves = moveObj.moves;

    const board = this.state.board.slice();
    // Remove highlights from all moves
    for (let i = 0; i < board.length; i++) {
      board[i].isHighlight = false;
    }
    // Highlight the locations that can be moved to and
    // set the onClick function for those squares
    for (let i = 0; i < availableMoves.length; i++) {
      board[availableMoves[i]].isHighlight = true;
      board[availableMoves[i]].onClick =
        () => this.movePiece(availableMoves[i]);
    }
    this.setState({
      board: board,
      selectedPiece: idx
    });
  }

  /* Moves the piece at this.state.selectedPiece to the square
   * at idx and changes the turn if no double jump is possible. */
  movePiece(idx) {
    if (this.state.selectedPiece == null) {
      throw "No piece to selected to move!";
    }

    // Reset hasDoubleJump variable
    this.setState({
      hasDoubleJump: false
    });

    const pieces = this.state.pieces.slice();
    const piece = pieces[this.state.selectedPiece];
    const rc = this.indexToRc(this.state.selectedPiece);
    const row = rc.row;
    const col = rc.col;
    const newRc = this.indexToRc(idx);
    const newRow = newRc.row;
    const newCol = newRc.col;

    // Check if the piece should be promoted
    let promote = false;
    if (piece.color === "red" && newRow === 0) {
      promote = true;
    }
    if (piece.color === "black" && newRow === 7) {
      promote = true;
    }

    // Insert piece at new location
    pieces[idx] = {
      hasPiece: true,
      color: piece.color,
      isKing: piece.isKing || promote,
      onClick: () => this.pieceOnClick(idx)
    };
    // Remove piece from current location
    pieces[this.state.selectedPiece] = {
      hasPiece: false,
      color: "red", // dummy value
      isKing: false, // dummy value
      onClick: () => this.pieceOnClick(this.state.selectedPiece)
    }
    // Determine if the movement resulted in a piece being captured
    let takePiece = false;
    if (Math.abs(newRow - row) == 2) {
      const takenPieceRow = row + Math.sign(newRow - row);
      const takenPieceCol = col + Math.sign(newCol - col);
      const takenPieceIdx = this.rcToIndex(takenPieceRow, takenPieceCol);
      takePiece = true;
      // Remove the taken piece
      pieces[takenPieceIdx] = {
        hasPiece: false,
        color: "red", // dummy value
        isKing: false // dummy value
      }
    }

    // Now reset the board
    const board = this.state.board.slice();
    // Dehighlight and reset the onClick functions of the squares
    for (let i = 0; i < board.length; i++) {
      board[i].isHighlight = false;
      board[i].onClick = () => {};
    }

    // Set the new state
    this.setState({
      board: board,
      pieces: pieces
    }, () => {
      // Check winner
      if (this.checkWinner(this.state.turn)) {
        return;
      };

      // Check to see if a double jump is possible
      // Only do this after the state has been updated
      if (takePiece && this.checkDoubleJump(idx)) {
        // Do nothing, let the double jump occur
        return;
      }
      else {
        this.setState({
          selectedPiece: null
        });
        this.changeTurn();
      }
    });
  }

  /* Checks if a double jump is possible from a piece at a certain idx
   * Note: that this should only be called after the board
   * and pieces state have been updated after the first jump.
   * Highlights locations of potential double jumps and prevents
   * the user from selecting another piece and also sets the selected
   * piece to idx
   * Returns: true if double jump is possible, false otherwise */
  checkDoubleJump(idx) {
    let doubleJump = false;
    const board = this.state.board.slice();

    const moves = this.getAvailableMoves(idx).moves;
    const rc = this.indexToRc(idx);
    const row = rc.row;
    for (let i = 0; i < moves.length; i++) {
      const newRc = this.indexToRc(moves[i]);
      const newRow = newRc.row;
      // newRow represents the new position of the piece
      // If any potential move differs in row # by 2, a
      // double jump is possible
      if (Math.abs(newRow - row) === 2) {
        // Highlight location of double jump
        board[moves[i]].isHighlight = true;
        board[moves[i]].onClick = () => this.movePiece(moves[i]);
        doubleJump = true;
      }
    }

    if (doubleJump) {
      this.setState({
        board: board,
        selectedPiece: idx,
        hasDoubleJump: true
      })
      return true;
    }

    return false;
  }

  /* Flips the turn from red to black and vice versa */
  changeTurn() {
    this.setState({turn: this.state.turn === "red" ? "black" : "red"},
    () => {
      // Switch turns back if the current player cannot move
      // NOTE: Stalemates are impossible in checkers
      if (!this.hasMove()) {
        alert(this.state.turn + " has no moves! Switching turn back");
        this.changeTurn();
      }
    })
  }

  render() {
    // Create the square objects to pass down
    const squares = [];
    for (let i = 0; i < this.state.board.length; i++) {
      squares.push(<Square color={this.state.board[i].color}
                     key={this.state.board[i].key}
                     isHighlight={this.state.board[i].isHighlight}
                     onClick={() => this.state.board[i].onClick()}
                     hasPiece={this.state.pieces[i].hasPiece}
                     pieceColor={this.state.pieces[i].color}
                     pieceOnClick={() => this.state.pieces[i].onClick()}
                     isKing={this.state.pieces[i].isKing}/>)
    }
    let turn = this.state.winner === null
    ? <p>It is {this.state.turn}'s turn</p> : null;
    let winner = this.state.winner === null
    ? null : <p>{this.state.winner} has won! </p>

    return (
      <div className="game">
        <Board board={squares}/>
        <p>{turn}</p>
        <p>{winner}</p>
      </div>
    )
  }
}

ReactDOM.render(<Game/>, document.querySelector("#app"));
