(() => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('#project-navigation');
  if (toggle && links) {
    document.documentElement.classList.add('has-js');
    toggle.hidden = false;
    const closeNavigation = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '展开项目导航');
      links.classList.remove('is-open');
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '收起项目导航' : '展开项目导航');
      links.classList.toggle('is-open', open);
    });
    links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeNavigation();
        toggle.focus();
      }
    });
  }
  const preview = document.querySelector('[data-preview]');
  const dialog = document.querySelector('.preview-dialog');
  const close = document.querySelector('[data-close-preview]');
  if (!preview || !dialog || !close || typeof dialog.showModal !== 'function') return;
  preview.setAttribute('aria-haspopup', 'dialog');
  preview.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('preview-open');
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('preview-open');
    preview.focus({ preventScroll: true });
  });
})();
