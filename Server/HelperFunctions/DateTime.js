exports.getCurrentDateTime = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const date = new Date();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hour = date.getHours();
    const minutes = date.getMinutes();
    let period = 'AM';
  
    if (hour > 12) {
      hour -= 12;
      period = 'PM';
    }
  
    const formattedDateTime = `${month} ${day}, ${year} ${hour}:${minutes.toString().padStart(2, '0')} ${period}`;
    return formattedDateTime;
  }
  