/* =============================================================================
   PGFLOW DESIGN SYSTEM & UI STYLING SPECIFICATION
   Complete design tokens, Tailwind configuration, component classes & layout styles
   ============================================================================= */

/* -----------------------------------------------------------------------------
   1. TYPOGRAPHY & WEB FONTS
   -----------------------------------------------------------------------------
   Font Family:
     - Primary: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif
     - Link tag (HTML head): https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap
   
   Font Weights:
     - font-normal:   400 (Body text, helper text, table content)
     - font-medium:   500 (Labels, nav links, card category headers, table th, button text)
     - font-semibold: 600 (Card values, section titles, dialog titles, status badges)
     - font-bold:     700 (App logo, main page titles, occupancy numbers, 404 display)

   Font Sizes & Line Heights:
     - text-xs:  0.75rem  / 12px  (line-height: 1rem)    - Subtitles, meta tags, table th, status badges, helper labels
     - text-sm:  0.875rem / 14px  (line-height: 1.25rem) - Body text, inputs, buttons, table td, descriptions, labels
     - text-base: 1.00rem / 16px  (line-height: 1.5rem)  - Section titles, nav items, mobile input text
     - text-lg:   1.125rem / 18px (line-height: 1.75rem) - Card group headings, dialog titles
     - text-xl:   1.25rem  / 20px (line-height: 1.75rem) - Page headers, KPI metric values
     - text-2xl:  1.50rem  / 24px (line-height: 2.0rem)  - Main desktop page titles, stat tile numbers
     - text-7xl:  4.50rem  / 72px (line-height: 1.0rem)  - Error/404 hero numbers

   Letter Spacing:
     - tracking-tight: -0.025em (Headings: text-xl, text-2xl, Dialog titles)
     - tracking-wide:  0.025em  (Badges: text-xs uppercase status badges, stat tile headers)
*/

/* -----------------------------------------------------------------------------
   2. TAILWIND V4 @theme & CSS COLOR TOKENS (OKLCH PALETTE)
   ----------------------------------------------------------------------------- */
@theme inline {
  --radius-sm: calc(var(--radius) - 4px); /* 8px */
  --radius-md: calc(var(--radius) - 2px); /* 10px */
  --radius-lg: var(--radius);             /* 12px */
  --radius-xl: calc(var(--radius) + 4px); /* 16px */
  --radius-2xl: calc(var(--radius) + 8px);/* 20px */
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-success-soft: var(--success-soft);
  --color-success-strong: var(--success-strong);
  --color-warning-soft: var(--warning-soft);
  --color-warning-strong: var(--warning-strong);
  --color-danger-soft: var(--danger-soft);
  --color-danger-strong: var(--danger-strong);
  --color-info-soft: var(--info-soft);
  --color-info-strong: var(--info-strong);

  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --shadow-soft: 0 1px 2px oklch(0.2 0.03 250 / 6%), 0 8px 24px oklch(0.2 0.03 250 / 6%);
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
}

:root {
  /* Radii */
  --radius: 0.75rem; /* 12px */

  /* Neutral Surface & Typography */
  --background: oklch(0.985 0.004 250);       /* Soft light grayish blue #f8f9fb */
  --foreground: oklch(0.21 0.03 255);         /* Slate navy deep text #1e2433 */
  --card: oklch(1 0 0);                       /* #ffffff */
  --card-foreground: oklch(0.21 0.03 255);
  --popover: oklch(1 0 0);                    /* #ffffff */
  --popover-foreground: oklch(0.21 0.03 255);
  --border: oklch(0.92 0.01 250);             /* Subtle slate border */
  --input: oklch(0.92 0.01 250);
  
  /* Primary Brand (Indigo/Blue Accent) */
  --primary: oklch(0.52 0.15 250);            /* Vibrant Royal Indigo */
  --primary-foreground: oklch(0.99 0.003 250);/* Clean white */
  --ring: oklch(0.52 0.15 250);

  /* Secondary & Muted */
  --secondary: oklch(0.96 0.008 250);
  --secondary-foreground: oklch(0.3 0.03 255);
  --muted: oklch(0.96 0.008 250);
  --muted-foreground: oklch(0.55 0.03 255);   /* Subtitle slate #6b7280 equivalent */
  --accent: oklch(0.95 0.02 250);
  --accent-foreground: oklch(0.32 0.05 255);

  /* Destructive */
  --destructive: oklch(0.58 0.2 25);          /* Crisp red */
  --destructive-foreground: oklch(0.99 0.003 250);

  /* Semantic Feedback & Status Tokens */
  --success-soft: oklch(0.94 0.06 155);       /* Pale Emerald Green tint */
  --success-strong: oklch(0.45 0.12 155);     /* Deep Emerald Green text */
  --warning-soft: oklch(0.95 0.07 85);        /* Pale Amber Yellow tint */
  --warning-strong: oklch(0.48 0.12 70);      /* Deep Amber Gold text */
  --danger-soft: oklch(0.95 0.05 25);         /* Pale Rose/Coral Red tint */
  --danger-strong: oklch(0.51 0.18 25);       /* Deep Red text */
  --info-soft: oklch(0.95 0.04 250);          /* Pale Sky/Indigo tint */
  --info-strong: oklch(0.48 0.14 250);        /* Deep Blue/Indigo text */

  /* Sidebar Tokens */
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.129 0.042 264.695);
  --sidebar-primary: oklch(0.208 0.042 265.755);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.968 0.007 247.896);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: oklch(0.704 0.04 256.788);
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.208 0.042 265.755);
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.208 0.042 265.755);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.929 0.013 255.508);
  --primary-foreground: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.984 0.003 247.858);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.984 0.003 247.858);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.551 0.027 264.364);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}

