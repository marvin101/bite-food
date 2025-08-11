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
      <div class="card singleItem h-100">
        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
        <div class="card-body text-center">
          <h5 class="card-title">${meal.strMeal}</h5>
          <a href="https://www.themealdb.com/meal.php?i=${meal.idMeal}" target="_blank" class="btn btn-primary">View Recipe</a>
        </div>
      </div>
    </div>`;
                });
                grid += `</div>`;
                items.innerHTML = grid;
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
      <div class="card singleItem h-100">
        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
        <div class="card-body text-center">
          <h5 class="card-title">${meal.strMeal}</h5>
          <a href="https://www.themealdb.com/meal.php?i=${meal.idMeal}" target="_blank" class="btn btn-primary">View Recipe</a>
        </div>
      </div>
    </div>`;
                            });
                            grid += `</div>`;
                            items.innerHTML = grid;
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
