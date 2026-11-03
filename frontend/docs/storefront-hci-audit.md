# Storefront HCI audit — November 3, 2026

## Checkout authentication follow-up

Following the user's guest-checkout report, all three checkout routes now use the shared account guard. Guests can still browse and add to the cart, but continuing from the cart or opening address/shipping/payment directly redirects to login. The intended checkout URL is retained for return after sign-in, including after an explicit sign-out. Existing order-history sign-out behavior is preserved.

Fresh local browser verification: a guest added one PS5 Digital to the cart; continuing redirected to login; customer sign-in returned to `/checkout/address` with the same one-item cart. After signing out, all three direct checkout URLs redirected to login. No order was submitted. Evidence: `.taste-skill/checkout-auth/` at the project root. Frontend lint/build and 59 tests passed, including guest/pending/error/authenticated guard coverage. The API's existing authentication requirement and payment submission guard remain in place; the observed gap was public access to checkout pages, not a demonstrated unauthenticated API purchase.

## Verdict and scope

**Partial pass: the tested shopping tasks passed, with two minor HCI refinements remaining.** This is a targeted local review, not full HCI or WCAG certification. Actual screen-reader output, comprehensive keyboard-only checkout and participant testing remain unverified. Deployment was not performed and is excluded from this student project's local acceptance criteria.

