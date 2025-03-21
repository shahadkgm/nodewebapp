const Order = require('../../models/orderSchema');
const Product = require('../../models/productSchema');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const path = require('path');

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, format, category } = req.query;
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Total Sales
    const totalSales = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ['$finalAmount', 0] } },
          totalOrders: { $sum: 1 },
        },
      },
    ]).then(result => result[0] || { totalRevenue: 0, totalOrders: 0 });

    // Sales by Date
    const salesByDate = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
          dailyRevenue: { $sum: { $ifNull: ['$finalAmount', 0] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Top Products with Category Filter
    const topProducts = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
      { $unwind: '$orderedItems' },
      {
        $group: {
          _id: '$orderedItems.product',
          totalQuantity: { $sum: '$orderedItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderedItems.quantity', '$orderedItems.price'] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
      ...(category ? [{ $match: { 'categoryDetails.name': category } }] : []),
      {
        $project: {
          productName: { $ifNull: ['$productDetails.productName', 'Unknown Product'] },
          totalQuantity: 1,
          totalRevenue: 1,
          category: { $ifNull: ['$categoryDetails.name', 'N/A'] },
        },
      },
    ]);

    // Fetch Categories
    const categories = await Product.aggregate([
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $group: { _id: '$cat.name' } },
      { $sort: { _id: 1 } },
      { $project: { name: '$_id', _id: 0 } },
    ]).then(results => results.map(r => r.name));

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="sales-report.pdf"');

      doc.pipe(res);

      // Header
      doc.fontSize(20).text('Sales Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(
        startDate && endDate ? `Date Range: ${startDate} to ${endDate}` : 'Date Range: All Time',
        { align: 'center' }
      );
      if (category) doc.fontSize(12).text(`Category: ${category}`, { align: 'center' });
      doc.moveDown();

      // Total Sales
      doc.fontSize(14).text('Total Sales', { underline: true });
      doc.fontSize(12).text(`Total Revenue: ₹${totalSales.totalRevenue.toLocaleString('en-IN')}`);
      doc.fontSize(12).text(`Total Orders: ${totalSales.totalOrders}`);
      doc.moveDown(2);

      // Sales by Date Table
      doc.fontSize(14).text('Sales by Date', { underline: true });
      doc.moveDown(0.5);
      const salesByDateTable = {
        headers: ['Date', 'Revenue (₹)', 'Orders'],
        rows: salesByDate.map(day => [
          day._id || 'N/A',
          day.dailyRevenue.toLocaleString('en-IN'),
          day.orderCount.toString(),
        ]),
      };
      await doc.table(salesByDateTable, {
        columnsSize: [150, 150, 100],
        header: { fontSize: 12, fillColor: '#D3D3D3', align: 'center' },
        cell: { fontSize: 10, align: 'center', padding: 5 },
        width: 500,
      });

      doc.moveDown(2);

      // Top Products Table
      doc.fontSize(14).text('Top Products', { underline: true });
      doc.moveDown(0.5);
      const topProductsTable = {
        headers: category ? ['Product Name', 'Qty Sold', 'Revenue (₹)', 'Category'] : ['Product Name', 'Qty Sold', 'Revenue (₹)'],
        rows: topProducts.map(product => [
          product.productName,
          product.totalQuantity.toString(),
          product.totalRevenue.toLocaleString('en-IN'),
          ...(category ? [product.category] : []),
        ]),
      };
      await doc.table(topProductsTable, {
        columnsSize: category ? [150, 100, 100, 100] : [200, 100, 100],
        header: { fontSize: 12, fillColor: '#D3D3D3', align: 'center' },
        cell: { fontSize: 10, align: 'center', padding: 5 },
        width: 500,
      });

      doc.moveDown(2);
      doc.fontSize(10).text('WODDIE', { align: 'center' });
      doc.end();
    } else {
      res.render('salesReport', {
        totalSales,
        salesByDate,
        topProducts,
        startDate,
        endDate,
        category,
        categories,
        activeTab: 'sales-report',
      });
    }
  } catch (error) {
    console.error('Error generating sales report:', error);
    if (req.query.format === 'pdf') {
      res.status(500).json({ success: false, message: 'Failed to generate PDF', error: error.message });
    } else {
      res.redirect('/admin/pageerror');
    }
  }
};

module.exports = { getSalesReport };