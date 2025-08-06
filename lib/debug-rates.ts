// Debug utility to log the rates response
export function debugRates(rates: any[]) {
  if (!Array.isArray(rates)) {
    // eslint-disable-next-line no-console
    console.log("Rates is not an array:", rates);
    return;
  }
  for (const rate of rates) {
    // eslint-disable-next-line no-console
    console.log("Rate:", rate);
  }
}
