// code for generating frequency list array -------------

let freqListArray = [];
let freqListEntry = {
    'char': "x",
    'freq': 0
};

function toArray(list) {
    let items = list.getElementsByTagName("li");
    let character = "";
    let frequency = 0;
    for (let i = 0; i < 5000; i++) {
        //    for (let i = 0; i < items.length; i++) {
        character = items[i].getElementsByTagName("a")[0].textContent;
        frequency = +items[i].getElementsByTagName("span")[0].textContent;
        //        freqListArray.push({char: character, freq: frequency});
        freqListArray.push(character, frequency);
    };
    return freqListArray;
}

// ------------------------------------------------