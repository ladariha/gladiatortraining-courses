// gladiator_social_images

function renderSocialImages(images) {
    var container = document.getElementById('gladiator_social_images');
    if (!container) return;

    if (!images || !images.length) {
        container.innerHTML = '<p>Žádné obrázky k zobrazení.</p>';
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
        return safe ? '<img src="' + safe + '" alt="Facebook photo" />' : '';
    }).join('');

    var html = '<style>'
        + '#gladiator_social_images {'
        + '    display: flex;'
        + '    flex-wrap: wrap;'
        + '    gap: 8px;'
        + '}'
        + '#gladiator_social_images img {'
        + '    max-width: 100%;'
        + '    height: auto;'
        + '    display: block;'
        + '}'
        + '</style>'
        + imgTags;

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('gladiator_social_images');
    if (!container) return;
    var images = window.GladiatortrainingSocialImages;
    if (!images || !images.length) {
        container.innerHTML = '<p>Žádné obrázky k zobrazení.</p>';
        return;
    }
    renderSocialImages(images);
});