Reviewed the homepage, catalog, PS5 Disc and Digital details, wishlist, cart, address validation, mobile navigation and missing-product recovery. Used [Nielsen's ten usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [WAI button guidance](https://www.w3.org/WAI/ARIA/apg/patterns/button/) and [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Findings below distinguish observed behavior from heuristic recommendations.

## Requested image update

The user selected **homepage promotions only**. Reused the existing original photos without modifying their bytes:

| Homepage placement | Photo |
| --- | --- |
| Main PlayStation promotion | `ps5-disc-console.jpg` |
| Editorial console promotion | `ps5-digital-console.jpg` |
| Closing decorative promotion | `ps5-disc-box.jpg` |

Updated descriptive alternative text for the informative photos; retained empty alternative text for the decorative closing image. The mobile main promotion uses `object-fit: contain` to keep the console and controller visible. Product galleries, catalog records, prices, stock, authentication and navigation behavior were preserved.

## Remaining findings

| Priority | Finding and evidence | Recommended refinement |
| --- | --- | --- |
| P2 — minor clarity | Homepage `Previous category` / `Next category` arrows resemble carousel controls beside three already-visible categories. Activating Next navigated to the Phones catalog instead of moving content in place. The destination works, but its purpose is less predictable. Source: `src/pages/landing.tsx`, category header. | Name the destination explicitly, or remove the arrows when all categories are displayed. |
| P3 — toggle consistency | Wishlist buttons both change their label and expose `aria-pressed`: Save/Unsave on cards and Add to wishlist/Saved to wishlist on detail pages. State changes and persistence within the tested browsing flow worked. This is a pattern refinement, not a demonstrated WCAG failure. | Keep a stable toggle label with pressed state, or use changing action labels without toggle semantics, following WAI's button guidance. |

These recommendations were recorded without expanding the approved homepage-photo change into a redesign.

## HCI principle coverage

| Principle | Fresh evidence and limits |
| --- | --- |
| Visibility of system status | Wishlist count, selected gallery image/zoom state, cart count, quantities and totals updated during interaction. Loading/error variants were not exhaustively exercised. |
| Match with the real world | Product names, pesos, cart quantities and address labels supported the tested tasks. Category-arrow wording remains a clarity concern. |
| User control and freedom | Wishlist toggled back, zoom reversed, quantities decreased, cart item removed, address entry cancelled and mobile menu dismissed with Escape. |
| Consistency and standards | Shared navigation and product actions worked; wishlist label/pressed-state pattern can be refined. |
| Error prevention | Empty address continuation was disabled. Saving an empty address exposed three invalid fields and focused the name field. No address was saved. |
| Recognition rather than recall | Categories, product imagery, gallery controls, filters and visible cart summary supported browsing. No participant study measured discoverability. |
| Flexibility and efficiency | Search submission, gallery/zoom, wishlist, cart and address controls received targeted Enter/Space testing. This does not establish complete keyboard-only checkout. |
| Aesthetic and minimalist design | Existing identity retained. All nine changed-promotion captures were visually reviewed at three widths. Automated visual-style findings remain recorded below. |
| Error recognition and recovery | No-results search, clearing filters, missing-product recovery and empty-address validation worked. Network/server failures were not newly induced. |
| Help and documentation | Visible labels and recovery links supported tested tasks; help comprehension and support discovery were not tested with participants. |

## Local browser evidence

Evidence folder: `.taste-skill/storefront-hci-2026-11-03/` at the project root.

- `interactions.json`: homepage console navigation; no-results search and clearing; category clearing; ascending price sort; save/unsave and saved-products view; PS5 packaging selection and reversible zoom; cart add/increase/decrease/remove; empty address validation and cancel focus restoration; mobile menu Escape/focus return; missing-product recovery.
- `measurements.json`: 15 loaded measurements covering `/`, `/products`, `/products/ps5-disc`, `/products/ps5-digital` and empty `/cart`, each at 1440, 768 and 390px. Actual viewport widths matched requests; horizontal page overflow was zero throughout.
- `ps5-captures.json` and nine `ps5-{top,editorial,closing}-{1440,768,390}.png` images: all replacement photos loaded; all nine captures were opened and visually reviewed. No horizontal overflow was found.
- Reduced-motion emulation disabled the observed hero animation and transition; emulation was reset afterward.
- `contrast.json`: 630 repeated enabled-control color calculations. Eighteen low-ratio samples were image-only links, not rendered text, and were classified separately. No confirmed default-state text failures remained in this sample; the lowest remaining sampled ratio was 5.644:1. This is not an exhaustive rendered contrast assessment of body text, icons, borders or interaction states.

The browser ended on the homepage with an empty cart and no saved products. No address, customer order or business record was created. Authenticated order submission was not repeated in this review; earlier checkout evidence remains in the dated general audit.

## Automated checks and visual-gate limits

- Frontend ESLint and TypeScript/Vite build passed.
- All **58 frontend tests passed**. The new homepage-photo regression test first failed against the old mapping, then passed after the scoped replacement.
- Public-page source lint: two existing warnings, marketing phrase “all in one” and a 1px outlined box. No source-lint failures.
- Impeccable detector: 37 style advisories (7 colors, 26 font sizes, 3 radii, 1 font-family advisory). These are scanner recommendations, not 37 established usability failures; existing storefront styling was preserved.
- Taste public-page inspector: **2 FAIL and 5 WARN findings remain**, so a full Taste visual pass is not claimed. Its icon-card detector flags functional category/product cards with wishlist icons. Its desktop off-centre detector measures asymmetric content extents; a follow-up geometry check found the principal 1120px container centered, with approximately 152px margins on each side. These observations do not establish a broken shopping task, but the raw gate failures are retained. Other warnings concern font-size count, grey body text (reported 5.7:1), absent video, local development serving and tablet asymmetry. Video is not an HCI requirement, and 5.7:1 exceeds the ordinary-text AA contrast threshold.

Inspector workflow exception: the root's saved direction is an earlier dashboard/app direction and caused automatic app-mode classification. The public-page run therefore executed from `frontend/`, with outputs explicitly directed back to the root evidence folder; no saved direction, guards or allow-list flags were changed. Command:

```powershell
node ../.agents/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:5173/ --out ../.taste-skill/storefront-hci-2026-11-03/page-inspector --widths 1440,768,390 --json
```

The existing direction and component-sized image replacement used Taste's scoped-task exception to a new direction draw. Local screenshots and interaction checks are the acceptance evidence here; no production-origin or deployment claim is made.

## Changed files and outstanding coverage

This task changed `src/pages/landing.tsx`, `src/styles/landing.css`, `src/assets/storefront/ASSETS.md`, `tests/landing.test.mjs`, this report and the general audit's report index. Pre-existing workspace changes were preserved.

Remaining coverage: actual screen-reader use, full keyboard-only authenticated checkout, high-contrast mode, exhaustive error/hover states, runtime performance profiling and participant testing. The two minor recommendations and unresolved visual gates prevent an unconditional full-pass statement.
