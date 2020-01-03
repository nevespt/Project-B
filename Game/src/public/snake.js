    $('main').hide()

    const playersNamesjson = {
                    pink: 'Pink',
                    purple: 'Purple',
                    deeppurple: 'Deep Purple',
                    indigo: 'Indigo',
                    blue: 'Blue',
                    lightblue: 'Light Blue',
                    cyan: 'Cyan',
                    teal: 'Teal',
                    green: 'Green',
                    lightgreen: 'Light Green',
                    lime: 'Lime',
                    yellow: 'Yellow',
                    amber: 'Amber',
                    brown: 'Brown',
                    grey: 'Grey',
                    bluegrey: 'Blue Grey',
                }
      
      
      
      $('.playerIcon').hover((e)=> {
            const nameId = $(e.target).attr('id')
            $('#H3PLayerName').html(`Estás prestes a selecionar: <span class="${[nameId]}" id="${[nameId]}" style="background-color: transparent !important">${playersNamesjson[nameId]}</span>`)
        })

        $('.playerIcon').mouseleave((e)=> {
            $('#H3PLayerName').html(`Estás prestes a selecionar:`)
        })


        $('.playerIcon').click((e)=>{
            $('.playerIcon').hide()
            $('.titleGame').hide()
            $('#H3PLayerName').hide()
            $("#screen").css({ display: "inline-block" });
            $("#score").css({ display: "flex" });
            $('main').show()
            comecarAJogar($(e.target).attr('id'))
        })



function comecarAJogar(playerIconSelectedClick) {
            let keyDownSelected = []
		    let connected = false

            const socket = io({
                query: {
                    player_icon: playerIconSelectedClick
                }
            })

socket.on('connect', () => {
    connected = true
    console.log('> Connected to server');
});
socket.on('disconnect', () => {
    console.log('> Disconnected');
    connected = false
    if (confirm("Foste desconectado.\nPressiona OK para reconectares novamente.")) {
        location.reload();
    }
});


const screen = document.getElementById('screen');
const context = screen.getContext('2d');
let game;
let currentPlayer;



socket.on('bootstrap', (gameInitialState) => {
    game = gameInitialState;


    const playersIconsjson = {
                    pink: '"#fd5f00"',
                    purple: document.getElementById('purple'),
                    deeppurple: document.getElementById('deeppurple'),
                    indigo: document.getElementById('indigo'),
                    blue: document.getElementById('blue'),
                    lightblue: document.getElementById('lightblue'),
                    cyan: document.getElementById('cyan'),
                    teal: document.getElementById('teal'),
                    green: document.getElementById('green'),
                    lightgreen: document.getElementById('lightgreen'),
                    lime: document.getElementById('lime'),
                    yellow: document.getElementById('yellow'),
                    amber: document.getElementById('amber'),
                    brown: document.getElementById('brown'),
                    grey: document.getElementById('grey'),
                    bluegrey: document.getElementById('bluegrey'),
                }











    currentPlayer = game.players[game.players.findIndex(player => player.id === socket.id)]
    

    requestAnimationFrame(renderGame);

    function renderGame() {
        context.globalAlpha = 1;
        context.clearRect(0, 0, screen.width, screen.height);

        for (const i in game.players) {
            const player = game.players[i];
            for (let j = 0; j < player.body.length; j++) {
                context.fillStyle = '#ffffff';
                context.globalAlpha = 0.20;
                context.fillRect(player.body[j].x, player.body[j].y, 1, 1);
                if (player.id === socket.id) {
                    context.fillStyle = playersIconsjson[player.player_icon];
                    context.globalAlpha = 0.40;
                    context.fillRect(player.body[j].x, player.body[j].y, 1, 1);
                }
            }
            context.fillStyle = '#ffffff';
            context.globalAlpha = 0.40;
            context.fillRect(player.body[0].x, player.body[0].y, 1, 1);
            if (player.id === socket.id) {
                context.fillStyle = playersIconsjson[currentPlayer.player_icon];
                context.globalAlpha = 1;
                context.fillRect(player.body[0].x, player.body[0].y, 1, 1);
            }
        }
        for (const i in game.fruits) {
            const fruit = game.fruits[i];
            context.fillStyle = '#FD5F00';
            context.globalAlpha = 1;
            context.fillRect(fruit.x, fruit.y, 1, 1);
        }
        updateScoreTable();
        requestAnimationFrame(renderGame);
    }


    function updateScoreTable() {
        const scoreTable = document.getElementById('score');
        const maxResults = 10;
        let scoreTableInnerHTML = `
            <tr class="header">
                <td>Os melhores 10 Noobs</td>
                <td>Pontos</td>
            </tr>
            `;
        const scoreArray = [];
        for (const i in game.players) {
            const player = game.players[i];
            scoreArray.push({
                player: player.id,
                score: player.points
            });
        }

        const scoreArraySorted = scoreArray.sort((first, second) => {
            if (first.score < second.score) {
                return 1;
            }
            if (first.score > second.score) {
                return -1;
            }
            return 0;
        });

        const scoreSliced = scoreArraySorted.slice(0, maxResults);
        scoreSliced.forEach((score) => {
            scoreTableInnerHTML += `
                <tr class="${ socket.id === score.player ? 'current-player' : ''}">
                    <td class="socket-id">${score.player}</td>
                    <td class="score-value">${score.score}</td>
                </tr>
                `;
        });

        let playerNotInTop10 = true;

        for (const score of scoreSliced) {
            if (socket.id === score.player) {
                playerNotInTop10 = false;
                break;
            }
            playerNotInTop10 = true;
        }

        if (playerNotInTop10) {
            scoreTableInnerHTML += `
                <tr class="current-player bottom">
                    <td class="socket-id">${socket.id}</td>
                    <td class="score-value">${currentPlayer.score}</td>
                </tr>
                `;
        }
        scoreTableInnerHTML += `
            <tr class="footer">
                <td>Total de Noobs em Jogo</td>
                <td align="right">${game.players.length}</td>
            </tr>
            `;
        scoreTable.innerHTML = scoreTableInnerHTML;
    }

    document.addEventListener('keydown', (event) => {
        const keyPressed = event.key;
        socket.emit('playerMove', keyPressed);
    });

    socket.on('newGameState', gameState => {
        game = gameState;
        currentPlayer = game.players[game.players.findIndex(player => player.id === socket.id)];
    });

    console.log(playerIconSelectedClick)

});}