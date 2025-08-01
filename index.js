document.getElementById("button").addEventListener('click',()=>{
    document.getElementById("msg").style.display = "none"; // <-- Add this line
    let inputValue = document.getElementById('inputName').value 
    let details = document.getElementById("details")
    details.innerHTML = "";

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${inputValue}`)
        .then(response => response.json())
        .then(data => {
            const items = document.getElementById("items");
            items.innerHTML = "";
            if (data.meals == null) {
                document.getElementById("msg").style.display = "block";
            } else {
                document.getElementById("msg").style.display = "none";
                // Start Bootstrap row
                let grid = `<div class="row justify-content-center">`;
                data.meals.forEach(meal => {
                    grid += `
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                            <div class="card singleItem h-100" style="cursor:pointer;" onclick="detailsView('${meal.idMeal}', this)">
                                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                                <div class="card-body text-center">
                                    <h5 class="card-title">${meal.strMeal}</h5>
                                    <p class="card-text">${meal.strArea ? meal.strArea : ""} ${meal.strCategory ? "| " + meal.strCategory : ""}</p>
                                </div>
                                <div class="details-container" id="details-${meal.idMeal}" style="display:none;"></div>
                            </div>
                        </div>
                    `;
                });
                grid += `</div>`;
                items.innerHTML = grid;
            }
        });
});

function detailsView(id, cardElem) {
    // Collapse any open details
    document.querySelectorAll('.details-container').forEach(div => {
        div.style.display = "none";
        div.innerHTML = "";
    });

    // Find the details container in the clicked card
    const detailsDiv = cardElem.querySelector(`#details-${id}`);
    if (!detailsDiv) return;

    // If already open, close it
    if (detailsDiv.style.display === "block") {
        detailsDiv.style.display = "none";
        detailsDiv.innerHTML = "";
        return;
    }

    // Fetch and show details
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(res => res.json())
        .then(detail => {
            let meal = detail.meals[0];
            let youtubeEmbed = "";
            if (meal.strYoutube) {
                const videoId = meal.strYoutube.split("v=")[1];
                youtubeEmbed = `
                    <h6>Watch Recipe Video</h6>
                    <div class="ratio ratio-16x9 mb-2">
                        <iframe src="https://www.youtube.com/embed/${videoId}" 
                            title="YouTube video" allowfullscreen></iframe>
                    </div>
                `;
            }

            // Collect all non-empty ingredients
            let ingredients = [];
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim()) {
                    ingredients.push(`<li>${ingredient}${measure && measure.trim() ? ` - ${measure}` : ""}</li>`);
                }
            }

            detailsDiv.innerHTML = `
                <div class="card-body">
                    <h6>Ingredients</h6>
                    <ul>
                        ${ingredients.join("")}
                    </ul>
                    <button class="btn btn-info mb-2" id="showInstructionsBtn-${id}">Show Instructions</button>
                    <div id="instructions-${id}" style="display:none;">
                        <h6>Instructions</h6>
                        <p>${meal.strInstructions}</p>
                    </div>
                    ${youtubeEmbed}
                </div>
            `;
            detailsDiv.style.display = "block";

            // Show/hide instructions
            const showBtn = detailsDiv.querySelector(`#showInstructionsBtn-${id}`);
            const instructionsDiv = detailsDiv.querySelector(`#instructions-${id}`);
            showBtn.addEventListener("click", () => {
                if (instructionsDiv.style.display === "none") {
                    instructionsDiv.style.display = "block";
                    showBtn.textContent = "Hide Instructions";
                } else {
                    instructionsDiv.style.display = "none";
                    showBtn.textContent = "Show Instructions";
                }
            });
        });
}

const themeSwitch = document.getElementById("themeToggleSwitch");
if (themeSwitch) {
    window.addEventListener("DOMContentLoaded", () => {
        if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
            themeSwitch.checked = true;
        }
    });

    themeSwitch.addEventListener("change", () => {
        if (themeSwitch.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    });
}

// Back to Top button logic
const backToTopBtn = document.getElementById("backToTopBtn");
window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
});
backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Fetch and display meal categories as a dropdown
function loadCategories() {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
        .then(res => res.json())
        .then(data => {
        const dropdownMenu = document.getElementById("categoryDropdownMenu");
            let html =/* `
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="categoriesDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        Browse by Category
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="categoriesDropdown" style="max-height:300px;overflow-y:auto;">
            `;*/"";
            data.categories.forEach(cat => {
                html += `
                    <li>
                        <a class="dropdown-item d-flex align-items-center category-dropdown-item" href="#" data-category="${cat.strCategory}">
                            <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" style="width:28px;height:28px;border-radius:50%;margin-right:10px;">
                            <span>${cat.strCategory}</span>
                        </a>
                    </li>
                `;
            });
           // html += `</ul></div>`;
            dropdownMenu.innerHTML = html;

            // Add click event to each dropdown item
            document.querySelectorAll('.category-dropdown-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    searchByCategory(this.getAttribute('data-category'));
                });
            });
        });
}

// Search meals by category
function searchByCategory(category) {
    document.getElementById("msg").style.display = "none";
    document.getElementById("inputName").value = ""; // Clear search box
    let details = document.getElementById("details");
    details.innerHTML = "";
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`)
        .then(response => response.json())
        .then(data => {
            const items = document.getElementById("items");
            items.innerHTML = "";
            if (data.meals == null) {
                document.getElementById("msg").style.display = "block";
            } else {
                document.getElementById("msg").style.display = "none";
                let grid = `<div class="row justify-content-center">`;
                data.meals.forEach(meal => {
                    grid += `
                        <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                            <div class="card singleItem h-100" style="cursor:pointer;" onclick="detailsView('${meal.idMeal}', this)">
                                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                                <div class="card-body text-center">
                                    <h5 class="card-title">${meal.strMeal}</h5>
                                </div>
                                <div class="details-container" id="details-${meal.idMeal}" style="display:none;"></div>
                            </div>
                        </div>
                    `;
                });
                grid += `</div>`;
                items.innerHTML = grid;
            }
        });
}

// Call this when the page loads
window.addEventListener("DOMContentLoaded", loadCategories);

// Autocomplete suggestions for inputName
const inputName = document.getElementById('inputName');
const suggestions = document.getElementById('suggestions');

inputName.addEventListener('input', function() {
    const query = this.value.trim();
    if (query.length < 3) {
        suggestions.style.display = 'none';
        suggestions.innerHTML = '';
        return;
    }
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
        .then(res => res.json())
        .then(data => {
            suggestions.innerHTML = '';
            if (data.meals) {
                data.meals.slice(0, 8).forEach(meal => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item list-group-item-action';
                    li.textContent = meal.strMeal;
                    li.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        inputName.value = meal.strMeal;
                        suggestions.style.display = 'none';
                    });
                    suggestions.appendChild(li);
                });
                suggestions.style.display = 'block';
            } else {
                suggestions.style.display = 'none';
            }
        })
        .catch(err => {
            console.error("Suggestion fetch error:", err);
            suggestions.style.display = 'none';
        });
});

document.addEventListener('click', function(e) {
    if (!inputName.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.style.display = 'none';
    }
});
// ...existing code...

// Contact form submit handler
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('.php-email-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const name = document.getElementById('name-field').value.trim();
      const email = document.getElementById('email-field').value.trim();
      const subject = document.getElementById('subject-field').value.trim();
      const message = document.getElementById('message-field').value.trim();

      if (!name || !email || !subject || !message) {
        alert('Please fill in all fields.');
        return;
      }

      alert('Your message has been sent. Thank you!');
      contactForm.reset();
    });
  }
});