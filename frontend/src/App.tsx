import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';

import HomeUser from './pages/user/Home';
import LoginUser from './pages/user/Login';
import SignUpUser from './pages/user/SignUp';
import HistoryUser from './pages/user/History';
import ProfileUser from './pages/user/Profile';
import CreatePinUser from './pages/user/CreatePin';
import SendMoneyUser from './pages/user/SendMoney';
import UpdatePinUser from './pages/user/UpdatePin';
import ReceiveMoneyUser from './pages/user/ReceiveMoney';
import WithdrawUser from "./pages/user/Withdraw"

import HomeVendor from './pages/vendor/Home';
import LoginVendor from './pages/vendor/Login';
import SignUpVendor from './pages/vendor/SignUp';
import HistoryVendor from './pages/vendor/History';
import ProfileVendor from './pages/vendor/Profile';
import CreatePinVendor from './pages/vendor/CreatePin';
import ReceiveMoneyVendor from './pages/vendor/ReceiveMoney';
import WithdrawVendor from "./pages/vendor/Withdraw"
import Payment from './pages/vendor/Payment';

import Admin from './pages/admin/Admin';
import HomeAdmin from './pages/admin/Home';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing />}></Route>
        <Route path='/user' element={<HomeUser />}></Route>
        <Route path='/user/login' element={<LoginUser />}></Route>
        <Route path='/user/sign-up' element={<SignUpUser />}></Route>
        <Route path='/user/history' element={<HistoryUser />}></Route>
        <Route path='/user/profile' element={<ProfileUser />}></Route>
        <Route path='/user/create-pin' element={<CreatePinUser />}></Route>
        <Route path='/user/send-money' element={<SendMoneyUser />}></Route>
        <Route path='/user/update-pin' element={<UpdatePinUser />}></Route>
        <Route path='/user/receive-money' element={<ReceiveMoneyUser />}></Route>
        <Route path="/user/withdraw" element={<WithdrawUser />}></Route>

        <Route path='/vendor' element={<HomeVendor />}></Route>
        <Route path='/vendor/login' element={<LoginVendor />}></Route>
        <Route path='/vendor/sign-up' element={<SignUpVendor />}></Route>
        <Route path='/vendor/history' element={<HistoryVendor />}></Route>
        <Route path='/vendor/profile' element={<ProfileVendor />}></Route>
        <Route path='/vendor/create-pin' element={<CreatePinVendor />}></Route>
        <Route path='/vendor/receive-money' element={<ReceiveMoneyVendor />}></Route>
        <Route path="/vendor/withdraw" element={<WithdrawVendor />}></Route>
        <Route path="/vendor/payment" element={<Payment />}></Route>

        <Route path='/admin' element={<Admin />}></Route>
        <Route path='/admin/home' element={<HomeAdmin />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