/* -----------------------------------------------------------------------------
   3. APP SHELL & LAYOUT ARCHITECTURE (AppShell.tsx)
   -----------------------------------------------------------------------------
   Page Wrapper:
     class="min-h-screen bg-background md:grid md:grid-cols-[224px_minmax(0,1fr)]"

   Sidebar Navigation:
     Container: class="border-b bg-card md:sticky md:top-0 md:h-screen md:border-r md:border-b-0"
     Flex Wrapper: class="flex h-full flex-col"
     Brand Header: class="flex items-center gap-3 border-b px-4 py-4 md:min-h-20 md:px-5"
     Brand Icon Badge: class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground" (Icon: size-5)
     Brand Title: class="text-base font-bold"
     Brand Subtitle: class="text-xs text-muted-foreground"
     Nav Menu: class="flex gap-1 overflow-x-auto p-2 md:flex-col md:p-3"
     Nav Item (Default):
       class="inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors text-muted-foreground hover:bg-accent hover:text-foreground md:w-full"
     Nav Item (Active):
       class="bg-secondary text-foreground"
     Nav Item Icon: class="size-4"

   Sticky Header:
     Container: class="sticky top-0 z-20 border-b bg-card/95 backdrop-blur"
     Inner Bar: class="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
     Title: class="truncate text-xl font-bold sm:text-2xl"
     Subtitle: class="truncate text-sm text-muted-foreground"
     Actions slot: class="flex items-center gap-2"

   Main Content Area:
     class="space-y-6 p-4 sm:p-6 lg:p-8"
*/

/* -----------------------------------------------------------------------------
   4. UI PRIMITIVES & CONTROLS (shadcn / Radix Components)
   -----------------------------------------------------------------------------
   BUTTON (buttonVariants - button.tsx):
     Base:
       "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
     Sizes:
       - sm:   "h-8 rounded-md px-3 text-xs" (used in tables, card actions, header refresh)
       - default: "h-9 px-4 py-2"          (standard buttons, modal footers)
       - lg:   "h-10 rounded-md px-8"
       - icon: "h-9 w-9"                   (ghost icon buttons: room edit/trash)
     Variants:
       - default:     "bg-primary text-primary-foreground shadow hover:bg-primary/90"
       - destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
       - outline:     "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
       - secondary:   "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"
       - ghost:       "hover:bg-accent hover:text-accent-foreground"
       - link:        "text-primary underline-offset-4 hover:underline"

   INPUT (input.tsx):
     "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

   LABEL (label.tsx):
     "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
     Form Field Stack: class="space-y-1.5"

   SELECT (select.tsx):
     Trigger:
       "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
     Trigger Chevron Icon: "h-4 w-4 opacity-50"
     Content Popover:
       "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
     Item:
       "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
     Item Check Icon: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center"

   MODALS & DIALOGS (dialog.tsx & alert-dialog.tsx):
     Overlay:
       "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
     Content Panel:
       "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
       Responsive maxHeight: "max-h-[90vh] overflow-y-auto"
     Close Button:
       "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
     Header: "flex flex-col space-y-1.5 text-center sm:text-left"
     Title: "text-lg font-semibold leading-none tracking-tight"
     Description: "text-sm text-muted-foreground"
     Footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
     Detail Rows (Student / Tenant Profile Drawer):
       class="flex items-center justify-between gap-4 border-b py-2 last:border-0"
       Label: class="text-sm text-muted-foreground"
       Value: class="text-right text-sm font-medium break-all"

   SKELETON (skeleton.tsx):
     "animate-pulse rounded-md bg-primary/10"
*/

