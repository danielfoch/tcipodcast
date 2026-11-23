/* Figures checked Nov 23, 2026 against the public sources named on each slide.
   Illustrative round numbers from the episode are flagged illustration:true.
   H1 2024 cash-flow share is reported as both 81 and 82. The bar uses 81. */
window.DD = {
  neg: {
    y: ["2020", "2021", "2022", "2023", "H1 2024"],
    // 2020 and the 40% line: Yahoo Finance Canada, May 29, 2023, and Advisor.ca / Canadian Press, July 25, 2024.
    // 2021: Yahoo, 44%. 2022: Global News, May 30, 2023, 52% (Yahoo reported 51%).
    // 2023: 77%, Mortgage Professional and Advisor.ca. H1 2024: Mortgage Professional 81% through June; Advisor.ca / CP 82%.
    v: [40, 44, 52, 77, 81]
  },
  cash: {
    y: ["2020", "2022", "2023"],
    // Monthly average cash flow, new GTA condo investors. 2021 average was not in the coverage checked.
    v: [63, -223, -597]
  },
  tax: {
    // StatCan T1 Family File, 2020. Medians, 2020 dollars.
    profit: 4880,
    loss: -3180,
    families: 1356650,
    profitablePct: 76.3,
    medianAll: 2750
  },
  leak: {
    // Episode round example. Vacancy is 2500/12. Sum is 358; the episode rounds the gap to about $350.
    labels: ["Vacant month, averaged", "Repairs, light"],
    v: [-208, -150]
  },
  renew: {
    labels: ["All renewals, 2025", "All renewals, 2026", "5-year fixed, 2026"],
    // Average payment change vs December 2024. Bank of Canada Staff Analytical Note 2025-21.
    v: [10, 6, 20]
  },
  rents: {
    labels: ["All asking rents", "Purpose-built", "Condo apartments"],
    level: [2036, 2040, 2048],
    yoy: [-3.2, -2.1, -5.5]
  },
  delinq: {
    labels: ["Canada", "Ontario", "British Columbia"],
    // Equifax Q1 2026, year-over-year change in the mortgage delinquency rate. Now Toronto, May 31, 2026.
    yoy: [32, 52, 36],
    levelCanada: 0.28
  },
  own: {
    // StatCan CHSP, reference year 2022, released July 7, 2026. Share of assessed value of rental properties.
    prov: ["P.E.I.", "Ontario", "B.C.", "New Brunswick", "Manitoba", "Nova Scotia"],
    smallInd: [57.1, 52.6, 49.4, 40.9, 39.0, 35.9],
    smallBiz: [10.6, 7.0, 6.8, 8.6, 6.8, 5.1],
    medInd: [5.4, 7.6, 9.9, 6.1, 4.4, 8.7],
    medBiz: [10.3, 9.2, 13.7, 13.0, 16.2, 12.3],
    inst: [16.6, 23.6, 20.3, 31.4, 33.6, 38.0]
  },
  owners: {
    // StatCan CHSP 2020. Share of owners who are investors, not the share of homes.
    prov: ["Nova Scotia", "New Brunswick", "British Columbia", "Manitoba", "Ontario"],
    v: [31.5, 29.0, 23.3, 20.4, 20.2]
  },
  pay: {
    // $500,000, 25-year amortization, Canadian semi-annual compounding. Calculated Nov 23, 2026.
    labels: ["4%", "5%"],
    monthly: [2630.10, 2908.02]
  }
};
