exports.Receipt = (req, res) => {
  const {
    date_time,
    transaction_ref,
    amount,
    amount_in_words,
    account_name,
    account_number,
    account_bank,
  } = req.query;
 
  res.render("Receipt", {
    date_time,
    transaction_ref,
    amount,
    amount_in_words,
    account_name,
    account_number,
    account_bank,
  });
};
