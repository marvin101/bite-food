(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('likedRecipes');
    if (!container) return;

    async function loadLikes() {
      try {
        const res = await fetch('get_likes.php', { credentials: 'same-origin' });
        if (res.status === 401) {
          container.innerHTML = '<div class="text-muted">Please <a href="signin.html">sign in</a> to see liked recipes.</div>';
          return;
        }
        const html = await res.text();
        container.innerHTML = html;
        attachLikeItemHandlers(container);
      } catch (err) {
        console.error('Failed to load liked recipes:', err);
        container.innerHTML = '<div class="text-danger">Could not load liked recipes. Try again later.</div>';
      }
    }

    function attachLikeItemHandlers(parent) {
      const items = parent.querySelectorAll('.liked-item');
      items.forEach(item => {
        // toggle details on click
        item.addEventListener('click', (e) => {
          // ignore clicks inside the details if they contain buttons/links (so user can interact)
          const details = item.querySelector('.liked-details');
          if (!details) return;
          const isVisible = details.style.display !== 'none';
          if (isVisible) {
            details.style.display = 'none';
            details.setAttribute('aria-hidden', 'true');
            item.classList.remove('expanded');
          } else {
            details.style.display = 'block';
            details.setAttribute('aria-hidden', 'false');
            item.classList.add('expanded');
            // optionally scroll the item into view
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });

        // prevent click on links inside details from toggling parent (if any)
        item.querySelectorAll('.liked-details a, .liked-details button').forEach(el => {
          el.addEventListener('click', (ev) => ev.stopPropagation());
        });
      });
    }

    // expose for external refresh
    window.refreshLikedRecipes = loadLikes;

    // initial load
    loadLikes();
  });
})();
