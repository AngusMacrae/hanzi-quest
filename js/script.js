'use strict';

const beginTestButton = document.getElementById("begin-test-button");
const knownButton = document.getElementById("known-button");
const unknownButton = document.getElementById("unknown-button");
const repeatTestButton = document.getElementById("repeat-test-button");
const welcomePanel = document.getElementById("welcome-panel");
const testPanel = document.getElementById("test-panel");
const resultPanel = document.getElementById("result-panel");

// code for generating frequency list array -----------------------

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

// -----------------------------------------------------------------

beginTestButton.addEventListener('click', function () {

    welcomePanel.style.display = "none";
    testPanel.style.display = "block";

});

knownButtonButton.addEventListener('click', function () {
    
    let answers = [];

    for (let i = charGrid.children.length; i >= 0; i--) {
        thisChar = charGrid.children[i];
        if (thisChar.getAttribute("dataChecked") === 1) {
//            answers.push(thisChar.getAttribute("dataFreq"));
        }
    }

});

knownButtonButton.addEventListener('click', function () {
    
    let answers = [];

    for (let i = charGrid.children.length; i >= 0; i--) {
        thisChar = charGrid.children[i];
        if (thisChar.getAttribute("dataChecked") === 1) {
//            answers.push(thisChar.getAttribute("dataFreq"));
        }
    }

});

repeatTestButton.addEventListener('click', function () {
    resultPanel.style.display = "none";
    testPanel.style.display = "block";
});