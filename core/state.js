const votingStatus = new Map(); // guildId -> boolean

export function openVoting(guildId) {
  votingStatus.set(guildId, true);
}

export function closeVoting(guildId) {
  votingStatus.set(guildId, false);
}

export function isVotingOpen() {
  const now = new Date();

  const marketOpen = new Date(now);
  marketOpen.setUTCHours(13, 30, 0, 0); // 9:30 AM ET

  const marketClose = new Date(now);
  marketClose.setUTCHours(20, 0, 0, 0); // 4:00 PM ET

  // Skip weekends
  if (now.getUTCDay() === 6 || now.getUTCDay() === 0) return false;

  return now < marketOpen || now > marketClose;
}

export function ensureVotingIsOpen(guildId) {
  if (!isVotingOpen(guildId)) {
    throw new Error('Voting is closed');
  }
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
