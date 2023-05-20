exports.compareNames = (name1, name2) => {
  // Split the names into arrays of first, middle, and last names
  const name1Parts = name1.split(" ");
  const name2Parts = name2.split(" ");

  // Sort the name parts alphabetically
  name1Parts.sort();
  name2Parts.sort();

  // Check if the sorted name parts match
  return name1Parts.join(" ") === name2Parts.join(" ");
};


