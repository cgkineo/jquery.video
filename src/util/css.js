var parseUnit = function(value, unit) {
  value = String(value || 0) + String(unit || "");
  var unitMatch = value.match(/[^0-9]+/g);
  var unit = "px";
  if (unitMatch) unit = unitMatch[0];
  return {
    value: parseFloat(value) || 0,
    unit: unit
  };
};
