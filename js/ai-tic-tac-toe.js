/* Unbeatable AI Tic-Tac-Toe JavaScript Game
	Used in conjunction with a web page, this game will play a standard 3x3 Tic Tac Toe game between a user and the computer. The game is designed such that it is unbeatable for the user. The computer should always win or tie no matter which selection the user makes.
	By Mike Danaher
*/ 

/*When the web page first loads, it sets up a new game and listens for user clicks. 
	It also creates a listener for another new game when the current one ends.
*/
$(document).ready(function() {
	$('#newGame').click(newGame);	
	$('.gameCell').click(playerMove);
	
	newGame();
});

// Create a global object to hold the game board and other variables
var tictactoe = {};

function newGame(){
	//Reset visual game board
	$('.gameCell').html(" ");
	$('#winnerBox').hide();
	$('.lightbox').hide();
	$('#currentPlayer').html("Your Turn");
	
/* Reset game board variables. 
	Coordinates are stored in the array so that the exact cell needed for the computer's next move can be retrieved. 
	The coordinates are replaced with an 'x' or 'o' when a cell has been taken. 
	These coordinates are also used in the UI to determine which cell was clicked on.
*/	
	tictactoe.cells = ["1-1","1-2","1-3","2-1","2-2","2-3","3-1","3-2","3-3"];
	tictactoe.currentPlayer = "x";
	tictactoe.moveCount = 0;
}

function playerMove(){
	//Check that the user selected an open cell and that they waited until the computer moved.
	if($(this).html() == "x" || $(this).html() == "o"){
		$('#alert').html("Please select an empty cell").show();
	}else if(tictactoe.moveCount % 2 !== 0){
		$('#alert').html("Please wait your turn").show();
	}else{
		/*  If the user selected an open cell on their turn, collect the ID of the cell and pass that to the cellChoice function. 
			The ID will be a coordinate matching the value in the cells array.
		*/
		$('#alert').hide();
		cellChoice($(this).attr("id"));
	}
}

/* When it's the computer's turn, it finds it's next move by following a set tests. 
	If it's the first move of the game, the computer's best move is to choose either the middle cell or a corner.
	On subsequent moves, the computer first tries to win. If it can't, it tries to block.
	If neither a win or a block is available, the computer then uses the corners to determine it's next move.
*/
function computerMove(){

	if(tictactoe.moveCount === 1){
		if(tictactoe.cells[4] === 'x'){
			pickCorner();
		}else{
			cellChoice("2-2");
		}			
	}else{
		var nextMove = tryWin();
		if(nextMove !== ""){
			cellChoice(nextMove);
		}else{
			nextMove = tryBlock();
			if(nextMove !== ""){
				cellChoice(nextMove);
			}else{
				tryCorners();
			}
		}
	}
}

/* This function loops through all the possibleWins to find a case where there are two o's in a row. 
	If there are, it will choose the open cell to win the game.
*/
function tryWin(){
	var nextMove = "";
	for(j=0; j < tictactoe.possibleWins.length; j++){
		var total = addCells(tictactoe.possibleWins[j]);
		if(total == 8){
			nextMove = findNextMove(tictactoe.possibleWins[j]);
			break;
		}	
	}
	return nextMove;
}

/* This function loops through all the possibleWins to find a case where there are two x's in a row. 
	If there are, it will choose the open cell to block the opponent.
*/
function tryBlock(){
	var nextMove = "";
	for(j=0; j < tictactoe.possibleWins.length; j++){
		var total = addCells(tictactoe.possibleWins[j]);
		if(total == 2){
			nextMove = findNextMove(tictactoe.possibleWins[j]);
			break;
		}	
	}
	return nextMove;
}

//In the case of a win or a block, this function takes an array and finds the only cell that doesn't have an 'x' or an 'o' and returns the value (coordinates) of that cell.
function findNextMove(n){
	var nextMove = "";
	for(i=0; i < n.length; i++){
		if(n[i] !== 'x' && n[i] !== 'o'){
			nextMove = n[i];
			break;
		}
	}
	return nextMove;
}

/* If there is no chance at winning or blocking, the computer can find it's next move by looking at the corners. 
	When the corners are added up (using the values x = 1 or o = 4), five possible scenarios exist. 
	Once the current scenario has been determined, the correct next move can be found.
*/
function tryCorners(){
	var corners = [tictactoe.cells[0], tictactoe.cells[2], tictactoe.cells[6], tictactoe.cells[8]];
	var cornerTotal = addCells(corners);
	switch(cornerTotal){
		case 0:
			//In the case of no corners occupied, find the row or column with only 1 'x' and pick the first cell (a corner)
			for(j=0; j < tictactoe.possibleWins.length; j++){
				var total = addCells(tictactoe.possibleWins[j]);
				if(total == 1){
					cellChoice(tictactoe.possibleWins[j][0]);
					break;
				}	
			}
			break;
		case 1:
			//In the case of an 'x' in only one corner, find the row or column that's empty and choose the middle cell
			for(j=0; j < tictactoe.possibleWins.length; j++){
				var total = addCells(tictactoe.possibleWins[j]);
				if(total == 0){
					cellChoice(tictactoe.possibleWins[j][1]);
					break;
				}	
			}
			break;
		case 2:
			//In the case of only 2 x's in the corners, pick any random available side
			var sides = [tictactoe.cells[1], tictactoe.cells[3], tictactoe.cells[5], tictactoe.cells[7]];
			var sidesLength = sides.length;
			var availableSides = [];
			for(i = 0; i < sidesLength; i++){
				if(sides[i] !== 'x' && sides[i] !== 'o'){
					availableSides.push(sides[i]);
				}
			}
			var randomSide = Math.floor(Math.random()*availableSides.length);
			cellChoice(availableSides[randomSide]);
			break;
		case 5:
			//In the case of 1 'x' and 1 'o' in the corners, pick any random available corner
			pickCorner();
			break;
		default:
			//If none of the above scenarios exist, the computer will just choose a randomly available cell.
			var cellsLength = tictactoe.cells.length;
			var availableCells = [];
			for(i = 0; i < cellsLength; i++){
				if(tictactoe.cells[i] !== 'x' && tictactoe.cells[i] !== 'o'){
					availableCells.push(tictactoe.cells[i]);
				}
			}
			var randomCell = Math.floor(Math.random() * availableCells.length);
			cellChoice(availableCells[randomCell]);
	}
}

