// Tic-Tac-Toe JavaScript Game

$(document).ready(function() {
	$('#newGame').click(newGame);	
	$('.gameCell').click(playerMove);
	
	newGame();
});

function newGame(){
	$('.gameCell').html(" ");

	window.cells = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	window.currentPlayer = 1;
	window.winner = 0;
	window.moveCount = 0;

	$('#winnerBox').hide();
	$('.lightbox').hide();
	$('#currentPlayer').html("Player 1's Turn");
}

function playerMove(){

	var cellChoice = parseInt($(this).attr("id"));

	if($(this).html() == "x" || $(this).html() == "o"){
		$('#alert').html("Please select an empty cell").show();
	}else{
		$('#alert').hide();
		if(currentPlayer == 1){
			$(this).html("x");
			cells[cellChoice] = 1;
		}else{
			$(this).html("o");
			cells[cellChoice] = 4;
		}
	
		winner = checkWinner();
		moveCount++;
	
		if(moveCount == 9 || winner > 0){
			endGame();
		}else{
			switchPlayers();
		}
	}
}
	
function checkWinner(){
	var wins = [
				[cells[1],cells[2],cells[3]],
				[cells[4],cells[0],cells[6]],
				[cells[5],cells[8],cells[7]],
				[cells[1],cells[4],cells[5]],
				[cells[2],cells[0],cells[8]],
				[cells[3],cells[6],cells[7]],
				[cells[1],cells[0],cells[7]],
				[cells[5],cells[0],cells[3]]
				];
					
	for(j=0; j < wins.length; j++){
		var total = addCells(wins[j]);
		
		/*wins[j].reduce(function(a,b){ 
			return a + b; });*/
			
		if(total == 3){
			winner = 1;
			break;
		}else if(total == 12){
			winner = 2;
			break;
		}	
	}
	
	return winner;
}

function addCells(arr){
	var total = 0;
	
	for(k=0; k < arr.length; k++){
		if(isNaN(arr[k])){
			total = total;
		} else {
			total += arr[k];
		}
	}	
	return total;
}

function switchPlayers(){
	if(currentPlayer == 1){
		currentPlayer = 2;
		$('#currentPlayer').html("Player 2's Turn");
	}else{
		currentPlayer = 1;
		$('#currentPlayer').html("Player 1's Turn");
	}
}

function endGame(){
	if(winner == 1){
		$('#winner').html("Player 1 Wins!");
	}else if(winner == 2){
		$('#winner').html("Player 2 Wins!");
	}else{
		$('#winner').html("It's a tie!");
	}
	$('#winnerBox').show();
	$('.lightbox').show();
}
