// AI Tic-Tac-Toe JavaScript Game

$(document).ready(function() {
	$('#newGame').click(newGame);	
	$('.gameCell').click(playerMove);
	
	newGame();
});

// Create a global object to hold the game board and other variables
var tictactoe = {};

function newGame(){
	$('.gameCell').html(" ");

	tictactoe.cells = ["mc","tl","tc","tr","ml","bl","mr","br","bc"];
	tictactoe.availableCells = ["mc","tl","tc","tr","ml","bl","mr","br","bc"];
	tictactoe.currentPlayer = "x";
	tictactoe.moveCount = 0;
	tictactoe.possibleWins = [
		[tictactoe.cells[1],tictactoe.cells[2],tictactoe.cells[3]],
		[tictactoe.cells[4],tictactoe.cells[0],tictactoe.cells[6]],
		[tictactoe.cells[5],tictactoe.cells[8],tictactoe.cells[7]],
		[tictactoe.cells[1],tictactoe.cells[4],tictactoe.cells[5]],
		[tictactoe.cells[2],tictactoe.cells[0],tictactoe.cells[8]],
		[tictactoe.cells[3],tictactoe.cells[6],tictactoe.cells[7]],
		[tictactoe.cells[1],tictactoe.cells[0],tictactoe.cells[7]],
		[tictactoe.cells[5],tictactoe.cells[0],tictactoe.cells[3]]
		];

	$('#winnerBox').hide();
	$('.lightbox').hide();
	$('#currentPlayer').html("Your Turn");
}

function playerMove(){
	if($(this).html() == "x" || $(this).html() == "o"){
		$('#alert').html("Please select an empty cell").show();
	}else{
		$('#alert').hide();
		cellChoice($(this).attr("id"));
		checkWinner();
	}
}

function computerMove(){

	if(tictactoe.moveCount == 1){
		if(tictactoe.cells[0] == 1){
			pickCorner();
		}else{
			cellChoice("mc");
		}			
	}else{
		var nextMove = tryWin();
		if(isNaN(nextMove)){
			cellChoice(nextMove);
		}else{
			nextMove = tryBlock();
			if(isNaN(nextMove)){
				cellChoice(nextMove);
			}else{
				tryCorners();
			}
		}
	}
	checkWinner();
}

function tryWin(){
	var nextMove = 0;
	for(j=0; j < tictactoe.possibleWins.length; j++){
		var total = addCells(tictactoe.possibleWins[j]);
		if(total == 8){
			nextMove = findNextMove(tictactoe.possibleWins[j]);
			break;
		}	
	}
	return nextMove;
}

function tryBlock(){
	var nextMove = 0;
	for(j=0; j < tictactoe.possibleWins.length; j++){
		var total = addCells(tictactoe.possibleWins[j]);
		if(total == 2){
			nextMove = findNextMove(tictactoe.possibleWins[j]);
			break;
		}	
	}
	return nextMove;
}

function tryCorners(){
	var corners = [tictactoe.cells[1], tictactoe.cells[3], tictactoe.cells[5], tictactoe.cells[7]];
	var cornerTotal = addCells(corners);
	switch(cornerTotal){
		case 0:
			//Pick the first corner in row with an 'x'
			for(j=0; j < tictactoe.possibleWins.length; j++){
				var total = addCells(tictactoe.possibleWins[j]);
				if(total == 1){
					cellChoice(tictactoe.possibleWins[j][0]);
					break;
				}	
			}
			break;
		case 1:
			//Pick the side in an empty row
			for(j=0; j < tictactoe.possibleWins.length; j++){
				var total = addCells(tictactoe.possibleWins[j]);
				if(total == 0){
					cellChoice(tictactoe.possibleWins[j][1]);
					break;
				}	
			}
			break;
		case 2:
			// Pick a random available side
			var sides = [];
			for(i = 0; i < tictactoe.availableCells.length; i++){
				if(tictactoe.availableCells[i] == "tc" || tictactoe.availableCells[i] == "ml" || tictactoe.availableCells[i] == "mr" || tictactoe.availableCells[i] == "bc"){
					sides.push(tictactoe.availableCells[i]);
				}
			}
			var randomSide = Math.floor(Math.random()*sides.length);
			cellChoice(sides[randomSide]);
			break;
		case 5:
			// Pick a random available corner
			pickCorner();
			break;
		default:
			// If no other moves, randomly choose an open cell.
			var randomCell = Math.floor(Math.random()*tictactoe.availableCells.length);
			cellChoice(tictactoe.availableCells[randomCell]);
	}
}

function pickCorner(){
	var corners = [];
	for(i = 0; i < tictactoe.availableCells.length; i++){
		if(tictactoe.availableCells[i] == "tl" || tictactoe.availableCells[i] == "tr" || tictactoe.availableCells[i] == "bl" || tictactoe.availableCells[i] == "br"){
			corners.push(tictactoe.availableCells[i]);
		}
	}
	var randomCorner = Math.floor(Math.random()*corners.length);
	cellChoice(corners[randomCorner]);
}

function findNextMove(n){
	var nextMove = 0;
	for(i=0; i < n.length; i++){
		if(isNaN(n[i])){
			nextMove = n[i];
			break;
		}
	}
	return nextMove;
}

function cellChoice(c){
	for(i = 0; i < tictactoe.cells.length; i++){
		if(tictactoe.cells[i] == c){
			$('#' + c).html(tictactoe.currentPlayer);
			if(tictactoe.currentPlayer == 'x'){
				tictactoe.cells[i] = 1;
			}else{
				tictactoe.cells[i] = 4;
			}
			removeCells(c);
			break;
		}
	}
}

function addCells(row){
	var total = 0;	
	for(i=0; i < row.length; i++){
		if(isNaN(row[i])){
			total = total;
		} else {
			total += row[i];
		}
	}	
	return total;
}

function removeCells(c){
	for(i=0; i < tictactoe.availableCells.length; i++){
		if(tictactoe.availableCells[i] == c){
			tictactoe.availableCells.splice(i, 1);
			break;
		}
	}
}

function updateWins(){

	tictactoe.possibleWins = [
		[tictactoe.cells[1],tictactoe.cells[2],tictactoe.cells[3]],
		[tictactoe.cells[4],tictactoe.cells[0],tictactoe.cells[6]],
		[tictactoe.cells[5],tictactoe.cells[8],tictactoe.cells[7]],
		[tictactoe.cells[1],tictactoe.cells[4],tictactoe.cells[5]],
		[tictactoe.cells[2],tictactoe.cells[0],tictactoe.cells[8]],
		[tictactoe.cells[3],tictactoe.cells[6],tictactoe.cells[7]],
		[tictactoe.cells[1],tictactoe.cells[0],tictactoe.cells[7]],
		[tictactoe.cells[5],tictactoe.cells[0],tictactoe.cells[3]]
		];
}

function checkWinner(){	
	updateWins();
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
	
	tictactoe.moveCount++;
	
	if(tictactoe.moveCount == 9 || winner > 0){
		endGame(winner);
	}else{
		switchPlayers();
	}
}

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
