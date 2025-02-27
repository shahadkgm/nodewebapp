const customerInfo = async (req, res) => {
    try {
        let search = req.query.search || ""; // Default to an empty string if no search query
        let page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = 5; // Number of customers per page

        // Fetch paginated user data with search
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
        res.status(500).send("An error occurred while retrieving customer data.");
    }
};
