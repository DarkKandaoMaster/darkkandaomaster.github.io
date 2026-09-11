// Apply the saved preference before the first paint; storage is optional.
try {
  const savedTheme = localStorage.getItem('kandao-theme');
  if (savedTheme === 'dark' || savedTheme === 'light')
    document.documentElement.dataset.theme = savedTheme;
} catch {
  /* The default light palette works without browser storage. */
}
