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

let character = "";
let currentCharFreq = 0;
let newCharFreq = 0;
let numCharsKnown = 0;
let numAnswers = 0;
let numWrongAnswers = 0;
let placementFreqs = [50, 150, 450, 1350, 4000];
let isPlacement = true;


function closestEven(number) {

    return Math.floor((number + 1) / 2) * 2;

}

function elo(knownChars, currCharDiff, outcome, answersSoFar) {
    
    let chanceOfKnown = 1 / ( 1 + Math.pow(10, (currCharDiff - knownChars) / 400));    
    let k = Math.max(Math.floor(knownChars/answersSoFar), 32);
    
    console.log("chance of known: " + chanceOfKnown);
    console.log("known chars change: " + Math.round(k * (outcome - chanceOfKnown)));
    return knownChars + Math.round(k * (outcome - chanceOfKnown));
    
}

function displayNewCharacter(nextCharToDisp) {

    character = freqList[nextCharToDisp];
    charDisp.innerHTML = character;

}

function displayResult(curEstNumKnown, curCharFreq, answersSoFar, wrongAnswersSoFar) {

    resultDisp.innerHTML = "Estimated number of characters known: " + Math.floor(curEstNumKnown);
    console.log("est. num of chars known: " + curEstNumKnown);
    console.log("current char freq: " + curCharFreq);
    console.log("num of answers" + answersSoFar);
    console.log("num wrong answers" + wrongAnswersSoFar);

}

beginTestButton.addEventListener('click', function () {

    welcomePanel.style.display = "none";
    testPanel.style.display = "block";
    currentCharFreq = placementFreqs[0];
    displayNewCharacter(currentCharFreq);
    console.log("current char freq: " + currentCharFreq);
    console.log("num of answers" + numAnswers);

});

function estimateNumCharsKnown(currentCharFreq, currentEstimatedCharsKnown, answersSoFar, answer, placement) {

    let newEstimatedCharsKnown = currentEstimatedCharsKnown;

    if (placement) {

        if (answer) {

            newEstimatedCharsKnown += currentCharFreq / 1.5;

        }

    } else {
        
        if (answer) {
            
            newEstimatedCharsKnown = elo(currentEstimatedCharsKnown, currentCharFreq, 1, answersSoFar);
            
        } else {
            
            newEstimatedCharsKnown = elo(currentEstimatedCharsKnown, currentCharFreq, 0, answersSoFar);
        
        }

    }

    return newEstimatedCharsKnown;

}

function chooseNextCharacterFreq(answersSoFar, wrongAnswersSoFar, currentEstimatedCharsUnknown, answer, placement) {

    let newCharFreq = 0;

    if (placement) {

        newCharFreq = placementFreqs[((answersSoFar - wrongAnswersSoFar) * 2) - wrongAnswersSoFar];

    } else {

        newCharFreq = closestEven(currentEstimatedCharsUnknown);

    }

    if (newCharFreq < 1) {
        newCharFreq = 2 + closestEven(answersSoFar);
    }
    if (newCharFreq > 4999) {
        newCharFreq = 4998 - closestEven(answersSoFar);
    }

    return newCharFreq;

}

knownButton.addEventListener('click', function () {
    
    numAnswers += 1;
    numCharsKnown = estimateNumCharsKnown(currentCharFreq, numCharsKnown, numAnswers, true, isPlacement);
    
    if (numWrongAnswers > 1 || ((numAnswers - numWrongAnswers) * 2) - numWrongAnswers > 4) {
        isPlacement = false;
    }
    
    currentCharFreq = chooseNextCharacterFreq(numAnswers, numWrongAnswers, numCharsKnown, true, isPlacement);
    displayNewCharacter(currentCharFreq);
    displayResult(numCharsKnown, currentCharFreq, numAnswers, numWrongAnswers);

});

unknownButton.addEventListener('click', function () {
    
    numAnswers += 1;
    numWrongAnswers += 1;
    numCharsKnown = estimateNumCharsKnown(currentCharFreq, numCharsKnown, numAnswers, false, isPlacement);
    
    if (numWrongAnswers > 1 || ((numAnswers - numWrongAnswers) * 2) - numWrongAnswers > 4) {
        isPlacement = false;
    }
    
    currentCharFreq = chooseNextCharacterFreq(numAnswers, numWrongAnswers, numCharsKnown, false, isPlacement);
    displayNewCharacter(currentCharFreq);
    displayResult(numCharsKnown, currentCharFreq, numAnswers, numWrongAnswers);

});

repeatTestButton.addEventListener('click', function () {

    resultPanel.style.display = "none";
    testPanel.style.display = "block";

});
