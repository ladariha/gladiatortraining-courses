// gladiatortraining_courses_app

const DAY_NAMES = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
const MONTH_NAMES = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

function renderTimetable(data) {
    const grouped = {};
    data.forEach(event => {
        if (!grouped[event.start_day]) grouped[event.start_day] = [];
        grouped[event.start_day].push(event);
    });

    const days = Object.keys(grouped).sort();

    const html = days.map(day => {
        const date = new Date(day + 'T00:00:00');
        const dayName = DAY_NAMES[date.getDay()];
        const dayNum = date.getDate();
        const monthName = MONTH_NAMES[date.getMonth()];

        const events = grouped[day].map(event => {
            const instructor = event.instructor
                ? `<span class="gt-event-instructor">${event.instructor}</span>`
                : '';
            return `
            <div class="gt-event">
                <div class="gt-event-time">${event.start_time} – ${event.end_time}</div>
                <div class="gt-event-info">
                    <span class="gt-event-name">${event.name}</span>
                    ${instructor}
                </div>
            </div>`;
        }).join('');

        return `
        <div class="gt-day">
            <div class="gt-day-header">
                <span class="gt-day-name">${dayName}</span>
                <span class="gt-day-date">${dayNum}. ${monthName}</span>
            </div>
            <div class="gt-events">${events}</div>
        </div>`;
    }).join('');

    return `
    <style>
        #gladiatortraining_courses_app {
            font-family: 'Open Sans', sans-serif;
            font-size: 14px;
            color: #333;
            max-width: 1080px;
            margin: 0 auto;
        }
        .gt-day {
            margin-bottom: 24px;
            border: 1px solid #e2e2e2;
            border-radius: 3px;
            overflow: hidden;
        }
        .gt-day-header {
            background: #2ea3f2;
            color: #fff;
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .gt-day-name {
            font-family: 'Oswald', sans-serif;
            font-weight: 600;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .gt-day-date {
            font-size: 13px;
            opacity: 0.9;
        }
        .gt-event {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            border-bottom: 1px solid #eee;
            gap: 16px;
        }
        .gt-event:last-child {
            border-bottom: none;
        }
        .gt-event-time {
            font-weight: 600;
            color: #2ea3f2;
            white-space: nowrap;
            min-width: 110px;
            font-size: 13px;
        }
        .gt-event-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .gt-event-name {
            font-family: 'Oswald', sans-serif;
            font-weight: 500;
            font-size: 15px;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
        .gt-event-instructor {
            font-size: 12px;
            color: #666;
        }
    </style>
    <div class="gt-timetable">${html}</div>`;
}

document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('gladiatortraining_courses_app');
    if (!container) return;
    const data = window.GladiatortrainingCourses;
    if (!data || !data.length) {
        container.innerHTML = '<p>Žádné události k zobrazení.</p>';
        return;
    }
    container.innerHTML = renderTimetable(data);
});

function renderSocialImages(images) {
    const container = document.getElementById('gladiator_social_images');
    if (!container) return;

    if (!images || !images.length) {
        container.innerHTML = '<p>Žádné obrázky k zobrazení.</p>';
        return;
    }

    const safeSrc = (url) => {
        try {
            const parsed = new URL(url);
            return (parsed.protocol === 'https:' || parsed.protocol === 'http:') ? url : '';
        } catch (e) {
            return '';
        }
    };

    const html = `
    <style>
        #gladiator_social_images {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        #gladiator_social_images img {
            max-width: 100%;
            height: auto;
            display: block;
        }
    </style>
    ` + images.map(src => {
        const safe = safeSrc(src);
        return safe ? `<img src="${safe}" alt="Facebook photo" />` : '';
    }).join('');

    container.innerHTML = html;
}
