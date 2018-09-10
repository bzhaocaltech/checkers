var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
var Square = function (_React$Component) {
  _inherits(Square, _React$Component);

  function Square() {
    _classCallCheck(this, Square);

    return _possibleConstructorReturn(this, (Square.__proto__ || Object.getPrototypeOf(Square)).apply(this, arguments));
  }

  _createClass(Square, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      if (this.props.hasPiece) {
        var piece = React.createElement(Piece, { isKing: this.props.isKing,
          color: this.props.pieceColor,
          onClick: function onClick() {
            return _this2.props.pieceOnClick();
          } });
      }
      var highlight = this.props.isHighlight ? "highlight" : "";

      return React.createElement(
        "div",
        { className: "square " + this.props.color + " " + highlight,
          onClick: this.props.onClick },
        this.props.hasPiece && piece
      );
    }
  }]);

  return Square;
}(React.Component);

/* Represents a piece on the checkerboard
 * props:
 * color: "red" or "black"
 * isKing: bool; is the piece a king?
 * onClick: function; to be called on click event */


function Piece(props) {
  return React.createElement(
    "div",
    { className: "piece " + props.color,
      onClick: props.onClick },
    props.isKing && React.createElement(
      "p",
      null,
      "K"
    )
  );
}

/* Represents the checkerboard
 * props:
 * board: 8x8 array of <Square/>'s
 */

var Board = function (_React$Component2) {
  _inherits(Board, _React$Component2);

  function Board() {
    _classCallCheck(this, Board);

    return _possibleConstructorReturn(this, (Board.__proto__ || Object.getPrototypeOf(Board)).apply(this, arguments));
  }

  _createClass(Board, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "board" },
        this.props.board
      );
    }
  }]);

  return Board;
}(React.Component);

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


