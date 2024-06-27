let players = [];
let playerBeans = {};
let currentRound = 1;
const totalRounds = 5;
const maxBeans = 10;
let currentPlayerIndex = 0;
const roundResults = [];
let totalPlayers;
let playerCount = 0;
let team1Name = '';
let team2Name = '';

document.getElementById('teamSizeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const team1Size = document.getElementById('team1Size').value;
    const team2Size = document.getElementById('team2Size').value;
    totalPlayers = parseInt(team1Size) + parseInt(team2Size);
    document.getElementById('setup').style.display = 'none';
    document.getElementById('playerSetup').style.display = 'block';
});

document.getElementById('individualPlayerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const playerName = document.getElementById('playerName').value;
    const playerPassword = document.getElementById('playerPassword').value;

    if (playerPassword.length !== 3) {
        alert('비밀번호는 반드시 3자리여야 합니다.');
        return;
    }

    const team = playerCount < document.getElementById('team1Size').value ? 'Team1' : 'Team2';
    players.push({ name: playerName, password: playerPassword, team });

    playerCount++;
    if (playerCount < totalPlayers) {
        document.getElementById('individualPlayerForm').reset();
    } else {
        document.getElementById('playerSetup').style.display = 'none';
        startGame();
    }
});

function startGame() {
    document.getElementById('game').style.display = 'block';
    players.forEach(player => {
        playerBeans[player.name] = maxBeans;
    });
    team1Name = players.find(p => p.team === 'Team1').name;
    team2Name = players.find(p => p.team === 'Team2').name;
    document.getElementById('team1Name').innerText = `${team1Name}팀`;
    document.getElementById('team2Name').innerText = `${team2Name}팀`;
    showTeamButtons();
}

function showTeamButtons() {
    const team1Players = document.getElementById('team1Players');
    const team2Players = document.getElementById('team2Players');
    team1Players.innerHTML = '';
    team2Players.innerHTML = '';

    players.forEach(player => {
        const button = document.createElement('button');
        button.innerText = player.name;
        button.disabled = player.beans !== undefined;
        if (player.beans !== undefined) {
            button.classList.add('submitted');
        } else {
            button.classList.remove('submitted');
        }
        button.addEventListener('click', () => showPasswordPrompt(player));
        if (player.team === 'Team1') {
            team1Players.appendChild(button);
        } else {
            team2Players.appendChild(button);
        }
    });

    if (players.every(player => player.beans !== undefined)) {
        document.getElementById('showResultsButton').style.display = 'block';
    }
}

function showPasswordPrompt(player) {
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('playerInputArea').style.display = 'block';
    document.getElementById('playerNameLabel').innerText = `${player.name}의 비밀번호를 입력하세요`;
    document.getElementById('playerPasswordInput').value = '';
    
    document.getElementById('passwordSubmit').onclick = function() {
        const enteredPassword = document.getElementById('playerPasswordInput').value;
        if (enteredPassword.length !== 3) {
            alert('비밀번호는 반드시 3자리여야 합니다.');
            return;
        }
        if (enteredPassword === player.password) {
            document.getElementById('playerInputArea').style.display = 'none';
            showBeanInput(player);
        } else {
            alert('비밀번호가 틀렸습니다. 다시 시도하세요.');
        }
    };

    document.getElementById('goBack').onclick = function() {
        document.getElementById('playerInputArea').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'block';
    };
}

function showBeanInput(player) {
    document.getElementById('beanInputArea').style.display = 'block';
    document.getElementById('beanInputLabel').innerText = `${player.name} - 남은 콩: ${playerBeans[player.name]}`;
    document.getElementById('beanInput').value = '0';
    document.getElementById('beanInput').max = playerBeans[player.name];

    document.getElementById('submitBean').onclick = function() {
        const beans = parseInt(document.getElementById('beanInput').value);
        if (beans >= 0 && beans <= playerBeans[player.name]) {
            playerBeans[player.name] -= beans;
            player.beans = beans;
            document.getElementById('beanInputArea').style.display = 'none';
            document.getElementById('gameBoard').style.display = 'block';
            showTeamButtons();
            if (players.every(player => player.beans !== undefined)) {
                document.getElementById('showResultsButton').style.display = 'block';
            }
        } else {
            alert(`잘못된 입력입니다. 0에서 ${playerBeans[player.name]} 사이의 값을 입력하세요.`);
        }
    };
}

