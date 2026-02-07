// Format: YYYY-MM-DD HH:MM:SS (UTC)
export const formatWalletLoginTimestamp = (date = new Date()): string => {
  return date.toISOString().replace("T", " ").substring(0, 19);
};

export const buildWalletLoginMessage = (date = new Date()): string => {
  return `Login to XTG at ${formatWalletLoginTimestamp(date)}`;
};