/* -----------------------------------------------------------------------------
   5. STATUS BADGES & TONAL MAPPINGS (StatusBadge.tsx)
   -----------------------------------------------------------------------------
   Badge Base Class:
     "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap"

   Tone Classes by Status:
     - PAID, SENT:
       "bg-success-soft text-success-strong"
     - PENDING, DUE TODAY:
       "bg-warning-soft text-warning-strong"
     - UPCOMING, ADDED, UPDATED:
       "bg-info-soft text-info-strong"
     - OVERDUE, FAILED:
       "bg-danger-soft text-danger-strong"
     - SKIPPED / Default fallback:
       "bg-muted text-muted-foreground"
*/

/* -----------------------------------------------------------------------------
   6. SUMMARY STATS CARDS & METRICS (SummaryCards.tsx & properties.tsx)
   -----------------------------------------------------------------------------
   Dashboard 5-Card Grid:
     Container: class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5"
     Card: class="rounded-xl border bg-card p-4 shadow-soft"
     Header: class="flex items-start justify-between gap-2"
     Title: class="text-xs font-medium text-muted-foreground sm:text-sm"
     Icon Pill: class="rounded-lg p-1.5 ${accentClass}"
       - Total Students: "text-info-strong bg-info-soft"
       - Paid:           "text-success-strong bg-success-soft"
       - Pending:        "text-warning-strong bg-warning-soft"
       - Due Today:      "text-warning-strong bg-warning-soft"
       - Overdue:        "text-danger-strong bg-danger-soft"
     Metric Value: class="mt-2 text-xl font-semibold tracking-tight sm:text-2xl"

   Properties Occupancy 4-Tile Grid:
     Container: class="grid grid-cols-2 gap-3 lg:grid-cols-4"
     Card: class="rounded-xl border bg-card p-4"
     Label: class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
     Value: class="mt-1 text-2xl font-bold"
*/

/* -----------------------------------------------------------------------------
   7. DASHBOARD SECTIONS (src/routes/index.tsx)
   -----------------------------------------------------------------------------
   Error Banner:
     class="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-danger-soft p-4 text-danger-strong"

   Section Heading:
     Icon: class="size-5 text-primary"
     Title: class="text-base font-semibold sm:text-lg"

   Rent Overview Card:
     Container: class="rounded-xl border bg-card p-5 shadow-soft sm:p-6"
     Figures Grid: class="mt-5 grid gap-4 sm:grid-cols-3"
     Figure Label: class="text-xs font-medium text-muted-foreground sm:text-sm"
     Figure Value (Neutral): class="mt-1 text-xl font-bold sm:text-2xl"
     Figure Value (Collected): class="mt-1 text-xl font-bold sm:text-2xl text-success-strong"
     Figure Value (Outstanding): class="mt-1 text-xl font-bold sm:text-2xl text-danger-strong"
     Progress Bar Container: class="mt-6"
     Progress Header: class="mb-2 flex items-center justify-between text-sm"
     Progress Tracker: class="h-2.5 w-full overflow-hidden rounded-full bg-muted accent-success-strong"

   Automation Panel (AutomationPanel.tsx):
     Container: class="rounded-xl border bg-card p-4 shadow-soft sm:p-5"
     Header: class="flex flex-wrap items-center justify-between gap-3"
     Action Button: class="w-full sm:w-auto" (icon: size-4, spinner: animate-spin)
     Metrics Grid: class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5"
     Metric Item: class="rounded-lg border bg-background p-3"
     Metric Header: class="flex items-center gap-2 text-xs text-muted-foreground"
     Metric Value: class="mt-1 text-sm font-semibold break-words"

   Today's Rent Status Card:
     Container: class="rounded-xl border bg-card shadow-soft"
     Header: class="border-b px-5 py-4 sm:px-6"
     3-Column Split: class="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0"
     Column: class="p-5 sm:p-6"
     Status Icon Pill: class="rounded-lg p-2 ${toneClass}" (Icon: size-4)
     Student List: class="mt-4 space-y-2 border-t pt-3"
     Student Item: class="flex items-center justify-between gap-3 text-sm"
     Student Meta: class="shrink-0 text-xs text-muted-foreground"
*/

