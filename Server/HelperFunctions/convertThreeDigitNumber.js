exports.convertAmountToWords = (amount) => {
    const singleDigits = [
      'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'
    ];
  
    const doubleDigits = [
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
  
    const tensDigits = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
  
    const powersOfTen = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
  
    if (amount === 0) {
      return singleDigits[amount];
    }
  
    function convertThreeDigitNumber(number) {
      const hundred = Math.floor(number / 100);
      const tens = Math.floor((number % 100) / 10);
      const ones = number % 10;
  
      let words = '';
  
      if (hundred > 0) {
        words += singleDigits[hundred] + ' Hundred ';
      }
  
      if (tens === 1) {
        words += doubleDigits[ones] + ' ';
      } else {
        if (tens > 1) {
          words += tensDigits[tens] + ' ';
        }
        if (ones > 0) {
          words += singleDigits[ones] + ' ';
        }
      }
  
      return words;
    }
  
    let words = '';
    let power = 0;
  
    while (amount > 0) {
      const threeDigitNumber = amount % 1000;
  
      if (threeDigitNumber > 0) {
        words = convertThreeDigitNumber(threeDigitNumber) + powersOfTen[power] + ' ' + words;
      }
  
      amount = Math.floor(amount / 1000);
      power++;
    }
  
    return words.trim();
  }
