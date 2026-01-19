# KoinX Tax Strategizer 🚀

🔗 **Live Demo**: [https://tax-strategizer.vercel.app/](https://tax-strategizer.vercel.app/)

A high-fidelity, production-grade Tax Loss Harvesting dashboard built for the modern crypto investor. Leveraging real-time data intelligence and premium UI design to optimize capital gains across multi-chain portfolios.

## ✨ Features

- **Real-Time Tax Optimization**: Instant recalculation of STCG and LTCG positions based on user-selected harvesting strategies.
- **Visual Intelligence**: Custom high-fidelity Dashboard Stats with granular profit/loss breakouts and predictive strategy modeling.
- **Asset Manager Table**: Advanced asset management with search, performance-based sorting, and selective liquidation tracking.
- **Mobile Responsive**: Full-spectrum adaptability for professional wealth management on any device.
- **Smart Logic**: Validated accounting utilities for precise financial balancing across Short-Term and Long-Term positions.

## 📁 Project Structure

```bash
koinx-tax-harvesting/
├── src/
│   ├── components/      # UI Components (DashboardStats, AssetManagerTable)
│   ├── hooks/           # Custom state logic (usePortfolio)
│   ├── services/        # Mock API & Data services (api.js)
│   ├── utils/           # Tax calculation utilities (taxCalculations.js)
│   ├── App.jsx          # Main Dashboard Orchestrator
│   └── index.css        # Global styles & Design Tokens
```

## 🛠️ Setup & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Launch the development server**:
   ```bash
   npm run dev
   ```

3. **Visit the app**: Open `http://localhost:5174` in your browser.

## 🚀 Deployment

The project is optimized for deployment on **Vercel**. 

- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🧠 Assumptions & Accounting Rules

- **Tax Rate**: An estimated 30% tax rate is used for calculating potential savings.
- **Realization Rule**: Selecting an asset simulates the realization of its current unrealized gain/loss.
- **Precision**: Money fields are formatted to 2 decimal places using `toLocaleString` for readable, localized financial transparency.

---
Built for the **KoinX Frontend Assignment**.
