const User = require("../../models/userschema");

const customerInfo = async (req, res) => {
    try {
        let search = req.query.search || "";
        let page = parseInt(req.query.page) || 1;
        const limit = 5;
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const count = await User.countDocuments({
            isAdmin: false,
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ],
        });

        const totalPages = Math.ceil(count / limit);

        res.render("customers", {
            data: userData,
            totalPages: totalPages,
            currentPage: page,
            totalCount: count,
            searchQuery: search,
        });

    } catch (error) {
        console.error("Error fetching customer data:", error);
        res.status(500).json({ success: false, message: "An error occurred while retrieving customer data." });
    }
};

const customerBlocked = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
        return res.status(200).json({ success: true, message: "Customer blocked successfully." });

    } catch (error) {
        console.error("Error blocking customer:", error);
        return res.status(500).json({ success: false, message: "An error occurred while blocking the customer." });
    }
};

const customerunBlocked = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
        return res.status(200).json({ success: true, message: "Customer unblocked successfully." });

    } catch (error) {
        console.error("Error unblocking customer:", error);
        return res.status(500).json({ success: false, message: "An error occurred while unblocking the customer." });
    }
};

module.exports = {
    customerInfo,
    customerBlocked,
    customerunBlocked,
};