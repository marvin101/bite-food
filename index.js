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

	  // Search button (guarded)
	  if (searchBtn && input && details && items) {
	    searchBtn.addEventListener('click', () => {
	      hideMsg();
	      const inputValue = input.value.trim();
	      details.innerHTML = "";
	      items.innerHTML = "";

	      if (!inputValue) {
	        showMsg("Please enter a meal or ingredient.");
	        return;
	      }

	      // search by meal name
	      fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(inputValue)}`)
	        .then(r => r.json())
	        .then(data => {
	          if (data.meals) {
	            let grid = `<div class="row justify-content-center">`;
	            data.meals.forEach(meal => {
	              grid += `
	<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
	  <div class="card singleItem search-result-card h-100" data-mealid="${meal.idMeal}" style="cursor:pointer;">
	    <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
	    <div class="card-body text-center">
	      <h5 class="card-title">${meal.strMeal}</h5>
	      <button class="btn btn-primary view-recipe-btn" data-mealid="${meal.idMeal}">View Recipe</button>
	    </div>
	  </div>
	</div>`;
	            });
	            grid += `</div>`;
	            items.innerHTML = grid;
	            items.querySelectorAll('.singleItem, .view-recipe-btn').forEach(el => {
	              el.addEventListener('click', function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                let mealId = this.getAttribute('data-mealid') || (this.closest && this.closest('.singleItem') && this.closest('.singleItem').getAttribute('data-mealid'));
	                if (mealId) showMealDetails(mealId);
	              });
	            });
	          } else {
	            // fallback: search by ingredient
	            fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(inputValue)}`)
	              .then(r2 => r2.json())
	              .then(data2 => {
	                if (data2.meals) {
	                  let grid = `<div class="row justify-content-center">`;
	                  data2.meals.forEach(meal => {
	                    grid += `
	<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
	  <div class="card singleItem search-result-card h-100" data-mealid="${meal.idMeal}" style="cursor:pointer;">
	    <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
	    <div class="card-body text-center">
	      <h5 class="card-title">${meal.strMeal}</h5>
	      <button class="btn btn-primary view-recipe-btn" data-mealid="${meal.idMeal}">View Recipe</button>
	    </div>
	  </div>
	</div>`;
	                  });
	                  grid += `</div>`;
	                  items.innerHTML = grid;
	                  items.querySelectorAll('.singleItem, .view-recipe-btn').forEach(el => {
	                    el.addEventListener('click', function (e) {
	                      e.preventDefault();
	                      e.stopPropagation();
	                      let mealId = this.getAttribute('data-mealid') || (this.closest && this.closest('.singleItem') && this.closest('.singleItem').getAttribute('data-mealid'));
	                      if (mealId) showMealDetails(mealId);
	                    });
	                  });
	                } else {
	                  showMsg("No recipes found. Try a different meal or ingredient.");
	                }
	              })
	              .catch(err => { console.error(err); showMsg("An error occurred while fetching recipes."); });
	          }
	        })
	        .catch(err => { console.error(err); showMsg("An error occurred while fetching recipes."); });
	    });
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
	});
} else {
	// Not running in a browser DOM (or script loaded incorrectly). No-op to avoid runtime errors.
}
