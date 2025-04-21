/* Calculator script */

const STR_CLEAR = "c";
const STR_BACK = "b";
const STR_EQUAL = "=";
const STR_ADD = "+";
const STR_SUBTRACT = "-";
const STR_MULTIPLY = "*";
const STR_DIVIDE = "/";
const STR_POINT = ".";
const STR_ZERO = "0";
const STR_ONE = "1";
const STR_TWO = "2";
const STR_THREE = "3";
const STR_FOUR = "4";
const STR_FIVE = "5";
const STR_SIX = "6";
const STR_SEVEN = "7";
const STR_EIGHT = "8";
const STR_NINE = "9";

const STATE_ADMIT_FIRST_NUMBER = "admit_first_number";
const STATE_ADMIT_FIRST_NUMBER_OPERATION = "admit_first_number_operation";
const STATE_ADMIT_SECOND_NUMBER = "admit_second_number";
const STATE_ADMIT_SECOND_NUMBER_OPERATION = "admit_second_number_operation";
const STATE_JUST_EVALUATED_EQUAL = "just_evaluated_equal";

const DIVISION_BY_ZERO_RESULT = "( ͡° ͜ʖ ͡°)";
const MAX_LENGTH = 8;
const OVERFLOW_TEXT = "OVERFLOW";

const calculatorElement = document.querySelector("#calculator");
const displayElement = document.querySelector("#display");

let firstNumber = "";
let secondNumber = "";
let operation = "";
let operationResult = null;
let currentState = STATE_ADMIT_FIRST_NUMBER;

function add(firstNumber, secondNumber) {
    return firstNumber + secondNumber;
}
function subtract(firstNumber, secondNumber) {
    return firstNumber - secondNumber;
}
function multiply(firstNumber, secondNumber) {
    return firstNumber * secondNumber;
}
function divide(firstNumber, secondNumber) {
    return firstNumber / secondNumber;
}
function operate(operator, firstNumber, secondNumber) {
    let result;
    switch (operator) {
        case "+":
            result = add(+firstNumber, +secondNumber);
            break;
        case "-":
            result = subtract(+firstNumber, +secondNumber);
            break;
        case "*":
            result = multiply(+firstNumber, +secondNumber);
            break;
        case "/":
            if (+secondNumber === 0) {
                result = DIVISION_BY_ZERO_RESULT;
            } else {
                result = divide(+firstNumber, +secondNumber);
            }
            break;
    }
    result = setDisplay(result);
    return result;
}

function setDisplay(textToDisplay) {
    if (typeof textToDisplay === "number") {
        if (textToDisplay.toString().includes(".")) {
            // Round decimals according to the space available
            const splitNumber = textToDisplay.toString().split(".");
            const integerPart = splitNumber[0];
            const availableDecimals = MAX_LENGTH - integerPart.length - 1;
            const roundFactor = 10 ** availableDecimals;
            textToDisplay = Math.round((textToDisplay + Number.EPSILON) * roundFactor) / roundFactor;
        }
    }
    if (textToDisplay.toString().length > MAX_LENGTH && textToDisplay.toString() !== DIVISION_BY_ZERO_RESULT) {
        textToDisplay = OVERFLOW_TEXT;
    }
    displayElement.textContent = textToDisplay;
    return textToDisplay;
}

function hasPoints(str) {
    return str.includes(STR_POINT) ? true : false;
}

function hasMaxLength(str) {
    return str.length >= MAX_LENGTH ? true : false;
}

function inputFirstNumber(str) {
    if (str === STR_POINT && hasPoints(firstNumber)) {
        return;
    }
    if (hasMaxLength(firstNumber)) {
        return;
    }
    firstNumber += str;
    currentState = STATE_ADMIT_FIRST_NUMBER_OPERATION;
    setDisplay(firstNumber);
}

function inputSecondNumber(str) {
    if (str === STR_POINT && hasPoints(secondNumber)) {
        return;
    }
    if (hasMaxLength(secondNumber)) {
        return;
    }
    secondNumber += str;
    currentState = STATE_ADMIT_SECOND_NUMBER_OPERATION;
    setDisplay(secondNumber);
}