/* -----------------------------------------------------------------------------
   8. STUDENTS MANAGEMENT (src/routes/students.tsx & StudentTable.tsx)
   -----------------------------------------------------------------------------
   Toolbar & Filters Card:
     Container: class="flex flex-col gap-3 rounded-xl border bg-card p-4"
     Search Box: class="relative flex-1"
     Search Icon: class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
     Search Input: class="pl-9"
     Dropdowns Grid: class="grid grid-cols-2 gap-3 lg:w-96"
     Pill Filter Container: class="flex flex-wrap gap-2"
     Pill Button (Inactive):
       class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors text-muted-foreground hover:bg-accent hover:text-foreground"
     Pill Button (Active):
       class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors border-primary bg-primary text-primary-foreground"

   Desktop Table:
     Container: class="hidden overflow-x-auto rounded-xl border bg-card lg:block"
     Table: class="w-full text-sm"
     Table Head: class="bg-muted/60 text-left text-xs text-muted-foreground uppercase"
     Table Header Cell (th): class="px-4 py-3 font-medium whitespace-nowrap"
     Table Row: class="border-t hover:bg-muted/40 transition-colors"
     Table Data Cell (td): class="px-4 py-3"
     Primary Student Link: class="text-left font-medium hover:underline"
     Action Buttons Container: class="flex gap-2"

   Mobile Student Card List:
     Container: class="space-y-3 lg:hidden"
     Card: class="rounded-xl border bg-card p-4"
     Header: class="flex items-start justify-between gap-3"
     Title: class="font-semibold"
     Subtitles: class="text-xs break-all text-muted-foreground"
     Key-Value Grid: class="mt-3 grid grid-cols-2 gap-2 text-sm"
     Key Label: class="text-xs text-muted-foreground"
     Key Value: class="font-medium"
     Action Buttons: class="mt-3 flex flex-wrap gap-2" (Buttons: class="flex-1")

   Empty State:
     class="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground"
*/

/* -----------------------------------------------------------------------------
   9. PROPERTIES, FLOORS, ROOMS & BEDS (src/routes/properties.tsx)
   -----------------------------------------------------------------------------
   Layout Structure:
     Main Container: class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
     Left Column: class="space-y-6"
     Right Column (Bed Details Sticky Aside):
       class="space-y-3 rounded-xl border bg-card p-4 lg:sticky lg:top-24 lg:self-start"

   Property Select Toolbar:
     class="flex flex-wrap items-center gap-2"
     Select dropdown: class="min-w-56 flex-1"

   Floors & Rooms:
     Floor Title: class="text-sm font-semibold text-muted-foreground"
     Rooms Grid: class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
     Room Card: class="rounded-xl border bg-card p-4"
     Room Header: class="flex items-start justify-between gap-2"
     Room Number: class="font-semibold"
     Room Subtitle: class="text-xs text-muted-foreground"

   Bed Chips (Inside Room Card):
     Base Chip:
       class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
     States:
       - Selected Bed:
         class="border-primary bg-primary/10 ring-2 ring-primary"
       - Occupied Bed:
         class="border-transparent bg-danger-soft text-danger-strong"
       - Vacant Bed:
         class="border-dashed bg-success-soft text-success-strong"
     Add Bed Button:
       class="h-8" variant="outline" size="sm"

   Bed Details Side Panel:
     Panel Heading: class="text-sm font-semibold"
     Status Header: class="flex items-center justify-between gap-2"
     Occupant Details: class="space-y-1 text-sm font-medium"
     Meta Lines: class="text-muted-foreground text-sm"
     Action Stack: class="flex flex-col gap-2"
*/

/* -----------------------------------------------------------------------------
   10. INTERACTION STATES & RESPONSIVE BREAKPOINTS
   -----------------------------------------------------------------------------
   States:
     - Hover:
       hover:bg-accent, hover:text-accent-foreground, hover:bg-primary/90,
       hover:bg-destructive/90, hover:bg-muted/40, hover:underline
     - Focus:
       focus-visible:outline-none, focus-visible:ring-1, focus-visible:ring-ring,
       focus:ring-2, focus:ring-offset-2
     - Active / Selected:
       bg-secondary, border-primary bg-primary/10 ring-2 ring-primary
     - Disabled:
       disabled:pointer-events-none, disabled:opacity-50, disabled:cursor-not-allowed
     - Loading:
       animate-pulse (Skeleton), animate-spin (RefreshCw, Loader2)
     - Error / Validation:
       text-destructive (class="text-xs text-destructive"),
       border-destructive/30 bg-danger-soft text-danger-strong

   Breakpoints:
     - sm: 640px  (2-col grids, responsive header text sm:text-2xl, dialog footers)
     - md: 768px  (AppShell desktop sidebar layout md:grid-cols-[224px_minmax(0,1fr)])
     - lg: 1024px (Desktop table view vs mobile card list, 2-column property layout)
     - xl: 1280px (5-column summary cards, 3-column room grid)
*/
