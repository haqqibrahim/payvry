const mongoose = require("mongoose");

const TodayTransactionsSchema = new mongoose.Schema({
    usersTransaction: {type:String},
    amountProcessedToday: {type:Number},
    profitToday: {type:Number}
});

const TodayTransactions = mongoose.model("TodayTransactionMade", TodayTransactionsSchema);
module.exports = TodayTransactions;
