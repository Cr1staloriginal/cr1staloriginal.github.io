(() => {
  const main = document.querySelector('.case-main');
  if (!main) return;
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute('rel', 'noopener noreferrer');
  });
})();