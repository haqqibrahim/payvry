const mongoose = require("mongoose");

const AdminDashboardSchema = new mongoose.Schema({
 all_account_user: {type:Number},
 all_transactions: {type:Number},
 all_profit_earned: {type:Number},
 active_users_today: {type:Number},
 transaction_today: {type:Number},
 profit_today: {type:Number}
});

const AdminDashboard = mongoose.model("Dashboard", AdminDashboardSchema);
module.exports = AdminDashboard;
