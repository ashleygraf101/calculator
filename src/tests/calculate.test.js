import calculate from "../logic/calculate";
import chai from "chai";

// https://github.com/chaijs/chai/issues/469
chai.config.truncateThreshold = 0;

const expect = chai.expect;

function pressButtons(buttons) {
  const value = {};
  buttons.forEach(button => {
    Object.assign(value, calculate(value, button));
  });
  // no need to distinguish between null and undefined values
  Object.keys(value).forEach(key => {
    if (value[key] === null) {
      delete value[key];
    }
  });
  return value;
}

function expectButtons(buttons, expectation) {
  expect(pressButtons(buttons)).to.deep.equal(expectation);
}

function test(buttons, expectation, only = false) {
  const func = only ? it.only : it;
  func(`${buttons.join(" ")} -> ${JSON.stringify(expectation)}`, () => {
    expectButtons(buttons, expectation);
  });
}

describe.each([1,2,3,4,5,6,7,8,9,0])
  ('entering the number %i returns the same', (a) => {
  test([a], 
    { next: a, 
  });
});

describe.each(["÷","x","-","+"])
  ('entering the operator %p returns the same', (b) => {
  test([b], 
    { operation: b, 
  });
});

describe("the operator signs also act as '='", function() {
  test(["2", "x", "2", "%"], {
    total: "0.04",
  });
  test(["2", "x", "2", "+"], {
    total: "4",
    operation: "+",
  });
  test(["2", "x", "2", "-"], {
    total: "4",
    operation: "-",
  });
  test(["2", "x", "2", "x"], {
    total: "4",
    operation: "x",
  });
  test(["2", "x", "2", "÷"], {
    total: "4",
    operation: "÷",
  });
});

describe(" the operator is cleared when AC is pressed", function() {
  test(["1", "+", "2", "AC"], {
  });
  test(["+", "2", "AC"], {
  });
});

describe(" % should convert number to percentage", function() {
  test(["4", "%"], {
    next: "0.04",
  });
  test(["4", "0", "0", "%"], {
    next: "4",
  });
});

describe(" x should multiply a percentage", function() {
  test(["4", "%", "x", "2", "="], {
    total: "0.08",
  });
});

describe("there is no result because an equals or other operator signs aren't provided", function() {
  test(["4", "%", "x", "2"], {
    total: "0.04",
    operation: "x",
    next: "2",
  });
});


describe("% returns percentage of given number", function() {
  test(["8", "0", "0", "x", "10", "%"], {
    total: "80",
  });
});


describe("- - = + with the +/- operator", function() {
  test(["9", "-", "8", "+/-", "="], {
    total: "17",
  });  
});

describe("- - = + with the - operator", function() {
  test(["9", "-", "-", "8", "="], {
    total: "17",
  });  
});

describe("pressing the multiplication or division sign multiple times should not affect the current computation", function() {
  test(["2", "x", "x"], {
    total: "2",
    operation: "x",
  });
  test(["2", "÷", "÷"], {
    total: "2",
    operation: "÷",
  });
});

describe("a positive multiplied by a positive equals a negative", function() {
  test(["8", "+/-", "x", "8", "="], {
    total: "-64"
  });
});

describe("multiplication works the same with decimals", function() {
  test(["8", "%", "x", "8", "="], {
    total: "0.64",
  });
});

describe("a number divided by itself = 1 and using the % doesn't change that", function() {
  test(["8", "%", "÷", "8", "="], {
    total: "0.01",
  });
});

describe("order of operations", function() {
  /* order of operations */ 
  // 3 + (3*3) = 12
  test(["3", "+", "3", "x", "3", "="], {
    total: "12",
  });

  // 3 + (3/3) = 12
  test(["3", "+", "3", "÷", "3", "="], {
    total: "4",
  });

  // (3 + 3) / 3 = 18
  test(["3", "+", "3", "=", "÷", "3", "="], {
    total: "2",
  });
});

describe("when no '=' or operator sign is given at the end of an operation, the operation should not complete", function() {
  test(["6", "+", "6"], {
    next: "6",
    total: "6",
    operation: "+",
  });
});

describe("when '=' is pressed and there is not enough information to complete an operation, the '=' should be disregarded.", function() {
  test(["3", "+", "=", "3", "="], {
    total: "6",
  });
  test(["3", "+", "6", "=", "+"], {
    total: "9",
    operation: "+",
  });
});

describe("division works", function() {
  test(["6", "÷", "6", "="], {
    total: "1",
  });
});

describe("multiplication works", function() {
  test(["6", "x", "6", "="], {
    total: "36",
  });
});

describe("addition works", function() {
  test(["6", "+", "6", "="], {
    total: "12",
  });
});

describe("subtraction works", function() {
  test(["6", "-", "6", "="], {
    total: "0",
  });
});

describe("full stop creates decimals", function() {
  test(["0", ".", "4"], {
    next: "0.4",
  });
  test([".", "4"], {
    next: "0.4",
  });
});

describe("minus works with decimal numbers", function() {
  test([".", "4", "-", ".", "2"], {
    total: "0.4",
    next: "0.2",
    operation: "-",
  });

  test([".", "4", "-", ".", "2", "="], {
    total: "0.2",
  });
});




