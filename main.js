const pokeAPIBaseUrl = "https://pokeapi.co/api/v2/pokemon/";
const game = document.getElementById('game');

const colors = {
    fire: '#fddfdf',
    grass: '#defde0',
    electric: '#fcf7de',
    water: '#def3fd',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#f5f5f5',
    fighting: '#e6e0d4',
    normal: '#f5f5f5'
};

let isPaused = false;
let firstPick;
let matches;

const loadPokemon = async () => {
    const randomIds = new Set();
    while(randomIds.size < 8){
        const randomNumber = Math.ceil(Math.random() * 150);
        randomIds.add(randomNumber)
    }
    const pokePromises =[...randomIds].map( id => fetch(pokeAPIBaseUrl + id));
    const responses = await Promise.all(pokePromises);
    return await Promise.all(responses.map(res => res.json()));
}

const displayPokemon = (pokemon) => {
    pokemon.sort(_ => Math.random() - 0.5);
    const pokemonHTML = pokemon.map(pokemon => {
        const type = pokemon.types[0]?.type?.name || 'normal';
        const color = colors[type]
        return `
        <div class="card" style="background-color:${color}" onclick="clickCard(event)" data-pokename="${pokemon.name}">
            <div class="front">
            </div>            
            <div class="back rotated" style="background-color:${color}">
                <img style="width:100%" src="${pokemon.sprites.front_default}" alt=${pokemon.name}/>
            </div>
        </div> 
        `
    }).join('');
    game.innerHTML = pokemonHTML;
}

const clickCard = (event) => {
    const pokemonCard = event.currentTarget;
    const [front, back] = getFrontAndBackFromCard(pokemonCard);

    if (front.classList.contains("rotated") || isPaused) return;
    
    isPaused = true;
    
    rotateElements([front,back]);

    if(!firstPick) {
        firstPick = pokemonCard;
        isPaused = false;
    }else {
        const secondPokemonName = pokemonCard.dataset.pokename;
        const firstPokemonName = firstPick.dataset.pokename;
        if (firstPokemonName != secondPokemonName) {
            const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
            setTimeout(() => {
                rotateElements([front,back,firstFront,firstBack]);
                firstPick = null;
                isPaused = false;                
            }, 500);
        }else {
            matches++;
            if (matches === 8){
                alert("Ganaste, ¿quieres volver a jugar?");
                resetGame();
            }
            firstPick = null;
            isPaused = false;
        }
    }
}

const rotateElements = (elements) => {
    if (typeof elements != 'object' || !elements.length) return;

    elements.forEach(element => element.classList.toggle('rotated'));
}

const getFrontAndBackFromCard = (card) => {
    const front = card.querySelector(".front");
    const back = card.querySelector(".back");
    return [front, back]
}

const resetGame = () => {
    game.innerHTML = '';
    isPaused = true;
    firstPick = null;
    matches = 0;

    setTimeout( async () => {
        const pokemon = await loadPokemon();
        displayPokemon([...pokemon, ...pokemon]);
        isPaused = false;
    }, 200);
}

resetGame();