/* This function was broken out so it could easily be used by two different scenarios above. 
	It will loop through all the corners to find the available ones, and then randomly select 1. 
	The randomness was added to give the appearance that the computer didn't follow the same pattern in every game.
*/
function pickCorner(){
	var corners = [tictactoe.cells[0],tictactoe.cells[2],tictactoe.cells[6],tictactoe.cells[8]];
	var cornersLength = corners.length;
	var availableCorners = [];
	for(i = 0; i < cornersLength; i++){
		if(corners[i] !== 'x' && corners[i] !== 'o'){
			availableCorners.push(corners[i]);
		}
	}
	var randomCorner = Math.floor(Math.random()*availableCorners.length);
	cellChoice(availableCorners[randomCorner]);
}

/* The cellChoice function takes a string that represents the coordinate of the cell to be taken. 
	It loops through all the cells until it matches the correct choice and then replaces the coordinate value with the current player's symbol, either 'x' or 'o'. 
	It then updates the UI with the new value and calls the checkWinner function to determine the next steps.
*/
function cellChoice(c){
	for(i = 0; i < tictactoe.cells.length; i++){
		if(tictactoe.cells[i] === c){
			tictactoe.cells[i] = tictactoe.currentPlayer;
			$('#' + c).html(tictactoe.currentPlayer);
			break;
		}
	}
	checkWinner();
}

/* The addCells function is passed an array of three values representing a possible winning combination. 
	It loops through the array and adds the cells together. 
	It uses a 1 to represent an 'x' and a 4 to represent an 'o'. It then returns a total for all three cells.
*/
function addCells(row){
	var total = 0;	
	for(i=0; i < row.length; i++){
		if(row[i] === 'x'){
			total += 1;
		}else if (row[i] === 'o') {
			total += 4;
		}
	}	
	return total;
}

//This function is called at the end of each player's turn and determines whether someone wins or the players switch turns.
function checkWinner(){	
	//First create/update the possibleWins array with the new values of the selected cell. 
	tictactoe.possibleWins = [
		[tictactoe.cells[0],tictactoe.cells[1],tictactoe.cells[2]],
		[tictactoe.cells[3],tictactoe.cells[4],tictactoe.cells[5]],
		[tictactoe.cells[6],tictactoe.cells[7],tictactoe.cells[8]],
		[tictactoe.cells[0],tictactoe.cells[3],tictactoe.cells[6]],
		[tictactoe.cells[1],tictactoe.cells[4],tictactoe.cells[7]],
		[tictactoe.cells[2],tictactoe.cells[5],tictactoe.cells[8]],
		[tictactoe.cells[0],tictactoe.cells[4],tictactoe.cells[8]],
		[tictactoe.cells[6],tictactoe.cells[4],tictactoe.cells[2]]
		];

	//Loop through the possibleWins array. If one of the arrays contains three of one symbol, the addCells function will return either a 3 or a 12. A 3 means player 1 wins. A 12 means player 2 wins.
	var winner = 0;
	for(j=0; j < tictactoe.possibleWins.length; j++){
		var total = addCells(tictactoe.possibleWins[j]);
		
		if(total == 3){
			winner = 1;
			break;
		}else if(total == 12){
			winner = 2;
			break;
		}	
	}
	//Update the moveCount
	tictactoe.moveCount++;
	//If the moveCount equals a complete game, or a winner was found, end the game. Otherwise switch players.
	if(tictactoe.moveCount == 9 || winner > 0){
		endGame(winner);
	}else{
		switchPlayers();
	}
}

/* This function switches the players. It changes the currentPlayer's symbol, updates the UI, and if it's the computer's turn, it waits a second and calls the 	computerMove function. 
	The delay was added to give the appearance that the computer was "thinking".
*/
function switchPlayers(){
	if(tictactoe.currentPlayer == "x"){
		tictactoe.currentPlayer = "o";
		$('#currentPlayer').html("Computer's Turn");
		setTimeout(computerMove, 1200);
	}else{
		tictactoe.currentPlayer = "x";
		$('#currentPlayer').html("Your Turn");
	}
}

/* This function is called when a winner has been found or no more moves are left. It is passed a value that determines the outcome. 
	Based on that value, a box is displayed with the correct message. The winnerBox also includes a button to start a new game.
*/
function endGame(w){
	if(w == 1){
		$('#winner').html("You Win!");
	}else if(w == 2){
		$('#winner').html("Computer Wins!");
	}else{
		$('#winner').html("It's a tie!");
	}
	$('#winnerBox').show();
	$('.lightbox').show();
}
