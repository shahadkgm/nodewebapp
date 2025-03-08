const Order = require('../../models/orderSchema');
const Product = require('../../models/productSchema');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, format, category } = req.query;
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.orderDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total Sales
    const totalSales = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Sales by Date
    const salesByDate = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
          dailyRevenue: { $sum: '$finalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top Products with Category Filter
    const topProducts = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
      { $unwind: '$orderedItems' },
      {
        $group: {
          _id: '$orderedItems.product',
          totalQuantity: { $sum: '$orderedItems.quantity' },
          totalRevenue: { $sum: { $multiply: ['$orderedItems.quantity', '$orderedItems.price'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      // Lookup to join with Category collection
      {
        $lookup: {
          from: 'categories', // Assuming your Category collection is named 'categories'
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },

      ...(category ? [{ $match: { 'categoryDetails.name': category } }] : []),
      {
        $project: {
          productName: '$productDetails.productName',
          totalQuantity: 1,
          totalRevenue: 1,
          category: '$categoryDetails.name' // Use category name in output
        }
      }
    ]);

    // Fetch distinct category names for the frontend dropdown
    const categories = await Product.aggregate([
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $group: { _id: '$cat.name' } },
      { $sort: { _id: 1 } },
      { $project: { name: '$_id', _id: 0 } }
    ]).then(results => results.map(r => r.name));

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="sales-report.pdf"');
      
      doc.pipe(res);
    
      doc.fontSize(20).text('Sales Report', { align: 'center' });
      doc.moveDown();
    
      if (startDate && endDate) {
        doc.fontSize(12).text(`Date Range: ${startDate} to ${endDate}`, { align: 'center' });
      } else {
        doc.fontSize(12).text('Date Range: All Time', { align: 'center' });
      }
      if (category) {
        doc.fontSize(12).text(`Category: ${category}`, { align: 'center' });
      }
      doc.moveDown();
    
      doc.fontSize(14).text('Total Sales', { underline: true });
      doc.fontSize(12).text(`Total Revenue: ₹${(totalSales[0]?.totalRevenue || 0).toLocaleString('en-IN')}`);
      doc.fontSize(12).text(`Total Orders: ${totalSales[0]?.totalOrders || 0}`);
      doc.moveDown();
    
      doc.fontSize(14).text('Sales by Date', { underline: true });
      doc.moveDown(0.5);
      salesByDate.forEach(day => {
        doc.fontSize(10).text(`Date: ${day._id}`);
        doc.fontSize(10).text(`Revenue: ₹${day.dailyRevenue.toLocaleString('en-IN')}`);
        doc.fontSize(10).text(`Orders: ${day.orderCount}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    
      doc.fontSize(14).text('Top Products', { underline: true });
      doc.moveDown(0.5);
      topProducts.forEach(product => {
        doc.fontSize(10).text(`Product: ${product.productName}`);
        doc.fontSize(10).text(`Quantity Sold: ${product.totalQuantity}`);
        doc.fontSize(10).text(`Revenue: ₹${product.totalRevenue.toLocaleString('en-IN')}`);
        if (category) {
          doc.fontSize(10).text(`Category: ${product.category}`);
        }
        doc.moveDown(0.5);
      });
    
      doc.end();
    } else {
      res.render('salesReport', {
        totalSales: totalSales[0] || { totalRevenue: 0, totalOrders: 0 },
        salesByDate,
        topProducts,
        startDate,
        endDate,
        category,
        categories, // Pass categories for dropdown
        activeTab: 'sales-report'
      });
    }
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.redirect('/admin/pageerror');
  }
};

module.exports = { getSalesReport };