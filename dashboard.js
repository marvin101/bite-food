document.addEventListener('DOMContentLoaded', function () {
	// --- Sidebar / overlay ---
	const sidebarBtn = document.getElementById('sidebarCollapse');
	const sidebar = document.getElementById('sidebar');
	const overlay = document.getElementById('sidebarOverlay');

	function openSidebar() {
		if (!sidebar) return;
		sidebar.classList.add('active');
		if (overlay) overlay.style.display = 'block';
		document.body.classList.add('sidebar-open');
	}
	function closeSidebar() {
		if (!sidebar) return;
		sidebar.classList.remove('active');
		if (overlay) overlay.style.display = 'none';
		document.body.classList.remove('sidebar-open');
	}

	if (sidebarBtn && sidebar) {
		sidebarBtn.addEventListener('click', function () {
			if (!sidebar.classList.contains('active')) openSidebar();
			else closeSidebar();
		});
	}
	if (overlay) {
		overlay.addEventListener('click', closeSidebar);
	}
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') closeSidebar();
	});
	window.addEventListener('resize', function () {
		if (window.innerWidth >= 992) {
			// ensure overlay is hidden and sidebar is not stuck open
			if (overlay) overlay.style.display = 'none';
			if (sidebar) sidebar.classList.remove('active');
			document.body.classList.remove('sidebar-open');
		}
	});

	// --- Liked recipes (localStorage demo) ---
	const likedRecipesPanel = document.getElementById('likedRecipes');

	function getLikedRecipes() {
		try { return JSON.parse(localStorage.getItem('likedRecipes') || '[]'); }
		catch (e) { return []; }
	}
	function saveLikedRecipes(list) {
		try { localStorage.setItem('likedRecipes', JSON.stringify(list)); } catch (e) {}
	}

	function renderLikedRecipes() {
		if (!likedRecipesPanel) return;
		const liked = getLikedRecipes();
		likedRecipesPanel.innerHTML = '';
		if (!liked || liked.length === 0) {
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

	// initial render
	renderLikedRecipes();

	// Expose minimal API for other scripts if needed (optional)
	window.appDashboard = {
		openSidebar,
		closeSidebar,
		renderLikedRecipes
	};
});
