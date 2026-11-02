# 👑 Spot Light Biriyani — Restaurant Owner's Operating Manual

---

## Welcome, Restaurant Owner!
This application was created to eliminate the two biggest financial leaks in restaurant operations:
1. **Hidden Aggregator Commission Bleed**: Not knowing how much money Swiggy and Zomato actually take from your profits.
2. **Food Wastage & Raw Material Pilferage**: Cooking too much food on slow days and running out of biriyani on busy days.

With **Spot Light Manager**, you can see your **real cash profit per order** before the bill is even punched, and forecast exactly how many plates to cook tomorrow.

---

## 1. Your 30-Second Daily Routine

### 🌅 Morning Routine (11:00 AM – 12:00 PM)
1. **Check Prep Forecast**:
   - Go to `/app/reports` on your phone or counter tablet.
   - Look at the column titled **"Prep Tomorrow"**.
   - It tells you the exact number of plates (Chicken Biriyani, Mutton Biriyani, Kushka) to cook today based on a weighted 4-week average of this same day of the week.
   - Hand these numbers to your Head Cook / Dum Master.
2. **Record Morning Purchases**:
   - Go to `/app/stock`.
   - If you bought 25 kg chicken, 50 kg basmati rice, or oil this morning, tap **"+ Record Movement"** -> Select **"Purchase"** -> enter the quantity.
   - Your live raw material stock and inventory value update instantly.

### 🍱 During Lunch & Dinner Rush
- Your counter cashier handles all billing under `/app/billing`.
- Every plate of biriyani billed at the counter or received via Swiggy/Zomato is recorded against the active branch.

### 🌙 Night Audit & Closing Routine (10:30 PM)
1. **Open `/app` (Dashboard)**:
   - Select **"Today"** in the top-right filter.
   - Review your 4 Key Numbers:
     - **Revenue**: Total money collected from all channels.
     - **Net Profit**: Your actual take-home operating cash (Gross − Food Cost − Swiggy Cut − Packing).
     - **Platform Commission**: Exactly how much Swiggy and Zomato deducted from you today.
     - **Food Cost (COGS)**: What your meat, rice, spices, and oil cost.
2. **Review Channel Profitability**:
   - Scroll down to the **"Channel Profitability"** table.
   - Compare Counter vs. Swiggy vs. Zomato margin %. If an online channel has less than 20% margin, adjust your online menu price in `/app/items`.
3. **Weekly Sunday Backup**:
   - Go to `/app/settings`.
   - Tap **"Download Backup (JSON)"**.
   - Save this small file to your WhatsApp or Google Drive. This ensures your sales data is 100% safe forever.

---

## 2. Understanding Your Profit Math

Traditional billing machines only show:
$$\text{Revenue} = \text{Item Price} \times \text{Quantity}$$

**Spot Light Manager calculates the real operating truth**:
```
  Customer Pays (Net Revenue)
− Food Cost (Meat + Rice + Oil + Spices per plate)
− Aggregator Cut (e.g. Swiggy 22% commission + GST)
− Packaging Fee (Container, bag, spoon cost)
==================================================
= TRUE NET OPERATING PROFIT
```
*Note: Rent, electricity, and staff salaries are fixed monthly costs. To calculate your net monthly take-home, simply subtract your monthly rent and payroll from your monthly Net Profit total on the Dashboard.*

---

## 3. How to Update Prices & Margins (`/app/items`)
When chicken or mutton market rates rise:
1. Open `/app/items` on the manager tablet.
2. Click any dish:
   - **Counter Price**: What walk-in customers pay.
   - **Online Price**: What Swiggy/Zomato customers pay (always keep this 15–25% higher to offset platform commission!).
   - **Plate Cost**: What 1 plate costs you to make (Meat + Rice + Oil + Masala + Egg + Raita).
3. The margin and margin % recalculate instantly.

---

## 4. Multi-Branch Operations
- If you have multiple branches (e.g., Tharamani, Adyar, Velachery):
- Use the **Branch Dropdown** at the top right of the screen.
- Filter Dashboard and Reports by:
  - *All Branches* (Combined business view)
  - *Individual Branch* (Audit specific branch manager performance)
- Add new branches anytime in `/app/settings`.
