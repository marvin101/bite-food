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
                            <div class="card singleItem h-100" style="cursor:pointer;" onclick="detailsView('${meal.idMeal}')">
                                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                                <div class="card-body text-center">
                                    <h5 class="card-title">${meal.strMeal}</h5>
                                    <p class="card-text">${meal.strArea} | ${meal.strCategory}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
                grid += `</div>`;
                items.innerHTML = grid;
            }
        });
});

function detailsView(id) {
    let details = document.getElementById("details");
    let items = document.getElementById("items");
    details.innerHTML = "";

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(res => res.json())
        .then(detail => {
            let meal = detail.meals[0];
            //Youtube link
    let youtubeEmbed = "";
    if (meal.strYoutube) {
    // Extract the video ID from the URL
    const videoId = meal.strYoutube.split("v=")[1];
    youtubeEmbed = `
        <h6>Watch Recipe Video</h6>
        <div class="ratio ratio-16x9 mb-2">
            <iframe src="https://www.youtube.com/embed/${videoId}" 
                title="YouTube video" allowfullscreen></iframe>
        </div>
        `;
        }
    //youtube link ends
            let detailsDiv = document.createElement("div");
            detailsDiv.innerHTML = `
                <button class="btn btn-secondary mb-2" id="backBtn">Back</button>
                <div class="card" style="width: 19rem;">
                    <img src="${meal.strMealThumb}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h3 class="card-text">${meal.strMeal}</h3>
                        <h6>Ingredients</h6>
                        <ul>
                            <li>${meal.strArea}</li>
                            <li>${meal.strCategory}</li>
                            <li>${meal.strIngredient1}</li>
                            <li>${meal.strIngredient2}</li>
                            <li>${meal.strIngredient3}</li>
                            <li>${meal.strIngredient4}</li>
                            <li>${meal.strIngredient5}</li>
                        </ul>
                        <button class="btn btn-info mb-2" id="showInstructionsBtn">Show Instructions</button>
                        <div id="instructions" style="display:none;">
                            <h6>Instructions</h6>
                            <p>${meal.strInstructions}</p>
                        </div>
                        ${youtubeEmbed}
                    </div>
                </div>
            `;
            details.appendChild(detailsDiv);
            items.innerHTML = "";

            // Back button
            const backBtn = detailsDiv.querySelector("#backBtn");
            backBtn.addEventListener("click", () => {
                details.innerHTML = "";
                items.innerHTML = "";
            });

            // Show/hide instructions        
            const showBtn = detailsDiv.querySelector("#showInstructionsBtn");
            const instructionsDiv = detailsDiv.querySelector("#instructions");
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
            const categoriesDiv = document.getElementById("categories");
            let html = `
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="categoriesDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        Browse by Category
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="categoriesDropdown" style="max-height:300px;overflow-y:auto;">
            `;
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
            html += `</ul></div>`;
            categoriesDiv.innerHTML = html;

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
                            <div class="card singleItem h-100" style="cursor:pointer;" onclick="detailsView('${meal.idMeal}')">
                                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                                <div class="card-body text-center">
                                    <h5 class="card-title">${meal.strMeal}</h5>
                                </div>
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
