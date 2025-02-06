
<%- include("../../views/partials/user/header") %>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swiper/6.8.4/swiper.min.css">

    <style>
        /* Page Header */
        .page-header {
            background-color: #f8f9fa;
            padding: 20px 0;
        }

        .breadcrumb {
            font-size: 14px;
            padding: 10px 0;
            margin: 0;
            background: none;
        }

        .breadcrumb a {
            color: #007bff;
            text-decoration: none;
        }

        .breadcrumb span {
            color: #6c757d;
        }

        /* Product Detail Slider */
        .product-detail .detail-gallery {
            position: relative;
        }

        .product-detail .swiper-container {
            width: 100%;
            max-height: 400px;
            overflow: hidden;
        }

        .product-detail .swiper-slide img {
            width: 100%;
            height: auto;
            max-height: 400px;
            object-fit: cover;
            border-radius: 10px;
        }

        .swiper-button-next,
        .swiper-button-prev {
            color: #333;
            font-size: 18px;
            transition: color 0.3s ease;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
            color: #000;
        }

        /* Image Zoom Styles */
        .detail-gallery .zoom-container {
            position: relative;
            overflow: hidden;
            cursor: zoom-in;
        }

        .detail-gallery .zoom-container img {
            transition: transform 0.3s ease;
            transform-origin: center center;
        }

        .detail-gallery .zoom-container:hover img {
            transform: scale(1.5);
        }

        .detail-gallery .zoom-lens {
            position: absolute;
            border: 1px solid #d4d4d4;
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.2);
            display: none;
            pointer-events: none;
        }

        /* Product Information */
        .detail-info {
            padding-left: 30px;
            display: flex;
            flex-direction: column;
        }

        .title-detail {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .product-price {
            font-size: 24px;
            color: #28a745;
        }

        .product-price .old-price {
            color: #6c757d;
            text-decoration: line-through;
        }

        .save-price {
            color: #dc3545;
        }

        .short-desc p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }

        .product-meta {
            margin-top: 20px;
        }

        .product-meta li {
            margin-bottom: 5px;
        }

        .product-meta .in-stock {
            color: #28a745;
        }

        .product-detail-rating {
            margin-bottom: 20px;
        }

        /* Make Images Responsive */
        .detail-gallery img {
            max-width: 100%;
        }

        /* Related Products Section */
        .related-products ul {
            padding: 0;
            list-style: none;
        }

        .related-products ul li {
            margin-bottom: 15px;
        }

        .related-products ul li img {
            border-radius: 5px;
            margin-right: 10px;
        }

        /* Add to Cart Button */
        .add-to-cart-btn {
            background-color: #28a745;
            color: #fff;
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }

        .add-to-cart-btn:hover {
            background-color: #218838;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
            .detail-info {
                padding-left: 0;
                margin-top: 20px;
            }

            .title-detail {
                font-size: 24px;
            }

            .product-price {
                font-size: 20px;
            }

            .short-desc p {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <main class="main">
        <!-- Breadcrumb Section -->
        <div class="page-header breadcrumb-wrap">
            <div class="container">
                <div class="breadcrumb">
                    <a href="/" rel="nofollow">Home</a>
                    <span></span>
                    <span>Product Detail Page</span>
                </div>
            </div>
        </div>

        <!-- Product Detail Section -->
        <section class="mt-50 mb-50">
            <div class="container">
                <div class="row">
                    <!-- Product Details -->
                    <div class="col-lg-9">
                        <div class="product-detail accordion-detail">
                            <div class="row mb-50">
                                <!-- Product Images -->
                                <div class="col-md-6 col-sm-12">
                                    <div class="detail-gallery">
                                        <div class="swiper-container product-image-slider">
                                            <div class="swiper-wrapper">
                                                <% product.productImages.forEach((image) => { %>
                                                    <div class="swiper-slide">
                                                        <figure class="border-radius-10 zoom-container">
                                                            <img
                                                                src="/uploads/product-images/<%= image %>"
                                                                alt="<%= product.name %>"
                                                                style="width: 100%; object-fit: cover;"
                                                                class="zoom-image"
                                                            />
                                                            <div class="zoom-lens"></div>
                                                        </figure>
                                                    </div>
                                                <% }); %>
                                            </div>
                                            <!-- Navigation buttons -->
                                            <div class="swiper-button-next"></div>
                                            <div class="swiper-button-prev"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Product Info -->
                                <div class="col-md-6 col-sm-12">
                                    <div class="detail-info">
                                        <h2 class="title-detail"><%= product.name %></h2>
                                        <div class="product-detail-rating"></div>
                                        <div class="clearfix product-price-cover">
                                            <div class="product-price primary-color float-left">
                                                <ins><span class="text-brand">₹<%= product.salePrice.toLocaleString('en-IN') %></span></ins>
                                                <span class="old-price font-md ml-15">
                                                    ₹<%= product.regularPrice.toLocaleString('en-IN') %>
                                                </span>
                                                <span class="save-price font-md color3 ml-15">
                                                    Save ₹<%= (product.regularPrice - product.salePrice).toLocaleString('en-IN') %>
                                                </span>
                                            </div>
                                        </div>
                                        <div class="short-desc mb-30">
                                            <p><%= product.description %></p>
                                        </div>
                                        <ul class="product-meta font-xs color-grey mt-50">
                                            <li>Availability:
                                                <span class="in-stock text-success ml-5">
                                                    <%= product.stock %>
                                                </span>
                                            </li>
                                        </ul>
                                        <form action="/add" method="POST">
                                            <input type="hidden" name="productId" value="<%= product.id %>">
                                            <input type="hidden" name="quantity" value="1"> <!-- Default quantity -->
                                            <button type="submit" class="add-to-cart-btn btn btn-success">
                                                Add to Cart
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Related Products -->
                    <div class="col-lg-3">
                        <div class="related-products">
                            <h4>Related Products</h4>
                            <ul class="list-unstyled">
                                <% if (relatedProducts && relatedProducts.length > 0) { %>
                                    <% relatedProducts.forEach((related) => { %>
                                        <li class="mb-2 d-flex align-items-center">
                                            <a href="/product/<%= related._id %>" class="text-decoration-none d-flex align-items-center">
                                                <img
                                                    src="/uploads/product-images/<%= related.productImage[0] %>"
                                                    alt="<%= related.productName %>"
                                                    style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 5px;"
                                                />
                                                <span><%= related.productName %></span>
                                            </a>
                                            <p class="mb-0 text-muted small">
                                                ₹<%= related.salePrice.toLocaleString('en-IN') %>
                                            </p>
                                        </li>
                                    <% }); %>
                                <% } else { %>
                                    <li>No related products found.</li>
                                <% } %>
                            </ul>
                        </div>
                    </div>
                    <h5>Quality: We prioritize high-quality products and services.
                        Customer Focused: We go the extra mile to ensure customer satisfaction.
                        Innovation: We're always looking for new ways to serve our customers better.
                        Sustainability: We are committed to environmentally-friendly practices and solutions.</h5>
                </div>
            </div>
        </section>
    </main>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/swiper/6.8.4/swiper.min.js"></script>
    <script>
        const swiper = new Swiper('.product-image-slider', {
            loop: false,
            slidesPerView: 1,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: 'slide',
            spaceBetween: 0,
        });

        // Image Zoom Functionality
        document.querySelectorAll('.zoom-container').forEach(container => {
            const image = container.querySelector('.zoom-image');
            const lens = container.querySelector('.zoom-lens');

            container.addEventListener('mousemove', (e) => {
                lens.style.display = 'none';

                const containerRect = container.getBoundingClientRect();
                const x = e.clientX - containerRect.left;
                const y = e.clientY - containerRect.top;

                lens.style.left = `${x - lens.offsetWidth / 2}px`;
                lens.style.top = `${y - lens.offsetHeight / 2}px`;

                const percentX = (x / container.offsetWidth) * 100;
                const percentY = (y / container.offsetHeight) * 100;
                image.style.transformOrigin = `${percentX}% ${percentY}%`;
            });

             
        });
    </script>
</body>
</html>
netstat -ano | findstr :3003
taskkill /PID 19124 /F

<style>
        .page-header {
            background-color: #f8f9fa;
            padding: 20px 0;
        }

        .breadcrumb {
            font-size: 14px;
            padding: 10px 0;
            margin: 0;
            background: none;
        }

        .breadcrumb a {
            color: #007bff;
            text-decoration: none;
        }

        .breadcrumb span {
            color: #6c757d;
        }

        .product-detail .detail-gallery {
            position: relative;
        }

        .product-detail .swiper-container {
            width: 100%;
            max-height: 400px;
            overflow: hidden;
        }

        .product-detail .swiper-slide img {
            width: 100%;
            height: auto;
            max-height: 400px;
            object-fit: cover;
            border-radius: 10px;
        }

        .swiper-button-next,
        .swiper-button-prev {
            color: #333;
            font-size: 18px;
            transition: color 0.3s ease;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
            color: #000;
        }

        .detail-gallery .zoom-container {
            position: relative;
            overflow: hidden;
            cursor: zoom-in;
        }

        .detail-gallery .zoom-container img {
            transition: transform 0.3s ease;
            transform-origin: center center;
        }

        .detail-gallery .zoom-container:hover img {
            transform: scale(1.5);
        }

        .detail-gallery .zoom-lens {
            position: absolute;
            border: 1px solid #d4d4d4;
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.2);
            display: none;
            pointer-events: none;
        }

        /* Product Information */
        .detail-info {
            padding-left: 30px;
            display: flex;
            flex-direction: column;
        }

        .title-detail {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .product-price {
            font-size: 24px;
            color: #28a745;
        }

        .product-price .old-price {
            color: #6c757d;
            text-decoration: line-through;
        }

        .save-price {
            color: #dc3545;
        }

        .short-desc p {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
        }

        .product-meta {
            margin-top: 20px;
        }

        .product-meta li {
            margin-bottom: 5px;
        }

        .product-meta .in-stock {
            color: #28a745;
        }

        .product-detail-rating {
            margin-bottom: 20px;
        }

        .detail-gallery img {
            max-width: 100%;
        }

        .related-products ul {
            padding: 0;
            list-style: none;
        }

        .related-products ul li {
            margin-bottom: 15px;
        }

        .related-products ul li img {
            border-radius: 5px;
            margin-right: 10px;
        }

        /* Add to Cart Button */
        .add-to-cart-btn {
            background-color: #28a745;
            color: #fff;
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }

        .add-to-cart-btn:hover {
            background-color: #218838;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
            .detail-info {
                padding-left: 0;
                margin-top: 20px;
            }

            .title-detail {
                font-size: 24px;
            }

            .product-price {
                font-size: 20px;
            }

            .short-desc p {
                font-size: 14px;
            }
        }
    </style>
    {/* new  */}
     
  
  <style>
    /* Custom Navbar Styles */
.custom-navbar {
    padding: 20px 0;
    transition: all 0.3s ease;
    background: #3b5d50 !important;  /* Custom dark green background */
}

/* Brand/Logo Styles */
.navbar-brand {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff !important;
}

.navbar-brand span {
    color: #198754;  /* Green dot after WODDIE */
}

/* Navigation Links */
.custom-navbar-nav .nav-link {
    font-weight: 500;
    color: #ffffff !important;
    position: relative;
    padding: 10px 15px !important;
    transition: all 0.3s ease;
}

.custom-navbar-nav .nav-link:hover {
    color: #198754 !important;
}

/* Active Link Style */
.custom-navbar-nav .nav-item.active .nav-link {
    color: #198754 !important;
}

/* Dropdown Styles - Refined */
.dropdown {
    position: relative;
    display: inline-block;
    padding: 0 15px;
}

.dropdown a {
    color: #ffffff !important;
    font-weight: 500;
    transition: all 0.3s ease;
}

.dropdown a:hover {
    color: #198754 !important;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #ffffff;
    min-width: 180px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
    z-index: 1000;
    right: 0;
    top: 100%;
    margin-top: 10px;
}

.dropdown-content::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 20px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #ffffff;
}

.dropdown-content a {
    color: #333333 !important;
    padding: 12px 20px;
    text-decoration: none;
    display: block;
    transition: all 0.3s ease;
    font-size: 14px;
}

.dropdown-content a:hover {
    background-color: #f8f9fa;
    color: #198754 !important;
}

.dropdown:hover .dropdown-content {
    display: block;
}

/* Cart Icon Styles */
.custom-navbar-cta {
    margin-left: 20px !important;
}

.custom-navbar-cta .nav-link {
    padding: 8px !important;
    position: relative;
}

.custom-navbar-cta img {
    width: 24px;
    filter: invert(1);  /* Makes SVG icon white */
    transition: all 0.3s ease;
}

.custom-navbar-cta .nav-link:hover img {
    transform: scale(1.1);
}

/* Mobile Navigation Styles */
.navbar-toggler {
    border: none;
    padding: 0;
    width: 30px;
    height: 30px;
    position: relative;
}

.navbar-toggler:focus {
    box-shadow: none;
}

.navbar-toggler-icon {
    background-image: none;
    position: relative;
    transition: all 0.3s ease;
}

/* Responsive Styles */
@media (max-width: 991.98px) {
    .custom-navbar {
        padding: 15px 0;
    }

    .navbar-collapse {
        background: #3b5d50;
        padding: 20px;
        margin-top: 15px;
        border-radius: 8px;
    }

    .custom-navbar-nav .nav-link {
        padding: 10px 0 !important;
    }

    .dropdown {
        padding: 0;
    }

    .dropdown-content {
        position: static;
        background-color: rgba(255,255,255,0.1);
        margin-top: 5px;
        box-shadow: none;
    }

    .dropdown-content::before {
        display: none;
    }

    .dropdown-content a {
        color: #ffffff !important;
    }

    .custom-navbar-cta {
        margin-left: 0 !important;
        margin-top: 15px;
    }
}
  </style>
</head>
<body>
  <nav class="custom-navbar navbar navbar-expand-md navbar-dark bg-dark" aria-label="Furni navigation bar">
    <div class="container">
      <a class="navbar-brand" href="/index">WODDIE<span>.</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsFurni" aria-controls="navbarsFurni" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarsFurni">
        <ul class="custom-navbar-nav navbar-nav ms-auto mb-2 mb-md-0">
          <li class="nav-item active"><a class="nav-link" href="/">Home</a></li>
          <li><a class="nav-link" href="/shop">Shop</a></li>
          <%if(locals.user){%>
            <div class="dropdown">
              <a href="#" class="sign-in-link"><%= locals.user.name %></a>
              <div class="dropdown-content">
                <a href="/userProfile">Profile</a>
                <a href="/logout">Logout</a>
              </div>
            </div>
          <%} else {%>
            <li><a class="nav-link" href="/signup">Sign up</a></li>
            <li><a class="nav-link" href="/login">Log in</a></li>
          <%}%>
        </ul>
        <!-- Update the cart icon HTML to match the styles -->
<ul class="custom-navbar-cta navbar-nav mb-2 mb-md-0 ms-5">
    <li>
      <a class="nav-link" href="/cart">
        <img src="images/cart.svg" alt="Cart">
      </a>
    </li>
  </ul>
      </div>
    </div>
  </nav>



    <main class="main">
        <div class="page-header breadcrumb-wrap">
            <div class="container">
                <div class="breadcrumb">
                    <a href="/" rel="nofollow">Home</a>
                    <span></span>
                    <span>Product Detail Page</span>
                </div>
            </div>
        </div>

        <section class="mt-50 mb-50">
            <div class="container">
                <div class="row">
                    <div class="col-lg-9">
                        <div class="product-detail accordion-detail">
                            <div class="row mb-50">

                                <div class="col-md-6 col-sm-12">
                                    <div class="detail-gallery">
                                        <div class="swiper-container product-image-slider">
                                            <div class="swiper-wrapper">
                                                <% product.productImages.forEach((image) => { %>
                                                    <div class="swiper-slide">
                                                        <figure class="border-radius-10 zoom-container">
                                                            <img
                                                                src="/uploads/product-images/<%= image %>"
                                                                alt="<%= product.name %>"
                                                                style="width: 100%; object-fit: cover;"
                                                                class="zoom-image"
                                                            />
                                                            <div class="zoom-lens"></div>
                                                        </figure>
                                                    </div>
                                                <% }); %>
                                            </div>
                                            <!-- Navigation buttons -->
                                            <div class="swiper-button-next"></div>
                                            <div class="swiper-button-prev"></div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Product Info -->
                                <div class="col-md-6 col-sm-12">
                                    <div class="detail-info">
                                        <h2 class="title-detail"><%= product.name %></h2>
                                        <div class="product-detail-rating"></div>
                                        <div class="clearfix product-price-cover">
                                            <div class="product-price primary-color float-left">
                                                <ins><span class="text-brand">₹<%= product.salePrice.toLocaleString('en-IN') %></span></ins>
                                                <span class="old-price font-md ml-15">
                                                    ₹<%= product.regularPrice.toLocaleString('en-IN') %>
                                                </span>
                                                <span class="save-price font-md color3 ml-15">
                                                    Save ₹<%= (product.regularPrice - product.salePrice).toLocaleString('en-IN') %>
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div class="short-desc mb-30">
                                            <p><%= product.description %></p>
                                        </div>
                                        <ul class="product-meta font-xs color-grey mt-50">
                                            <li>Availability:
                                                <span class="in-stock text-success ml-5">
                                                    <%= product.stock %>
                                                </span>
                                            </li>
                                        </ul>
                                        <form action="/add" method="POST">
                                            <input type="hidden" name="productId" value="<%= product.id %>">
                                            <input type="hidden" name="quantity" value="1"> 
                                            <button type="submit" class="add-to-cart-btn btn btn-success">
                                                Add to Cart
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Related Products -->
                    <div class="col-lg-3">
                        <div class="related-products">
                            <h4>Related Products</h4>
                            <ul class="list-unstyled">
                                <% if (relatedProducts && relatedProducts.length > 0) { %>
                                    <% relatedProducts.forEach((related) => { %>
                                        <li class="mb-2 d-flex align-items-center">
                                            <a href="/product/<%= related._id %>" class="text-decoration-none d-flex align-items-center">
                                                <img
                                                    src="/uploads/product-images/<%= related.productImage[0] %>"
                                                    alt="<%= related.productName %>"
                                                    style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 5px;"
                                                />
                                                <span><%= related.productName %></span>
                                            </a>
                                            <p class="mb-0 text-muted small">
                                                ₹<%= related.salePrice.toLocaleString('en-IN') %>
                                            </p>
                                        </li>
                                    <% }); %>
                                <% } else { %>
                                    <li>No related products found.</li>
                                <% } %>
                            </ul>
                        </div>
                    </div>
                    <h5>Quality: We prioritize high-quality products and services.
                        Customer Focused: We go the extra mile to ensure customer satisfaction.
                        Innovation: We're always looking for new ways to serve our customers better.
                        Sustainability: We are committed to environmentally-friendly practices and solutions.</h5>
                </div>
            </div>
        </section>
    </main>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/swiper/6.8.4/swiper.min.js"></script>
    <script>
        const swiper = new Swiper('.product-image-slider', {
            loop: false,
            slidesPerView: 1,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: 'slide',
            spaceBetween: 0,
        });

        document.querySelectorAll('.zoom-container').forEach(container => {
            const image = container.querySelector('.zoom-image');
            const lens = container.querySelector('.zoom-lens');

            container.addEventListener('mousemove', (e) => {
                lens.style.display = 'none';

                const containerRect = container.getBoundingClientRect();
                const x = e.clientX - containerRect.left;
                const y = e.clientY - containerRect.top;

                lens.style.left = `${x - lens.offsetWidth / 2}px`;
                lens.style.top = `${y - lens.offsetHeight / 2}px`;

                const percentX = (x / container.offsetWidth) * 100;
                const percentY = (y / container.offsetHeight) * 100;
                image.style.transformOrigin = `${percentX}% ${percentY}%`;
            });

             
        });
    </script>
    </body>
    </html>
