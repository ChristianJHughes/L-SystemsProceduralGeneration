(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// lsystem.js
// By: Christian Hughes
// apply() and lsystem() functions by Nathan Bean
//
// The constructs for creating and rendering an l-system based on user parameters.

// L-System engine defined using the Module pattern
module.exports = (function (){
  var _final = "",
      _strokeOn = true,
      _fillOn = false,
      _currentFillColor = "none",
      _currentStrokeColor = "black",
      DEFAULT_STEP = 15,
      DEFAULT_TURN = Math.PI / 4;

  // An object with functions available for creating an SVG snippet.
  var svgObject = new SVG();

  /* Initializes an L-System using the supplied
   * axiom, rules, and number of iterations
   * params:
   * - axiom: the starting string
   * - rules: the array of rules as string -> string
   *   key/value pairs (i.e. ["key", "value"]
   * - iterations: the number of iterations to carry out
   */
  function lsystem(axiom, rules, iterations) {
    _final = axiom;

    for(var i = 0; i < iterations; i++) {
      _final = apply(_final, rules);
    }

    return _final;
  }

  /* Apply the ruleset in rules to the
   * provided axiom string.
   * params:
   * - axiom: the current axiom string
   * - rules: the transformation rules to apply to the axiom string
   */
  function apply(axiom, rules) {
    var tmp = "",
        value = "",
        match,
        re,
        flag;
    for(var i = 0; i < axiom.length; i++){
      flag = false;
      for(var j = 0; j < rules.length; j++) {
        // If the next sequence of characters is our
        // matching key token, then apply its rule
        // We use regular expressions to match non-exact
        // keys (i.e. +<angle> where angle is a number
        // with a non-definite number of digits can be
        // matched by the regular expression:
        //         /\+([0-9]+)/
        // The parentheses in this expression are a
        // "capture group" which are included in the
        // array returned from the String.prototype.exec
        // function at indices 1...n.  The first element
        // in the array is the full matching value.
        match = axiom.substring(i).match(rules[j][0]);
        if(match && match.index === 0) {
          // Because our rule may need to inject a value
          // captured by our regular expression, we need
          // to do slightly more than simple concatenation
          // We use the $<number> syntax to indicate the
          // capture group, starting with an index of 1.
          value = rules[j][1];
          for(var k = 1; k < match.length; k++) {
            re = new RegExp("/\$" + k + "/", 'g');
            value = value.replace(re, match[k]);
          }
          tmp = tmp.concat(value);
          flag = true;
          break;
        }
      }
      if(!flag) tmp = tmp.concat(axiom.charAt(i));
    }
    return tmp;
  }

  /* Render the current L-System
   * params:
   * - context: a rendering context to draw into
   */
  function render(xPosition, yPosition, context) {
    console.log("Rendering " + _final + "...");
    var stack = [],
        x = xPosition,
        y = yPosition,
        angle = Math.PI,  // Start facing up
        step = 15,        // Default distance to move
        turn = 45,        // Default turning angle
        sub = "",
        rads = 0,
        match;

    // Reset all of the drawing state variables for the canvas.
    svgObject.resetSVG();
    _strokeOn = true;
    _fillOn = false;
    _currentFillColor = "none";
    _currentStrokeColor = "black";
    context.fillStyle = _currentFillColor;
    context.strokeStyle = _currentStrokeColor;
    context.save();       // Save any rendering state from calling context
    context.beginPath();
    context.moveTo(x, y); // Move turtle to starting position
    svgObject.newPath(x,y);
    for(var i = 0; i < _final.length; i++) {
      var c = _final.charAt(i);
      console.log("processing " + c );
      if(c === '-') {
        // turn left by specified degrees (or default)
        sub = _final.substr(i);
        match = /\-\(([0-9]+)\)/.exec(sub);
        if(match && match.length > 1) {
          angle -= parseFloat(match[1]) * (Math.PI / 180.0);
          console.log("-" + match[1]);
          i += match[1].length + 2; // advance past the parameters
        } else {
          angle -= DEFAULT_TURN;
        }
      } else if(c === '+') {
        // turn right by specified degrees (or default)
        sub = _final.substr(i);
        match = /\+\(([0-9]+)\)/.exec(sub);
        if(match && match.length > 1) {
          angle += parseFloat(match[1]) * (Math.PI / 180.0);
          console.log("+" + match[1]);
          i += match[1].length + 2; // advance past the parameters
        } else {
          angle += DEFAULT_TURN;
        }
      } else if (c === '|') {
        // Set the stroke color to the specified color. Specifying |(none) will turn off the stroke.
        sub = _final.substr(i);
        matchNone = /\|\((none)\)/.exec(sub);
        matchColor = /\|\(([A-Za-z0-9]+)\)/.exec(sub);
        // ([A-Za-z0-9]+)
        if(matchNone && matchNone.length > 1 && matchNone.index === 0) {
          // Set the stroke state to false if the user specifies no stroke.
          if (_strokeOn)
          {
            svgObject.endPath(_currentFillColor,_currentStrokeColor);
            context.stroke();
            context.beginPath();
            context.moveTo(x, y);
            svgObject.newPath(x,y);
            _currentStrokeColor = "none";
            _strokeOn = false;
          }
          console.log("|" + matchNone[1] + ": The Stroke was turned off.");
          i += matchNone[1].length + 2; // advance past the parameters
        } else if (matchColor && matchColor.length > 1 && matchColor.index === 0) {
          // Otherwise, set the stroke color.
          if (_currentStrokeColor.indexOf(matchColor[1]) === -1)
          {
            if (_strokeOn)
            {
              context.stroke();
            }
            _strokeOn = true;
            svgObject.endPath(_currentFillColor,_currentStrokeColor);
            context.beginPath();
            context.moveTo(x, y);
            svgObject.newPath(x,y);
            _currentStrokeColor = "#" + matchColor[1];
            context.strokeStyle = _currentStrokeColor;
            console.log(_currentStrokeColor + ": The stroke color has been changed.");
            i += matchColor[1].length + 2; // advance past the parameters
          }
          else {
            console.log(_currentStrokeColor + ": The stroke color was the same, and has not been changed.");
            i += matchColor[1].length + 2; // advance past the parameters
          }
        } else {
          // If we got here, the the user didn't enter the input correctly.
          alert("Error! Stroke color must be defined after the \'|\' symbol. Specify |(none) to turn off the stroke.");
        }

      } else if (c === '#') {
        // Set the fill color to the specified color. Specifying #(none) will turn off the fill.
        sub = _final.substr(i);
        matchNone = /\#\((none)\)/.exec(sub);
        matchColor = /\#\(([A-Za-z0-9]+)\)/.exec(sub);
        // ([A-Za-z0-9]+)
        if(matchNone && matchNone.length > 1 && matchNone.index === 0) {
          // Set the fill state to false if the user specifies no fill.
          // Starts a new path that will not be filled.
          if (_fillOn)
          {
            svgObject.endPath(_currentFillColor,_currentStrokeColor);
            context.fill();
            context.beginPath();
            context.moveTo(x, y);
            svgObject.newPath(x,y);
            _currentFillColor = "none";
            _fillOn = false;
          }
          console.log("#" + matchNone[1] + ": The fill was turned off.");
          i += matchNone[1].length + 2; // advance past the parameters
        } else if (matchColor && matchColor.length > 1 && matchColor.index === 0) {
          // Otherwise, set the fill color. IF it is a NEW color.
          if (_currentFillColor.indexOf(matchColor[1]) === -1)
          {
            // The fill is set to ON and a new path is created with the new color.
            if (_fillOn)
            {
              context.fill();
            }
            _fillOn = true;
            svgObject.endPath(_currentFillColor,_currentStrokeColor);
            context.beginPath();
            context.moveTo(x, y);
            svgObject.newPath(x,y);
            _currentFillColor = "#" + matchColor[1];
            context.fillStyle = _currentFillColor;
            console.log(_currentFillColor + ": The fill color has been changed.");
            i += matchColor[1].length + 2; // advance past the parameters
          }
          else // Else it is the same color as the current color. We still want to iterate over the value. However, the path will remain the same.
          {
            console.log("#" + matchColor[1] + ": The fill color is the same, and has not been changed.");
            i += matchColor[1].length + 2; // advance past the parameters
          }
        } else {
          // If we got here, the the user didn't enter the input correctly.
          alert("Error! Fill color must be defined after the \'#\' symbol. Specify #(none) to turn off the fill.");
        }

      } else if(c === '[') {
        // save state
        stack.push(
        {x: x,
         y: y,
         angle: angle,
         fillColor: _currentFillColor,
         strokeColor: _currentStrokeColor,
         fillOn: _fillOn,
         strokeOn: _strokeOn });
      } else if(c === ']') {
        // restore state
        var state = stack.pop();
        x = state.x;
        y = state.y;
        angle = state.angle;
        _currentFillColor = state.fillColor;
        _currentStrokeColor = state.strokeColor;
        _fillOn = state.fillOn;
        _strokeOn = state.strokeOn;
        context.fillStyle = _currentFillColor;
        context.strokeStyle = _currentStrokeColor;
        context.moveTo(x, y); // Move turtle back to saved position
      } else {
        // move forward
        x += DEFAULT_STEP * Math.sin(angle);
        y += DEFAULT_STEP * Math.cos(angle);
        context.lineTo(x, y); // Draw line with turtle
        svgObject.addToPath(x, y); // Add this path to the SVG.
      }
    }

    svgObject.endPath(_currentFillColor,_currentStrokeColor);
    if (_strokeOn)
    {
      context.stroke();
    }
    if (_fillOn)
    {
      context.fill();
    }
    context.restore();  // Restore contexts' graphical state
  }

  /* Creates an L-System based off of the user-specified parameters in the web app.
   *
   * Parameters:
   * - axiom: the user specified axiom for the l-system.
   * - rules: The user specified rules as a two dimensional array of key value pairs.
   * - iterations: The number of iterations to perform for the l-system.
   */
  function userCreatedLSystem(axiom, rules, iterations)
  {
    return lsystem(axiom, rules, iterations);
  }

  // Cretes an SVG snippet (paths within a group tag) based off of the current L-System.
  function SVG()
  {
    var completeSVG = "<g>\n";
    var currentPath = "";

    this.newPath = function(xStart, yStart)
    {
      currentPath = "<path d=\"M " + xStart + " " + yStart;
    }

    this.addToPath = function(xTo, yTo)
    {
      currentPath += " L " + xTo + " " + yTo;
    }

    this.endPath = function(fillColor, strokeColor)
    {
      currentPath += "\" fill=\"" + fillColor + "\" stroke=\"" + strokeColor +"\" />\n";
      completeSVG += currentPath;
      currentPath = "";
    }

    this.returnCompleteSVG = function()
    {
      completeSVG += "</g>";
      return completeSVG;
    }

    this.resetSVG = function()
    {
      completeSVG = "<g>\n";
    }
  }

  // The public API for the L-System module
  return {
    lsystem: lsystem,
    render: render,
    userCreatedLSystem: userCreatedLSystem,
    SVG: svgObject.returnCompleteSVG // Returns the FUNCTION of the SVG object that returns the completed group tag as a string.
  }

})();

},{}],2:[function(require,module,exports){
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

},{"./lsystem.js":1}]},{},[1,2]);
