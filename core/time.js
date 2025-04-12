export function getMarketOpenTime(relative = false) {
    const now = new Date();
    const marketOpen = new Date();
    marketOpen.setUTCHours(13, 30, 0, 0); // 9:30 AM ET = 13:30 UTC

    // If it's already past 9:30AM today, roll to next day (skip weekends)
    if (marketOpen < now) {
        marketOpen.setUTCDate(marketOpen.getUTCDate() + 1);
        while (marketOpen.getUTCDay() === 6 || marketOpen.getUTCDay() === 0) {
            marketOpen.setUTCDate(marketOpen.getUTCDate() + 1);
        }
    }

    if (relative) {
        const unix = Math.floor(marketOpen.getTime() / 1000);
        return `<t:${unix}:R>`;
    }

    return marketOpen;
}

export function getMarketCloseTime(relative = false) {
    const marketClose = new Date();
    marketClose.setUTCHours(20, 0, 0, 0); // 4:00 PM ET = 20:00 UTC

    // If after close, return today’s close (or tomorrow’s if desired)
    const now = new Date();
    if (marketClose < now) {
        marketClose.setUTCDate(marketClose.getUTCDate() + 1);
        while (marketClose.getUTCDay() === 6 || marketClose.getUTCDay() === 0) {
            marketClose.setUTCDate(marketClose.getUTCDate() + 1);
        }
    }

    if (relative) {
        const unix = Math.floor(marketClose.getTime() / 1000);
        return `<t:${unix}:R>`;
    }

    return marketClose;
}

export function getMarketDate() {
    const now = new Date();
  
    // If current UTC time is after 9:30 AM ET (13:30 UTC), move to next market day
    if (now.getUTCHours() > 13 || (now.getUTCHours() === 13 && now.getUTCMinutes() >= 30)) {
      now.setUTCDate(now.getUTCDate() + 1);
    }
  
    // Skip weekends (Saturday = 6, Sunday = 0)
    while (now.getUTCDay() === 6 || now.getUTCDay() === 0) {
      now.setUTCDate(now.getUTCDate() + 1);
    }
  
    return now.toISOString().slice(0, 10);
}
  