document.getElementById('showResults').addEventListener('click', processRound);

function processRound() {
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('playerInputArea').style.display = 'none';
    document.getElementById('beanInputArea').style.display = 'none';
    document.getElementById('showResultsButton').style.display = 'none';

    const { team1Total, team2Total } = calculateTeamResults();
    roundResults.push({ team1Total, team2Total });

    displayResults(team1Total, team2Total);
    checkEarlyWin();
}

function calculateTeamResults() {
    const team1 = players.filter(player => player.team === 'Team1');
    const team2 = players.filter(player => player.team === 'Team2');

    const team1Total = team1.reduce((total, player) => total + (player.beans || 0), 0);
    const team2Total = team2.reduce((total, player) => total + (player.beans || 0), 0);

    return { team1Total, team2Total };
}

function displayResults(team1Total, team2Total) {
    const resultsDiv = document.getElementById('results');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');

    if (team1Total === team2Total) {
        resultTitle.style.display = 'none';
        resultMessage.innerText = `라운드 무승부`;
    } else {
        resultTitle.style.display = 'block';
        if (team1Total > team2Total) {
            resultMessage.innerText = `${team1Name}팀 승리!\n${team2Name}팀이 낸 콩 개수: ${team2Total}개!`;
        } else {
            resultMessage.innerText = `${team2Name}팀 승리!\n${team1Name}팀이 낸 콩 개수: ${team1Total}개!`;
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
        document.getElementById('gameBoard').style.display = 'block';
        document.getElementById('roundNumber').innerText = currentRound;
        players.forEach(player => {
            player.beans = undefined;
        });
        showTeamButtons(); // Show team buttons at the start of the new round
    }
});

function checkEarlyWin() {
    let team1Wins = 0;
    let team2Wins = 0;

    roundResults.forEach(result => {
        if (result.team1Total > result.team2Total) {
            team1Wins++;
        } else if (result.team2Total > result.team1Total) {
            team2Wins++;
        }
    });

    if (team1Wins >= 3 || team2Wins >= 3) {
        displayFinalResults();
    }
}

function displayFinalResults() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('finalResults').style.display = 'block';
    const finalScores = document.getElementById('finalScores');
    finalScores.innerHTML = `<h3>라운드 요약</h3>`;

    let team1Wins = 0;
    let team2Wins = 0;

    roundResults.forEach((result, index) => {
        if (result.team1Total > result.team2Total) {
            team1Wins++;
        } else if (result.team2Total > result.team1Total) {
            team2Wins++;
        }
        finalScores.innerHTML += `<p>라운드 ${index + 1} - 팀1: ${result.team1Total}, 팀2: ${result.team2Total} - ${result.team1Total === result.team2Total ? '무승부' : (result.team1Total > result.team2Total ? '팀1 승리' : '팀2 승리')}</p>`;
    });

    finalScores.innerHTML += `<h3>최종 콩 개수</h3>`;
    players.forEach(player => {
        finalScores.innerHTML += `<p>${player.name} (${player.team}): ${playerBeans[player.name]} 콩</p>`;
    });

    let winner;
    if (team1Wins > team2Wins) {
        winner = team1Name;
    } else if (team2Wins > team1Wins) {
        winner = team2Name;
    } else {
        winner = '무승부';
    }

    if (winner === '무승부') {
        finalScores.innerHTML += `<h3>${winner}입니다!</h3>`;
    } else {
        finalScores.innerHTML += `<h3>${winner}팀 게임에서 승리!</h3>`;
    }
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
    playerCount = 0;
    team1Name = '';
    team2Name = '';

    document.getElementById('setup').style.display = 'block';
    document.getElementById('game').style.display = 'none';
    document.getElementById('finalResults').style.display = 'none';

    // Clear input fields
    document.getElementById('individualPlayerForm').reset();
}
