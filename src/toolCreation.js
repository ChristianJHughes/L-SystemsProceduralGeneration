// toolCreation.js
// By: Christian Hughes
//
// Gets the elements of the page, and applies l-system logic using the user defined parameters.

// Wait for page to load completely
window.onload = function() {
  var ls = require('./lsystem.js');

  // Store references the all relevant page elements.
  var iterator = document.getElementById("iterations"),
      axiom = document.getElementById("axiom"),
      rules = document.getElementById("rules"),
      svgOutput = document.getElementById("svg-output"),
      canvas = document.getElementById("canvas"),
      submitButton = document.getElementById("submitButton");
      stringOutput = document.getElementById("prod");
      ctx = canvas.getContext("2d");

  // v TURN THIS ON IF THE PAGE SHOULD LOAD IN A RENDERED STATE.
  //ls.render(30, 450, ctx);

  alert("Press generate to begin!");

  submitButton.onclick = function() {
    // Split the rules input up by commas to get INDIVIDUAL rules.
    var rulesArr = rules.value.split(",");
    var rulesKeyValues = [];
    // Split up the individual rules into key value pairs, and place them into a new array.
    for (var i = 0; i < rulesArr.length; i++)
    {
      rulesKeyValues.push(rulesArr[i].split("->"));
    }

    // Create an l-system with the current user input and render the l-system to the canvas.
    stringOutput.value = ls.userCreatedLSystem(axiom.value, rulesKeyValues, iterator.value);
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ls.render(30, 450, ctx);
    svgOutput.value = ls.SVG();
  }

};
