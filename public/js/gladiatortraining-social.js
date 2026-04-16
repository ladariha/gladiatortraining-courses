// gladiator_social_images

function renderSocialImages(images) {
    var container = document.getElementById('gladiator_social_images');
    if (!container) return;

    if (!images || !images.length) {
        // container.innerHTML = '<p>Žádné obrázky k zobrazení.</p>';
        return;
    }

    var safeSrc = function (url) {
        try {
            var parsed = new URL(url);
            return (parsed.protocol === 'https:' || parsed.protocol === 'http:') ? url : '';
        } catch (e) {
            return '';
        }
    };

    var imgTags = images.map(function (src) {
        var safe = safeSrc(src);
        return safe ? '<a href="https://www.facebook.com/gladiatorskralupy" target="_blank" rel="noopener noreferrer"><img src="' + safe + '" alt="Facebook Gladiator training" /></a>' : '';
    }).join('');

    var html = `
    <style>
    .glsocial-gallery {
  columns: 4 250px; /* 4 columns, or as many as fit with 250px width */
  column-gap: 16px;
  padding-block: 1rem
}

.glsocial-gallery img {
  width: 100%;
  display: block;
  margin-bottom: 16px; /* Space between images vertically */
  border-radius: 8px;
}
    </style>
    <div class="glsocial-gallery">
        ${imgTags}
    </div>`;

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('gladiator_social_images');
    if (!container) return;
    var images = window.GladiatortrainingSocialImages;
    renderSocialImages(images);
});
