# 📟 Spot Light Biriyani — Manager & Cashier Billing Manual

---

## Welcome, Counter Cashier & Branch Manager!
This manual explains how to bill orders at lightning speed during heavy lunch and dinner rushes, calculate customer change with zero mental math errors, and print 80mm thermal kitchen receipts.

---

## 1. Screen Overview (`/app/billing`)

```
+-------------------------------------------------------------+------------------------------------+
| [COUNTER POS]       [+ Custom Item]    [Next Token #039]    | [Counter]   [Swiggy]   [Zomato]    |
| [Biriyani] [Kushka] [Starters] [Breads] [Desserts]          |------------------------------------|
|                                                             | CART ITEMS:                        |
| +-------------------------+ +-------------------------+     | - 1 x Chicken Biriyani (Full) ₹180 |
| | Chicken Biriyani (Full) | | Chicken Biriyani (Half) |     | - 1 x Chicken Biriyani (Half) ₹110 |
| | ₹180                    | | ₹110                    |     | - 1 x Chicken 65 Biriyani     ₹210 |
| | [ - ] 1 in cart [ + ]   | | [ Tap to Add ]          |     |------------------------------------|
| +-------------------------+ +-------------------------+     | Discount: [0]  Payment: [Cash   v] |
| +-------------------------+ +-------------------------+     | Quick Cash: [Exact] [₹200] [₹500]  |
| | Mutton Biriyani (Full)  | | Chicken 65 Biriyani     |     | Return Change: ₹140 (Bold Green)   |
| | ₹280                    | | ₹210                    |     |------------------------------------|
| | [ Tap to Add ]          | | [ - ] 1 in cart [ + ]   |     | Customer Pays: ₹500  Profit: ₹212  |
| +-------------------------+ +-------------------------+     | [ 🔊 SAVE BILL & PRINT RECEIPT ]   |
+-------------------------------------------------------------+------------------------------------+
```

---

## 2. Step-by-Step Billing Instructions

### Step 1: Select Channel
At the top of the cart panel on the right, tap:
- **Counter / Dine-in**: Standard takeaway and counter dining prices.
- **Swiggy**: Menu prices automatically switch to online aggregator rates.
- **Zomato**: Menu prices automatically switch to online aggregator rates.

### Step 2: How to Bill Multiple Items (e.g. 1 Full, 1 Half, 1 Chicken 65)
1. Tap **Chicken Biriyani (Full)** card on the left -> It immediately appears in the cart on the right.
2. Tap **Chicken Biriyani (Half)** card on the left -> It immediately appears in the cart below.
3. Tap **Chicken 65 Biriyani** card on the left -> It appears in the cart as well.
4. **Adjusting Quantities**:
   - You can tap the `[ + ]` or `[ - ]` buttons directly on the dish card on the left.
   - Or tap the `+` and `−` buttons next to each line item in the cart.
   - To remove an item completely, tap the red trash can icon `🗑️`.

### Step 3: How to Bill Off-Menu or Custom Items (`+ Custom Dish`)
If a customer asks for a special order (e.g., *"1 KG Dum Bucket"*, *"Extra Chicken Piece"*, *"5 Extra Boiled Eggs"*):
1. Tap the **"+ Custom / Open Dish"** button at the top right of the terminal.
2. Enter the **Item Name** (e.g., `Extra Chicken Piece`).
3. Enter the **Price** (e.g., `₹70`).
4. Tap **"Add to Bill"**. The custom item is added directly to the active bill!

### Step 4: Special Kitchen Notes
- Below the cart items, enter any special customer instructions in the **"Special Kitchen Note"** field:
  - Examples: `Less spicy`, `Extra onion raita`, `Parcel / Takeaway`.
  - This note will be printed in a highlighted box on the 80mm kitchen receipt!

### Step 5: Handling Cash & Quick Change Calculator
1. Select Payment Mode: **Cash**, **UPI**, or **Card**.
2. When **Cash** is selected:
   - Quick tender buttons appear: `[Exact]`, `[₹200]`, `[₹500]`, `[₹1000]`.
   - If customer bill is ₹360 and customer hands you a **₹500 note**, tap **`[₹500]`**.
   - The screen instantly flashes: **Return Change: ₹140** in bold green!
   - Hand the customer their ₹140 change. Zero mental math mistakes during rush hour.

### Step 6: Save Bill & Thermal Receipt Printing
1. Tap the large orange button: **"🔊 SAVE BILL & PRINT"**.
2. A pleasant cash-register chime (`ding!`) plays.
3. A success notification shows the bill total and order token number.
4. The system triggers the browser print dialog to print an **80mm thermal receipt** with the daily Token Number (e.g., `#Token 039`) for the customer and kitchen!