function numberButtonPress(dataStr) {
    switch (currentState) {
        case STATE_ADMIT_FIRST_NUMBER:
        case STATE_ADMIT_FIRST_NUMBER_OPERATION:
            inputFirstNumber(dataStr);
            break;
        case STATE_ADMIT_SECOND_NUMBER:
        case STATE_ADMIT_SECOND_NUMBER_OPERATION:
            inputSecondNumber(dataStr);
            break;
        case STATE_JUST_EVALUATED_EQUAL:
            firstNumber = "";
            inputFirstNumber(dataStr);
            break;
    }
}

function setOperation(dataStr) {
    if (dataStr !== STR_EQUAL) {
        operation = dataStr;
    }
    currentState = STATE_ADMIT_SECOND_NUMBER;
}

function clearState(displayText) {
    if (displayText === undefined) {
        // Blank space
        displayText = "\u00A0"
    }
    firstNumber = "";
    secondNumber = "";
    operation = "";
    currentState = STATE_ADMIT_FIRST_NUMBER;
    operationResult = null;
    setDisplay(displayText);
}

function inputOperation(dataStr) {
    setOperation(dataStr);
    operationResult = operate(operation, firstNumber, secondNumber);
    currentState = STATE_ADMIT_FIRST_NUMBER;
    if (dataStr === STR_EQUAL) {
        currentState = STATE_JUST_EVALUATED_EQUAL;
    }
    firstNumber = operationResult;
    secondNumber = "";
    operation = "";
    operationResult = null;
    if (firstNumber === DIVISION_BY_ZERO_RESULT) {
        clearState(DIVISION_BY_ZERO_RESULT);
    }
    if (firstNumber === OVERFLOW_TEXT) {
        clearState(OVERFLOW_TEXT);
    }
}

function inputOperationPending(dataStr) {
    operationResult = operate(operation, firstNumber, secondNumber);
    currentState = STATE_ADMIT_FIRST_NUMBER;
    if (dataStr === STR_EQUAL) {
        currentState = STATE_JUST_EVALUATED_EQUAL;
    }
    firstNumber = operationResult;
    secondNumber = "";
    setOperation(dataStr);
    operationResult = null;
    currentState = STATE_ADMIT_SECOND_NUMBER;
    if (firstNumber === DIVISION_BY_ZERO_RESULT) {
        clearState(DIVISION_BY_ZERO_RESULT);
    }
    if (firstNumber === OVERFLOW_TEXT) {
        clearState(OVERFLOW_TEXT);
    }
}

function operationButtonPress(dataStr) {
    switch (currentState) {
        case STATE_ADMIT_FIRST_NUMBER_OPERATION:
        case STATE_JUST_EVALUATED_EQUAL:
            setOperation(dataStr);
            break;
        case STATE_ADMIT_SECOND_NUMBER_OPERATION:
            inputOperationPending(dataStr);
            break;
        case STATE_ADMIT_SECOND_NUMBER:
            setOperation(dataStr);
            break;
    }
}

function equalButtonPress(dataStr) {
    switch (currentState) {
        case STATE_ADMIT_SECOND_NUMBER_OPERATION:
            inputOperation(dataStr);
            break;
    }
}

function backButtonPress(dataStr) {
    switch (currentState) {
        case STATE_ADMIT_FIRST_NUMBER_OPERATION:
            let firstNumberStr = firstNumber.toString()
            if (firstNumberStr.length > 0) {
                firstNumberStr = firstNumberStr.substring(0, firstNumberStr.length-1);
            }
            firstNumber = firstNumberStr;
            if (firstNumber.length == 0) {
                // Blank space
                setDisplay("\u00A0");
            } else {
                setDisplay(firstNumber);
            }
            break;
        case STATE_ADMIT_SECOND_NUMBER_OPERATION:
            let secondNumberStr = secondNumber.toString()
            if (secondNumberStr.length > 0) {
                secondNumberStr = secondNumberStr.substring(0, secondNumberStr.length-1);
            }
            secondNumber = secondNumberStr;
            if (secondNumber.length == 0) {
                // Blank space
                setDisplay("\u00A0");
            } else {
                setDisplay(secondNumber);
            }
            break;
    }
}

