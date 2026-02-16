# Implementation Guide

## Quick Start Commands

### Install Dependencies:

```bash/cmd
npm install primeng primeicons @ngrx/store @ngrx/effects @ngrx/store-devtools highcharts highcharts-angular

OR

npm i
```

### Run Development Server:
```bash/cmd
npm start
# or
ng serve --o
```
Navigate to `http://localhost:4200/`

---

Built with:
- Angular 21
- PrimeNG 17+
- NgRx 18+
- Highcharts 11+
- TypeScript 5.9+

---

##  Project Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── product.service.ts             # Handles product API calls and caching
│   │   │   ├── cart.service.ts                # Manages cart operations and local storage
│   │   │   ├── order.service.ts               # Order creation and tracking simulation
│   │   │   ├── auth.service.ts                # Authentication and user management
│   │   │   ├── admin.service.ts               # Admin dashboard metrics and operations
│   │   │   ├── currency.service.ts            # Multi-currency support with real-time rates
│   │   │   └── cache.service.ts               # Session and local storage management
│   │   ├── guards/
│   │   │   └── auth.guard.ts                   # Authentication guard from unauthorized access
│   │   └── interceptors/
│   │       └── http.interceptor.ts             # HTTP interceptor for handling HTTP requests and handling API errors
│   ├── modules/
│   │   ├── products/
│   │   │   ├── product-list/              # all products listing with category sample products and category tabs (Home Page)
│   │   │   └── product-detail/            # Detailed single product view with review and rating for that product
│   │   ├── cart/
│   │   │   └── cart-page/                 # Shopping cart management
│   │   ├── orders/
│   │   │   └── order-confirmation/        # Order success and summary with track order option
│   │   │   └── order-tracking/            # Real-time order tracking with mock simulation of status change of the product processing to delivered
│   │   └── admin/
│   │       ├── admin-dashboard/           # Admin metrics and analytics with charts and graphs and active users
│   ├── state/
│   │   ├── product/                         # NgRx product state management
│   │   ├── cart/                            # NgRx cart state management
│   │   └── order/                           # NgRx order state management
│   ├── app.config.ts                        # Application configuration
│   ├── app.routes.ts                        # Routing configuration
│   ├── app.ts                               # Root component logic
│   ├── app.html                             # Root template
│   └── app.css                              # Root styles
└── styles.css                               # Global styles


---

##  API Integration

### Base URL
- **DummyJSON API**: `https://dummyjson.com`

### Endpoints Used

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token 
- `POST /users/add` - User signup (simulated)

#### Products
- `GET /products?limit={limit}&skip={skip}` - Get all products
- `GET /products/{id}` - Get single product
- `GET /products/search?q={query}&limit={limit}&skip={skip}` - Search 

#### Cart
- `GET /carts/user/{userId}` - Get user cart
- `POST /carts/add` - Add to cart

#### Orders
- `POST /carts/add` - Create order (simulated)
- `GET /carts/user/{userId}` - Get user orders

#### Admin Dashboard
- `GET /users?limit=100` - Get all users
- `GET /products?limit=100` - Get all products for metrics
- `GET /products?limit=100&sortBy=rating&order=desc` - Get best sellers
- `GET /carts` - Get order statistics

---

##  Notes

- All state management is handled via NgRx with signals
- Product catalog uses session storage for caching
- Multi-currency support with 8 currencies
- Real-time order tracking simulation
- Admin dashboard with user and analytics management
- Responsive design for all screen sizes


## Note
As We Integrated this application with Dummy APIs Some features are restricted to a single session. For example, if you add a product to the cart and logout the application and after the next login, the product will be removed from the cart because we are not getting proper data from the dummy APIs. 
