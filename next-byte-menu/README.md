# NEXT BYTE Menu UI — Clean CSS Refactor

This version starts from the previously preferred `next-byte-menu-ui-kicker-review-fix` build and replaces the accumulated CSS cascade instead of appending more overrides.

## What changed

- Removed the stacked/conflicting CSS override problem.
- Added deterministic Kicker card section classes.
- Kicker page now uses fixed row bands:
  - section label
  - top drink row
  - Escape Rūm hero band
  - section label
  - specialty row
- Drink images are much larger and consistently placed.
- Escape Rūm is a distinct hero component, not a stretched normal row.
- Specialty row is directly under its label with no dead vertical gulf.
- Bitstream remains integrated into the header with a softer shell.
- Review layout remains below the open Bitstream drawer.


## Region height tweak

- Increased the Kicker content bands slightly so the top row, Escape Rūm band, and Specialty row fill more of the available vertical space.
- Reduced the bottom gutter slightly so the page sits more comfortably in the frame.


## Category structure fix

This version fixes the category logic structurally instead of with overlapping pseudo-rings.

- Top category group now contains:
  - label + A–F (or M–R on 21+)
- Middle category is Escape Rūm only
- Bottom category group now contains:
  - label + J–L (or V–Z on 21+)

This keeps Escape Rūm independent and prevents Soda-Tap / Specialty framing from visually swallowing it.


## Kicker spacing / sizing cleanup

- Converted the Kicker page regions to proportional vertical bands so they fill the available height.
- Reduced extra padding and rigid sizing that was clipping the bottom row.
- Tightened the card internals so names, prices, and add buttons stay visible.
- Reduced unused bottom space by letting the layout stretch more naturally inside the screen frame.


## Review / Order Summary polish

- Refactored the open Bitstream into a thinner, wider top ribbon.
- Detached the top Back to Menu button visually from the Bitstream ribbon.
- Rebalanced the Review Order and Order Summary columns.
- Enlarged and centered the 64-bit Order Summary grid.
- Increased hierarchy for “ITEMS IN ORDER”, TOTAL, and the Complete Order button.
- Tightened review row spacing so the panel feels denser and closer to the concept art.


## Review layout tweak

- Made the review-state Bitstream ribbon thinner so it sits clear of the title bar.
- Nudged the Review Order / Order Summary region slightly lower.
- Reduced review row sizing so the left panel fits more comfortably.
- Compacted the Order Summary grid while preserving the full 64-bit structure in view.


## Review final alignment pass

Remaining issues corrected:
- The review Bitstream ribbon was still too tall and visually crowding the panel headings.
- The Review Order and Order Summary panels needed a clearer start line below the ribbon.
- The Order Summary grid needed to keep all 64 cells visible in a compact fixed grid.
- Review Order rows were tightened slightly so the scroll area fits better.


## Top section clean fix

This pass intentionally starts from the pre-break version and only corrects the review-state top section:
- restores a visible top-right Back to Menu button
- makes the open Bitstream a shallow full-width band again
- centers the byte groups with more concept-like spacing
- styles completed bytes cyan and the current/incomplete byte amber dashed
- adds subtler DNA-like end flourishes
- lowers the review content so the header strip reads cleanly


## Dedicated Review Conveyor Bitstream

Approach:
- Leave the existing menu-state Bitstream alone.
- Route only `state.reviewOpen` to a dedicated review-only conveyor renderer.
- Render review nibbles as compact capsules in a duplicated conveyor strip.
- Measure the first strip and animate exactly one strip-width for seamless looping.
- Keep the review conveyor clipped inside a shallow full-width ribbon.
- Reduce visual noise with lighter borders, subtler DNA end flourishes, and clone labels hidden.


## Review conveyor actual-motion fix

The previous build relied on CSS animation, which could be neutralized by inherited review-open transform/animation rules. This build drives the Review Order / Pay Bitstream conveyor with `requestAnimationFrame`, updating `transform: translate3d(...)` every frame while `state.reviewOpen` is true.

Menu-state Bitstream remains unchanged.


## Review conveyor motion hard fix

The prior motion loop was blocked by an older `.review-open .bitstream-track { transform:none!important; }` rule. This pass writes the conveyor transform as an inline `!important` style every frame, so the Review Order / Pay conveyor visibly moves.

Menu-state Bitstream remains unchanged.


## Review conveyor nibble-count correction

- Removed the artificial minimum of 8 nybble containers.
- Review conveyor now renders only the exact number of nybble containers required by the cart.
  - 1–4 bits = 1 nybble
  - 5–8 bits = 2 nybbles
  - 16 bits = 4 nybbles
- Conveyor still duplicates that exact sequence for looping, but the loop gap is now very small so it wraps sooner.
- NYBBLE labels are now right-aligned inside each capsule.


