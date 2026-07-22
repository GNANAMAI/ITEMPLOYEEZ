# IT Employeez (itemployeez.com) — Complete Site Report

**Run by:** Santosh Software Systems
**Location:** Vizag (Visakhapatnam), India
**Phone:** +91-8712956595 / +91-8712956594 (WhatsApp: wa.me/918712956594)
**Email:** santu.edi@gmail.com
**Purpose:** A community + services platform for IT professionals (developers, sysadmins, cybersecurity experts, etc.) offering networking, resources, career support, and a members-only community area.

---

## 1. Site Navigation (Global)

Present on every page, top and bottom:

- **Logo** → links to Home
- **Top nav:** IT Products | IT Communities | Our Services
- **Top-right:** "Login / Join IT Employeez" button, plus separate **Login** and **Register** buttons
- **Floating buttons:** Phone Call (tel:8712956594), WhatsApp Now (wa.me/918712956594)
- **Footer:**
  - Mission statement: "we envision a future where technology bridges gaps and drives progress..."
  - **Quick Links:** Home, About Us, IT Products, IT Communities, Our Services, Contact Us, Login as Sub-Admin
  - **Our Policy links:** Privacy & Policy, Terms & Conditions, Cancellation & Refund Policy
  - Copyright: "©2025 IT Employeez. All Rights Reserved."

---

## 2. Home (`/`)

- Hero banner with CTA: **"Become Part Of Our Vibrant IT Community!"** → links to `/signup`
- Scrollable row of 9 product tiles (image links) — IDs 50, 49, 46, 44, 42, 37, 36, 35, 34 → each opens `/product/{id}`
- 2 featured "product-details" tiles: **SAP ECC** and **macOS**
- **"Why Join IT Employeez"** section with two value-proposition cards:
  1. **Access to Exclusive Resources** — industry-leading tools, tutorials, best practices
  2. **Career Advancement** — job boards, skill-building workshops, support for career goals

---

## 3. About Us (`/about`)

Static informational page. Key content:

> The IT Employeez Community is a vibrant network designed for IT professionals to connect, collaborate, and grow. Whether you're a developer, sysadmin, cybersecurity expert, or tech enthusiast, this community provides a platform for knowledge sharing, career advice, and industry trends. Members can engage in discussions, attend webinars, and access exclusive resources.

Copyright footer: **© 2025 Santosh Software Systems.** All rights to services, content, and software reserved.

No interactive functionality beyond standard nav/footer.

---

## 4. IT Products (`/it-apps`)

A catalog/grid of **18 product category tiles**, image-linked, IDs `/product/34` through `/product/51`:

| Product ID | Notes |
|---|---|
| 34 | Confirmed category: **"Programing Languages"** |
| 35–51 | Category names not confirmed (pages require direct browsing; not indexed for remote search retrieval) |

Functionality: click a tile → opens a category detail page (breadcrumb-based navigation: Home > IT Products > [Category]).

Two separate **`/product-details/{name}`** pages exist for featured items (**SAP ECC**, **macOS**) — a different content type from the numbered `/product/{id}` category pages.

---

## 5. IT Communities (`/community-subscribe`)

**Gated / members-only feature.**

- Displays a banner image
- Message: **"Please Login/Signup to access IT Communities"**
- No content is visible without an account — this is the site's members-only community/forum section.

---

## 6. Our Services (`/services`)

Lists 2 services, matching the homepage value cards, each with its own detail page:

1. **Access to Exclusive Resources** → `/service-details/access-to-exclusive-resources`
2. **Career Advancement** → `/service-details/Career-Advancement`

(Detail page content wasn't retrievable this session — likely expands on the short homepage blurbs.)

---

## 7. Contact Us (`/contact`)

- **Phone:** +91-8712956595
- **Email:** santu.edi@gmail.com
- **Address:** Vizag
- Contact form with a **"Send Message"** submit button
- 4 additional links currently placeholder-labeled **"Test"** (site appears to be mid-development here)

---

## 8. Account & Access Functions

| Page | Path | Purpose |
|---|---|---|
| Login | `/login` | Member sign-in |
| Register/Signup | `/signup` | New member registration ("Join IT Employeez") |
| Sub-Admin Login | `/sub-admin/login` | Separate administrative portal |

These are transactional/form pages (not content-heavy) and were not independently fetchable this session, as they are not search-indexed and the page-fetch tool restricts retrieval to previously discovered URLs.

---

## 9. Legal / Policy Pages

All four share a common tab bar: *1. Terms & Conditions | 2. Privacy Policy | 3. Cancel Policy | 4. Disclaimer*

### 9.1 Terms & Conditions (`/terms-conditions`)
- Definitions of "IT Emp," "User," "Services"
- Use of Services: accurate info required, users responsible for account security
- Intellectual Property: all site content owned by IT Employeez, no reproduction without permission
- Privacy: references the Privacy Policy
- Limitation of Liability: no liability for damages from service use/inability to use
- Termination: IT Employeez may terminate/suspend accounts at any time, without notice
- Governing Law: subject to applicable jurisdiction's courts
- Changes to Terms: may be updated any time; continued use = acceptance
- Contact: info@itemployeez.com

### 9.2 Privacy Policy (`/privacy-policy`)
- **Information collected:** personal info (name, email, phone), professional info (job title, company, industry), usage data (IP, browser, OS)
- **Use of information:** provide/improve services, communication, personalization, inquiries, legal compliance
- **Sharing:** not shared with third parties except trusted partners under confidentiality
- **Data Security:** reasonable protection measures, no absolute guarantee
- **User Rights:** access, correct, delete personal data; request data copy; withdraw consent
- **Policy changes:** periodic review encouraged
- Contact: info@itemployeez.com

### 9.3 Cancellation & Refund Policy (`/cancel-policies`)
- **Cancellation request:** written request via email or account dashboard, with account details + reason
- **Notice period:** 30 days required for all cancellations
- **Refunds:** full refund only if cancelled within first 15 days of subscription; no refunds after that
- **Refund processing time:** within 30 business days
- **Service termination:** access ends at end of notice period
- **Outstanding payments:** must be settled before cancellation is processed
- **Data retention:** data kept 30 days post-termination, then permanently deleted
- **Policy changes:** may be updated; continued use = acceptance
- Contact: info@itemployeez.com

### 9.4 Disclaimer (`/disclaimer`)
- Referenced in the legal tab bar on all policy pages, but the page content was **not retrievable this session** (fetch tool restriction — see Known Gaps below).

---

## 10. Known Gaps / Not Retrievable This Session

The following pages exist (confirmed via links on other pages) but could not be fetched directly in this session, because the fetch tool only allows retrieving URLs already surfaced by a prior search or fetch call, and these particular pages are either gated, transactional, or not search-indexed:

- `/disclaimer` (full text)
- `/service-details/access-to-exclusive-resources`
- `/service-details/Career-Advancement`
- `/login`, `/signup`, `/sub-admin/login` (form pages)
- `/product/35` through `/product/51` (individual category names, aside from confirmed `/product/34` = Programing Languages)
- `/product-details/SAP ECC`, `/product-details/macOS` (featured product detail content)

If you'd like, I can attempt these again in a fresh session/turn, or you can share the URLs/screenshots directly and I'll incorporate the content into an updated version of this document.

---

*Compiled from a full crawl of itemployeez.com on July 21, 2026.*