var Game = function (_React$Component3) {
  _inherits(Game, _React$Component3);

  function Game(props) {
    _classCallCheck(this, Game);

    /* Initialize the variable "board" which will hold
     * all of the squares and the variable "pieces" which
     * will hold all the pieces on the board */
    var _this4 = _possibleConstructorReturn(this, (Game.__proto__ || Object.getPrototypeOf(Game)).call(this, props));

    var currentColor = "red";
    var board = [];
    var pieces = [];

    var _loop = function _loop(i) {
      var piece = { hasPiece: false, color: "red", isKing: false,
        onClick: function onClick() {
          return _this4.pieceOnClick(i);
        } };
      var square = { color: currentColor, isHighlight: false,
        onClick: function onClick() {}, key: i
        /* Black squares on first three rows and last three
         * rows contain a piece */
      };if (i <= 23 && currentColor === "black") {
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
    };

    for (var i = 0; i < 64; i++) {
      _loop(i);
    }

    _this4.state = {
      board: board,
      pieces: pieces,
      selectedPiece: null,
      turn: "red",
      hasDoubleJump: false,
      winner: null
    };
    return _this4;
  }

  /* Maps row, col to index */


  _createClass(Game, [{
    key: "rcToIndex",
    value: function rcToIndex(row, col) {
      if (row >= 8 || row < 0 || col >= 8 || col < 0) {
        throw "Row/Col pair on checkerboard is out of bounds!";
      }
      return row * 8 + col;
    }

    /* Maps index back to row, col */

  }, {
    key: "indexToRc",
    value: function indexToRc(idx) {
      if (idx >= 64 || idx < 0) {
        throw "Index on checkerboard is out of bounds!";
      }
      var row = Math.floor(idx / 8);
      var col = idx % 8;
      return { row: row, col: col };
    }

    /* Determines if the current player can jump a piece. */

  }, {
    key: "hasJump",
    value: function hasJump() {
      // Check the moves for every piece belonging to the player
      for (var i = 0; i < this.state.pieces.length; i++) {
        var _piece = this.state.pieces[i];
        if (_piece.hasPiece && _piece.color === this.state.turn) {
          if (this.getAvailableMoves(i).jump) {
            return true;
          }
        }
      }
      return false;
    }

    /* Determines if the current player can move */

  }, {
    key: "hasMove",
    value: function hasMove() {
      for (var i = 0; i < this.state.pieces.length; i++) {
        var _piece2 = this.state.pieces[i];
        if (_piece2.hasPiece && _piece2.color === this.state.turn) {
          if (this.getAvailableMoves(i).moves.length !== 0) {
            return true;
          }
        }
      }
      return false;
    }

    /* Determines if the input player has won and sets this.state.winnder
     * accordingly */

  }, {
    key: "checkWinner",
    value: function checkWinner(player) {
      // We should only need to check if the current player has won
      var otherPlayer = player === "red" ? "black" : "red";
      for (var i = 0; i < this.state.pieces.length; i++) {
        var _piece3 = this.state.pieces[i];
        if (_piece3.hasPiece && _piece3.color === otherPlayer) {
          return false;
        }
      }
      alert(player + " is the winner!");
      // Remove all onclick functions
      var pieces = this.state.pieces.slice();
      var board = this.state.board.slice();
      for (var _i = 0; _i < pieces.length; _i++) {
        pieces[_i].onClick = function () {};
        board[_i].onClick = function () {};
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

  }, {
    key: "getAvailableMoves",
    value: function getAvailableMoves(idx) {
      // Invalid idx
      if (idx > 64 || idx < 0) {
        throw "Index of board is out of bounds!";
      }

      // Grab the correct piece
      var piece = this.state.pieces[idx];
      // Throw error if piece does not exist at idx
      if (!piece.hasPiece) {
        throw "Piece does not exist at index!";
      }
      var temp = this.indexToRc(idx);
      var row = temp.row;
      var col = temp.col;

      var jump = false; // Keeps track if we can jump with the piece
      var availableMoves = [];
      // Movement for kings
      if (piece.isKing) {
        // Find indices of simple diagonal moves
        var leftDown = null;
        var rightDown = null;
        var leftUp = null;
        var rightUp = null;
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
        if (leftDown !== null && this.state.pieces[leftDown].hasPiece && this.state.pieces[leftDown].color !== piece.color && row <= 5 && col >= 2) {
          var leftDownPass = this.rcToIndex(row + 2, col - 2);
          if (!this.state.pieces[leftDownPass].hasPiece) {
            availableMoves.push(leftDownPass);
            jump = true;
          }
        }
        if (rightDown !== null && this.state.pieces[rightDown].hasPiece && this.state.pieces[rightDown].color !== piece.color && row <= 5 && col <= 5) {
          var rightDownPass = this.rcToIndex(row + 2, col + 2);
          if (!this.state.pieces[rightDownPass].hasPiece) {
            availableMoves.push(rightDownPass);
            jump = true;
          }
        }
        if (leftUp !== null && this.state.pieces[leftUp].hasPiece && this.state.pieces[leftUp].color !== piece.color && row >= 2 && col >= 2) {
          var leftUpPass = this.rcToIndex(row - 2, col - 2);
          if (!this.state.pieces[leftUpPass].hasPiece) {
            availableMoves.push(leftUpPass);
            jump = true;
          }
        }
        if (rightUp !== null && this.state.pieces[rightUp].hasPiece && this.state.pieces[rightUp].color !== piece.color && row >= 2 && col <= 5) {
          var rightUpPass = this.rcToIndex(row - 2, col + 2);
          if (!this.state.pieces[rightUpPass].hasPiece) {
            availableMoves.push(rightUpPass);
            jump = true;
          }
        }

        // If we can't take pieces, check simple diagonal moves
        if (!jump) {
          if (leftDown !== null && !this.state.pieces[leftDown].hasPiece) {
            availableMoves.push(leftDown);
          }
          if (rightDown !== null && !this.state.pieces[rightDown].hasPiece) {
            availableMoves.push(rightDown);
          }
          if (leftUp !== null && !this.state.pieces[leftUp].hasPiece) {
            availableMoves.push(leftUp);
          }
          if (rightUp !== null && !this.state.pieces[rightUp].hasPiece) {
            availableMoves.push(rightUp);
          }
        }
      }
      // Movement for regular pieces
      else {
          // Movement for black pieces
          if (piece.color === "black") {
            // Find indices of simple diagonal moves
            var _leftDown = null;
            var _rightDown = null;
            if (col >= 1 && row <= 6) {
              _leftDown = this.rcToIndex(row + 1, col - 1);
            }
            if (col <= 6 && row <= 6) {
              _rightDown = this.rcToIndex(row + 1, col + 1);
            }

            // See if we can take pieces
            if (_leftDown !== null && this.state.pieces[_leftDown].hasPiece && this.state.pieces[_leftDown].color === "red" && row <= 5 && col >= 2) {
              var _leftDownPass = this.rcToIndex(row + 2, col - 2);
              if (!this.state.pieces[_leftDownPass].hasPiece) {
                availableMoves.push(_leftDownPass);
                jump = true;
              }
            }
            if (_rightDown !== null && this.state.pieces[_rightDown].hasPiece && this.state.pieces[_rightDown].color === "red" && row <= 5 && col <= 5) {
              var _rightDownPass = this.rcToIndex(row + 2, col + 2);
              if (!this.state.pieces[_rightDownPass].hasPiece) {
                availableMoves.push(_rightDownPass);
                jump = true;
              }
            }

            // If we can't take pieces, check simple diagonal moves
            if (!jump) {
              if (_leftDown !== null && !this.state.pieces[_leftDown].hasPiece) {
                availableMoves.push(_leftDown);
              }
              if (_rightDown !== null && !this.state.pieces[_rightDown].hasPiece) {
                availableMoves.push(_rightDown);
              }
            }
          }
          // Movement for red pieces
          if (piece.color === "red") {
            // Find indices of simple diagonal moves
            var _leftUp = null;
            var _rightUp = null;
            if (col >= 1 && row >= 1) {
              _leftUp = this.rcToIndex(row - 1, col - 1);
            }
            if (col <= 6 && row >= 1) {
              _rightUp = this.rcToIndex(row - 1, col + 1);
            }

            // Check if we can take any pieces first
            if (_leftUp !== null && this.state.pieces[_leftUp].hasPiece && this.state.pieces[_leftUp].color === "black" && row >= 2 && col >= 2) {
              var _leftUpPass = this.rcToIndex(row - 2, col - 2);
              if (!this.state.pieces[_leftUpPass].hasPiece) {
                availableMoves.push(_leftUpPass);
                jump = true;
              }
            }
            if (_rightUp !== null && this.state.pieces[_rightUp].hasPiece && this.state.pieces[_rightUp].color === "black" && row >= 2 && col <= 5) {
              var _rightUpPass = this.rcToIndex(row - 2, col + 2);
              if (!this.state.pieces[_rightUpPass].hasPiece) {
                availableMoves.push(_rightUpPass);
                jump = true;
              }
            }
            // Check simple diagonal moves only if we cannot take pieces
            if (!jump) {
              if (_leftUp !== null && !this.state.pieces[_leftUp].hasPiece) {
                availableMoves.push(_leftUp);
              }
              if (_rightUp !== null && !this.state.pieces[_rightUp].hasPiece) {
                availableMoves.push(_rightUp);
              }
            }
          }
        }

      return { moves: availableMoves, jump: jump };
    }

    /* The function that handles onClick event for a piece. Highlights
     * available moves with the piece clicked. */

  }, {
    key: "pieceOnClick",
    value: function pieceOnClick(idx) {
      var _this5 = this;

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
      var moveObj = this.getAvailableMoves(idx);
      // If there is no way to jump with the current piece, ensure that
      // there is no way to jump with any piece
      if (!moveObj.jump && this.hasJump()) {
        alert("You must capture a piece if able!");
        return;
      }
      var availableMoves = moveObj.moves;

      var board = this.state.board.slice();
      // Remove highlights from all moves
      for (var i = 0; i < board.length; i++) {
        board[i].isHighlight = false;
      }
      // Highlight the locations that can be moved to and
      // set the onClick function for those squares

      var _loop2 = function _loop2(_i2) {
        board[availableMoves[_i2]].isHighlight = true;
        board[availableMoves[_i2]].onClick = function () {
          return _this5.movePiece(availableMoves[_i2]);
        };
      };

      for (var _i2 = 0; _i2 < availableMoves.length; _i2++) {
        _loop2(_i2);
      }
      this.setState({
        board: board,
        selectedPiece: idx
      });
    }

    /* Moves the piece at this.state.selectedPiece to the square
     * at idx and changes the turn if no double jump is possible. */

  }, {
    key: "movePiece",
    value: function movePiece(idx) {
      var _this6 = this;

      if (this.state.selectedPiece == null) {
        throw "No piece to selected to move!";
      }

      // Reset hasDoubleJump variable
      this.setState({
        hasDoubleJump: false
      });

      var pieces = this.state.pieces.slice();
      var piece = pieces[this.state.selectedPiece];
      var rc = this.indexToRc(this.state.selectedPiece);
      var row = rc.row;
      var col = rc.col;
      var newRc = this.indexToRc(idx);
      var newRow = newRc.row;
      var newCol = newRc.col;

      // Check if the piece should be promoted
      var promote = false;
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
        onClick: function onClick() {
          return _this6.pieceOnClick(idx);
        }
      };
      // Remove piece from current location
      pieces[this.state.selectedPiece] = {
        hasPiece: false,
        color: "red", // dummy value
        isKing: false, // dummy value
        onClick: function onClick() {
          return _this6.pieceOnClick(_this6.state.selectedPiece);
        }
        // Determine if the movement resulted in a piece being captured
      };var takePiece = false;
      if (Math.abs(newRow - row) == 2) {
        var takenPieceRow = row + Math.sign(newRow - row);
        var takenPieceCol = col + Math.sign(newCol - col);
        var takenPieceIdx = this.rcToIndex(takenPieceRow, takenPieceCol);
        takePiece = true;
        // Remove the taken piece
        pieces[takenPieceIdx] = {
          hasPiece: false,
          color: "red", // dummy value
          isKing: false // dummy value
        };
      }

      // Now reset the board
      var board = this.state.board.slice();
      // Dehighlight and reset the onClick functions of the squares
      for (var i = 0; i < board.length; i++) {
        board[i].isHighlight = false;
        board[i].onClick = function () {};
      }

      // Set the new state
      this.setState({
        board: board,
        pieces: pieces
      }, function () {
        // Check winner
        if (_this6.checkWinner(_this6.state.turn)) {
          return;
        };

        // Check to see if a double jump is possible
        // Only do this after the state has been updated
        if (takePiece && _this6.checkDoubleJump(idx)) {
          // Do nothing, let the double jump occur
          return;
        } else {
          _this6.setState({
            selectedPiece: null
          });
          _this6.changeTurn();
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

  }, {
    key: "checkDoubleJump",
    value: function checkDoubleJump(idx) {
      var _this7 = this;

      var doubleJump = false;
      var board = this.state.board.slice();

      var moves = this.getAvailableMoves(idx).moves;
      var rc = this.indexToRc(idx);
      var row = rc.row;

      var _loop3 = function _loop3(i) {
        var newRc = _this7.indexToRc(moves[i]);
        var newRow = newRc.row;
        // newRow represents the new position of the piece
        // If any potential move differs in row # by 2, a
        // double jump is possible
        if (Math.abs(newRow - row) === 2) {
          // Highlight location of double jump
          board[moves[i]].isHighlight = true;
          board[moves[i]].onClick = function () {
            return _this7.movePiece(moves[i]);
          };
          doubleJump = true;
        }
      };

      for (var i = 0; i < moves.length; i++) {
        _loop3(i);
      }

      if (doubleJump) {
        this.setState({
          board: board,
          selectedPiece: idx,
          hasDoubleJump: true
        });
        return true;
      }

      return false;
    }

    /* Flips the turn from red to black and vice versa */

  }, {
    key: "changeTurn",
    value: function changeTurn() {
      var _this8 = this;

      this.setState({ turn: this.state.turn === "red" ? "black" : "red" }, function () {
        // Switch turns back if the current player cannot move
        // NOTE: Stalemates are impossible in checkers
        if (!_this8.hasMove()) {
          alert(_this8.state.turn + " has no moves! Switching turn back");
          _this8.changeTurn();
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this9 = this;

      // Create the square objects to pass down
      var squares = [];

      var _loop4 = function _loop4(i) {
        squares.push(React.createElement(Square, { color: _this9.state.board[i].color,
          key: _this9.state.board[i].key,
          isHighlight: _this9.state.board[i].isHighlight,
          onClick: function onClick() {
            return _this9.state.board[i].onClick();
          },
          hasPiece: _this9.state.pieces[i].hasPiece,
          pieceColor: _this9.state.pieces[i].color,
          pieceOnClick: function pieceOnClick() {
            return _this9.state.pieces[i].onClick();
          },
          isKing: _this9.state.pieces[i].isKing }));
      };

      for (var i = 0; i < this.state.board.length; i++) {
        _loop4(i);
      }
      var turn = this.state.winner === null ? React.createElement(
        "p",
        null,
        "It is ",
        this.state.turn,
        "'s turn"
      ) : null;
      var winner = this.state.winner === null ? null : React.createElement(
        "p",
        null,
        this.state.winner,
        " has won! "
      );

      return React.createElement(
        "div",
        { className: "game" },
        React.createElement(Board, { board: squares }),
        React.createElement(
          "p",
          null,
          turn
        ),
        React.createElement(
          "p",
          null,
          winner
        )
      );
    }
  }]);

  return Game;
}(React.Component);

ReactDOM.render(React.createElement(Game, null), document.querySelector("#app"));