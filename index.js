import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your verified Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3wZ7RvG-y34zZH7iCYEXrbubqosDddQY",
  authDomain: "sports-slot-live.firebaseapp.com",
  databaseURL: "https://sportslot-live-default-rtdb.firebaseio.com", 
  projectId: "sports-slot-live",
  storageBucket: "sports-slot-live.appspot.com",
  messagingSenderId: "141052035870",
  appId: "1:141052035870:web:dcb9dafc2a03de5dd3ff0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const categories = {
    "Badminton": ["Court 1", "Court 2"],
    "TT": ["Table A", "Table B"],
    "Swimming": ["Slot A", "Slot B"]
};

let systemData = [];

// 1. Listen for Live Data from Cloud
onValue(ref(db, 'bookings/'), (snapshot) => {
    const data = snapshot.val();
    systemData = data ? Object.values(data) : [];
    renderBoard();
});

// 2. Admin Login Logic
document.getElementById('roleSelect').addEventListener('change', (e) => {
    if (e.target.value === 'admin') {
        const pass = prompt("Enter Admin Password:");
        if (pass === "123456789") {
            toggleInterface('admin');
        } else {
            alert("Access Denied!");
            e.target.value = 'user';
            toggleInterface('user');
        }
    } else {
        toggleInterface('user');
    }
});

function toggleInterface(role) {
    const adminTime = document.getElementById('adminTimeControl');
    const userSection = document.getElementById('userSection');
    const tableHeader = document.getElementById('tableHeader');

    tableHeader.innerHTML = `<th>Time</th><th>Facility</th><th>Category</th><th>Status</th><th>Member Name</th>`;

    if (role === 'admin') {
        adminTime.classList.remove('hidden');
        userSection.classList.add('hidden');
        tableHeader.innerHTML += `<th>Contact</th><th>Action</th>`;
    } else {
        adminTime.classList.add('hidden');
        userSection.classList.remove('hidden');
    }
    renderBoard();
}

// 3. Render the Dashboard
function renderBoard() {
    const list = document.getElementById('memberList');
    const role = document.getElementById('roleSelect').value;
    const currentHour = parseInt(document.getElementById('manualHour').value);
    list.innerHTML = '';

    const facilities = ["Badminton", "TT", "Swimming"];
    const times = ["18:00", "19:00", "20:00"];

    facilities.forEach(f => {
        categories[f].forEach(cat => {
            times.forEach(t => {
                const booking = systemData.find(d => d.time === t && d.sport === f && d.category === cat);
                const hour = parseInt(t);
                let status = 'empty', rowClass = 'row-empty', statusLabel = 'AVAILABLE';

                if (booking) {
                    if (currentHour === hour) { status = 'playing'; rowClass = 'row-playing'; statusLabel = 'PLAYING'; }
                    else if (currentHour < hour) { status = 'booked'; rowClass = 'row-booked'; statusLabel = 'BOOKED'; }
                }

                let rowHTML = `<tr class="${rowClass}">
                    <td>${t}</td><td>${f}</td><td>${cat}</td>
                    <td class="status-txt ${status}-txt">${statusLabel}</td>
                    <td>${booking ? booking.member : '—'}</td>`;

                if (role === 'admin') {
                    rowHTML += `<td>${booking ? booking.phone : '—'}</td>`;
                    rowHTML += `<td>${booking ? `<button class="del-btn" onclick="deleteBooking('${t}','${f}','${cat}')">Cancel</button>` : '—'}</td>`;
                }
                list.innerHTML += rowHTML + `</tr>`;
            });
        });
    });
}

// 4. Send Data to Firebase
document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const time = document.getElementById('slotTime').value;
    const sport = document.getElementById('sport').value;
    const category = document.getElementById('category').value;
    const slotId = `${time}-${sport}-${category}`.replace(/\s+/g, '');

    set(ref(db, 'bookings/' + slotId), {
        time, sport, category,
        member: document.getElementById('name').value,
        phone: document.getElementById('phone').value
    });
    e.target.reset();
    alert("Booking Submitted Successfully!");
});

// 5. Delete Data from Firebase
window.deleteBooking = (t, s, c) => {
    const slotId = `${t}-${s}-${c}`.replace(/\s+/g, '');
    if(confirm("Confirm Cancellation?")) {
        remove(ref(db, 'bookings/' + slotId));
    }
};

// Initialization
document.getElementById('sport').addEventListener('change', updateCats);
function updateCats() {
    const s = document.getElementById('sport').value;
    document.getElementById('category').innerHTML = categories[s].map(c => `<option value="${c}">${c}</option>`).join('');
}
document.getElementById('manualHour').addEventListener('input', renderBoard);
updateCats();
renderBoard();
