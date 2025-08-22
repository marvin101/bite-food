<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'db.php';
if (!$conn) {
    error_log('fetch_recipes.php: cannot obtain DB connection');
    echo "<p>Unable to load recipes right now.</p>";
    exit();
}

if (!isset($_SESSION['user_id'])) {
    echo "<p>Please log in to see your recipes.</p>";
    $conn->close();
    exit();
}

$stmt = $conn->prepare("SELECT id, title, image_url, ingredients, instructions FROM recipes WHERE user_id = ? ORDER BY created_at DESC");
if ($stmt === false) {
    error_log('fetch_recipes.php prepare failed: ' . $conn->error);
    echo "<p>Unable to load recipes right now.</p>";
    $conn->close();
    exit();
}

$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result === false) {
    error_log('fetch_recipes.php get_result failed: ' . $stmt->error);
    echo "<p>Unable to load recipes right now.</p>";
    $stmt->close();
    $conn->close();
    exit();
}

if ($result->num_rows === 0) {
    echo "<p>No recipes posted yet.</p>";
} else {
    // container wrapper (dashboard.html includes this file inside #myRecipes)
    while ($row = $result->fetch_assoc()) {
        $id = (int)$row['id'];
        $title = htmlspecialchars($row['title'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8');
        $image = !empty($row['image_url']) ? htmlspecialchars($row['image_url'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8') : '';
        $ingredients = htmlspecialchars($row['ingredients'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8');
        $instructions = htmlspecialchars($row['instructions'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8');

        // Display block + hidden inline edit form
        echo "<div class='recipe-card' data-recipe-id='{$id}'>";
        echo "<div class='recipe-display'>";
        echo "<h4 class='recipe-card-title'>{$title}</h4>";
        if ($image) {
            echo "<img src='{$image}' alt='Recipe Image' style='max-width:100%;border-radius:8px;margin-bottom:10px;'>";
        }
        echo "<p class='recipe-card-ingredients'><strong>Ingredients:</strong> <span class='display-ingredients'>{$ingredients}</span></p>";
        echo "<p class='recipe-card-instructions'><strong>Instructions:</strong> <span class='display-instructions'>" . nl2br($instructions) . "</span></p>";
        echo "<div class='d-flex gap-2 mt-2'>";
        echo "<button class='btn btn-sm btn-outline-secondary edit-btn' data-id='{$id}'>Edit</button>";
        echo "<a href='edit_recipe.php?id={$id}' class='btn btn-sm btn-outline-secondary d-none' aria-hidden='true'>Edit (full)</a>";
        echo "</div>";
        echo "</div>";

        // Inline edit form (hidden)
        echo "<form class='edit-form' data-recipe-id='{$id}' style='display:none;margin-top:10px;'>";

        echo "<div class='mb-2'><label class='form-label visually-hidden' for='title-{$id}'>Title</label>";
        echo "<input id='title-{$id}' name='title' class='form-control form-control-sm edit-title' value=\"".htmlspecialchars($row['title'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8')."\" required></div>";

        echo "<div class='mb-2'><label class='form-label visually-hidden' for='ingredients-{$id}'>Ingredients</label>";
        echo "<textarea id='ingredients-{$id}' name='ingredients' class='form-control form-control-sm edit-ingredients' rows='2' required>".htmlspecialchars($row['ingredients'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8')."</textarea></div>";

        echo "<div class='mb-2'><label class='form-label visually-hidden' for='instructions-{$id}'>Instructions</label>";
        echo "<textarea id='instructions-{$id}' name='instructions' class='form-control form-control-sm edit-instructions' rows='4' required>".htmlspecialchars($row['instructions'], ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8')."</textarea></div>";

        echo "<div class='d-flex gap-2'>";
        echo "<button type='button' class='btn btn-sm btn-success save-edit-btn' data-id='{$id}'>Save</button>";
        echo "<button type='button' class='btn btn-sm btn-outline-secondary cancel-edit-btn' data-id='{$id}'>Cancel</button>";
        echo "</div>";
        echo "</form>";

        echo "</div>"; // .recipe-card
    }

    // Inline JS to handle toggling and AJAX save (delegated handlers)
    ?>
    <script>
    (function(){
      // delegate in #myRecipes (dashboard.html includes this file inside #myRecipes)
      const container = document.querySelector('#myRecipes');
      if (!container) return;

      // Show toast helper (reuse if present)
      function showToast(msg, type='info') {
        const colors = { success:'#1f8a3a', info:'#0b74c7', error:'#c02f2f' };
        const t = document.createElement('div');
        t.className = 'app-toast';
        t.style.borderLeft = '6px solid ' + (colors[type]||colors.info);
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(()=>t.classList.add('visible'));
        setTimeout(()=>{ t.classList.remove('visible'); setTimeout(()=>t.remove(),300); }, 2500);
      }

      container.addEventListener('click', function(e){
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
          const card = editBtn.closest('.recipe-card');
          if (!card) return;
          card.querySelector('.recipe-display').style.display = 'none';
          card.querySelector('.edit-form').style.display = 'block';
          return;
        }
        const cancelBtn = e.target.closest('.cancel-edit-btn');
        if (cancelBtn) {
          const card = cancelBtn.closest('.recipe-card');
          if (!card) return;
          // restore values from display (no server call)
          const dispIng = card.querySelector('.display-ingredients').textContent;
          const dispInstr = card.querySelector('.display-instructions').innerHTML.replace(/<br\s*\/?>/g, "\n");
          card.querySelector('.edit-ingredients').value = dispIng.trim();
          card.querySelector('.edit-instructions').value = dispInstr.trim();
          const title = card.querySelector('.recipe-card-title').textContent;
          card.querySelector('.edit-title').value = title.trim();
          card.querySelector('.edit-form').style.display = 'none';
          card.querySelector('.recipe-display').style.display = '';
          return;
        }
        const saveBtn = e.target.closest('.save-edit-btn');
        if (saveBtn) {
          const card = saveBtn.closest('.recipe-card');
          if (!card) return;
          const id = card.getAttribute('data-recipe-id');
          const title = card.querySelector('.edit-title').value.trim();
          const ingredients = card.querySelector('.edit-ingredients').value.trim();
          const instructions = card.querySelector('.edit-instructions').value.trim();
          if (!title) { showToast('Title required','error'); return; }
          // send update via fetch
          fetch('update_recipe.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id: id, title: title, ingredients: ingredients, instructions: instructions })
          }).then(r => r.json()).then(j => {
            if (j && j.success) {
              // update display fields
              card.querySelector('.recipe-card-title').textContent = title;
              card.querySelector('.display-ingredients').textContent = ingredients;
              card.querySelector('.display-instructions').innerHTML = instructions.replace(/\n/g, '<br>');
              card.querySelector('.edit-form').style.display = 'none';
              card.querySelector('.recipe-display').style.display = '';
              showToast('Recipe updated', 'success');
            } else {
              showToast((j && j.error) ? j.error : 'Could not update recipe', 'error');
            }
          }).catch(err => {
            console.error(err);
            showToast('Network error', 'error');
          });
        }
      });
    })();
    </script>
    <?php
}

$stmt->close();
$conn->close();
?>
