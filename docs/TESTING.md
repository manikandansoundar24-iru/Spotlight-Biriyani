# Test checklist

Run this before every handover or demo. ~10 minutes.

## Website
- [ ] `/` loads, hero image visible, no layout break at 375px width (phone).
- [ ] Nav works on mobile (hamburger opens/closes).
- [ ] `/menu` lists all categories and prices.
- [ ] `/branches` shows 3 branches; "Get directions" opens Google Maps.
- [ ] `/contact` phone link dials on a phone; email link opens mail app.

## Billing
- [ ] Tap an item → it appears in the cart with correct price.
- [ ] Switch to Swiggy → cart prices change to online prices, payment becomes Online.
- [ ] Commission and packing lines appear for Swiggy/Zomato, not for Counter.
- [ ] Enter discount 20 → "Customer pays" and profit both drop by 20.
- [ ] Save bill → toast confirms; cart clears; Dashboard "Today" order count +1.
- [ ] Print receipt → print preview shows shop name, items, total.

## Reports
- [ ] Item-wise table totals match Dashboard revenue for the same range.
- [ ] "Prep tomorrow" shows a number for items sold on that weekday before.
- [ ] CSV downloads and opens in Excel/Sheets.

## Stock
- [ ] Purchase 10 kg chicken → qty increases by 10, movement logged.
- [ ] Used 50 kg rice → qty decreases; if below reorder level, status turns "Reorder"
      and the Dashboard banner appears.
- [ ] Add a new raw material → it appears in the table and the movement dropdown.

## Menu & Costs
- [ ] Change a plate cost → margin updates, and a new bill uses the new cost.
- [ ] Uncheck "Live" → item disappears from Billing and the website menu.

## Settings / data
- [ ] Change commission % → new bills use it (old bills stay as billed — correct behaviour).
- [ ] Download backup → JSON file saved.
- [ ] Reset to demo data → then Restore backup → data comes back.
- [ ] Reload the page → data persists.

## Known limitations (say these out loud during the demo)
- Data is per-device/browser; no login, no cross-branch sync yet (cloud upgrade).
- No auto stock deduction per plate (recipe/BOM module = paid add-on).
- Swiggy/Zomato orders are entered manually; there is no live API integration
  (aggregator APIs need partner approval — quote it as a project).
- Rent/salary fixed costs are not deducted.
