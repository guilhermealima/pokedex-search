class pokemonData {
    constructor(pokemon, evolution){
        this.name = pokemon.species.name;
        this.type1 = pokemon.types[0]?.type.name;
        this.type2 = pokemon.types[1]?.type.name;
        this.picture = pokemon.sprites.other.home.front_default;
        this.species = '';
        this.description = '';
        this.height = putDecimalOnNumber(pokemon.height);
        this.weight = putDecimalOnNumber(pokemon.weight);
        this.abilities = pokemon.abilities;
        this.statHp = pokemon.stats[0].base_stat;
        this.statAttack = pokemon.stats[1].base_stat;
        this.statDefense = pokemon.stats[2].base_stat;
        this.statSpAtk = pokemon.stats[3].base_stat;
        this.statSpDef = pokemon.stats[4].base_stat;
        this.statSpeed = pokemon.stats[5].base_stat;
        this.evolutionChain = evolution.chain;
        this.evolutionStage2 = [];
        this.evolutionStage3 = [];
    }

    setDescription(species){
        const entriesArray = species.flavor_text_entries;

        for (let item of entriesArray){
            if (item.language.name === 'en'){
                const description = item.flavor_text.includes('') ? item.flavor_text.replace(//g, ' ') : item.flavor_text;
                this.description = description;
                break;
            }
        }
    }

    setSpecies(species){
        const entriesArray = species.genera;

        for (let item of entriesArray){
            if (item.language.name === 'en'){
                this.species = item.genus;
                break;
            }
        }
    }
}

const getSpeciesUrl = 'https://pokeapi.co/api/v2/pokemon-species/'
const getPokemonUrl = 'https://pokeapi.co/api/v2/pokemon/';
const errorImageUrl = './img/error-mark.png';

let uiTabAbout;
let uiTabStats;
let uiTabEvolution;

const uiInputPokemon = document.querySelector('.type-pokemon');
const uiSendForm = document.querySelector('.search-form');
const uiSendButton = document.querySelector('.search-pokemon');

const uiPokemonName = document.querySelector('.pokemon-title');
const uiErrorTitle = document.querySelector('.error-title');
const uiResultsSection = document.querySelector('.results-wrapper');

const uiPokemonAbout = document.querySelector('.pokemon-about');
const uiPokemonBaseStats = document.querySelector('.pokemon-base-stats');
const uiPokemonEvolution = document.querySelector('.pokemon-evolution');

const uiPokemonHp = document.querySelector('.pokemon-hp');
const uiPokemonAtk = document.querySelector('.pokemon-atk');
const uiPokemonDef = document.querySelector('.pokemon-def');
const uiPokemonSpAtk = document.querySelector('.pokemon-spatk');
const uiPokemonSpDef = document.querySelector('.pokemon-spdef');
const uiPokemonSpd = document.querySelector('.pokemon-spd');



const uiPokemonPicture = document.querySelector('.pokemon-image');
const uiTabs = document.querySelector('.pokemon-tabs');


//Event listeners
uiSendForm.addEventListener("submit", getPokemon);

function getPokemon(e){
    e.preventDefault();
    clearPreviousPokemon();

    fetchPokemon(e).then((data) => {
        const pokemon = new pokemonData(data[0], data[2]);
        pokemon.setDescription(data[1]);
        pokemon.setSpecies(data[1]);

        //Creating Pokemon Title and Picture
        createElement('h2', pokemon.name.toUpperCase(), '', '', uiPokemonName);
        createImageElement('img', pokemon.picture, uiPokemonPicture);

        //Creating tabs and their content
        createTabs();
        createDataAboutTab(pokemon);
        createDataBaseStatsTab(pokemon);
        createDataEvolutionTab(pokemon);
    })
    .catch((error) => {
        console.log('ERROR:', error);
    });
}


async function fetchPokemon(e){
    let finalUrl = '';
    let pokemonName = '';

    //Checks if request comes from input or click on Pokémon's name on Evolution tab
    //In case of input, also checks special name cases
    if(e.target.matches('form')){
        pokemonName = checkSpecialPokemonNames(uiInputPokemon.value.trim().toLowerCase());

        if(uiInputPokemon.value.trim() === ''){
            handleError(404);
            throw new Error(`Search field is empty`);
        }
    }
    else{
        pokemonName = e.target.textContent.toLowerCase();
    }

    finalUrl = `${getSpeciesUrl}${pokemonName}`;

    // Getting values from species
    const responseSpecies = await fetch(finalUrl).catch(() => handleError(500));

    if(!responseSpecies.ok){
        handleError(responseSpecies.status);
        throw new Error(`Error while fetching data. Status code: ${responseSpecies.status}`)
    }

    const dataSpecies = await responseSpecies.json().catch(() => handleError(500));

    //Getting values from Pokemon itself
    const responsePokemon = await fetch(`${getPokemonUrl}${dataSpecies.name}`);

    if(!responsePokemon.ok){
        handleError(responsePokemon.status);
        throw new Error(`Error while fetching data. Status code: ${responsePokemon.status}`)
    }

    const dataPokemon = await responsePokemon.json().catch(() => handleError(500));

    //Getting values from Evolution chain
    const responseEvolution = await fetch(dataSpecies.evolution_chain.url);

    if(!responseEvolution.ok){
        handleError(responseEvolution.status);
        throw new Error(`Error while fetching data. Status code: ${responseEvolution.status}`)
    }

    const dataEvolution = await responseEvolution.json().catch(() => handleError(500));

    return [dataPokemon, dataSpecies, dataEvolution];
}

function createTabs(){
    createElement('button', 'About', 'btn-tabs active', 'btn-about', uiTabs);
    createElement('button', 'Base Stats', 'btn-tabs', 'btn-base-stats', uiTabs);
    createElement('button', 'Evolution', 'btn-tabs', 'btn-evolution', uiTabs);

    uiPokemonAbout.style.display = 'block';

    console.log(document.querySelector('#btn-base-stats'));
    document.querySelector('#btn-about').addEventListener("click", activeTab);
    document.querySelector('#btn-base-stats').addEventListener("click", activeTab);
    document.querySelector('#btn-evolution').addEventListener("click", activeTab);
}

function createDataAboutTab(pokemon){
    uiPokemonAbout.style.backgroundColor = '#ffffff';

    //Formatting text for Types
    const typesTextContent = pokemon.type2 ? `Types: ${capitalizeFirstLetter(pokemon.type1)} / ${capitalizeFirstLetter(pokemon.type2)}` : `Type: ${capitalizeFirstLetter(pokemon.type1)}`;

    //Formatting text for Abilities
    let strAllAbilities = '';

    pokemon.abilities.forEach((item, index) => {
        index != 0 ? strAllAbilities += ', ' : strAllAbilities;
        strAllAbilities += `${capitalizeFirstLetter(item.ability.name)}`;
    })

    createElement('p', typesTextContent, '', '', uiPokemonAbout);
    createElement('p', `Species: ${pokemon.species}`, '', '', uiPokemonAbout);
    createElement('p', `Abilities: ${strAllAbilities}`, '', '', uiPokemonAbout);
    createElement('p', `Height: ${pokemon.height} m`, '', '', uiPokemonAbout);
    createElement('p', `Weight: ${pokemon.weight} kg`, '', '', uiPokemonAbout);
    createElement('p', pokemon.description, '', '', uiPokemonAbout);
}

function createDataBaseStatsTab(pokemon){
    uiPokemonBaseStats.style.backgroundColor = '#ffffff';

    uiPokemonBaseStats.style.display = 'none';

    uiPokemonHp.append(createLabelBaseStats('HP', 'label-bar'), createLabelBaseStats(pokemon.statHp, 'label-stat-number'), createBarBaseStats(pokemon.statHp));
    uiPokemonAtk.append(createLabelBaseStats('Attack', 'label-bar'), createLabelBaseStats(pokemon.statAttack, 'label-stat-number'), createBarBaseStats(pokemon.statAttack));
    uiPokemonDef.append(createLabelBaseStats('Defense', 'label-bar'), createLabelBaseStats(pokemon.statDefense, 'label-stat-number'), createBarBaseStats(pokemon.statDefense));
    uiPokemonSpAtk.append(createLabelBaseStats('Special Attack', 'label-bar'), createLabelBaseStats(pokemon.statSpAtk, 'label-stat-number'), createBarBaseStats(pokemon.statSpAtk));
    uiPokemonSpDef.append(createLabelBaseStats('Special Defense', 'label-bar'), createLabelBaseStats(pokemon.statSpDef, 'label-stat-number'), createBarBaseStats(pokemon.statSpDef));
    uiPokemonSpd.append(createLabelBaseStats('Speed', 'label-bar'), createLabelBaseStats(pokemon.statSpeed, 'label-stat-number'), createBarBaseStats(pokemon.statSpeed));
}

function createDataEvolutionTab(pokemon){
    uiPokemonEvolution.style.backgroundColor = '#ffffff';

    for (let secondStage of pokemon.evolutionChain.evolves_to){
        pokemon.evolutionStage2.push([pokemon.evolutionChain.species.name, secondStage.species.name]);

        if(secondStage.evolves_to){
            secondStage.evolves_to.forEach((thirdStage, index) => {
                pokemon.evolutionStage3.push([secondStage.species.name, thirdStage.species.name]);
            });
        }
    }
    
    //Handle case of no evolution
    if(pokemon.evolutionStage2.length == 0 && pokemon.evolutionStage3.length == 0){
        createElement('section', '', 'evolution-chain', '', uiPokemonEvolution);
        createElement('section', 'This Pokémon does not have an evolution.', '', '', document.querySelector('.evolution-chain'));
    }

    //Handling cases for stages 2 and stages 3 of evolution chain
    populatingEvolutionList(pokemon.evolutionStage2);
    populatingEvolutionList(pokemon.evolutionStage3);
}   

function populatingEvolutionList(evolutionChainArray){
    evolutionChainArray.forEach((item, index) => {   
        //Creating Stage 1 Pokémon --------> evolves to --------> Stage 2 Pokémon

        //Wrapper
        const evolutionChain = document.createElement('section');
        evolutionChain.className = 'evolution-chain';
        uiPokemonEvolution.append(evolutionChain);

        //Stage 1 Element
        const stage1 = document.createElement('section');
        stage1.textContent = `${capitalizeFirstLetter(item[index, 0])}`;
        stage1.className = 'stage1';
        evolutionChain.append(stage1);

        //Arrow Wrapper
        const arrowWrapper = document.createElement('section');
        arrowWrapper.className = 'stage-arrow-wrapper';
        evolutionChain.append(arrowWrapper);

        createElement('span', 'evolves to', 'stage-arrow-text', '', arrowWrapper);
        createElement('section', '', 'stage-arrow-line', '', arrowWrapper);

        //Stage 2 Element
        const stage2 = document.createElement('section');
        stage2.textContent = `${capitalizeFirstLetter(item[index, 1])}`;
        stage2.className = 'stage2';
        evolutionChain.append(stage2);

        stage1.addEventListener('click', getPokemon);
        stage2.addEventListener('click', getPokemon);
    });
}

function clearPreviousPokemon(){
    uiPokemonName.innerHTML = '';
    uiPokemonAbout.innerHTML = '';
    uiPokemonAbout.style.display = 'none';
    uiPokemonBaseStats.style.display = 'none';
    uiPokemonEvolution.style.display = 'none';
    uiPokemonHp.innerHTML = '';
    uiPokemonAtk.innerHTML = '';
    uiPokemonDef.innerHTML = '';
    uiPokemonSpAtk.innerHTML = '';
    uiPokemonSpDef.innerHTML = '';
    uiPokemonSpd.innerHTML = '';
    uiPokemonEvolution.innerHTML = '';
    uiPokemonPicture.innerHTML = '';
    uiErrorTitle.style.display = 'none';
    uiErrorTitle.innerHTML = '';
    uiTabs.innerHTML = '';
}

function activeTab(e){
    const typeTab = e.target.id;

    const uiBtnTabAbout = document.querySelector('#btn-about');
    const uiBtnTabBaseStats = document.querySelector('#btn-base-stats');
    const uiBtnTabEvolution = document.querySelector('#btn-evolution');

    let checkActive = {
        'btn-about': () => {
            uiPokemonAbout.style.display = 'block';
            uiPokemonBaseStats.style.display = 'none';
            uiPokemonEvolution.style.display = 'none';

            uiBtnTabAbout.className = 'btn-tabs active';
            uiBtnTabBaseStats.className = 'btn-tabs';
            uiBtnTabEvolution.className = 'btn-tabs';
        },
        'btn-base-stats': () => {
            uiPokemonAbout.style.display = 'none';
            uiPokemonBaseStats.style.display = 'flex';
            uiPokemonEvolution.style.display = 'none';

            uiBtnTabAbout.className = 'btn-tabs';
            uiBtnTabBaseStats.className = 'btn-tabs active';
            uiBtnTabEvolution.className = 'btn-tabs';
        },
        'btn-evolution': () => {
            uiPokemonAbout.style.display = 'none';
            uiPokemonBaseStats.style.display = 'none';
            uiPokemonEvolution.style.display = 'flex';

            uiBtnTabAbout.className = 'btn-tabs';
            uiBtnTabBaseStats.className = 'btn-tabs';
            uiBtnTabEvolution.className = 'btn-tabs active';
        }
    };

    checkActive[typeTab]();
}

function checkSpecialPokemonNames(pokemonName){
    let checkName = {
        'tapu koko': () => {
            return 'tapu-koko';
        },
        'tapu lele': () => {
            return 'tapu-lele';
        },
        'tapu bulu': () => {
            return 'tapu-bulu';
        },
        'tapu fini': () => {
            return 'tapu-fini';
        },
        'type: null': () => {
            return 'type-null';
        },
        'type:null': () => {
            return 'type-null';
        },
        'porygon z': () => {
            return 'porygon-z';
        }
    };

    return checkName[pokemonName] ? checkName[pokemonName]() : pokemonName;
}

function capitalizeFirstLetter(string) {
    return string? (string.charAt(0).toUpperCase() + string.slice(1)) : '';
}

function putDecimalOnNumber(number){
    return (number / 10).toFixed(1);
}

function getStatPercentageBar(number){
    return (100 * number) / 255;
}

function createElement(elementType, textValue, classValue, idValue, parentElement){
    const element = document.createElement(elementType);
    element.textContent = textValue && textValue !== '' ? textValue : element.textContent;
    element.className = classValue && classValue !== '' ? classValue : element.className;
    element.id = idValue && idValue !== '' ? idValue : element.id;
    parentElement.append(element);
}

function createImageElement(elementType, imageUrl, parentElement){
    const element = document.createElement(elementType);
    element.src = imageUrl;
    parentElement.append(element);
}

function createLabelBaseStats(statType, className){
    const barLabel = document.createElement('div');
    barLabel.textContent = `${statType}`;
    barLabel.className = className;
    return barLabel;
}

function createBarBaseStats(statNumber){
    const barWrapper = document.createElement('div');
    barWrapper.className = 'stats-wrapper';
    
    const bar = document.createElement('div');
    bar.className = 'stats-bar';
    bar.style.width = `${getStatPercentageBar(statNumber)}%`;

    barWrapper.append(bar);
    return barWrapper;
}

function handleError(status){
    const errorMessage = document.createElement('h2');

    let msg = '';

    if (status === 404){
        msg = `The Pokémon you typed seem to not exist. Please try again!`;
    }
    else{
        msg = `Internal server error! Please check your connection or enter in contact with the administrator.`;
    }

    errorMessage.textContent = msg;
    uiErrorTitle.append(errorMessage);
    uiErrorTitle.style.display = 'block';

    const errorImage = document.createElement('img');
    errorImage.src = errorImageUrl;
    uiPokemonPicture.append(errorImage);
}