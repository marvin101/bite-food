document.getElementById("button").addEventListener('click', () => {
    document.getElementById("msg").style.display = "none";
    let inputValue = document.getElementById("inputName").value.trim();
    let details = document.getElementById("details");
    let items = document.getElementById("items");
    details.innerHTML = "";
    items.innerHTML = "";

    if (!inputValue) {
        document.getElementById("msg").innerText = "Please enter a meal or ingredient.";
        document.getElementById("msg").style.display = "block";
        return;
    }

    // 1. Try searching by meal name
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(inputValue)}`)
        .then(response => response.json())
        .then(data => {
            if (data.meals) {
                // Show meal name results
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

                // Add click event to cards and buttons
                items.querySelectorAll('.singleItem, .view-recipe-btn').forEach(el => {
                    el.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        let mealId = this.getAttribute('data-mealid');
                        if (!mealId && this.closest('.singleItem')) {
                            mealId = this.closest('.singleItem').getAttribute('data-mealid');
                        }
                        if (mealId) {
                            showMealDetails(mealId);
                        }
                    });
                });
            } else {
                // 2. If no meal name results, try searching by ingredient
                fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(inputValue)}`)
                    .then(response => response.json())
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

                            // Add click event to cards and buttons
                            items.querySelectorAll('.singleItem, .view-recipe-btn').forEach(el => {
                                el.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    let mealId = this.getAttribute('data-mealid');
                                    if (!mealId && this.closest('.singleItem')) {
                                        mealId = this.closest('.singleItem').getAttribute('data-mealid');
                                    }
                                    if (mealId) {
                                        showMealDetails(mealId);
                                    }
                                });
                            });
                        } else {
                            document.getElementById("msg").innerText = "No recipes found. Try a different meal or ingredient.";
                            document.getElementById("msg").style.display = "block";
                        }
                    })
                    .catch(err => {
                        console.error("Error fetching ingredient data:", err);
                        document.getElementById("msg").innerText = "An error occurred while fetching recipes.";
                        document.getElementById("msg").style.display = "block";
                    });
            }
        })
        .catch(err => {
            console.error("Error fetching meal data:", err);
            document.getElementById("msg").innerText = "An error occurred while fetching recipes.";
            document.getElementById("msg").style.display = "block";
        });
});

// Show meal details in the #details section
function showMealDetails(mealId) {
    let details = document.getElementById("details");
    let items = document.getElementById("items");
    details.innerHTML = "";
    // Fetch meal details
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(res => res.json())
        .then(data => {
            const meal = data.meals[0];
            // Ingredients list
            let ingredients = '';
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== '') {
                    ingredients += `<li>${ingredient}${measure ? ' - ' + measure : ''}</li>`;
                }
            }
            details.innerHTML = `
                <div class="card">
                  <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                  <div class="card-body">
                    <h5>${meal.strMeal}</h5>
                    <h6>Ingredients:</h6>
                    <ul>${ingredients}</ul>
                    <h6>Instructions:</h6>
                    <p>${meal.strInstructions}</p>
                    ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-info mb-2">Watch Video</a>` : ''}
                    <button class="btn btn-secondary" id="closeDetailsBtn">Close</button>
                  </div>
                </div>`;
            // Scroll to details
            details.scrollIntoView({ behavior: 'smooth' });
            // Close button
            document.getElementById('closeDetailsBtn').onclick = function() {
                details.innerHTML = "";
            };
        })
        .catch(err => {
            details.innerHTML = "<div class='alert alert-danger'>Could not load recipe details.</div>";
        });
}

// Surprise Me button functionality
document.getElementById("randomMeal").addEventListener('click', () => {
    let details = document.getElementById("details");
    let items = document.getElementById("items"); // clear items too
    details.innerHTML = "";
    items.innerHTML = "";

    fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
        .then(res => res.json())
        .then(data => {
            const meal = data.meals[0];
            details.innerHTML = `
                <div class="card">
                  <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                  <div class="card-body">
                    <h5>${meal.strMeal}</h5>
                    <a href="https://www.themealdb.com/meal.php?i=${meal.idMeal}" target="_blank" class="btn btn-primary">View Recipe</a>
                  </div>
                </div>`;
        })
        .catch(err => {
            console.error("Error fetching random meal:", err);
            document.getElementById("msg").innerText = "Could not load a random meal.";
            document.getElementById("msg").style.display = "block";
        });
});

const input = document.getElementById('inputName');
const suggestions = document.getElementById('suggestions');

// Dummy data for demonstration
const meals = ["Pizza", "Pasta", "Paneer", "Pav Bhaji", "Pancake", "Paratha", "Pulao", "Pudding"];

input.addEventListener('input', function() {
    const val = this.value.trim().toLowerCase();
    suggestions.innerHTML = '';
    if (!val) {
        suggestions.style.display = 'none';
        return;
    }
    const filtered = meals.filter(meal => meal.toLowerCase().includes(val));
    if (filtered.length === 0) {
        suggestions.style.display = 'none';
        return;
    }
    filtered.forEach(meal => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = meal;
        li.onclick = function() {
            input.value = meal;
            suggestions.style.display = 'none';
        };
        suggestions.appendChild(li);
    });
    suggestions.style.display = 'block';
});

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.style.display = 'none';
    }
});
