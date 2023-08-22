var set = [
"Battery overvoltage",
"Battery overheated",
"Charging overcurrent",
"Charging soft start failed",
"Inverse charge soft overcurrent",
"Inverter overheated",
"Inverter short circuit",
"Output overload",
"Memory read/write error",
"Inverse soft start failed",
"Battery overvoltage",
"Inverter overvoltage",
"Serial port communication failure",
"Inverter hard overcurrent",
"Inverter radiator temperature sensor fails",
"Transformer overheated"
];

var msk = 0;
//var i = set.length - 1;
var i = 0;
var subset = [];
while (msk > 0) {
    console.log(msk);
    if (msk & 1) subset.push(set[i]);
    msk = msk >> 1;
    i += 1;
};
console.log(subset.toString());