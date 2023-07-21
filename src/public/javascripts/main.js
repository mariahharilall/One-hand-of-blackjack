//TODO: unhide computer's first card when there's a winner
//TODO: make it so ties are possible
const deck = [];
const faces = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
for (let i=0; i<faces.length; i++) {
    for (let j=0; j < values.length; j++) {
        const card = {
            face: faces[i],
            value: values[j]
        };
        deck.push(card);
    }
}

function randomize(cards) {
    const randomizedDeck = [];
    while (cards.length !== 0) {
        const randomCardIndex = Math.floor(Math.random() * cards.length);
        randomizedDeck.push(cards[randomCardIndex]);
        cards.splice(randomCardIndex, 1);
    }
    return randomizedDeck;
}

function moveToBack(backCards, deck) {
    backCards = backCards.reverse();
    // splice ele from deck then push to back
    for (const card in backCards) {
        let cardFound = false;
        let index = 0;
        while (!cardFound && index < deck.length) {
            if (deck[index].value === backCards[card]) {
                // if find card, splice it out, then push to end
                const foundCard = deck.splice(index, 1);
                deck.push(foundCard[0]);
                cardFound = true;
            } else {
                index++;
            }
        }
    }
}

function deckSetup(topCards) {
    // randomize elements
    const gameDeck = randomize(deck);

    // if user entered topCards, swap elements so topCard elements are at back
    // (so they'll get popped from array first)
    if (topCards) {
        moveToBack(topCards, gameDeck);
    }

    return gameDeck;
}

function addCardElement(cardSpace, card, hidden=false) {
    const cardElement = document.createElement('div');
    const cardText = document.createTextNode(card.face + ' ' + card.value);
    cardElement.appendChild(cardText);
    cardSpace.appendChild(cardElement);

    if (hidden) {
        cardElement.classList.add('hiddenCard');
    }

    return cardElement; 
}

function updateTotal(totalElement, cards, user) {
    let total = 0; 
    for (const card in cards) {
        if (isNaN(cards[card].value)) {
            if (cards[card].value === 'A') {
                // either 1 or 11 --> optimize 
                // choose the bigger number as long as it makes total <= 21
                if ( (21 >= (total + 11)) && ((total+11) > (total+1)) ) {
                    total += 11;
                } else {
                    total+=1; 
                }
            } else {
                total += 10;
            } 
        } else {
            total += parseInt(cards[card].value);
        }
    }
    const content = document.createTextNode(user + ' Total: ' + total);
    totalElement.appendChild(content);
    return total;
}

function main() {
    const playBtn = document.querySelector('.playBtn');
    const form = document.querySelector('form');
    playBtn.addEventListener('click', function(event) {
        form.classList.add('hide');
        event.preventDefault();
        let topCards = document.getElementById('startValues').value;
        if (topCards) {
            // turn entry string into array by splitting
            topCards = topCards.split(',');
        }
        const gameDeck = deckSetup(topCards);

        const playerCards = [];
        const computerCards = [];

        // deal first 4 cards: pop from end
        for (let i=0; i<4; i++) {
            if (i%2===0) {
                computerCards.push(gameDeck.pop());
            } else {
                playerCards.push(gameDeck.pop());
            }
        }

        const gamespace = document.querySelector('.game');
        const computerCardSpace = document.createElement('div');
        const playerCardSpace = document.createElement('div');

        gamespace.appendChild(computerCardSpace);
        gamespace.appendChild(playerCardSpace);

        // will be divs in computer card space div
        const hiddenCard = addCardElement(computerCardSpace, computerCards[0], true);
        addCardElement(computerCardSpace, computerCards[1]);
            
        for (const card in playerCards) {
            // will be divs in player card space div
            addCardElement(playerCardSpace, playerCards[card]);
        }

        let playerTotalElement = document.createElement('h3');
        playerCardSpace.appendChild(playerTotalElement);
        let computerTotalElement = document.createElement('h3');
        computerCardSpace.appendChild(computerTotalElement);

        updateTotal(playerTotalElement, playerCards, 'Player');
        const hideComputerTotal = document.createTextNode('Computer Total: ?');
        computerTotalElement.appendChild(hideComputerTotal);
        // updateTotal(computerTotalElement, computerCards, 'Computer'); 

        const hitBtn = document.createElement('button');
        hitBtn.textContent = 'Hit';
        gamespace.appendChild(hitBtn);

        const standBtn = document.createElement('button');
        standBtn.textContent = 'Stand';
        gamespace.appendChild(standBtn);

        let winner;
        function winnerFound(winner) {
            console.log('winner is: ' + winner);

            // unflip computer's hidden card + unhide computer's score
            hiddenCard.classList.remove('hiddenCard');
            computerCardSpace.removeChild(computerTotalElement);
            computerTotalElement = document.createElement('h3');
            computerCardSpace.appendChild(computerTotalElement);
            updateTotal(computerTotalElement, computerCards, 'Computer');

            // make element that says winner
            const winnerElement = document.createElement('h2');
            const content = document.createTextNode('Winner: ' + winner);
            winnerElement.appendChild(content);
            gamespace.appendChild(winnerElement);


            // get rid of buttons
            gamespace.removeChild(hitBtn);
            gamespace.removeChild(standBtn);
        }

        function handleDeal() {
            playerCards.push(gameDeck.pop());
            addCardElement(playerCardSpace, playerCards[playerCards.length-1]);

            // update the textContent of the element showing the count of the hand
            playerCardSpace.removeChild(playerTotalElement);
            playerTotalElement = document.createElement('h3');
            playerCardSpace.appendChild(playerTotalElement);
            const total = updateTotal(playerTotalElement, playerCards, 'Player');
            if (total === 21) {
                winner = 'Player';
            } else if (total > 21) {
                winner = 'Computer'; 
            }

            // if winner call winner function
            if (winner) {
                winnerFound(winner);
            }
        }

        function handleStand() {
            // get rid of buttons
            gamespace.removeChild(hitBtn);
            gamespace.removeChild(standBtn);

            // let computer play
            // comp will hit as long as score < 21 (stand if it's 21)
            computerCardSpace.removeChild(computerTotalElement);
            computerTotalElement = document.createElement('h3');
            computerCardSpace.appendChild(computerTotalElement);
            let total = updateTotal(computerTotalElement, computerCards, 'Computer');
            while (total < 21) {
                computerCards.push(gameDeck.pop());
                
                addCardElement(computerCardSpace, computerCards[computerCards.length-1]);

                computerCardSpace.removeChild(computerTotalElement);
                computerTotalElement = document.createElement('h3');
                computerCardSpace.appendChild(computerTotalElement);
                total = updateTotal(computerTotalElement, computerCards, 'Computer');
            }

            if (total === 21) {
                winner = 'Computer';
            } else if (total > 21) {
                winner = 'Player'; 
            }

            if(winner) {
                winnerFound(winner);
            }
        }

        hitBtn.addEventListener('click', handleDeal);
        standBtn.addEventListener('click', handleStand);
    });
}

document.addEventListener('DOMContentLoaded', main);
