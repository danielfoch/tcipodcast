/* Every figure here is copied from the episode run sheet (recorded Nov 25, 2026), which names a source for each.
   Nothing is estimated or interpolated. Figures the run sheet marks as "our math" or hypothetical are flagged below
   and tagged on the slide. Where the run sheet gives a number without a label or year, it is left out. */
window.DD = {
  gifts: {
    // Embark Grandparent Economy Report 2026, p.9. Share of givers by amount given in the past year.
    // The run sheet's chart list also has two middle bands (18% and 9%) with no dollar range, so they are not drawn.
    labels: ["Under $500", "$500 to $1,999", "$10,000 or more"],
    v: [29, 31, 12]
  },
  cibc: {
    // CIBC Economics, June 25, 2024.
    shareLabels: ["2015", "2024"],
    share: [20, 31],
    giftLabels: ["Canada", "Ontario"],
    gift: [115000, 128000]
  },
  fertility: {
    // StatCan, Daily, Sept 23, 2026. Total fertility rate, 2025.
    labels: ["Canada", "British Columbia", "Yukon"],
    v: [1.26, 1.04, 1.02],
    replacement: 2.1
  },
  growth: {
    // StatCan. 2023 is the Mar 27, 2024 release. 0.5% is the year to July 1, 2026 (annual series only).
    labels: ["2023", "Year to July 1, 2026"],
    v: [3.2, 0.5]
  },
  pr: {
    // 2024 actual per PBO. Target per IRCC levels plan, per year through 2029.
    labels: ["2024 actual", "Target per year, through 2029"],
    v: [484000, 380000]
  },
  worth: {
    // StatCan Survey of Financial Security 2023, Daily table 1. Trillions of dollars. Total is $16.78T.
    // The 35 to 54 groups are not in the run sheet and are not drawn.
    labels: ["Under 35", "55 to 64", "65 and older"],
    v: [1.49, 4.15, 5.66]
  },
  own: {
    // StatCan Census 2021, Daily, Sept 21, 2022. Homeownership rate by age.
    labels: ["Age 25 to 29", "Age 30 to 34"],
    y2011: [44.1, 59.2],
    y2021: [36.5, 52.3]
  },
  assets: {
    // StatCan SFS 2023, Daily table 2. Trillions of dollars. 47.5% is the run sheet's math.
    labels: ["All household assets", "Real estate"],
    v: [19.24, 9.14]
  },
  permits: {
    // City of Toronto Development Activity Bulletin 2025, p.11. Units in permits.
    labels: ["Multiplex", "Garden suites", "Laneway suites"],
    v: [4104, 1014, 981]
  },
  relief: {
    // Finance Canada (Mar 12, 2026), CRA Notice 346, Canada and Ontario release (June 2026).
    // $130,000 is the combined maximum HST relief, so these bars do not add.
    labels: ["Ontario HST relief, max", "Toronto DC cut, new single, about", "Federal GST rebate, max"],
    v: [130000, 83000, 50000]
  },
  price: {
    // BILD / Altus, Sept 2026. TRREB, Oct 2026, via WOWA.
    labels: ["New low-rise benchmark", "Resale detached average"],
    v: [1246764, 1310627]
  },
  psf: {
    // Urbanation, Q3 2026.
    labels: ["New unsold condo, asking", "Resale condo, average"],
    v: [1157, 724]
  },
  ratio: {
    // Office of the Chief Actuary, 19th OAS report. People 20 to 64 per person 65 and older.
    labels: ["2025", "2060"],
    v: [3.0, 2.1]
  },
  oas: {
    // Same report. OAS cost, billions of dollars.
    labels: ["2026", "2035"],
    v: [92.6, 137.2]
  },
  tfr: {
    // Eurostat via Eunews (EU, 2024). Destatis, Istat, ONS, Yonhap, StatCan (2025).
    labels: ["South Korea", "Italy", "Canada", "Germany", "EU (2024)", "England and Wales"],
    v: [0.8, 1.14, 1.26, 1.32, 1.34, 1.39],
    replacement: 2.1
  },
  immig: {
    // Environics Institute, Focus Canada. Share who say there is too much immigration.
    // The run sheet gives 2022, 2024 and 2026. Other years are not drawn.
    labels: ["2022", "2024", "2026"],
    v: [27, 58, 48]
  },
  sell: {
    // CMHC Housing Market Insight, Nov 2023. Share of owners who sell within five years, by age.
    // The run sheet's chart list also has a fifth value (83.5%) with no age band, so it is not drawn.
    labels: ["75 to 79", "80 to 84", "85 to 89", "90 to 94"],
    v: [21.5, 36.6, 55.3, 72.4]
  },
  nia: {
    // National Institute on Ageing, Jan 20, 2026. Canadians 50 and older.
    labels: ["Want to stay in their home or a smaller one", "Have done nothing to prepare"],
    v: [81, 62]
  },
  move: {
    // Run sheet worked example (our math). Sell a $1.3M Toronto detached, 5% commission, assumed legal and moving.
    scenarios: ["A: buy a $1.0M bungalow or townhouse", "B: buy a $650K condo"],
    rows: [
      ["Commission, 5% of $1.3M", [65000, 65000]],
      ["HST on commission, 13%", [8450, 8450]],
      ["Ontario land transfer tax", [16475, 9475]],
      ["Toronto land transfer tax", [16475, 9475]],
      ["Legal, assumed", [3500, 3500]],
      ["Movers, assumed", [2200, 2200]]
    ],
    total: [112100, 98100]
  },
  life: {
    // StatCan, Daily, Jan 9, 2026 (2023 data). Remaining life expectancy at 65, years.
    labels: ["Women", "Men"],
    v: [22.3, 19.7]
  },
  cottage: {
    // Run sheet hypothetical. Not a real property.
    labels: ["Bought for", "Worth at death", "Capital gain", "Taxable, 50% included"],
    v: [200000, 900000, 700000, 350000]
  },
  give: {
    // Embark Grandparent Economy Report 2026, p.15.
    labels: ["Give while alive", "Leave an inheritance"],
    v: [63, 18]
  }
};
