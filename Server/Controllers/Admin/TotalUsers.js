const User = require("../../Models/User");
const Student = require("../../Models/Student");
const Account = require("../../Models/Account");
const Transaction = require("../../Models/Transaction");

exports.TotalUser = async(req, res) => {
    try {
        // Retrieve all users
        const users = await User.find();
    
        // Prepare an array to store the response data for each user
        const responseData = [];
    
        // Iterate through each user
        for (const user of users) {
          const userId = user._id;
    
          // Retrieve account balance
          const account = await Account.findOne({ ID: userId });
          if (!account) {
            return res.status(404).json({ message: `Account not found for user: ${userId}` });
          }
    
          // Retrieve total amount deposited, withdrawn, transferred or paid
          const transactions = await Transaction.find({ user: userId });
          let totalDeposits = 0;
          let totalWithdrawals = 0;
          let totalTransfersAndPayments = 0;
          transactions.forEach((transaction) => {
            if (transaction.transactionType === 'deposit') {
              totalDeposits += transaction.amount;
            } else if (transaction.transactionType === 'withdraw') {
              totalWithdrawals += transaction.amount;
            } else if (
              transaction.transactionType === 'transfer' ||
              transaction.transactionType === 'payment'
            ) {
              totalTransfersAndPayments += transaction.amount;
            }
          });
    
          // Retrieve recent transaction
          const recentTransaction = await Transaction.findOne({ user: userId }).sort({
            date: -1,
          });
    
          // Prepare response data for the current user
          const userData = {
            fullName: user.fullName,
            department: '',
            accountBalance: account.balance,
            totalDeposits,
            totalWithdrawals,
            totalTransfersAndPayments,
            recentTransaction: {
              amount: 0,
              time: null,
            },
          };
    
          // If user is a student, retrieve department from student model
          if (user.role === 'student') {
            const student = await Student.findOne({ ID: userId });
            if (student) {
              userData.department = student.department;
            }
          }
    
          // If recent transaction exists, update the response data
          if (recentTransaction) {
            userData.recentTransaction.amount = recentTransaction.amount;
            userData.recentTransaction.time = recentTransaction.date;
          }
    
          // Push the user's data to the response array
          responseData.push(userData);
        }
    
        // Send the response with the array of user data
        res.render("Analytics/Users", { responseData})
        // res.json(responseData);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
}