let currentRecipe = "";
let currentRecipeDir = "";

const recipeLookUp = {
    desserts: ["moose.txt", "almondBars.txt"],
    mains: [],
    snacks: [],
    drinks: ["hotChocolate.txt"]
};

function getFilename() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
    return filename;
}

async function readRecipeFile(dir) {
    console.log('Fetching:', dir);
    const response = await fetch(dir);
    if (!response.ok) throw new Error(`Network response was not ok for ${dir}`);
    const text = await response.text();
    return text;
}

function parseRecipeTitle(text) {
    return text.split('\n')[0];
}

function parseRecipeContent(text) {
    if (!text || typeof text !== 'string') {
        console.error("Invalid text input to parseRecipeContent");
        return {
            title: "",
            ingredients: [],
            instructions: []
        };
    }

    const lines = text.split('\n').map(line => line.trim());
    const content = {
        title: "",
        ingredients: [],
        instructions: []
    };

    if (lines.length === 0) return content;

    content.title = lines[0];

    let idx = 1;

    // Skip empty lines
    while (idx < lines.length && lines[idx] === "") idx++;

    // Parse ingredients
    while (idx < lines.length && lines[idx] !== "") {
        content.ingredients.push(lines[idx]);
        idx++;
    }

    // Skip empty lines between ingredients and instructions
    while (idx < lines.length && lines[idx] === "") idx++;

    // Parse instructions
    while (idx < lines.length && lines[idx] !== "") {
        content.instructions.push(lines[idx]);
        idx++;
    }

    if (content.ingredients.length == 0) {
        content.ingredients = ["To be updated!"];
    }
    if (content.instructions.length == 0) {
        content.instructions = ["To be updated!"];
    }
    return content;
}



function fillRecipeTitles(titles, foldername, directories) {
    const ulElement = document.getElementById('list-recipes');
    ulElement.innerHTML = ''; // Clear any existing content

    titles.forEach((text, i) => {
        const li = document.createElement('li');
        const p = document.createElement('p');     
        p.textContent = text;  
        if (titles.length != i +1) {
            p.style.borderBottom = "1px solid var(--dark-purple)"; 
        }
        li.id = "/recipes/" + foldername + "/" + directories[i];
        li.classList.add("recipe-title");    
        li.appendChild(p);                  
        ulElement.appendChild(li);                 
    });
}

async function fillRecipeList() {
    const foldername = getFilename();
    // console.log('foldername:', foldername);

    const directories = recipeLookUp[foldername] || [];
    // console.log('directories:', directories);

    if (directories.length === 0) {
        console.warn(`No recipes found for folder "${foldername}".`);
        return;
    }

    try {
        const promises = directories.map(filename => readRecipeFile(`/recipes/${foldername}/${filename}`));
        const texts = await Promise.all(promises);
        // console.log('texts:', texts);

        if (!texts || !Array.isArray(texts)) {
            console.error('texts is not an array or is undefined:', texts);
            return;
        }

        const titles = texts.map(text => parseRecipeTitle(text));
        fillRecipeTitles(titles, foldername, directories);

        document.querySelectorAll(".recipe-title").forEach(elem => {
        elem.addEventListener("click", () => {
            currentRecipe = elem.textContent;
            currentRecipeDir = elem.id;
            console.log("Selected:", currentRecipe, "at", currentRecipeDir);
            
            fillRecipes();
        });
});

    } catch (err) {
        console.error('Error reading files:', err);
    }
}

// FILL RECIPE ON CLICK
//////////////////////////////////////////////////////////////////////////////

async function fillRecipes() {
    let text;
    try {
        text = await readRecipeFile(currentRecipeDir);
        // console.log(text);
    } catch (err) {
        console.error("Error reading files:", err);
        text = "";
    }

    let content = parseRecipeContent(text);

    const divElement = document.getElementById('container-recipe');
    divElement.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.innerHTML = currentRecipe;
    divElement.appendChild(h2);

    const h3_ingreds = document.createElement('h3');
    h3_ingreds.innerHTML = "Ingredients:";
    divElement.appendChild(h3_ingreds);
    
    const ul = document.createElement('ul');
    const li_s = [];
    const p_s = [];

    content.ingredients.forEach((value, i) => {
        li_s.push(document.createElement('li'));
        p_s.push(document.createElement('p'));
        
        p_s[i].innerHTML = value;
        li_s[i].appendChild(p_s[i]);
        ul.appendChild(li_s[i]);
    });
    ul.classList.add("list-recipe-ingred");
    divElement.appendChild(ul);

    const h3_instructs = document.createElement('h3');
    h3_instructs.innerHTML = "Instructions:";
    divElement.appendChild(h3_instructs);

    const descrips = [];
    content.instructions.forEach((descrip, i) => {
        descrips.push(document.createElement('p'));
        descrips[i].innerHTML = descrip;
        descrips[i].classList.add("recipe-descrip");
        divElement.appendChild(descrips[i]);
    });
}

window.onload = fillRecipeList;
