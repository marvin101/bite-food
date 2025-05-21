document.getElementById("button").addEventListener('click',()=>{
    let inputValue = document.getElementById('inputName').value 
    let details = document.getElementById("details")
    details.innerHTML = "";
   // buttonSpinner.style.display="inline-block"; // Show spinner

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${inputValue}`)
        .then(response => response.json())
        .then(data=> {
      //      buttonSpinner.style.display = "none"; // Hide spinner
            const items = document.getElementById("items")
            items.innerHTML = ""
            if(data.meals == null){
                document.getElementById("msg").style.display = "block"
            }else{
                document.getElementById("msg").style.display = "none"
                data.meals.forEach(meal =>{
                   let itemDiv = document.createElement("div")
                    itemDiv.className = "m-2 singleItem"
                    itemDiv.setAttribute('onclick' , `detailsView('${meal.idMeal}')`)
                    let  itemInfo = `
                    <div class="card " style="width: 12rem;">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="...">
                        <div class="card-body text-center">
                            <h5 class="card-text">${meal.strMeal}</h5>
                        </div>
                    </div>
                    `
                    itemDiv.innerHTML = itemInfo
                    items.appendChild(itemDiv)
                });
            }

        })
      
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
// Theme Toggle using switch
const themeSwitch = document.getElementById("themeToggleSwitch");

// Apply theme on load
window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeSwitch.checked = true;
    }
});

// Toggle theme
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