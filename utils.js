// The Fitbit Settings SDK will cast types to strings,
// which can lead to unpredictable behavior (i.e. ""aquamarine"", "true" vs true)
// autoCast attempts to re-cast types to their original types
// Note: Expect this method to be improved in the future
export var autoCast = function autoCast(value) {
  if (typeof value === 'string' || value instanceof String) {
    // Booleans
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    } // String Colors: '"aquamarine"', etc


    if (value.indexOf('"') === 0 && value.charAt(value.length - 1) === '"') {
      return value.substring(1, value.length - 1);
    }
  }

  return value;
};