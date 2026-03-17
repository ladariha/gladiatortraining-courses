(function( $ ) {
	'use strict';
	/**
	 * All of the code for your public-facing JavaScript source
	 * should reside in this file.
	 *
	 * Note: It has been assumed you will write jQuery code here, so the
	 * $ function reference has been prepared for usage within the scope
	 * of this function.
	 *
	 * This enables you to define handlers, for when the DOM is ready:
	 *
	 * $(function() {
	 *
	 * });
	 *
	 * When the window is loaded:
	 *
	 * $( window ).load(function() {
	 *
	 * });
	 *
	 * ...and/or other possibilities.
	 *
	 * Ideally, it is not considered best practise to attach more than a
	 * single DOM-ready or window-load handler for a particular page.
	 * Although scripts in the WordPress core, Plugins and Themes may be
	 * practising this, we should strive to set a better example in our own work.
	 */

	// gladiatortraining_courses_app

const DAY_NAMES = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
const MONTH_NAMES = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

window.renderTimetable = function (data) {

    const toMinutes = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const formatTime = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    const filtered = data.filter(e => !e.name.startsWith('Pronájem'));

    const grouped = {};
    filtered.forEach(event => {
        if (!grouped[event.start_day]) grouped[event.start_day] = [];
        grouped[event.start_day].push(event);
    });

    const days = Object.keys(grouped).sort();

    let minMin = Infinity, maxMin = 0;
    filtered.forEach(e => {
        minMin = Math.min(minMin, toMinutes(e.start_time));
        maxMin = Math.max(maxMin, toMinutes(e.end_time));
    });
    minMin = Math.floor(minMin / 30) * 30;
    maxMin = Math.ceil(maxMin / 30) * 30;
    const numSlots = (maxMin - minMin) / 30;

    // Row 1 = header, rows 2..numSlots+1 = time slots
    // Col 1 = time labels, cols 2..days.length+1 = days
    let items = '';

    // Corner
    items += `<div class="gt-corner" style="grid-column:1;grid-row:1;"></div>`;

    // Day headers
    days.forEach((day, di) => {
        const date = new Date(day + 'T00:00:00');
        items += `<div class="gt-col-header" style="grid-column:${di + 2};grid-row:1;">
            <span class="gt-day-name">${DAY_NAMES[date.getDay()]}</span>
            <span class="gt-day-date">${date.getDate()}. ${MONTH_NAMES[date.getMonth()]}</span>
        </div>`;
    });

    // Time labels + background cells
    for (let i = 0; i < numSlots; i++) {
        const row = i + 2;
        items += `<div class="gt-time-label" style="grid-column:1;grid-row:${row};">${formatTime(minMin + i * 30)}</div>`;
        days.forEach((_, di) => {
            items += `<div class="gt-cell-bg" style="grid-column:${di + 2};grid-row:${row};"></div>`;
        });
    }

    // Events
    filtered.forEach(event => {
        const dayIdx = days.indexOf(event.start_day);
        if (dayIdx === -1) return;
        const startSlot = (toMinutes(event.start_time) - minMin) / 30;
        const span = (toMinutes(event.end_time) - toMinutes(event.start_time)) / 30;
        const col = dayIdx + 2;
        const row = startSlot + 2;
        const instructor = event.instructor ? `<span class="gt-event-instructor">${event.instructor}</span>` : '';
        items += `<div class="gt-event" style="grid-column:${col};grid-row:${row}/span ${span};">
            <span class="gt-event-name">${event.name}</span>
            ${instructor}
            <span class="gt-event-time">${event.start_time} – ${event.end_time}</span>
        </div>`;
    });

    document.getElementById("gladiatortraining_courses_app_content").innerHTML = `
    <style>
        #gladiatortraining_courses_app {
            font-family: 'Open Sans', sans-serif;
            font-size: 14px;
            color: #333;
        }
        .gt-timetable {
            display: grid;
            grid-template-columns: 56px repeat(${days.length}, 1fr);
            grid-template-rows: auto repeat(${numSlots}, 40px);
            border-left: 1px solid #e2e2e2;
            border-top: 1px solid #e2e2e2;
        }
        .gt-corner {
            background: #f7f7f7;
            border-right: 1px solid #e2e2e2;
            border-bottom: 1px solid #e2e2e2;
        }
        .gt-col-header {
            background: #2ea3f2;
            color: #fff;
            padding: 8px 6px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            border-right: 1px solid #1a8fd1;
            border-bottom: 1px solid #e2e2e2;
        }
        .gt-day-name {
            font-family: 'Oswald', sans-serif;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .gt-day-date {
            font-size: 11px;
            opacity: 0.9;
        }
        .gt-time-label {
            background: #f7f7f7;
            font-size: 11px;
            color: #999;
            padding: 4px 6px 0;
            text-align: right;
            border-right: 1px solid #e2e2e2;
            border-bottom: 1px solid #eee;
        }
        .gt-cell-bg {
            border-right: 1px solid #e2e2e2;
            border-bottom: 1px solid #eee;
        }
        .gt-event {
            background: #2ea3f2;
            color: #fff;
            margin: 2px;
            border-radius: 3px;
            padding: 4px 6px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 2px;
            overflow: hidden;
            z-index: 1;
            box-sizing: border-box;
        }
        .gt-event-name {
            font-family: 'Oswald', sans-serif;
            font-weight: 500;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            line-height: 1.2;
        }
        .gt-event-instructor {
            font-size: 10px;
            opacity: 0.85;
        }
        .gt-event-time {
            font-size: 10px;
            font-weight: 600;
            opacity: 0.9;
        }
    </style>
    <div class="gt-timetable">${items}</div>`;
}



})( jQuery );
