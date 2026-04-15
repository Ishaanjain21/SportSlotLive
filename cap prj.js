const categories = {
    "Badminton": ["Court 1", "Court 2"],
    "TT": ["Table A", "Table B"],
    "Swimming": ["Boys Only", "Girls Only", "Ladies Only", "Family Time"]
};

let systemData = [
    { time: "18:00", sport: "Badminton", category: "Court 1", member: "Arjun Sharma", phone: "9876543210" },
    { time: "19:00", sport: "Swimming", category: "Girls Only", member: "Ananya Iyer", phone: "9000011111" }
];

function handleRoleChange() {
    const roleSelect = document.getElementById('roleSelect');
    const selectedRole = roleSelect.value;

    if (selectedRole === 'admin') {
        const password = prompt("Enter Admin Password:");
        if (password === "123456789") {
            alert("Login Successful");
            toggleInterface('admin');
        } else {
            alert("Incorrect Password!");
            roleSelect.value = 'user';
            toggleInterface('user');
        }
    } else {
        toggleInterface('user');
    }
}

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

function updateCategories() {
    const sport = document.getElementById('sport').value;
    const catSelect = document.getElementById('category');
    catSelect.innerHTML = categories[sport].map(c => `<option value="${c}">${c}</option>`).join('');
}

function deleteBooking(time, sport, category) {
    if(confirm("Are you sure you want to cancel this booking?")) {
        systemData = systemData.filter(d => !(d.time === time && d.sport === sport && d.category === category));
        renderBoard();
    }
}

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
                    if (currentHour === hour) { 
                        status = 'playing'; rowClass = 'row-playing'; statusLabel = 'PLAYING';
                    } else if (currentHour < hour) { 
                        status = 'booked'; rowClass = 'row-booked'; statusLabel = 'BOOKED';
                    }
                }

                let rowHTML = `<tr class="${rowClass}">
                    <td>${t}</td>
                    <td>${f}</td>
                    <td>${cat}</td>
                    <td class="status-txt ${status}-txt">${statusLabel}</td>
                    <td>${(booking && status !== 'empty') ? booking.member : '—'}</td>`;

                if (role === 'admin') {
                    rowHTML += `<td>${booking ? booking.phone : '—'}</td>`;
                    rowHTML += `<td>${booking ? `<button class="del-btn" onclick="deleteBooking('${t}','${f}','${cat}')">Cancel</button>` : '—'}</td>`;
                }
                rowHTML += `</tr>`;
                list.innerHTML += rowHTML;
            });
        });
    });
}

document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const entry = {
        time: document.getElementById('slotTime').value,
        sport: document.getElementById('sport').value,
        category: document.getElementById('category').value,
        member: document.getElementById('name').value,
        phone: document.getElementById('phone').value
    };

    const exists = systemData.some(s => s.time === entry.time && s.sport === entry.sport && s.category === entry.category);
    if (exists) alert("Slot already taken!");
    else {
        systemData.push(entry);
        renderBoard();
        this.reset();
        alert("Booking confirmed!");
    }
});

document.getElementById('manualHour').addEventListener('input', renderBoard);
updateCategories();
toggleInterface('user');