function toggleNavigation(open) {
  const expanded = open ?? !document.body.classList.contains('navigation-open');
  document.body.classList.toggle('navigation-open', expanded);
  document.getElementById('menuToggle').setAttribute('aria-expanded', String(expanded));
}
document.getElementById('nav-command').setAttribute('aria-current', 'page');
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    toggleNavigation(false);
    closeIngestModal();
    toggleSpecDrawer(false);
  }
});
// Associate visible form labels with their controls, including legacy markup.
document.querySelectorAll('label:not([for])').forEach(label => {
  const control = label.parentElement.querySelector('input[id],select[id],textarea[id]');
  if (control) label.htmlFor = control.id;
});
document.querySelectorAll('aside div[onclick]').forEach(item => {
  item.tabIndex = 0;
  item.setAttribute('role', 'button');
  item.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); item.click(); }
  });
});