## Review conveyor label visibility fix

- Removed the wraparound/clone label hiding behavior.
- NYBBLE labels are now visible on both the primary conveyor copy and the duplicated looping copy.
- Labels remain right-aligned inside each nybble capsule.


## Review conveyor size / alignment fix

- Review/pay Bitstream ribbon is slightly wider and aligned to the Review Order / Order Summary panel edges.
- Ribbon height was reduced so it clears the panels cleanly.
- Conveyor cells were slightly reduced to maintain the same visual density inside the shorter ribbon.


## Review conveyor full-width alignment fix

- Review/pay Bitstream ribbon now fills the full available review width.
- Its outer border aligns with the Review Order / Order Summary panel edges.
- Inner conveyor viewport retains a small inset so moving content does not collide with rounded corners.


## Review panel containment fix

- Restored Review Order / Order Summary panels to the intended 34px left/right inset.
- Pushed panels down below the Bitstream so they no longer overlap it.
- Kept the Bitstream aligned to the same inset as the panels.


## Review body scale / density pass

- Order Summary now uses more of its available vertical space.
- Summary grid, totals, total price, and buttons are scaled up.
- Review Order row text and thumbnails are slightly larger for readability.
- Panel containment and Bitstream clearance from the prior pass are preserved.


## Order Summary 64-bit grid readability fix

- Corrected only the 64-bit Order Summary matrix.
- Removed the oversized transform that caused cropping.
- Restored a readable 4-row x 16-bit grid.
- Preserved Nybble grouping, dash separators, and larger Byte spacing.
- Left the rest of the Order Summary scaling intact.


## Final 64-bit grid visibility fix
- Reduced the 64-bit grid cell size and spacing slightly so all 64 positions remain fully visible inside the Order Summary panel.
- Preserved the intended organization: 4 rows x 16 bits, grouped as nybbles and bytes.


## Menu bitstream conveyor motion fix
- Restored smooth continuous movement for the Payload and Kicker menu bitstreams.
- Implemented JS-driven conveyor motion for menu screens so the movement is reliable.
- Review / Pay conveyor remains unchanged.


## Always-moving menu conveyor update
- Payload and Kicker menu bitstreams now animate continuously whenever there is at least 1 bit in the stream.
- Conveyor wraparound now works even for a single bit by duplicating the rendered bitstream and looping across a small gap.


## Menu conveyor gap + review back button
- Menu-state Payload/Kicker conveyor now includes a full one-byte (8-bit) blank gap between loop copies before wrapping.
- Loop distance is measured with that gap included so the conveyor still scrolls seamlessly.
- Added a dedicated top-right "Back to Menu" button in the Review Order / Pay view.


## Kinetic UI pass

- Added touchscreen press/ripple feedback to buttons, tabs, item cards, review rows, and action buttons.
- Added menu-switch transition energy when moving between Payload/Kicker/Age modes.
- Added item-add pulse on cards and Bitstream signal reaction.
- Added Review Order row arrival animations.
- Added Order Summary update pulse when totals/grid refresh.
- Added Complete Order send pulse and toast pop.
- Preserved the uploaded base code and the user's adjusted review-top-back positioning.


## Kinetic layout safety pass

- Kept the new motion/press feedback.
- Removed layout side effects from the global press target styling.
- Limited ripple clipping to actual buttons instead of cards/rows/panels.
- Stabilized Review Order / Order Summary containers so transitions do not create overflow or misalignment.
- Changed the Order Summary update pulse so it glows instead of scaling/cropping the 64-bit grid.


## Plus button placement fix

- Pinned every item card plus button to the top-left of its own card.
- Prevented kinetic press transforms from moving plus icons out of alignment.
- Added breathing room between Kicker letter codes and the plus button.
- Kept Payload plus buttons cyan and Kicker plus buttons amber.


## Plus placement refinement

- Moved all add buttons back to the right side of each card.
- Anchored them to the bottom-right to avoid covering the item code.
- Restored the default code position for kicker cards.


## Plus right-side animation fix

- Kept the plus buttons on the right side of each card.
- Removed the earlier transform override that was suppressing plus animations.
- Restored add snap/rotate animation, press response, release pop, and glow styling.


## Plus rotation restoration
- Restored the original + icon quarter-turn animation by triggering a dedicated `.plus-spin` class directly in JavaScript whenever an item is added.
- This avoids conflicts with the press/release classes that were overriding the animation state.


## Plus icon spin hard fix

- The plus character is now wrapped as `<span class="plus-icon">+</span>`.
- The rotation animates the inner icon instead of the button shell.
- Added a delegated pointerup trigger so the icon rotates immediately on any plus press.
- This preserves right-side button placement while restoring the visible 90-degree snap.
