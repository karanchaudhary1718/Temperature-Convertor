function convertTemp() {
  const inputTemp = parseFloat(document.getElementById("inputTemp").value);
  const fromUnit = document.getElementById("fromUnit").value;
  const toUnit = document.getElementById("toUnit").value;

  if (isNaN(inputTemp)) {
    document.getElementById("result").innerText = "Please enter a valid number!";
    return;
  }

  let celsius;

  // Convert input to Celsius first
  if (fromUnit === "Celsius") {
    celsius = inputTemp;
  } else if (fromUnit === "Fahrenheit") {
    celsius = (inputTemp - 32) * 5/9;
  } else {
    celsius = inputTemp - 273.15;
  }

  let resultTemp;
  if (toUnit === "Celsius") {
    resultTemp = celsius;
  } else if (toUnit === "Fahrenheit") {
    resultTemp = celsius * 9/5 + 32;
  } else {
    resultTemp = celsius + 273.15;
  }

  document.getElementById("result").innerText =
    `${inputTemp}° ${fromUnit} = ${resultTemp.toFixed(2)}° ${toUnit}`;
}
