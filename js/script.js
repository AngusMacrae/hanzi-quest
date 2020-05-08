'use strict';

const beginTestButton = document.getElementById("begin-test-button");
const knownButton = document.getElementById("known-button");
const unknownButton = document.getElementById("unknown-button");
const repeatTestButton = document.getElementById("repeat-test-button");
const welcomePanel = document.getElementById("welcome-panel");
const testPanel = document.getElementById("test-panel");
const resultPanel = document.getElementById("result-panel");
const charDisp = document.getElementById("charDisp");
const resultDisp = document.getElementById("resultDisp");

let result = 5;
let answered = [];
let answersKnown = [];
let answersFreq = [];

let character = "";
let currentCharFreq = 2500;
let knownUnknown = 1;
let leap = 5;
let numCharsKnown = 800;
let currentCharDiff = 0;
let numAnswers = 0;

function chooseNextChar(numCharsKnown, known) {
    
    if (known) {
        leap += 50;
    } else {
        leap -= 50;
    }
    
    numAnswers += 1;
    currentCharDiff = (Math.round(numCharsKnown/2) + leap) * 2;
    if (currentCharDiff < 1) {
        currentCharDiff = 2 + (numAnswers * 2);
    }
    if (currentCharDiff > 4999) {
        currentCharDiff = 4998 - (numAnswers * 2);
    }
    return currentCharDiff;
    
}

function displayCharacter(nextCharToDisp) {
    
    currentCharFreq = nextCharToDisp;
//    character = closest(freqList, currentCharFreq);
    character = freqList[currentCharFreq];
    charDisp.innerHTML = character;
    
}

function displayResult() {
    
    resultDisp.innerHTML = "Est. chars known: " + numCharsKnown;
    console.log("leap size:" + leap);
    console.log("current char diff: " + currentCharDiff);
    console.log("num of answers" + numAnswers);
    console.log("est. num of chars known: " + numCharsKnown);
    console.log("current char diff: " + currentCharDiff);
    
}

beginTestButton.addEventListener('click', function () {

    welcomePanel.style.display = "none";
    testPanel.style.display = "block";
    displayCharacter(currentCharFreq);

});

knownButton.addEventListener('click', function () {
    
    numCharsKnown = Elo.getNewRating(numCharsKnown, currentCharDiff, 1);
    displayCharacter(chooseNextChar(numCharsKnown, 1));
    displayResult();
    
});

unknownButton.addEventListener('click', function () {
    
    numCharsKnown = Elo.getNewRating(numCharsKnown, currentCharDiff, 0);
    displayCharacter(chooseNextChar(numCharsKnown, 0));
    displayResult();
    
});

repeatTestButton.addEventListener('click', function () {
    
    resultPanel.style.display = "none";
    testPanel.style.display = "block";
    
});