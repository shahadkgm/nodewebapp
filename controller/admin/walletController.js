const mongoose=require('mongoose');
const User=require("../../models/userschema")



 const getAllWallets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, minBalance, maxBalance } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (minBalance) query.wallet = { $gte: parseFloat(minBalance) };
    if (maxBalance) query.wallet = { ...query.wallet, $lte: parseFloat(maxBalance) };

    const users = await User.find(query)
      .select('name email wallet walletHistory')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await User.countDocuments(query);

    res.render('wallets', {
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      minBalance,
      maxBalance
    });
  } catch (err) {
    console.error('Error in getAllWallets:', err);
    res.status(500).send('Server Error');
  }
};

const getUserWallet = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findById(req.params.userId)
      .select('name email wallet walletHistory');
    
    if (!user) {
      return res.status(404).send('User not found');
    }

    const walletHistory = user.walletHistory
      .sort((a, b) => b.date - a.date)
      .slice((page - 1) * limit, page * limit);
    const totalHistory = user.walletHistory.length;

    res.render('wallet-details', {
      user,
      walletHistory,
      totalHistory,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error in getUserWallet:', err);
    res.status(500).send('Server Error');
  }
};

const creditWallet = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.wallet += parseFloat(amount);
    user.walletHistory.push({
      date: new Date(),
      type: 'credit',
      amount: parseFloat(amount),
      description: description || 'Admin credit'
    });
    await user.save();
    res.redirect(`/admin/wallets/${user._id}`);
  } catch (err) {
    console.error('Error in creditWallet:', err);
    res.status(500).send('Server Error');
  }
};

const debitWallet = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.wallet < parseFloat(amount)) {
      return res.status(400).send('Insufficient balance');
    }

    user.wallet -= parseFloat(amount);
    user.walletHistory.push({
      date: new Date(),
      type: 'debit',
      amount: parseFloat(amount),
      description: description || 'Admin debit'
    });
    await user.save();
    res.redirect(`/admin/wallets/${user._id}`);
  } catch (err) {
    console.error('Error in debitWallet:', err);
    res.status(500).send('Server Error');
  }
};





module.exports={
    debitWallet,
    getAllWallets,
    creditWallet,
    getUserWallet,

}