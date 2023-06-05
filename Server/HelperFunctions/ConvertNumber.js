exports.convertNumber = (number)  => {
  // Remove everything except digits from the number
  const digitsOnly = number.replace(/\D/g, "");

  // Check if the number starts with "234" and has 13 digits
  if (digitsOnly.startsWith("234") && digitsOnly.length === 13) {
    // Remove the "234" prefix and add "0" at the beginning
    const formattedNumber = "0" + digitsOnly.slice(3);
    return formattedNumber;
  }

  // If the number doesn't match the expected format, return the original number
  return number;
}
