<%- include("../../views/partials/admin/header") %>

<div class="container my-5">
  <h2 class="text-center mb-4">Order Management</h2>
  <div class="row">
    <% if (orders.length > 0) { %>
      <% orders.forEach(order => { %>
        <div class="col-md-12 mb-3">
          <div class="card border-success">
            <!-- Order Header -->
            <div class="card-header d-flex justify-content-between">
              <strong>Order ID:</strong> <%= order.orderId %>
              <span><strong>Order Status:</strong> <%= order.status %></span>
            </div>

            <!-- Order Details -->
            <div class="card-body">
              <h5 class="mb-3">Ordered Items:</h5>
              <% order.orderedItems.forEach(item => { %>
                <div class="d-flex justify-content-between mb-3">
                  <div>
                    <strong>Product:</strong> <%= item.product.productName %> <br>
                    <strong>Price:</strong> ₹<%= item.price %> <br>
                    <strong>Quantity:</strong> <%= item.quantity %> <br>
                    <strong>Payment Method:</strong> <%= order.paymentMethod %>
                  </div>
                  <div>
                    <!-- Product Status Update Form -->
                    <form action="/admin/update-product-status/<%= order._id %>/<%= item._id %>" method="POST" class="d-inline">
                      <label for="product-status-<%= item._id %>"><strong>Product Status:</strong></label>
                      <select id="product-status-<%= item._id %>" name="status" class="form-select form-select-sm d-inline-block w-auto border-success">
                        <option value="Pending" <%= item.status === 'Pending' ? 'selected' : '' %>>Pending</option>
                        <option value="Processing" <%= item.status === 'Processing' ? 'selected' : '' %>>Processing</option>
                        <option value="Shipped" <%= item.status === 'Shipped' ? 'selected' : '' %>>Shipped</option>
                        <option value="Delivered" <%= item.status === 'Delivered' ? 'selected' : '' %>>Delivered</option>
                        <option value="Cancelled" <%= item.status === 'Cancelled' ? 'selected' : '' %>>Cancelled</option>
                      </select>
                      <button type="submit" class="btn btn-primary btn-sm">Update</button>
                    </form>
                  </div>
                </div>
              <% }) %>
              <hr>
              <div class="d-flex justify-content-between">
                <strong>Total Price:</strong> ₹<%= order.totalPrice %>
              </div>
            </div>
          </div>
        </div>
      <% }) %>
    <% } else { %>
      <div class="col-12">
        <p class="text-center">No orders to display.</p>
      </div>
    <% } %>
  </div>
</div>
