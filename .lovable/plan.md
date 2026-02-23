

## Fix Booking Card Layout - Show Cancel Button Fully

The booking card on the My Bookings page is too narrow, causing the "Cancel" button to be cut off. The issue is in the footer section of the `BookingCard` component where the "Requested on" date and the Edit/Cancel buttons are crammed together on one line.

### Changes

**File: `src/pages/MyBookings.tsx`**

1. Modify the card footer layout (the `div` at line 122) to stack vertically instead of side-by-side, so the "Requested on" text and the Edit/Cancel buttons each get their own row. This ensures the Cancel button is always fully visible regardless of card width.

2. Change the footer from `flex items-center justify-between` to a vertical stack layout (`flex flex-col gap-2`), with the buttons right-aligned on their own line.

### Technical Details

- Change the footer container at line 122 from horizontal to vertical layout
- Move the Edit and Cancel buttons to a separate row with `flex justify-end`
- Keep the "Requested on" text on the first row
- No backend or database changes needed

