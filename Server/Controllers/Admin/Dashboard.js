const User = require("../../Models/User");
const Account = require("../../Models/Account");
const Transaction = require("../../Models/Transaction");

exports.Dashbard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBalance = await Account.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
        },
      },
    ]);
    const totalDepositsResult = await Transaction.aggregate([
        {
          $match: { transactionType: "deposit" },
        },
        {
          $group: {
            _id: null,
            totalDeposits: { $sum: "$amount" },
          },
        },
      ]);
      const totalDeposits = totalDepositsResult.length > 0 ? totalDepositsResult[0].totalDeposits : 0;
      
      console.log(totalDeposits);      
    const totalWithdrawals = await Transaction.aggregate([
      {
        $match: { transactionType: "withdraw" },
      },
      {
        $group: {
          _id: null,
          totalWithdrawals: { $sum: "$amount" },
        },
      },
    ]);
    const totalTransfersAndPaymentsResult = await Transaction.aggregate([
        {
          $match: { transactionType: { $in: ["debit", "refund", "credit"] } },
        },
        {
          $group: {
            _id: null,
            totalTransfersAndPayments: { $sum: "$amount" },
          },
        },
      ]);
  
      const totalTransfersAndPayments = totalTransfersAndPaymentsResult.length > 0 ? totalTransfersAndPaymentsResult[0].totalTransfersAndPayments : 0;
  
    const totalTransactions = await Transaction.countDocuments();

    const stats = {
      totalUsers,
      totalBalance: totalBalance[0].totalBalance,
      totalDeposits,
      totalWithdrawals,
      totalTransfersAndPayments,
      totalTransactions,
    };
    res.render("Analytics/Dashboard", {
        stats
    });
    // res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
