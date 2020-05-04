'use strict';

const beginTestButton = document.getElementById("begin-test-button");
const knownButton = document.getElementById("known-button");
const unknownButton = document.getElementById("unknown-button");
const repeatTestButton = document.getElementById("repeat-test-button");
const welcomePanel = document.getElementById("welcome-panel");
const testPanel = document.getElementById("test-panel");
const resultPanel = document.getElementById("result-panel");

let result = 5;
let answersKnown = [];
let answersFreq = [];
let character = "";
let frequency = 0;
let known = 1;

function updateAnswers(frequency, known) {
    
    answersFreq.push(frequency);
    answersKnown.push(known);
    
}

function determineResult() {
    
    
    let lr = linRegression(answersFreq, answersKnown);
    result = (0.5 - lr.intercept) / lr.slope;
    
}

function determineNext(result) {
    
    
    
}

function displayCharacter(nextCharToDisp) {
    
        
    
}

function displayResult(result) {
    
    
    
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
    
}

beginTestButton.addEventListener('click', function () {

    welcomePanel.style.display = "none";
    testPanel.style.display = "block";

});

knownButton.addEventListener('click', function () {
    
    updateAnswers(frequency, 1);
    determineResult();
    displayCharacter(determineNext(result));
    displayResult(result);
    
});

unknownButton.addEventListener('click', function () {

    updateAnswers(frequency, 0);
    determineResult();
    displayCharacter(determineNext(result));
    displayResult(result);
    
});

repeatTestButton.addEventListener('click', function () {
    
    resultPanel.style.display = "none";
    testPanel.style.display = "block";
    
});