function clearButtonPress(dataStr) {
    clearState();
}

function buttonPress(target) {
    const dataStr = target.getAttribute("data-str");
    switch (dataStr) {
        case STR_ZERO:
        case STR_ONE:
        case STR_TWO:
        case STR_THREE:
        case STR_FOUR:
        case STR_FIVE:
        case STR_SIX:
        case STR_SEVEN:
        case STR_EIGHT:
        case STR_NINE:
        case STR_POINT:
            numberButtonPress(dataStr);
            break;
        case STR_ADD:
        case STR_SUBTRACT:
        case STR_MULTIPLY:
        case STR_DIVIDE:
            operationButtonPress(dataStr);
            break;
        case STR_EQUAL:
            equalButtonPress(dataStr);
            break;
        case STR_BACK:
            backButtonPress(dataStr);
            break;
        case STR_CLEAR:
            clearButtonPress(dataStr);
            break;
    }
}
function buttonClickEvent(event) {
    if (event.target.id === "display") {
        return;
    }
    buttonPress(event.target);
}
calculatorElement.addEventListener("click", buttonClickEvent, {capture: true});

function getKeyElement(key) {
    let element;
    switch (key) {
        case STR_ZERO:
            element = document.querySelector("#button-zero");
            break;
        case STR_ONE:
            element = document.querySelector("#button-one");
            break;
        case STR_TWO:
            element = document.querySelector("#button-two");
            break;
        case STR_THREE:
            element = document.querySelector("#button-three");
            break;
        case STR_FOUR:
            element = document.querySelector("#button-four");
            break;
        case STR_FIVE:
            element = document.querySelector("#button-five");
            break;
        case STR_SIX:
            element = document.querySelector("#button-six");
            break;
        case STR_SEVEN:
            element = document.querySelector("#button-seven");
            break;
        case STR_EIGHT:
            element = document.querySelector("#button-eight");
            break;
        case STR_NINE:
            element = document.querySelector("#button-nine");
            break;
        case STR_POINT:
            element = document.querySelector("#button-point");
            break;
        case STR_ADD:
            element = document.querySelector("#button-add");
            break;
        case STR_SUBTRACT:
            element = document.querySelector("#button-subtract");
            break;
        case STR_MULTIPLY:
            element = document.querySelector("#button-multiply");
            break;
        case STR_DIVIDE:
            element = document.querySelector("#button-divide");
            break;
        case "=":
        case "Enter":
            element = document.querySelector("#button-equal");
            break;
        case "Backspace":
            element = document.querySelector("#button-back");
            break;
        case "c":
            element = document.querySelector("#button-clear");
            break;
    }
    return element;
}

function keyDownEvent(event) {
    const key = event.key;
    switch (key) {
        case STR_ZERO:
        case STR_ONE:
        case STR_TWO:
        case STR_THREE:
        case STR_FOUR:
        case STR_FIVE:
        case STR_SIX:
        case STR_SEVEN:
        case STR_EIGHT:
        case STR_NINE:
        case STR_POINT:
            numberButtonPress(key);
            break;
        case STR_ADD:
        case STR_SUBTRACT:
        case STR_MULTIPLY:
        case STR_DIVIDE:
            operationButtonPress(key);
            break;
        case "=":
        case "Enter":
            equalButtonPress("=");
            break;
        case "Backspace":
            backButtonPress("b");
            break;
        case "c":
            clearButtonPress("c");
            break;
    }
    const element = getKeyElement(key);
    element.classList.add("active");
}
function keyUpEvent(event) {
    const key = event.key;
    const element = getKeyElement(key);
    element.classList.remove("active");
}
document.addEventListener("keydown", keyDownEvent);
document.addEventListener("keyup", keyUpEvent);