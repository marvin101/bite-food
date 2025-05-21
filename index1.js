document.getElementById("button").addEventListener('click',()=>{
    let inputValue = document.getElementById('inputName').value ;
    let details = document.getElementById("details");
   let spinner = document.getElementById("spinner");
    details.innerHTML = "";
    spinner.style.display = "block"; // Show spinner 


    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(inputValue)}`)
        .then(response => response.json())
        .then(data=> {
            spinner.style.display = "none"; // Hide spinner
            const items = document.getElementById("items")
            items.innerHTML = ""
            if(data.meals == null){
                document.getElementById("msg").style.display = "block"
  // Optionally: items.innerHTML = "No meals found";

            }else{
                document.getElementById("msg").style.display = "none"
                data.meals.forEach(meal =>{
                   let itemDiv = document.createElement("div");
                    itemDiv.className = "m-2 singleItem"
                    itemDiv.setAttribute('onclick' , `details('${meal.idMeal}')`)
                    let  itemInfo = `
                    <div class="card " style="width: 12rem;">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="...">
                        <div class="card-body text-center">
                            <h5 class="card-text">${meal.strMeal}</h5>
                        </div>
                    </div>
                    `;
                    itemDiv.innerHTML = itemInfo;
                    items.appendChild(itemDiv);
                });
            }

        })
      .catch(error => {
            spinner.style.display = "none"; // Hide spinner on error
            // Optionally handle error
        });  
});

// Function to fetch and display meal details

function details(id){

    let spinner = document.getElementById("spinner");
    spinner.style.display = "block"; // Show spinner

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(res=>res.json())
    .then(detail => {
        let meal = detail.meals[0];
        //console.log(meal)
        let details = document.getElementById("details");
        details.innerHTML = "";
        let detailsDiv = document.createElement("div");

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

        let detailsInfo = `
        <button class="btn btn-secondary mb-2" id="backBtn">Back</button>
        <div class="card " style="width: 19rem;">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="...">
            <div class="card-body ">
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
        `;
        detailsDiv.innerHTML = detailsInfo;
        details.appendChild(detailsDiv);

        
    const backBtn = detailsDiv.querySelector("#backBtn");
backBtn.addEventListener("click", () => {
    details.innerHTML = ""; // Hide the details card
        
const showBtn = detailsDiv.querySelector("#showInstructionsBtn");
const instructionsDiv = detailsDiv.querySelector("#instructions");
showBtn.addEventListener("click", () => {
    instructionsDiv.style.display = instructionsDiv.style.display === "none" ? "block" : "none";
    showBtn.textContent = instructionsDiv.style.display === "none" ? "Show Instructions" : "Hide Instructions";

});
        spinner.style.display = "none"; // Hide spinner
    })
    .catch(error => {
            spinner.style.display = "none"; // Hide spinner on error
            // Optionally handle error
        });
})
}
