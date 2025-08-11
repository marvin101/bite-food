var sidebarBtn = document.getElementById('sidebarCollapse');
var sidebar = document.getElementById('sidebar');
var overlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar.classList.add('active');
  overlay.style.display = 'block';
  document.body.classList.add('sidebar-open');
}
function closeSidebar() {
  sidebar.classList.remove('active');
  overlay.style.display = 'none';
  document.body.classList.remove('sidebar-open');
}

if (sidebarBtn) {
  sidebarBtn.addEventListener('click', function () {
    if (!sidebar.classList.contains('active')) {
      openSidebar();
    } else {
      closeSidebar();
    }
  });
}
if (overlay) {
  overlay.addEventListener('click', closeSidebar);
}

// Close sidebar on window resize (if desktop)
window.addEventListener('resize', function() {
  if (window.innerWidth >= 992) {
    closeSidebar();
  }
});

// Simple chat UI logic (no backend)
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

chatForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  // Add user message
  const userDiv = document.createElement('div');
  userDiv.className = 'chat-message user';
  userDiv.innerHTML = '<div class="message-content">' + userMsg + '</div>';
  chatMessages.appendChild(userDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatInput.value = '';

  // Simulate bot reply
  setTimeout(function() {
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-message bot';
    botDiv.innerHTML = '<div class="message-content">Sorry, I am a demo! (You said: ' + userMsg + ')</div>';
    chatMessages.appendChild(botDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 700);
});

// Simulate login state (set by backend in real app)
window.isLoggedIn = typeof window.username !== "undefined" && window.username !== null;

// --- Share Recipe Logic ---
const shareRecipeForm = document.getElementById('shareRecipeForm');
const shareRecipeMsg = document.getElementById('shareRecipeMsg');
const searchResults = document.getElementById('searchResults');
const likedRecipesPanel = document.getElementById('likedRecipes');

// Store recipes and liked recipes in localStorage for demo
function getSharedRecipes() {
  return JSON.parse(localStorage.getItem('sharedRecipes') || '[]');
}
function saveSharedRecipes(recipes) {
  localStorage.setItem('sharedRecipes', JSON.stringify(recipes));
}
function getLikedRecipes() {
  return JSON.parse(localStorage.getItem('likedRecipes') || '[]');
}
function saveLikedRecipes(recipes) {
  localStorage.setItem('likedRecipes', JSON.stringify(recipes));
}

// Handle share recipe form submit
if (shareRecipeForm) {
  shareRecipeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('recipeTitle').value.trim();
    const ingredients = document.getElementById('recipeIngredients').value.trim();
    const instructions = document.getElementById('recipeInstructions').value.trim();
    if (!title || !ingredients || !instructions) return;
    const recipes = getSharedRecipes();
    recipes.unshift({
      id: Date.now(),
      title,
      ingredients,
      instructions
    });
    saveSharedRecipes(recipes);
    shareRecipeMsg.textContent = "Recipe posted!";
    shareRecipeForm.reset();
    renderSearchResults();
  });
}

// --- Liked Recipes Logic ---
function renderLikedRecipes() {
  const liked = getLikedRecipes();
  likedRecipesPanel.innerHTML = '';
  if (liked.length === 0) {
    likedRecipesPanel.innerHTML = '<div class="text-muted">No liked recipes yet.</div>';
    return;
  }
  liked.forEach(recipe => {
    const div = document.createElement('div');
    div.className = 'col-12 col-md-6 col-lg-4';
    div.innerHTML = `
      <div class="recipe-card">
        <div class="recipe-card-title">${recipe.title}</div>
        <div class="recipe-card-ingredients"><b>Ingredients:</b> ${recipe.ingredients}</div>
        <div class="recipe-card-instructions"><b>Instructions:</b> ${recipe.instructions}</div>
      </div>
    `;
    likedRecipesPanel.appendChild(div);
  });
}

// --- Search Results Logic ---
function renderSearchResults() {
  const recipes = getSharedRecipes();
  searchResults.innerHTML = '';
  if (recipes.length === 0) {
    searchResults.innerHTML = '<div class="text-muted">No recipes found. Share your own above!</div>';
    return;
  }
  const liked = getLikedRecipes();
  recipes.forEach(recipe => {
    const isFavourited = liked.some(r => r.id === recipe.id);
    const div = document.createElement('div');
    div.className = 'col-12 col-md-6 col-lg-4';
    div.innerHTML = `
      <div class="recipe-card">
        <div class="recipe-card-title">${recipe.title}
          <button class="fav-btn${isFavourited ? ' favourited' : ''}" data-id="${recipe.id}" title="Add to Favourites">
            <i class="bi bi-heart${isFavourited ? '-fill' : ''}"></i>
          </button>
        </div>
        <div class="recipe-card-ingredients"><b>Ingredients:</b> ${recipe.ingredients}</div>
        <div class="recipe-card-instructions"><b>Instructions:</b> ${recipe.instructions}</div>
      </div>
    `;
    searchResults.appendChild(div);
  });
  // Attach event listeners to favourite buttons
  searchResults.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const recipeId = Number(this.getAttribute('data-id'));
      if (!window.isLoggedIn) {
        // Show login modal
        var loginModal = new bootstrap.Modal(document.getElementById('loginPromptModal'));
        loginModal.show();
        return;
      }
      let liked = getLikedRecipes();
      const recipes = getSharedRecipes();
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      if (liked.some(r => r.id === recipeId)) {
        // Remove from liked
        liked = liked.filter(r => r.id !== recipeId);
      } else {
        // Add to liked
        liked.unshift(recipe);
      }
      saveLikedRecipes(liked);
      renderLikedRecipes();
      renderSearchResults();
    });
  });
}

// Initial render
if (searchResults && likedRecipesPanel) {
  renderSearchResults();
  renderLikedRecipes();
}
