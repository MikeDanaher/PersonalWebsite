// AI Tic-Tac-Toe JavaScript Game

$(document).ready(function() {
	$('#newGame').click(newGame);	
	$('.gameCell').click(playerMove);
	
	newGame();
});

function newGame(){
	$('.gameCell').html(" ");

	window.cells = ["mc","tl","tc","tr","ml","bl","mr","br","bc"];
	window.availableCells = ["mc","tl","tc","tr","ml","bl","mr","br","bc"];
	window.playerSymbol = "x";
	window.playerValue = 1;
	window.moveCount = 0;
	window.round = 1;
	window.possibleWins = [
		[cells[1],cells[2],cells[3]],
		[cells[4],cells[0],cells[6]],
		[cells[5],cells[8],cells[7]],
		[cells[1],cells[4],cells[5]],
		[cells[2],cells[0],cells[8]],
		[cells[3],cells[6],cells[7]],
		[cells[1],cells[0],cells[7]],
		[cells[5],cells[0],cells[3]]
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

	if(round == 1){
		round++;
		if(cells[0] == 1){
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
	for(j=0; j < possibleWins.length; j++){
		var total = addCells(possibleWins[j]);
		if(total == 8){
			nextMove = findNextMove(possibleWins[j]);
			break;
		}	
	}
	return nextMove;
}

function tryBlock(){
	var nextMove = 0;
	for(j=0; j < possibleWins.length; j++){
		var total = addCells(possibleWins[j]);
		if(total == 2){
			nextMove = findNextMove(possibleWins[j]);
			break;
		}	
	}
	return nextMove;
}

function tryCorners(){
	var corners = [cells[1], cells[3], cells[5], cells[7]];
	var total = addCells(corners);
	switch(total){
		case 0:
			pickCornerEmpty();
			break;
		case 1:
			pickSideEmpty();
			break;
		case 2:
			pickSide();
			break;
		case 5:
			pickCorner();
			break;
		default:
			randomMove();
	}
}

function pickCornerEmpty(){
	var nextMove = 0;
	for(j=0; j < possibleWins.length; j++){
		var total = addCells(possibleWins[j]);
		if(total == 1){
			cellChoice(possibleWins[j][0]);
			break;
		}	
	}
}

function pickSideEmpty(){
	var nextMove = 0;
	for(j=0; j < possibleWins.length; j++){
		var total = addCells(possibleWins[j]);
		if(total == 0){
			cellChoice(possibleWins[j][1]);
			break;
		}	
	}
}

function pickSide(){
	var sides = [];
	for(i = 0; i < availableCells.length; i++){
		if(availableCells[i] == "tc" || availableCells[i] == "ml" || availableCells[i] == "mr" || availableCells[i] == "bc"){
			sides.push(availableCells[i]);
		}
	}
	var randomSide = Math.floor(Math.random()*sides.length);
	cellChoice(sides[randomSide]);
}

function pickCorner(){
	var corners = [];
	for(i = 0; i < availableCells.length; i++){
		if(availableCells[i] == "tl" || availableCells[i] == "tr" || availableCells[i] == "bl" || availableCells[i] == "br"){
			corners.push(availableCells[i]);
		}
	}
	var randomCorner = Math.floor(Math.random()*corners.length);
	cellChoice(corners[randomCorner]);
}

function randomMove(){
	var randomCell = Math.floor(Math.random()*availableCells.length);
	cellChoice(availableCells[randomCell]);
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
	for(i = 0; i < cells.length; i++){
		if(cells[i] == c){
			$('#' + c).html(playerSymbol);
			cells[i] = playerValue;
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
	for(i=0; i < availableCells.length; i++){
		if(availableCells[i] == c){
			availableCells.splice(i, 1);
			break;
		}
	}
}

function updateWins(){

	possibleWins = [
		[cells[1],cells[2],cells[3]],
		[cells[4],cells[0],cells[6]],
		[cells[5],cells[8],cells[7]],
		[cells[1],cells[4],cells[5]],
		[cells[2],cells[0],cells[8]],
		[cells[3],cells[6],cells[7]],
		[cells[1],cells[0],cells[7]],
		[cells[5],cells[0],cells[3]]
		];
}

function checkWinner(){	
	updateWins();
	var winner = 0;
			
	for(j=0; j < possibleWins.length; j++){
		var total = addCells(possibleWins[j]);
		
		if(total == 3){
			winner = 1;
			break;
		}else if(total == 12){
			winner = 2;
			break;
		}	
	}
	
	moveCount++;
	
	if(moveCount == 9 || winner > 0){
		endGame(winner);
	}else{
		switchPlayers();
	}
}

function switchPlayers(){
	if(playerValue == 1){
		playerSymbol = "o";
		playerValue = 4;
		$('#currentPlayer').html("Computer's Turn");
		setTimeout(computerMove, 1200);
	}else{
		playerSymbol = "x";
		playerValue = 1;
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
