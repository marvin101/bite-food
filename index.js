// Guard against environments or incorrect loads where `document` is not available
if (typeof document !== 'undefined' && document && typeof document.addEventListener === 'function') {
	document.addEventListener('DOMContentLoaded', () => {
	  const msg = document.getElementById("msg");
	  const input = document.getElementById("inputName");
	  const details = document.getElementById("details");
	  const items = document.getElementById("items");
	  const searchBtn = document.getElementById("button");
	  const randomMealBtn = document.getElementById("randomMeal");
	  const suggestions = document.getElementById("suggestions");

	  function showMsg(text) {
	    if (!msg) return;
	    msg.innerText = text;
	    msg.style.display = "block";
	  }
	  function hideMsg() {
	    if (!msg) return;
	    msg.style.display = "none";
	  }

	  // add: recipeCardHtml and attachResultHandlers helpers (used by performSearch/performCategorySearch)
function recipeCardHtml(meal) {
  const id = meal.idMeal || '';
  const thumb = meal.strMealThumb || '';
  const title = meal.strMeal || '';
  // simple tile markup — consistent with index.css grid
  return `
    <article class="search-result-card card" tabindex="0" data-mealid="${id}" aria-label="${title}">
      <img src="${thumb}" class="card-img-top" alt="${title}">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <div class="d-grid gap-2">
          <button class="btn btn-primary view-recipe-btn" data-mealid="${id}">View Recipe</button>
          <button class="btn btn-outline-danger like-btn" data-mealid="${id}" type="button">
            <i class="bi bi-heart"></i> Like
          </button>
        </div>
      </div>
    </article>
  `;
}

function attachResultHandlers(container) {
  if (!container) return;

  // view button
  container.querySelectorAll('.view-recipe-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const id = this.getAttribute('data-mealid');
      if (id) showMealDetails(id);
    });
  });

  // clicking card (but not buttons) opens details
  container.querySelectorAll('.search-result-card').forEach(card => {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.like-btn') || e.target.closest('.view-recipe-btn')) return;
      const id = this.getAttribute('data-mealid');
      if (id) showMealDetails(id);
    });
  });

  // like button: fetch meal details then POST to save_like.php (toggle)
  container.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async function (e) {
      e.preventDefault();
      const mealId = this.getAttribute('data-mealid');
      if (!mealId) return;
      try {
        const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(mealId)}`);
        const data = await resp.json();
        const meal = data.meals && data.meals[0];
        if (!meal) { alert('Could not load meal details.'); return; }
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
          const ing = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ing && ing.trim() !== '') ingredients.push((measure ? measure + ' ' : '') + ing);
        }
        const payload = {
          meal_id: meal.idMeal,
          title: meal.strMeal,
          thumbnail: meal.strMealThumb || '',
          ingredients: ingredients.join(', '),
          instructions: meal.strInstructions || ''
        };
        const r = await fetch('save_like.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'same-origin'
        });
        if (r.status === 401) { window.location.href = 'signin.html'; return; }
        const jr = await r.json();
        if (jr.status === 'added') {
          btn.classList.add('active');
          btn.innerHTML = '<i class="bi bi-heart-fill"></i> Liked';
          showToast('Recipe added to your liked recipes', 'success');
        } else if (jr.status === 'removed') {
          btn.classList.remove('active');
          btn.innerHTML = '<i class="bi bi-heart"></i> Like';
          showToast('Recipe removed from your liked recipes', 'info');
        } else if (jr.error) {
          showToast('Could not save like: ' + (jr.error || 'Server error'), 'error');
        }

        // NEW: If we're on the profile page (or #likedRecipes exists), refresh the liked list
        const likedContainer = document.getElementById('likedRecipes');
        if (likedContainer) {
          fetch('get_likes.php', { credentials: 'same-origin' })
            .then(res => res.text())
            .then(html => {
              likedContainer.innerHTML = html;
            })
            .catch(err => {
              console.warn('Could not refresh liked recipes', err);
            });
        }
      } catch (err) {
        console.error('Like error', err);
        alert('Could not like the recipe. Try again.');
      }
    });
  });
}

	  // centralised search implementation used by Search button and suggestion clicks
	  async function performSearch(q) {
	    if (!q || !items) return;
	    hideMsg();
	    details.innerHTML = '';
	    items.innerHTML = '<div class="p-3 text-muted">Loading results...</div>';
	    try {
	      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`);
	      const data = await res.json();
	      if (data && data.meals) {
	        items.innerHTML = data.meals.map(m => recipeCardHtml(m)).join('');
	        attachResultHandlers(items);
	        updateNavUser();
	        // results now push content down; scroll smoothly to results
	        items.scrollIntoView({ behavior: 'smooth' });
	        return;
	      }
	      // fallback to ingredient filter
	      const res2 = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(q)}`);
	      const data2 = await res2.json();
	      if (data2 && data2.meals) {
	        items.innerHTML = data2.meals.map(m => recipeCardHtml(m)).join('');
	        attachResultHandlers(items);
	        updateNavUser();
	        items.scrollIntoView({ behavior: 'smooth' });
	        return;
	      }
	      items.innerHTML = '';
	      showMsg('No recipes found. Try a different meal or ingredient.');
	    } catch (err) {
	      console.error(err);
	      items.innerHTML = '';
	      showMsg('An error occurred while fetching recipes.');
	    }
	  }

	  // Search button (guarded)
	  if (searchBtn && input && items) {
	    searchBtn.addEventListener('click', () => performSearch(input.value.trim()));
	  }

	  // Show meal details (guarded)
	  function showMealDetails(mealId) {
	    if (!details) return;
	    details.innerHTML = "";
	    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
	      .then(r => r.json())
	      .then(data => {
	        const meal = data.meals && data.meals[0];
	        if (!meal) { details.innerHTML = "<div class='alert alert-danger'>Could not load recipe details.</div>"; return; }
	        let ingredients = '';
	        for (let i = 1; i <= 20; i++) {
	          const ing = meal[`strIngredient${i}`];
	          const measure = meal[`strMeasure${i}`];
	          if (ing && ing.trim() !== '') ingredients += `<li>${ing}${measure ? ' - ' + measure : ''}</li>`;
	        }
	        details.innerHTML = `
	<div class="card">
	  <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
	  <div class="card-body">
	    <h5>${meal.strMeal}</h5>
	    <h6>Ingredients:</h6><ul>${ingredients}</ul>
	    <h6>Instructions:</h6><p>${meal.strInstructions}</p>
	    ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-info mb-2">Watch Video</a>` : ''}
	    <button class="btn btn-secondary" id="closeDetailsBtn">Close</button>
	  </div>
	</div>`;
	        const closeBtn = document.getElementById('closeDetailsBtn');
	        if (closeBtn) closeBtn.addEventListener('click', () => details.innerHTML = '');
	        details.scrollIntoView({ behavior: 'smooth' });
	      })
	      .catch(err => { console.error(err); details.innerHTML = "<div class='alert alert-danger'>Could not load recipe details.</div>"; });
	  }

	  // Random button (guarded)
	  if (randomMealBtn && details && items) {
	    randomMealBtn.addEventListener('click', () => {
	      details.innerHTML = "";
	      items.innerHTML = "";
	      fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
	        .then(r => r.json())
	        .then(data => {
	          const meal = data.meals && data.meals[0];
	          if (!meal) { showMsg("Could not load a random meal."); return; }
	          details.innerHTML = `
	<div class="card">
	  <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
	  <div class="card-body">
	    <h5>${meal.strMeal}</h5>
	    <button class="btn btn-primary view-recipe-btn" data-mealid="${meal.idMeal}">View Recipe</button>
	  </div>
	</div>`;
	          const viewBtn = details.querySelector('.view-recipe-btn');
	          if (viewBtn) viewBtn.addEventListener('click', () => showMealDetails(meal.idMeal));
	        })
	        .catch(err => { console.error(err); showMsg("Could not load a random meal."); });
	    });
	  }

	  // Suggestions (guarded) — replaced with API-driven, debounced suggestions
	  if (input && suggestions) {
	    // debounce helper
	    function debounce(fn, delay) {
	      let t;
	      return function(...args) {
	        clearTimeout(t);
	        t = setTimeout(() => fn.apply(this, args), delay);
	      };
	    }

	    // populate suggestion list and show it
	    function showSuggestions(list) {
	      suggestions.innerHTML = '';
	      if (!list || list.length === 0) {
	        suggestions.classList.remove('show');
	        suggestions.style.display = 'none';
	        return;
	      }
	      list.slice(0, 8).forEach(name => {
	        const li = document.createElement('li');
	        li.className = 'list-group-item';
	        li.textContent = name;
	        li.onclick = function() {
	          input.value = name;
	          suggestions.classList.remove('show');
	          suggestions.style.display = 'none';
	          performSearch(name); // run search immediately on suggestion click
	        };
	        suggestions.appendChild(li);
	      });
	      suggestions.classList.add('show');
	      // ensure visible (override any inline display:none)
	      suggestions.style.display = 'block';
	    }

	    // fetch suggestions from TheMealDB (search by name) — returns meals matching substring
	    const fetchSuggestions = debounce(function() {
	      const q = input.value.trim();
	      if (q.length < 3) {
	        suggestions.classList.remove('show');
	        suggestions.innerHTML = '';
	        suggestions.style.display = 'none';
	        return;
	      }
	      // call API
	      fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`)
	        .then(res => res.json())
	        .then(data => {
	          if (!data || !data.meals) {
	            // no results
	            showSuggestions([]);
	            return;
	          }
	          // map meals to names and filter those containing the query (case-insensitive)
	          const qLow = q.toLowerCase();
	          const names = data.meals
	            .map(m => m.strMeal)
	            .filter(n => n && n.toLowerCase().includes(qLow));
	          showSuggestions(names);
	        })
	        .catch(err => {
	          console.error('Suggestions error:', err);
	          showSuggestions([]);
	        });
	    }, 250);

	    input.addEventListener('input', fetchSuggestions);

	    // Hide suggestions when clicking outside
	    document.addEventListener('click', function(e) {
	      if (!input.contains(e.target) && !suggestions.contains(e.target)) {
	        suggestions.classList.remove('show');
	        suggestions.style.display = 'none';
	      }
	    });
	  }

	  // Update nav greeting if logged in (prefer #navSignIn)
	  function updateNavUser() {
	    fetch('session.php', { credentials: 'same-origin' })
	      .then(res => res.json())
	      .then(js => {
	        if (js && js.username) {
	          // Prefer explicit id
	          const navById = document.getElementById('navSignIn');
	          if (navById) {
	            navById.textContent = `Hello, ${js.username}`;
	            navById.href = 'profile.php';
	            navById.classList.add('active');
	            navById.setAttribute('aria-current', 'page');
	            return;
	          }
	          // Fallback to existing selectors if id is not present
	          const signLink = document.querySelector('a[href="signin.html"], a[href="signin.php"], a[href="login.html"], a[href="login.php"]');
	          if (signLink) {
	            signLink.textContent = `Hello, ${js.username}`;
	            signLink.href = 'profile.php';
	            signLink.classList.add('active');
	            signLink.setAttribute('aria-current', 'page');
	          }
	        }
	      })
	      .catch(() => { /* ignore errors */ });
	  }

	  // load categories into the navbar dropdown and wire clicks
	  async function loadCategories() {
	    const menu = document.getElementById('categoryDropdownMenu');
	    const toggleBtn = document.getElementById('navbarCategoryDropdown');
	    if (!menu) return;
	    menu.innerHTML = '<li class="dropdown-item text-muted">Loading...</li>';
	    try {
	      const res = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
	      const data = await res.json();
	      if (!data || !data.categories) { menu.innerHTML = '<li class="dropdown-item text-muted">No categories</li>'; return; }
	      menu.innerHTML = '';
	      data.categories.forEach(cat => {
	        const li = document.createElement('li');
	        const a = document.createElement('a');
	        a.className = 'dropdown-item';
	        a.href = '#';
	        a.textContent = cat.strCategory;
	        a.setAttribute('data-category', cat.strCategory);
	        a.addEventListener('click', (e) => {
	          e.preventDefault();
	          performCategorySearch(cat.strCategory);
	          // update toggle label slightly for user feedback (keeps caret)
	          if (toggleBtn) toggleBtn.textContent = cat.strCategory;
	        });
	        li.appendChild(a);
	        menu.appendChild(li);
	      });
	    } catch (err) {
	      console.error('Failed to load categories', err);
	      menu.innerHTML = '<li class="dropdown-item text-muted">Error loading categories</li>';
	    }
	  }

	  // perform a category search and render tiles (uses existing recipeCardHtml + attachResultHandlers)
	  async function performCategorySearch(category) {
	    if (!items || !category) return;
	    hideMsg();
	    details.innerHTML = '';
	    items.innerHTML = '<div class="text-muted p-3">Loading...</div>';
	    try {
	      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
	      const data = await res.json();
	      if (!data || !data.meals) {
	        items.innerHTML = '<div class="p-3">No recipes found for this category.</div>';
	        return;
	      }
	      items.innerHTML = data.meals.map(m => recipeCardHtml(m)).join('');
	      attachResultHandlers(items);
	      updateNavUser();
	      // scroll to results
	      items.scrollIntoView({ behavior: 'smooth' });
	    } catch (err) {
	      console.error('Category search failed', err);
	      items.innerHTML = '<div class="p-3 text-danger">Error fetching category recipes.</div>';
	    }
	  }

	  // add: small toast/pop-up helper
  function showToast(message, type = 'success') {
    // types: 'success' (green), 'info' (blue), 'error' (red)
    const colors = {
      success: '#1f8a3a',
      info: '#0b74c7',
      error: '#c02f2f'
    };
    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.style.borderLeft = `6px solid ${colors[type] || colors.info}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    // force reflow then show
    requestAnimationFrame(() => toast.classList.add('visible'));
    // remove after 3s
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => { try { toast.remove(); } catch (e) {} }, 300);
    }, 3000);
  }

	  updateNavUser(); // Initial call to set up nav user info
	  loadCategories(); // ensure categories are loaded on page ready
	});
} else {
	// Not running in a browser DOM (or script loaded incorrectly). No-op to avoid runtime errors.
}
