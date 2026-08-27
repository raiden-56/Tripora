# Travel Diaries User Guide

**Your complete guide to mapping, planning and preserving your journey.**

Travel Diaries is a personal travel platform that helps you keep track of the places you've visited, plan future destinations, organize memories and understand your travel journey through an interactive map.

This guide explains, in plain language, how to use every part of the application as it exists today.

> **Note on screenshots:** This guide references screenshots stored in [`docs/screenshots/`](screenshots/). See [`docs/screenshots/README.md`](screenshots/README.md) for the exact list of images to capture from your own running copy of the app and add to that folder.

---

## Table of Contents

1. [Welcome to Travel Diaries](#1-welcome-to-travel-diaries)
2. [Getting Started](#2-getting-started)
3. [Login](#3-login)
4. [Create an Account](#4-create-an-account)
5. [Onboarding (First-Time Setup)](#5-onboarding-first-time-setup)
6. [Dashboard](#6-dashboard)
7. [Navigation / Sidebar](#7-navigation--sidebar)
8. [Travel Map](#8-travel-map)
9. [Destinations](#9-destinations)
10. [How to Add a Destination](#10-how-to-add-a-destination)
11. [Edit a Destination](#11-edit-a-destination)
12. [Delete a Destination](#12-delete-a-destination)
13. [Destination Details](#13-destination-details)
14. [Memories](#14-memories)
15. [How to Add a Memory](#15-how-to-add-a-memory)
16. [Photo Viewer](#16-photo-viewer)
17. [Google Drive](#17-google-drive)
18. [My Journeys](#18-my-journeys)
19. [Upcoming Trips](#19-upcoming-trips)
20. [Create a Trip](#20-create-a-trip)
21. [Trip Details](#21-trip-details)
22. [Wishlist](#22-wishlist)
23. [Discover](#23-discover)
24. [Canvas AI](#24-canvas-ai)
25. [Travel Statistics](#25-travel-statistics)
26. [India Explorer](#26-india-explorer)
27. [Profile](#27-profile)
28. [My 2026 (Yearly Recap)](#28-my-2026-yearly-recap)
29. [Upgrade to Pro](#29-upgrade-to-pro)
30. [Settings](#30-settings)
31. [Notifications](#31-notifications)
32. [Search](#32-search)
33. [Filters](#33-filters)
34. [Using Travel Diaries on Mobile](#34-using-travel-diaries-on-mobile)
35. [Common Tasks](#35-common-tasks)
36. [I Just Created My Account — What Should I Do?](#36-i-just-created-my-account--what-should-i-do)
37. [Best Practices](#37-best-practices)
38. [FAQ](#38-faq)
39. [Troubleshooting](#39-troubleshooting)
40. [Understanding the Interface](#40-understanding-the-interface)
41. [Status Guide](#41-status-guide)
42. [Privacy & Data](#42-privacy--data)
43. [Logout](#43-logout)
44. [Quick Reference](#44-quick-reference)
45. [Document Information](#45-document-information)

---

## 1. Welcome to Travel Diaries

With Travel Diaries you can:

- Track the places you've already visited
- Add upcoming destinations you're planning to go to
- Maintain a travel wishlist
- View your entire journey on an interactive map
- Save travel memories (photos, notes, dates, tags) tied to a destination
- Link a Google Drive folder to a destination for your files
- Plan and manage trips, with checklists and a budget
- View travel statistics (countries, states, memories, travel days, and more)
- Discover new destinations based on your own travel history
- Chat with Canvas AI for destination ideas and a sample day-by-day itinerary
- See your yearly travel recap and a personal "travel profile"

### Who is this guide for?

This guide is for anyone using Travel Diaries — whether you're setting up your account for the first time or just want to understand a specific feature.

---

## 2. Getting Started

The first-time experience looks like this:

1. Open Travel Diaries.
2. Choose **Start Your Journey** to create an account and log in, or select **Explore Demo** to try the app instantly with sample data.
3. If you created a new account, complete the short onboarding.
4. Land on your **Dashboard**.
5. Add your first destination from the map.
6. Add a memory to a destination.
7. Plan an upcoming trip.

**Figure 1 — Login screen**
![Travel Diaries Login](screenshots/01-login.png)

---

## 3. Login

The Login screen is titled **"Welcome back"** with the subtitle _"Continue your journey with Travel Diaries."_

**Figure 2 — Login form**
![Travel Diaries Login](screenshots/01-login.png)

Fields and actions on this screen:

| Field / Action                             | Description                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Email                                      | Your account email address                                                                |
| Password                                   | Your account password (has a show/hide eye icon)                                          |
| Remember me                                | A checkbox, checked by default                                                            |
| Forgot password?                           | Link that opens the [Forgot Password](#forgot-password) screen                            |
| Login                                      | Signs you in and takes you to the Dashboard                                               |
| Continue with Google / Continue with Apple | Present on screen, but currently show a message that social sign-in is a demo placeholder |
| Create account                             | Link to the [Signup](#4-create-an-account) screen                                         |

The screen also shows a clearly labeled **"Demo credentials — temporary"** box with a working demo login and a **Use Demo Account** button that automatically fills the email and password for you.

### How to log in

1. Enter your email.
2. Enter your password (or click **Use Demo Account** to fill in the demo login automatically).
3. Click **Login**.
4. On success, you'll see a "Welcome back to Travel Diaries" confirmation and be taken to the Dashboard.
5. If the email or password is incorrect, you'll see an **"Invalid email or password."** message and stay on the Login screen.

### Forgot Password

Selecting **Forgot password?** opens a screen titled **"Forgot your password?"** with a single Email field and a **Send Reset Link** button. Submitting it shows the message _"If this email exists, a password reset link has been sent."_ and a **Back to Login** link. This is a demo flow — no email is actually sent.

---

## 4. Create an Account

The Signup screen is titled **"Create your journey."**

Fields:

| Field            | Notes                   |
| ---------------- | ----------------------- |
| First name       | Required                |
| Last name        | Required                |
| Email            | Required                |
| Password         | Required                |
| Confirm password | Must match the password |

If the password is shorter than 6 characters, or the two password fields don't match, you'll see an on-screen error and the form won't submit.

**Continue with Google** and **Continue with Apple** buttons are shown but currently only display a demo message — they don't perform real sign-in.

After a successful signup, you'll see a confirmation message and be taken straight into the [onboarding](#5-onboarding-first-time-setup) flow, not directly to the Dashboard.

---

## 5. Onboarding (First-Time Setup)

New accounts (created through Signup) go through a short 5-step setup before reaching the Dashboard. A progress bar at the top shows "Step X of 5."

| Step | Title                          | What you do                                                                                                                                                                                               |
| ---- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Let's build your travel map    | Select the countries/states you've already been to, from a list of chips                                                                                                                                  |
| 2    | What type of traveler are you? | Select any number of travel interests (Adventure, Mountains, Beaches, Nature, Culture, Food, Road Trips, Photography, Backpacking, Luxury, Spiritual, Wildlife, Weekend Trips, Solo Travel, Group Travel) |
| 3    | Where do you want to go next?  | Tap suggested destination cards to mark them as interesting, then continue                                                                                                                                |
| 4    | Bring your memories with you   | Choose **Connect Google Drive**, **Upload Photos**, **Import Memories**, or **Skip for now** (all four simply continue to the next step in this version)                                                  |
| 5    | Your journey is ready          | A summary screen with sample numbers, ending in an **Enter My Journey** button that takes you to the Dashboard                                                                                            |

> Logging in with the demo account skips onboarding entirely, since the demo profile is already fully set up.

---

## 6. Dashboard

The Dashboard is titled **"Your Journey"** with the subtitle _"Every place you've been. Every place you're going."_

**Figure 3 — Dashboard**
![Travel Diaries Dashboard](screenshots/02-dashboard.png)

| Dashboard item                                       | What it means                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| Countries                                            | Number of distinct countries among your **visited** destinations          |
| States                                               | Number of distinct states among your **visited** destinations             |
| Destinations                                         | Total number of destinations you've added (any status)                    |
| Memories                                             | Total number of memories saved                                            |
| "My entire travel life, in one beautiful map" banner | Shortcuts to **Open Explore Map** and **Add Destination**                 |
| Recent Journeys                                      | Your most recently visited destinations, as cards                         |
| Upcoming Trips                                       | Your next planned trips, as cards                                         |
| What's Next?                                         | Destination suggestions based on states/countries you've already explored |

Clicking a destination card anywhere in the app opens the [Destination Details](#13-destination-details) panel. Clicking **View all** next to a section takes you to the full Destinations or Trips page.

---

## 7. Navigation / Sidebar

On desktop, a sidebar on the left is always visible. On mobile, a bottom navigation bar is shown instead (see [Using Travel Diaries on Mobile](#34-using-travel-diaries-on-mobile)).

**Figure 4 — Sidebar navigation**
![Travel Diaries Navigation](screenshots/03-navigation.png)

The sidebar contains, in order:

## Dashboard

**Purpose:** Your travel overview.
**What you can do:** See your key stats, recent visited places, upcoming trips, and destination suggestions.
**How to use it:** Click **Dashboard**, then select any card to see more detail.

## Explore Map

**Purpose:** See and manage every destination on an interactive map.
**What you can do:** Zoom/pan the map, switch between World and India views, filter by status, add a destination, and open destination details.
**How to use it:** Click **Explore Map**, then interact with the map directly. See [Travel Map](#8-travel-map).

## Discover

**Purpose:** Browse curated groups of destinations based on your journey.
**What you can do:** Scroll horizontal rows such as Trending, Hidden Gems, Weekend Trips, Road Trips, Near You, and "Because you loved…" suggestions.
**How to use it:** Click **Discover**, then click any destination card to open its details.

## My Journeys

**Purpose:** A chronological timeline of everywhere you've visited, plus your achievements.
**What you can do:** Scroll through your travel timeline grouped by year, and view achievement progress.
**How to use it:** Click **My Journeys** to review your history.

## Destinations

**Purpose:** A searchable, filterable list of every destination you've added.
**What you can do:** Search by name/state/country/city, filter by status, add a new destination.
**How to use it:** Click **Destinations**, use the search box or filters, then click a card to open it.

## Memories

**Purpose:** Your photo and memory archive.
**What you can do:** Search memories, filter by India/International, add a memory, and open the full-screen photo viewer.
**How to use it:** Click **Memories**, use search/filters, then click a memory tile.

## Upcoming Trips

**Purpose:** Manage planned trips and your wishlist.
**What you can do:** See your next trip with a countdown, add/edit/delete trips, and move wishlist destinations into planned trips.
**How to use it:** Click **Upcoming Trips**, then use **Add Trip** or open a trip card.

## Canvas AI

**Purpose:** A travel assistant that answers questions about your journey and can generate a sample trip.
**What you can do:** Chat with Canvas AI, or use the "Create Trip with AI" planner tab.
**How to use it:** Click **Canvas AI**, choose a tab, and type a question or fill in the trip planner fields.

## Travel Statistics

**Purpose:** Understand your travel history through numbers and charts.
**What you can do:** View countries, states, destinations, trips completed, memories, and travel days, plus charts for activity by year, countries explored, and most-visited locations.
**How to use it:** Click **Travel Statistics** to review your data.

## Profile

**Purpose:** Manage your personal profile.
**What you can do:** Edit your bio, view your stats and "travel profile" score, see favorite destinations and achievements, and open your public journey page.
**How to use it:** Click **Profile**, then **Edit Profile** to make changes.

## Settings

**Purpose:** Manage your account preferences.
**What you can do:** Switch appearance, toggle notifications, change journey privacy, manage Google Drive connection, export or delete data, and log out.
**How to use it:** Click **Settings** and use any of the listed controls.

---

## 8. Travel Map

**Figure 5 — Travel Map**
![Travel Map](screenshots/04-map.png)

The map represents every destination you've added, plotted at its real-world coordinates.

### Marker colors

| Color          | Meaning                                                         |
| -------------- | --------------------------------------------------------------- |
| Green          | Visited                                                         |
| Blue           | Planned                                                         |
| Amber / Yellow | Wishlist                                                        |
| Pink           | A destination marked as a favorite (overrides the status color) |

### What you can do on the map

- **Zoom** with your scroll wheel or the pinch gesture on touch devices.
- **Pan** by dragging the map.
- **Hover** over a marker to see a preview card with the destination's name, state/country, status, date, and number of memories.
- **Click** a marker to open its full [Destination Details](#13-destination-details) panel.
- **Switch view** between **World** and **India** using the toggle in the top-left. Selecting India also opens the India Explorer panel — see [India Explorer](#26-india-explorer).
- **Filter** destinations using the filter bar (All, Visited, Planned, Wishlist, Favorites) — see [Filters](#33-filters).
- **Add a destination** using the **Add Destination** button in the top-right of the map.

---

## 9. Destinations

**Figure 6 — Destinations list**
![Destinations](screenshots/05-destinations.png)

The Destinations page shows every destination you've added as a grid of cards, sorted alphabetically.

- Use the **Search destinations…** box to search by name, state, country, or city.
- Use the filter bar to narrow the list by status or favorites.
- Use **Add Destination** to open the [Add Destination](#10-how-to-add-a-destination) form.
- Click any card to open its [Destination Details](#13-destination-details) panel.
- If no destinations match, you'll see an empty state with an **Add First Destination** button.

---

## 10. How to Add a Destination

Click **Add Destination** from the Explore Map or Destinations page to open the **"Add Destination"** form.

**Figure 7 — Add Destination form**
![Add Destination](screenshots/06-add-destination.png)

### Fields

| Field                         | Description                                                                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search Location               | Type a place name to search real-world locations; selecting a result automatically fills in the name, country, state, city, latitude, and longitude |
| Destination Name _(required)_ | The name of the place                                                                                                                               |
| Country _(required)_          | The country                                                                                                                                         |
| State                         | The state or region, if applicable                                                                                                                  |
| City                          | The city or town                                                                                                                                    |
| Latitude _(required)_         | Filled automatically from search, or entered manually                                                                                               |
| Longitude _(required)_        | Filled automatically from search, or entered manually                                                                                               |
| Status                        | **Visited**, **Planned**, or **Wishlist**                                                                                                           |
| Visit Date / End Date         | The date range of your visit or planned trip                                                                                                        |
| Rating                        | A number from 0–5                                                                                                                                   |
| Notes                         | Free-text notes about the destination                                                                                                               |
| Google Maps Link              | A URL to open the place in Google Maps                                                                                                              |
| Google Drive Folder Link      | A URL to your Drive folder for this destination (see [Google Drive](#17-google-drive))                                                              |

### Steps

1. Click **Add Destination**.
2. Optionally use **Search Location** to find and auto-fill the place.
3. Fill in the remaining fields (Name, Country, Latitude, and Longitude are required).
4. Choose a Status.
5. Click **Add to Journey** to save, or **Cancel** to discard.
6. The new destination appears on the map and in your Destinations list immediately.

---

## 11. Edit a Destination

1. Open a destination (from the map, Destinations list, or Dashboard) to open its [Destination Details](#13-destination-details) panel.
2. Click **Edit**.
3. The same form used for adding a destination opens, pre-filled with the current information, titled **"Edit Destination"**.
4. Make your changes.
5. Click **Save Changes**.

---

## 12. Delete a Destination

1. Open the destination's details panel.
2. Click **Delete**.
3. The destination is removed immediately and you'll see a **"Destination deleted"** confirmation message.

There is no confirmation dialog before deleting a destination — the action happens as soon as you click **Delete**. Deleting a destination does not delete its associated memories; they remain in your Memories archive but will no longer be grouped under that destination's page.

---

## 13. Destination Details

Clicking any destination anywhere in the app opens a details panel (a side drawer on desktop, a full-width sheet on mobile).

**Figure 8 — Destination Details**
![Destination Details](screenshots/07-destination-details.png)

At the top you'll see a hero photo, the destination's name, city/state/country, status badge, visit dates, and rating (if set). Below that are quick stats (Memories, Places, Drive Folder) and action buttons:

### Open in Google Maps

Opens the destination's saved Google Maps link in a new tab (only shown if a link was provided).

### Open Drive

Opens the destination's linked Google Drive folder in a new tab (only shown if one was linked).

### Edit

Opens the Edit Destination form.

### Delete

Deletes the destination immediately.

Below the action buttons are five tabs:

| Tab      | What it shows                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------- |
| Overview | The destination's description                                                                       |
| Places   | Specific spots within the destination (e.g., a viewpoint or waterfall)                              |
| Memories | A small photo grid of memories saved for this destination, with an **Add Memory** option when empty |
| Notes    | Free-text notes you saved for this destination                                                      |
| Files    | The linked Google Drive folder card, or a prompt to connect one via Edit                            |

---

## 14. Memories

**Figure 9 — Memories**
![Memories](screenshots/08-memories.png)

The Memories page shows all your saved memories as a photo grid ("masonry" layout), most recent first.

- Use **Search memories…** to search by memory title, tags, or destination name.
- Use the **All / India / International** filter to narrow memories by the destination's country.
- Use **Add Memory** to save a new memory.
- Click any memory to open the full-screen [Photo Viewer](#16-photo-viewer).
- If there are no memories yet, you'll see an empty state with an **Add Memory** button.

---

## 15. How to Add a Memory

1. Click **Add Memory** on the Memories page (or from an empty Memories tab inside a destination).
2. Fill in the form:

| Field       | Description                                           |
| ----------- | ----------------------------------------------------- |
| Title       | A short title for the memory                          |
| Destination | Which destination this memory belongs to              |
| Date        | The date of the memory                                |
| Description | Free-text description                                 |
| Tags        | Comma-separated tags (e.g., `sunset, friends, coorg`) |

3. Click **Save Memory**.
4. The memory appears immediately in your Memories grid and under that destination's Memories tab.

There is currently no option to upload your own photo file — a placeholder image is generated automatically for each new memory.

---

## 16. Photo Viewer

Clicking a memory opens a full-screen viewer showing:

- The memory's title, date, and destination name.
- **Next** and **previous** arrows to move between memories.
- A **zoom** button to enlarge the photo (click the photo again to zoom back out).
- A **delete** button to remove the memory permanently.
- A **close** (X) button to exit the viewer.
- The memory's description and tags below the photo.

There is currently no download option in the photo viewer, and memories cannot be edited after they're created — only deleted.

---

## 17. Google Drive

Travel Diaries lets you attach a Google Drive folder **link** to a destination or trip so your files stay organized by place. This version does **not** connect to your actual Google account or automatically read files from Drive — it simply stores the folder link you paste in, and shows it as a card you can click to open in a new tab.

**Figure 10 — Drive folder card**
![Google Drive folder](screenshots/07-destination-details.png)

### Attach a Google Drive Folder

1. Open a destination and click **Edit** (or fill it in while adding a new destination).
2. Paste your folder link into **Google Drive Folder Link**.
3. Click **Save Changes**.
4. The link now appears in the destination's **Files** tab as a Drive folder card, and an **Open Drive** button appears at the top of its details panel.

The **Settings** page also has a **Connect Google Drive** button under Connected Accounts — this is a demo action that shows a confirmation message; it does not perform a real Google sign-in.

---

## 18. My Journeys

The **My Journeys** page shows a vertical timeline of your visited destinations, grouped by year, with photos and dates. Alongside it is an **Achievements** panel showing travel milestones (e.g., "First Destination," "10 States," "Memory Keeper") with a progress bar for locked achievements and a highlighted style for unlocked ones.

> Achievement progress reflects sample/demo milestone data in this version — it is not yet automatically recalculated from your live destination or memory counts.

---

## 19. Upcoming Trips

**Figure 11 — Upcoming Trips**
![Upcoming Trips](screenshots/09-trips.png)

At the top, your next planned trip is shown as a large banner with its title, date, and a countdown (e.g., "19 days to go" or "Today"). Clicking the banner opens its [Trip Details](#21-trip-details).

Below that:

- **Planned Trips** — cards for every trip with status "Planned," each showing its dates, duration, checklist progress (if any), and a Drive folder link (if any). Each card has a **⋮** menu with **Edit** and **Delete**.
- **Places I Want To Explore** — your wishlist destinations, each with a priority label (High/Medium/Low) and an **Add to Planned** button. See [Wishlist](#22-wishlist).

---

## 20. Create a Trip

1. Click **Add Trip** on the Upcoming Trips page.
2. Fill in the form:

| Field                    | Description                                 |
| ------------------------ | ------------------------------------------- |
| Trip Title               | A name for the trip                         |
| Destination              | Which destination the trip is for           |
| Start Date / End Date    | The trip's dates                            |
| Notes                    | Free-text notes                             |
| Google Drive Folder Link | An optional link to the trip's Drive folder |

3. Click **Add Trip** to save.
4. The trip appears immediately under Planned Trips.

To edit a trip, open its **⋮** menu and choose **Edit** — the same form opens pre-filled, titled **"Edit Trip."** To remove it, choose **Delete** from the same menu.

---

## 21. Trip Details

Clicking a trip's cover image (not its **⋮** menu) opens a details panel with three tabs:

| Tab       | What it shows                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------- |
| Overview  | A weather placeholder, the destinations included, any notes, and a link to the Drive folder               |
| Checklist | A list of preparation items (e.g., "Transport booked," "Hotel booked") you can check off by clicking them |
| Budget    | Category-by-category **Planned** vs **Actual** spending, with totals for Planned, Actual, and Saved/Over  |

Only trips that were created with sample checklist/budget data show items in those tabs; trips you create yourself start without a checklist or budget.

---

## 22. Wishlist

Travel Diaries doesn't have a separate "Wishlist" page — instead, destinations with the status **Wishlist** appear:

- On the map and Destinations list, tagged with an amber "Wishlist" badge.
- On the **Upcoming Trips** page, under **"Places I Want To Explore."**

### How do I add a destination to my wishlist?

When adding or editing a destination, set its **Status** to **Wishlist**.

### How do I move a wishlist destination to Planned?

On the Upcoming Trips page, click **Add to Planned** on the destination's card. Its status changes to **Planned** and you'll see a confirmation message.

### How do I remove a wishlist destination?

Open it and click **Delete**, the same as any other destination.

---

## 23. Discover

**Figure 12 — Discover**
![Discover](screenshots/10-discover.png)

Discover shows your destinations organized into curated horizontal rows:

| Row                             | What it contains                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Trending                        | A rotating selection of your destinations                                                              |
| Hidden Gems                     | Your wishlist destinations                                                                             |
| Weekend Trips                   | Indian destinations you haven't visited yet                                                            |
| Road Trips                      | Destinations in Karnataka, Kerala, Tamil Nadu, and Maharashtra                                         |
| Best This Season                | Your planned destinations                                                                              |
| Near You                        | Destinations near Bangalore                                                                            |
| Popular with Travelers          | All destinations, most recently added first                                                            |
| Because you loved [Destination] | Destinations similar to your favorites (same state or country), shown for each favorite you've visited |

Click any card to open its Destination Details.

---

## 24. Canvas AI

**Figure 13 — Canvas AI**
![Canvas AI](screenshots/11-canvas-ai.png)

Canvas AI is a travel assistant built into the app, with two tabs:

### Ask Canvas AI

A chat window where you can type a question or tap one of the suggested prompts (e.g., "Where should I go next?", "Suggest a road trip."). Canvas AI replies based on your actual destinations and their status — for example, it recommends nearby or similar places you haven't visited yet.

> Canvas AI in this version uses built-in rules based on your travel data, not a live connection to an external AI service.

### Create Trip with AI

A planner form where you enter a starting location, destination, number of days, budget, travel style, travel companions, and interests, then click **Generate Trip** to see a sample day-by-day itinerary with places, activities, and food suggestions, plus an estimated budget, distance, and route.

---

## 25. Travel Statistics

**Figure 14 — Travel Statistics**
![Travel Statistics](screenshots/12-statistics.png)

| Statistic       | What it means                                      |
| --------------- | -------------------------------------------------- |
| Countries       | Distinct countries among your visited destinations |
| States          | Distinct states among your visited destinations    |
| Destinations    | Total destinations added                           |
| Trips Completed | Trips with status "Visited"                        |
| Memories        | Total memories saved                               |
| Travel Days     | Estimated total days spent at visited destinations |

Charts on this page:

- **Travel Activity by Year** — a bar chart showing how many destinations you visited each year.
- **Countries Explored** — a horizontal bar list ranking your visited countries.
- **Most Visited Locations (by memories)** — your top 5 destinations by number of memories saved.

---

## 26. India Explorer

India Explorer is part of the **Travel Map**, not a separate page. Switch the map's toggle to **India** to open it.

On desktop it appears as a panel on the right side of the map; on mobile, tap the **States** button to open it as a bottom sheet.

- A progress bar shows how many of India's 36 states & union territories you've visited (e.g., "8 / 36 States").
- Below that, every state/UT is shown as a chip — states with at least one visited destination are highlighted in green.
- Clicking a state shows its destinations, with a count of destinations and how many are visited; clicking a destination opens its details.

---

## 27. Profile

**Figure 15 — Profile**
![Profile](screenshots/13-profile.png)

The Profile page shows:

- Your avatar, name, and a short bio (editable — click **Edit Profile**, change the text, then click **Save**).
- A **Public Journey** link that opens your shareable public journey page (`/u/your-handle`).
- Mini stats: Countries, States, Destinations, Memories.
- **My Travel Profile** — a set of percentage bars (e.g., Adventure Explorer, Nature Lover, Road Tripper) calculated from your destinations.
- **Favorite Destinations** — a grid of the destinations marked as favorites (shown only if you have any).
- **Achievements** — the same achievement cards shown on My Journeys.

> There is currently no button in the interface to mark or unmark a destination as a favorite — favorites shown here come from the sample data. You can still filter the map and Destinations list by **Favorites**.

---

## 28. My 2026 (Yearly Recap)

This page (`/app/recap`) shows an animated recap card for the current year: destinations, states, countries, memories, trips, and travel days, plus your favorite destination and highest-rated trip for the year. Below it are **Share My 2026** buttons (WhatsApp, Instagram, X, Facebook, Copy Link) and a few auto-generated recap highlight cards.

> This page is not yet linked from the sidebar — you reach it by navigating directly to it. Sharing buttons show a confirmation message but don't post to real social accounts, except **Copy Link**, which copies a link to your clipboard.

---

## 29. Upgrade to Pro

This page (`/app/upgrade`) compares the **Free** plan (current features: basic map, destinations, wishlist, basic memories, basic statistics, basic trip planning) against a **Pro** plan (AI trip planning, AI memory stories, advanced statistics, advanced map styles, and more), which is labeled **"Coming soon."** Clicking **Notify Me** shows a confirmation message — no payment is processed.

> This page is not yet linked from the sidebar — you reach it by navigating directly to it.

---

## 30. Settings

**Figure 16 — Settings**
![Settings](screenshots/14-settings.png)

Settings is organized into sections:

### Account

Shows your name, email, and avatar (and a "Demo account" label if you're signed in with the demo login).

### Preferences

- **Appearance** — switch between Light and Dark mode.
- **Notifications** — enable or disable in-app notifications.

### Privacy

- **Journey Privacy** — click to cycle your journey's visibility between **Private**, **Friends**, and **Public**.

### Connected Accounts

- **Google Drive Integration** — a **Connect Google Drive** button (demo action, see [Google Drive](#17-google-drive)).

### Data & Privacy

- **Export Data** — shows a confirmation message (demo action; no file is actually downloaded).
- **Disconnect Google Drive** — shows a confirmation message.
- **Delete Journey** / **Delete Account** — each opens an "Are you sure?" confirmation dialog before completing (as a demo action; your data isn't actually deleted).

### Logout

A **Logout** button at the bottom of the page. See [Logout](#43-logout).

---

## 31. Notifications

A bell icon appears in the top bar of every app page, showing a badge with the number of current notifications.

**How it works:**

- Notifications are generated automatically from your real data — for example, an upcoming trip within 14 days, an achievement you're close to unlocking, or a nudge to check Discover.
- Click the bell to open the notification list.
- There is no "mark as read" action — the list simply reflects your current data each time you open it.
- Turn notifications on or off from **Settings → Notifications**. When disabled, the bell shows no notifications and the panel explains that notifications are turned off.

---

## 32. Search

A search icon appears in the top bar of every app page.

**How to search:**

1. Click the search icon.
2. Type in the box (e.g., a destination name, state, country, memory title, or tag).
3. Matching destinations and memories appear in a results list below the box.
4. Click a result to jump to it — destinations open the map centered on that place; memories take you to the Memories page.
5. Click the **X** or click outside the search box to close it without selecting anything.

---

## 33. Filters

A filter bar appears on the Explore Map and Destinations pages, with these options:

| Filter    | Shows                                  |
| --------- | -------------------------------------- |
| All       | Every destination                      |
| Visited   | Only destinations marked Visited       |
| Planned   | Only destinations marked Planned       |
| Wishlist  | Only destinations marked Wishlist      |
| Favorites | Only destinations marked as a favorite |

Filters update the map or list immediately when clicked.

---

## 34. Using Travel Diaries on Mobile

Travel Diaries is fully responsive.

- The sidebar is replaced by a **bottom navigation bar** with five items: **Home, Map, Discover, Trips, Profile**.
- The Explore Map still supports pinch-to-zoom and touch dragging.
- Destination and trip details open as a **full-height sheet** rather than a side panel.
- On the India Explorer, the states panel opens as a bottom sheet triggered by a **States** button instead of a fixed side panel.
- Modals (Add Destination, Add Memory, Add Trip) open as bottom sheets that can be scrolled.

---

## 35. Common Tasks

### Add your first destination

1. Log in.
2. Open **Explore Map**.
3. Click **Add Destination**.
4. Search for or enter the location.
5. Choose a Status.
6. Click **Add to Journey**.

### Add a memory

1. Open **Memories**.
2. Click **Add Memory**.
3. Select the destination.
4. Add a title, date, description, and tags.
5. Click **Save Memory**.

### Plan your next trip

1. Open **Upcoming Trips**.
2. Click **Add Trip**.
3. Select the destination and dates.
4. Click **Add Trip** to save.

### Add a destination to your wishlist

1. Click **Add Destination** (or edit an existing one).
2. Set **Status** to **Wishlist**.
3. Click **Add to Journey** / **Save Changes**.

### View your travel statistics

1. Open **Travel Statistics**.
2. Review the overview numbers.
3. Scroll down to explore the charts.

---

## 36. I Just Created My Account — What Should I Do?

**Step 1** — Add a few places you've already visited, so your map and stats reflect your real history.

**Step 2** — Add memories (photos, notes, dates) to those destinations.

**Step 3** — Set accurate statuses (Visited / Planned / Wishlist) for everything you add.

**Step 4** — Add places you want to visit as Wishlist destinations.

**Step 5** — Create upcoming trips for anything you've already planned.

**Step 6** — Visit **Travel Statistics** to see your journey summarized.

---

## 37. Best Practices

- Add destinations soon after a trip, while the details are fresh.
- Fill in Visit Date / End Date whenever you can — several features (statistics, timeline, countdowns) rely on dates.
- Keep memories attached to the correct destination so your Memories archive stays organized.
- Use clear, specific memory titles (e.g., "Sunset at Raja's Seat" rather than "Photo 1").
- Review your Wishlist occasionally and move destinations to Planned once you've decided to go.
- Use trip Notes and the Checklist/Budget tabs for anything with more than one destination or a real budget to track.
- Check **Travel Statistics** and **My Journeys** periodically to see your progress.
- Set your **Journey Privacy** deliberately in Settings before assuming your journey is private or public.

---

## 38. FAQ

### What is Travel Diaries?

A personal travel platform for tracking visited places, planning future trips, saving memories, and viewing your journey on an interactive map.

### How do I add a destination?

Click **Add Destination** from the Explore Map or Destinations page and fill in the form. See [How to Add a Destination](#10-how-to-add-a-destination).

### Can I edit a destination?

Yes — open it and click **Edit**.

### How do I delete a destination?

Open it and click **Delete**. This happens immediately, with no extra confirmation step.

### How do I add memories?

Open **Memories** and click **Add Memory**, or add one from inside a destination's Memories tab.

### Can I connect Google Drive?

You can attach a Google Drive folder **link** to a destination or trip. This version stores and opens the link; it doesn't read files from your Drive account automatically.

### How do I plan a future trip?

Open **Upcoming Trips** and click **Add Trip**.

### Can I use Travel Diaries on mobile?

Yes — see [Using Travel Diaries on Mobile](#34-using-travel-diaries-on-mobile).

### Can I see all my travels on one map?

Yes — the **Explore Map** shows every destination, with a toggle for a dedicated India view.

### How do I change my profile?

Open **Profile** and click **Edit Profile** to update your bio.

### How do I log out?

Open **Settings** and click **Logout** at the bottom of the page.

---

## 39. Troubleshooting

### I cannot log in

- Double-check your email and password (they're case-sensitive).
- Try the **Use Demo Account** button to confirm the app itself is working.
- Check your internet connection — the app needs it for the location search feature, though login itself works offline once loaded.

### My destination is not appearing

- Confirm you clicked **Add to Journey** (not **Cancel**) and no error message appeared.
- Check that the active filter isn't hiding it (e.g., the "Visited" filter will hide a Wishlist destination).
- Make sure the map has fully loaded before looking for the marker.

### My memory is not showing

- Make sure you selected the correct destination when adding it.
- Check the **All / India / International** filter on the Memories page.
- Try clearing the search box.

### Google Drive link isn't opening

- Make sure the link you pasted is a valid, complete URL.
- Make sure you have permission to access that Drive folder — Travel Diaries only opens the link, it doesn't manage folder permissions.

---

## 40. Understanding the Interface

| Icon                | Meaning                                     |
| ------------------- | ------------------------------------------- |
| 📍 Map pin          | A destination marker on the map             |
| 🔍 Magnifying glass | Search                                      |
| ＋ Plus             | Add (a destination, memory, or trip)        |
| ✏️ Pencil           | Edit                                        |
| 🗑 Trash            | Delete                                      |
| ⭐ Star             | Rating                                      |
| ❤️ Heart            | Marks a destination as a favorite           |
| 📁 Folder           | Google Drive link                           |
| 🔔 Bell             | Notifications                               |
| ⋮ Three dots        | More actions (Edit / Delete) on a trip card |

---

## 41. Status Guide

Every destination has one of three statuses:

### Visited

You have already traveled there. Shown in green on the map and with a green "Visited" badge.

### Planned

You intend to visit — usually tied to an upcoming trip. Shown in blue with a "Planned" badge.

### Wishlist

You're interested in visiting someday, but haven't planned it yet. Shown in amber/yellow with a "Wishlist" badge.

A destination can also be marked as a **Favorite** (shown with a pink marker and heart icon) independently of its status.

---

## 42. Privacy & Data

- **Journey Privacy** — set to Private, Friends, or Public from Settings. This controls the intent for your public journey page's visibility in this version.
- **Public Journey page** — available at `/u/your-handle`, linked from your Profile.
- **Connected services** — only Google Drive folder links are supported today; no other services connect to Travel Diaries.
- **Export Data / Delete Journey / Delete Account** — available in Settings under Data & Privacy. In this version these are demo actions that show a confirmation message rather than performing a real, permanent deletion or download.

---

## 43. Logout

1. Open **Settings**.
2. Click **Logout** at the bottom of the page.
3. You'll see a confirmation message and be returned to the public landing page.

---

## 44. Quick Reference

| Menu              | Purpose                          | Main Actions                                                   |
| ----------------- | -------------------------------- | -------------------------------------------------------------- |
| Dashboard         | View your travel overview        | Review stats, recent destinations, upcoming trips, suggestions |
| Explore Map       | View your journey geographically | Add/view destinations, switch World/India, filter              |
| Discover          | Browse curated destination ideas | Browse rows, open a destination                                |
| My Journeys       | Review your travel history       | View timeline, view achievements                               |
| Destinations      | Manage all destinations          | Search, filter, add, open, edit, delete                        |
| Memories          | Manage travel memories           | Add, view, delete memories                                     |
| Upcoming Trips    | Manage trips and wishlist        | Add/edit/delete trips, view checklist/budget, manage wishlist  |
| Canvas AI         | Get travel suggestions           | Chat, generate a sample itinerary                              |
| Travel Statistics | Understand your travel history   | View stats and charts                                          |
| Profile           | Manage your profile              | Edit bio, view travel score, view achievements                 |
| Settings          | Manage preferences               | Appearance, notifications, privacy, Drive, data, logout        |

---

## 45. Document Information

**Product:** Travel Diaries
**Document:** End User Guide
**Version:** 1.0
**Last Updated:** 2026-08-27
**Audience:** Travel Diaries end users
