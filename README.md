# DRAX ESPORTS — Free Fire MAX Tournament Platform

This package includes the **DRAX ESPORTS** web application, **Host Admin Control Center**, and a lightweight **Node.js + Express** backend (`server.js`) with JSON database persistence (`db.json`).

## Features Included
- **Host Admin Panel (PIN: `2026`)**:
  - Set your real **Host UPI ID** (e.g. `yourname@okaxis`, `yourname@ybl`).
  - Review player **UPI Deposit Requests** (with 12-digit UTR numbers) and click **Approve** to credit their wallet.
  - Review player **Withdrawal Requests** (player UPI ID + amount), pay via your UPI app, and click **Mark Paid**.
  - Publish custom Free Fire MAX rooms (Battle Royale, Clash Squad, Lone Wolf), manage Room ID/Password, and credit winners.
- **Player App**:
  - Real UPI deep-link payment flow (`upi://pay?...`) + UTR submission.
  - Room ID & Password unlock in **My Matches**.
  - Leaderboard, Watch & Earn Free Entry Tickets, and Refer & Earn.

## How to Publish Online (Free Hosting on Render or Railway)
1. Upload this folder to a GitHub repository.
2. Create a new **Web Service** on [Render](https://render.com) or [Railway](https://railway.app).
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add Environment Variables:
   - `HOST_PIN`: your secret admin PIN (default `2026`)
   - `HOST_UPI_ID`: your real UPI ID (e.g. `yourname@okaxis`)

## Run Locally
```bash
npm install
npm start
```
Then open `http://localhost:3000`.

> **Note on Automated Payments & Compliance**: Manual UPI + UTR verification lets you collect entry fees directly into your UPI without gateway fees. If you want 100% automated instant deposits and payouts without manual UTR approval, integrate a payment gateway such as Razorpay or Cashfree and ensure compliance with local skill-gaming regulations.
