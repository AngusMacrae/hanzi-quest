'use strict';

const beginTestButton = document.getElementById("begin-test-button");
const viewResultsButton = document.getElementById("view-results-button");
const repeatTestButton = document.getElementById("repeat-test-button");
const welcomeScreen = document.getElementById("welcome-screen");
const testScreen = document.getElementById("test-screen");
const resultsScreen = document.getElementById("results-screen");

beginTestButton.addEventListener('click', function() {
    welcomeScreen.style.display = "none"; 
    testScreen.style.display = "block";
});

viewResultsButton.addEventListener('click', function() {
    testScreen.style.display = "none";
    resultsScreen.style.display = "block";
});

repeatTestButton.addEventListener('click', function() {
    resultsScreen.style.display = "none";
    testScreen.style.display = "block";
})