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
let currentCharFreq = 5000;
let knownUnknown = 1;
let k = 100;
let probCorrect = 0.5;
let numCharsKnown = 200;
let currentCharDiff = 0;


function updateAnswers(currentCharFreq, known) {
    
//    answered.push(currentCharFreq/2);
//    freqList[currentCharFreq] = 99999;
//    answersFreq.push(currentCharFreq/2);
//    answersKnown.push(known);
    
}

function estimateCharsKnown() {
    
    currentCharDiff = currentCharFreq;
    probCorrect = 1 / (1 + Math.E ** (-(numCharsKnown - currentCharDiff)));
    numCharsKnown += k * (knownUnknown - probCorrect);
    numCharsKnown = Math.round(numCharsKnown);
    
    
//    let lr = linRegression(answersFreq, answersKnown);
//    result = (0.5 - lr.intercept) / lr.slope;
    
}

function chooseNextChar(numCharsKnown, known) {
    
    if (knownUnknown == 1) {
        
        return numCharsKnown + k;
        
    } else {
        
        return numCharsKnown - k;
        
    }
    
}

function displayCharacter(nextCharToDisp) {
    
    currentCharFreq = nextCharToDisp;
//    character = closest(freqList, currentCharFreq);
    character = freqList[currentCharFreq];
    charDisp.innerHTML = character;
    
}

function displayResult() {
    
    resultDisp.innerHTML = "Est. chars known: " + numCharsKnown;
    console.log("est. num of chars known: " + numCharsKnown);
    console.log("k: " + k);
    console.log("current char freq: " + currentCharFreq);
    console.log("current char diff: " + currentCharDiff);
    console.log("probability correct: " + probCorrect);
    
}

function closest(array, number) {
    
    
    
}

function linRegression(x, y) {
    
    let lr = {};
    let n = y.length;
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let sum_yy = 0;
    
    for (let i = 0; i < n; i++) {
        
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i] * y[i]);
        sum_xx += (x[i] * x[i]);
        sum_yy += (y[i] * y[i]);
        
    }
    
    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
    lr['r2'] = Math.pow((n * sum_xy - sum_x*sum_y)/Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);
    
    return lr;
    
}

beginTestButton.addEventListener('click', function () {

    welcomePanel.style.display = "none";
    testPanel.style.display = "block";
    displayCharacter(currentCharFreq);

});

knownButton.addEventListener('click', function () {
    
    updateAnswers(currentCharFreq, 1);
    knownUnknown = 1;
    estimateCharsKnown();
    displayCharacter(chooseNextChar(numCharsKnown, 1));
    displayResult();
    
});

unknownButton.addEventListener('click', function () {

    updateAnswers(currentCharFreq, 0);
    knownUnknown = 0;
    estimateCharsKnown();
    displayCharacter(chooseNextChar(numCharsKnown, 0));
    displayResult();
    
});

repeatTestButton.addEventListener('click', function () {
    
    resultPanel.style.display = "none";
    testPanel.style.display = "block";
    
});