let players = [];
let playerBeans = {};
let currentRound = 1;
const totalRounds = 5;
const maxBeans = 10;
let currentPlayerIndex = 0;
const roundResults = [];

document.getElementById('teamSizeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const redTeamSize = document.getElementById('redTeamSize').value;
    const blueTeamSize = document.getElementById('blueTeamSize').value;
    generatePlayerFields(redTeamSize, blueTeamSize);
    document.getElementById('setup').style.display = 'none';
    document.getElementById('playerSetup').style.display = 'block';
});

function generatePlayerFields(redTeamSize, blueTeamSize) {
    const redTeamDiv = document.getElementById('redTeam');
    const blueTeamDiv = document.getElementById('blueTeam');
    
    for (let i = 1; i <= redTeamSize; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${i}`;
        input.placeholder = `Player ${i} (Red)`;
        input.required = true;
        redTeamDiv.appendChild(input);
    }

    for (let i = 1; i <= blueTeamSize; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${parseInt(redTeamSize) + i}`;
        input.placeholder = `Player ${i} (Blue)`;
        input.required = true;
        blueTeamDiv.appendChild(input);
    }
}

document.getElementById('playerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    players = [];
    document.querySelectorAll('#redTeam input').forEach(input => {
        players.push({ name: input.value, team: 'Red' });
    });
    document.querySelectorAll('#blueTeam input').forEach(input => {
        players.push({ name: input.value, team: 'Blue' });
    });
    document.getElementById('playerSetup').style.display = 'none';
    document.getElementById('confirmation').style.display = 'block';
});

document.getElementById('confirmReady').addEventListener('click', function() {
    document.getElementById('confirmation').style.display = 'none';
    startGame();
});

function startGame() {
    document.getElementById('game').style.display = 'block';
    players.forEach(player => {
        playerBeans[player.name] = maxBeans;
    });
    currentPlayerIndex = 0; // Start with the first player
    showNextPlayer(); // Show the first player at the start of the game
}

function displayPlayerInput() {
    if (currentPlayerIndex >= players.length) {
        processRound();
        return;
    }

    const player = players[currentPlayerIndex];
    document.getElementById('inputArea').innerHTML = `
        <label>${player.name} (${player.team}) - Beans left: ${playerBeans[player.name]}</label>
        <input type="number" id="beanInput" min="0" max="${Math.min(10, playerBeans[player.name])}" required>
        <button id="submitInput">Submit</button>
    `;
    document.getElementById('inputArea').style.display = 'block';
    document.getElementById('confirmPlayer').style.display = 'none';
    document.getElementById('submitInput').addEventListener('click', handlePlayerInput);
}

function handlePlayerInput() {
    const player = players[currentPlayerIndex];
    const beanInput = document.getElementById('beanInput');
    const beans = parseInt(beanInput.value);

    // Ensure the entered value is valid
    if (isNaN(beans) || beans < 0 || beans > 10 || beans > playerBeans[player.name]) {
        alert(`Invalid input. Please enter a value between 0 and ${Math.min(10, playerBeans[player.name])}.`);
        return;
    }

    playerBeans[player.name] -= beans;
    players[currentPlayerIndex].beans = beans;
    currentPlayerIndex++;

    if (currentPlayerIndex < players.length) {
        showNextPlayer();
    } else {
        processRound();
    }
}

function showNextPlayer() {
    if (currentPlayerIndex >= players.length) {
        processRound();
        return;
    }
    
    const nextPlayer = players[currentPlayerIndex];
    document.getElementById('inputArea').style.display = 'none';
    document.getElementById('confirmPlayer').innerText = `Next Player: ${nextPlayer.name} (${nextPlayer.team})`;
    document.getElementById('confirmPlayer').style.display = 'block';
    document.getElementById('confirmPlayer').removeEventListener('click', displayPlayerInput);
    document.getElementById('confirmPlayer').addEventListener('click', displayPlayerInput);
}

function processRound() {
    document.getElementById('inputArea').style.display = 'none';
    document.getElementById('confirmPlayer').style.display = 'none';

    const redTeam = players.filter(player => player.team === 'Red');
    const blueTeam = players.filter(player => player.team === 'Blue');

    const redTotal = redTeam.reduce((total, player) => total + player.beans, 0);
    const blueTotal = blueTeam.reduce((total, player) => total + player.beans, 0);

    roundResults.push({ redTotal, blueTotal });

    displayResults(redTotal, blueTotal);
}

function displayResults(redTotal, blueTotal) {
    const resultsDiv = document.getElementById('results');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    if (redTotal === blueTotal) {
        resultTitle.style.display = 'none';
        resultMessage.innerText = `Round Draw`;
    } else {
        resultTitle.style.display = 'block';
        if (redTotal > blueTotal) {
            resultMessage.innerText = `Red Team wins!\nBlue Team beans: ${blueTotal}`;
        } else {
            resultMessage.innerText = `Blue Team wins!\nRed Team beans: ${redTotal}`;
        }
    }
    resultsDiv.style.display = 'block';
}

document.getElementById('nextRound').addEventListener('click', function() {
    currentRound++;
    currentPlayerIndex = 0;

    if (currentRound > totalRounds) {
        displayFinalResults();
    } else {
        document.getElementById('results').style.display = 'none';
        document.getElementById('roundNumber').innerText = currentRound;
        showNextPlayer(); // Show next player at the start of the new round
    }
});

function displayFinalResults() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('finalResults').style.display = 'block';
    const finalScores = document.getElementById('finalScores');
    finalScores.innerHTML = `<h3>Round Summary</h3>`;

    let redTeamWins = 0;
    let blueTeamWins = 0;

    roundResults.forEach((result, index) => {
        if (result.redTotal > result.blueTotal) {
            redTeamWins++;
        } else if (result.blueTotal > result.redTotal) {
            blueTeamWins++;
        }
        finalScores.innerHTML += `<p>Round ${index + 1} - Red Team: ${result.redTotal}, Blue Team: ${result.blueTotal} - ${result.redTotal === result.blueTotal ? 'Draw' : (result.redTotal > result.blueTotal ? 'Red Team wins' : 'Blue Team wins')}</p>`;
    });

    finalScores.innerHTML += `<h3>Final Bean Count</h3>`;
    players.forEach(player => {
        finalScores.innerHTML += `<p>${player.name} (${player.team}): ${playerBeans[player.name]} beans</p>`;
    });

    let winner;
    if (redTeamWins > blueTeamWins) {
        winner = 'Red Team';
    } else if (blueTeamWins > redTeamWins) {
        winner = 'Blue Team';
    } else {
        winner = 'No one, it\'s a draw';
    }

    finalScores.innerHTML += `<h3>${winner} wins the game!</h3>`;
}

document.getElementById('restartGame').addEventListener('click', function() {
    resetGame();
});

function resetGame() {
    players = [];
    playerBeans = {};
    currentRound = 1;
    currentPlayerIndex = 0;
    roundResults.length = 0;
    
    document.getElementById('setup').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('finalResults').style.display = 'none';
    
    // Clear input fields
    document.getElementById('playerForm').reset();
}
