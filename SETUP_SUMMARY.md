# Setup Summary

This guide walks you through setting up the Global E-Commerce Platform on your local machine.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js (Compatible Version)
- **Required Version**: Node.js 18.x or 22.x
- **Download**: [nodejs.org](https://nodejs.org/)
- **Verify Installation**:
  ```CMD
  node --version
  npm --version
  ```

### 2. Angular CLI 21
After installing Node.js, install Angular CLI globally:
```CMD
npm install -g @angular/cli@21
```

**Verify Installation**:
```CMD
ng version
```

---

## Setup Steps

### Step 1: Clone the Repository
Clone the project from GitHub to your local machine:
```CMD
git clone <repository-url>
cd Global_E-Commerce_Platform
```

### Step 2: Install Dependencies
Install all required npm packages:

npm install primeng primeicons @ngrx/store @ngrx/effects @ngrx/store-devtools highcharts highcharts-angular

```CMD
npm install
```

This will install:
- Angular 21
- PrimeNG 17+
- NgRx 18+
- Highcharts 11+
- TypeScript 5.9+
- All other dependencies

### Step 3: Run the Development Server
Start the local development server:
```CMD
npm start
```

Or alternatively:
```CMD
ng serve --o  
```

The application will automatically open at `http://localhost:4200/`

---

## Default Login Credentials

### Admin Account
- **Username**: `emilys`
- **Password**: `emilyspass`

### Customer Account
- **Username**: `michaelw`
- **Password**: `michaelwpass`

---

## Verify Setup

After starting the server, verify everything is working:

1. **Navigate to**: `http://localhost:4200/`
2. **Login** using the admin credentials/customer credentials
3. **Browse** the product catalog
4. **Test** adding items to cart
5. **Access** admin dashboard (if using admin account)

---

## Troubleshooting

### Port Already in Use
If port 4200 is already in use, run on a different port:
```CMD
ng serve --port 4300
```

### Module Not Found Errors
Try clearing node_modules and reinstalling:
```CMD
rmdir /s /q node_modules
npm install
```

### Build Errors
Clear Angular cache:
```CMD
ng cache clean
```

---
