
let myPlants = [
    
    { id: 1, name: 'Money Plant', type: 'Climber', status: 'healthy', nextWater: '2 Days' },
    { id: 2, name: 'tulsi', type: 'Medicinal', status: 'thirsty', nextWater: 'Today' }
];
const plantGuide = {
    "Money Plant": {
        advantages: [
            "Improves air quality",
            "Easy to grow",
            "Good for indoor decoration"
        ],
        drawbacks: [
            "Toxic to pets",
            "Needs regular trimming"
        ],
        conditions: "Indirect sunlight, moderate watering"
    },

    "tulsi": {
        advantages: [
            "Medicinal properties",
            "Repels insects",
            "Good for health"
        ],
        drawbacks: [
            "Needs daily sunlight",
            "Sensitive to cold"
        ],
        conditions: "Direct sunlight, daily watering"
    }
};

// Login Logic
function handleLogin(e) {
    const overlay = document.getElementById('loginOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');
        initApp();
    }, 500);
}

function initApp() {
    const savedPlants = localStorage.getItem("plants");
    const savedJournal = localStorage.getItem("journal");
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        document.body.classList.add("dark");
    }

    if (savedPlants) myPlants = JSON.parse(savedPlants);
    if (savedJournal) document.getElementById("journalEntries").innerHTML = savedJournal;

    renderPlants(myPlants);
    updateSmartTips();
    loadPlantOptions();
    startReminder();
    fixOldEntries();
}

// Navigation Tab Logic
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'shadow-sm', 'text-green-700');
        btn.classList.add('text-gray-500');
        if(btn.innerText.toLowerCase().includes(tabId === 'home' ? 'dashboard' : tabId)) {
            btn.classList.add('bg-white', 'shadow-sm', 'text-green-700');
        }
    });
}

// Plant Grid Rendering


    function renderPlants(plantsToRender) {
    const grid = document.getElementById('plantGrid');
    grid.innerHTML = '';

    const statusColors = {
        healthy: 'bg-green-500',
        thirsty: 'bg-yellow-400',
        sick: 'bg-red-500'
    };

   plantsToRender.forEach(plant => {
    const imageContent = plant.image 
        ? `<img src="${plant.image}" class="h-16 w-16 rounded-2xl object-cover shadow-inner">`
        : `<div class="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">🪴</div>`;

    grid.innerHTML += `
        <div onclick="openPlantPage(${plant.id})" class="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 plant-card flex items-center gap-4 cursor-pointer">
            ${imageContent}
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h4 class="font-bold text-lg text-gray-800">
                        ${plant.name} <span class="text-xs text-gray-400">(ID: ${plant.id})</span>
                    </h4>
                    <div class="h-3 w-3 rounded-full ${statusColors[plant.status]}"></div>
                </div>
                <p class="text-xs text-gray-400">${plant.type}</p>
                <div class="bg-blue-50 p-2 rounded-lg mt-2 flex justify-between items-center">
                    <span class="text-[10px] font-bold text-blue-600 uppercase">Next Water</span>
                    <span class="text-[10px] font-black text-blue-800">${plant.nextWater}</span>
                </div>
            </div>
        </div>
    `;
});
}

function openPlantPage(plantId) {
    localStorage.setItem("currentPlantId", plantId);
    const plant = myPlants.find(p => p.id == plantId);
    if (!plant) return;
   

            // Get guide data
            let guide = plantGuide[plant.name] || {
                advantages: ["No data available"],
                drawbacks: ["No data available"],
                conditions: "Not specified"
            };


    const journalContainer = document.getElementById('journalEntries');
    const relatedEntries = Array.from(journalContainer.children)
        .filter(entry => entry.querySelector('p.font-bold')?.innerText === plant.name);

    // Build the HTML for plant detail page
    const content = `
    <div id="plantDetailPage" class="max-w-4xl mx-auto p-6 bg-white rounded-3xl shadow-lg">
        <button onclick="closePlantPage()" class="mb-4 text-green-700 font-bold">⬅ Back</button>
        <div class="flex items-center gap-6 mb-4">
            <img src="${plant.image || ''}" class="w-32 h-32 object-cover rounded-2xl bg-green-50" />
            <div>
                <h2 class="text-2xl font-bold text-gray-800">${plant.name}</h2>
                <p class="text-gray-500">Type: ${plant.type}</p>
                <p class="text-gray-500">Status: ${plant.status}</p>
                <p class="text-gray-500">Next Water: ${plant.nextWater}</p>
                <p>Next Water: <span id="nextWaterText">${plant.nextWater}</span></p>

         

                <!-- WATER BUTTON -->
                <button onclick="markWatered()" 
                class="bg-blue-500 text-white px-4 py-2 rounded-lg mt-3">
                💧 Mark as Watered
                </button>

                <!-- DELETE BUTTON -->
                <button onclick="toggleCustomDeleteModal()" 
                class="bg-red-500 text-white px-4 py-2 rounded-lg mt-3">
                🗑 Delete Plant
                </button>
            </div>
        </div>
        <h3 class="text-xl font-bold text-green-700 mb-2">Journal Entries</h3>

        <div class="space-y-4">
            ${relatedEntries.map(e => e.outerHTML).join('') || '<p class="text-gray-500">No entries yet.</p>'}
        </div>
    </div>
    <div class="bg-white p-6 rounded-3xl shadow-sm">

    <h3 class="text-xl font-bold text-green-700 mb-4">
        🌿 Plant Insights
    </h3>

    <!-- ADVANTAGES -->
    <div class="bg-green-50 p-4 rounded-xl mb-3">
        <h4 class="font-bold text-green-700">✅ Advantages</h4>
        <ul class="text-sm text-gray-600 mt-2">
            ${guide.advantages.map(a => `<li>• ${a}</li>`).join("")}
        </ul>
    </div>

    <!-- DRAWBACKS -->
    <div class="bg-red-50 p-4 rounded-xl mb-3">
        <h4 class="font-bold text-red-600">❌ Drawbacks</h4>
        <ul class="text-sm text-gray-600 mt-2">
            ${guide.drawbacks.map(d => `<li>• ${d}</li>`).join("")}
        </ul>
    </div>

    <!-- CONDITIONS -->
    <div class="bg-blue-50 p-4 rounded-xl">
        <h4 class="font-bold text-blue-600">🌞 Best Conditions</h4>
        <p class="text-sm text-gray-600 mt-2">
            ${guide.conditions}
        </p>
    </div>

</div>
    `;
    
    

    // Hide main app content and show plant detail
    const mainContent = document.querySelector('main');
    mainContent.style.display = 'none';
    
    const plantDetailContainer = document.createElement('div');
    plantDetailContainer.id = 'plantDetailContainer';
    plantDetailContainer.innerHTML = content;
    document.getElementById('appContent').appendChild(plantDetailContainer);

}

// OPEN / CLOSE MODAL
function toggleCustomDeleteModal() {
    document.getElementById("customDeleteModal").classList.toggle("hidden");
}

function closePlantPage() {
    const detailPage = document.getElementById('plantDetailContainer');
    if (detailPage) detailPage.remove();
    
    const mainContent = document.querySelector('main');
    mainContent.style.display = 'block';
}


// Plant Search
function filterPlants() {
    const term = document.getElementById('plantSearch').value.toLowerCase();
    const filtered = myPlants.filter(p => 
        p.name.toLowerCase().includes(term)
    );
    renderPlants(filtered);
}

// Smart Tips Generator
function updateSmartTips() {
    const hour = new Date().getHours();
    const greeting = document.getElementById('greetingText');
    const tip = document.getElementById('smartTip');

    if(hour < 12) {
        greeting.innerText = "Good Morning, Grower!";
        tip.innerText = "Early morning is the best time to water—less evaporation!";
    } else {
        greeting.innerText = "Good Evening, Planter!";
        tip.innerText = "Check for pests tonight. Many come out after dark.";
    }
}

// Journal System
async function addJournalEntry() {
    const input = document.getElementById('journalInput');
    const plant = document.getElementById('journalPlant').value;
    const mood = document.getElementById('journalMood').value;
    const fileInput = document.getElementById('journalImage');

    if (!input.value) return;

    let imageData = null;

    if (fileInput.files[0]) {
        imageData = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    }

    const container = document.getElementById('journalEntries');
    const date = new Date().toLocaleString();

    const entry =  `
<div class="journal-card bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500 relative">

    <!-- ACTION BUTTONS -->
    <div class="absolute top-2 right-2 flex gap-2">
        <button onclick="editEntry(this)" class="text-blue-500 text-xs font-bold">Edit</button>
        <button onclick="deleteEntry(this)" class="text-red-500 text-xs font-bold">Delete</button>
    </div>

    <p class="text-[10px] text-gray-400">${date}</p>
    <p class="font-bold text-green-700">${plant}</p>
    <p>${mood}</p>
    <p class="entry-text">${input.value}</p>

    ${imageData ? `<img src="${imageData}" class="mt-3 rounded-xl h-40 w-full object-cover">` : ""}
</div>
`;
    

    container.insertAdjacentHTML('afterbegin', entry);
    saveData();
    saveJournalData();
    input.value = '';
    fileInput.value = '';

    updateChart(); // graph update
}

// Modal Toggle
function toggleModal(id) {
    document.getElementById(id).classList.toggle('hidden');
}

// Save New Plant
async function savePlant() {
    const name = document.getElementById('newPlantName').value;
    const status = document.getElementById('newPlantStatus').value;
    const fileInput = document.getElementById('newPlantImage');
    
    if(!name) return;

    let imageData = null;

    // Process the image if one was selected
    if (fileInput.files && fileInput.files[0]) {
        imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    }

    myPlants.push({
        id: Date.now(),
        name: name,
        type: 'New Addition',
        status: status,
        nextWater: 'Soon',
        image: imageData // Store the Base64 string
    });saveData();

    renderPlants(myPlants);
    toggleModal('addPlantModal');
    
    // Clear the file input for next time
    fileInput.value = '';
}
// 1. Toggle between Login and Signup
function toggleAuth() {
    const login = document.getElementById('loginContainer');
    const signup = document.getElementById('signupContainer');
    
    // Animate out current, animate in new
    if (signup.classList.contains('hidden')) {
        // Switch to Signup
        login.classList.add('opacity-0', '-translate-x-8');
        setTimeout(() => {
            login.classList.add('hidden');
            signup.classList.remove('hidden');
            setTimeout(() => signup.classList.remove('opacity-0', 'translate-x-8'), 10);
        }, 300);
    } else {
        // Switch to Login
        signup.classList.add('opacity-0', 'translate-x-8');
        setTimeout(() => {
            signup.classList.add('hidden');
            login.classList.remove('hidden');
            setTimeout(() => login.classList.remove('opacity-0', '-translate-x-8'), 10);
        }, 300);
    }
}

// 2. Handle Signup Validation
function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const pass = document.getElementById('regPass').value;
    const confirm = document.getElementById('regConfirm').value;
    const errorDiv = document.getElementById('signupError');
    const card = document.querySelector('.login-card');

    if (pass !== confirm) {
        errorDiv.innerText = "❌ Passwords don't match!";
        errorDiv.classList.remove('hidden');
        card.classList.add('error-shake');
        setTimeout(() => card.classList.remove('error-shake'), 300);
        return;
    }

    // Success! 
    console.log("Account created for:", name);
    enterApp();
}

// 3. Helper to enter the app (Shared by Login and Signup)
function enterApp() {
    const overlay = document.getElementById('loginOverlay');
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(1.1)';
    setTimeout(() => {
        overlay.classList.add('hidden');
        document.getElementById('appContent').classList.remove('hidden');
        initApp(); // Starts the dashboard logic
    }, 500);
}
// Update your old handleLogin to use the helper
function handleLogin(e) {
    e.preventDefault();
    enterApp();
}
// log out 
function handleLogout() {
    // 1. Clear the persistent login and tab state
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('activeTab');

    // 2. Add a quick fade-out animation to the app content
    const appContent = document.getElementById('appContent');
    const overlay = document.getElementById('loginOverlay');
    
    appContent.style.opacity = '0';
    appContent.style.transition = 'opacity 0.4s ease';

    setTimeout(() => {
        // 3. Swap visibility
        appContent.classList.add('hidden');
        overlay.classList.remove('hidden');
        
        // 4. Reset the overlay appearance
        overlay.style.opacity = '1';
        overlay.style.transform = 'scale(1)';
        
        // 5. Force a reload to ensure all variables are reset to "clean" state
        window.location.reload();
    }, 400);
}

// delete features
// Toggle profile menu
function toggleProfileMenu() {
    const menu = document.getElementById("profileMenu");
    menu.classList.toggle("hidden");
}
function deletePlantById() {
    toggleDeleteModal();


    if (!id) return;

    const index = myPlants.findIndex(p => p.id == id);

    if (index === -1) {
        alert("❌ Plant not found");
        return;
    }

    myPlants.splice(index, 1);
    renderPlants(myPlants);

    alert("✅ Plant deleted successfully");
}
function toggleDeleteModal() {
    document.getElementById("deleteModal").classList.toggle("hidden");
}

function confirmDelete() {
    const id = document.getElementById("deletePlantIdInput").value;

    if (!id) return;

    const index = myPlants.findIndex(p => p.id == id);

    if (index === -1) {
        showCustomAlert("❌ Plant not found");
        return;
    }

    myPlants.splice(index, 1);
    localStorage.setItem("plants", JSON.stringify(myPlants));
    renderPlants(myPlants);

    toggleDeleteModal();
    showCustomAlert("✅ Plant deleted successfully");
}
function showCustomAlert(message) {
    const alertBox = document.createElement("div");

    alertBox.innerHTML = `
        <div class="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg">
            🌿 SproutSpace: ${message}
        </div>
    `;

    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}
// guide extra | Ai suggestion
function generateSuggestion() {
    const suggestionBox = document.getElementById("aiSuggestion");

    suggestionBox.innerText = "🤖 Thinking...";

    setTimeout(() => {
        const suggestions = [
            "🌱 Try growing Spinach — it grows quickly.",
            "🌿 Mint is perfect for balcony gardening.",
            "🍅 Tomato plants need sunlight and water.",
            "🌼 Add Marigold for color.",
            "🌵 Succulents need less water.",
            "🌞 Plants need 4–6 hours sunlight.",
            "💧 Check soil before watering.",
            "🍃 Grow Coriander for kitchen use.",
            "🪴 Use pots with drainage holes.",
            "🌿 Add compost for better growth."
        ];

        const randomIndex = Math.floor(Math.random() * suggestions.length);
        suggestionBox.innerText = suggestions[randomIndex];
    }, 800);
}
// notifictaion
function showNotification(message) {
    const box = document.createElement("div");

    box.innerHTML = `
        <div class="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-xl">
            🌿 ${message}
        </div>
    `;

    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3000);
}
// auto reminder
function startReminder() {
    setInterval(() => {
        showNotification("💧 Reminder: Water your plants!");
    }, 20000);
}

// features in growth journal 
function loadPlantOptions() {
    const select = document.getElementById("journalPlant");
    select.innerHTML = '<option value="">Select Plant</option>';

    myPlants.forEach(p => {
        select.innerHTML += `<option value="${p.name}">${p.name}</option>`;
    });
}
// edit and delete

function deleteEntry(btn) {
    btn.closest(".journal-card").remove();
    saveData(); // update localStorage
}

// Save both plants and journal entries
function saveData() {
    localStorage.setItem("plants", JSON.stringify(myPlants));
    localStorage.setItem("journal", document.getElementById("journalEntries").innerHTML);
}
function editEntry(btn) {
    const entry = btn.closest("div");
    const text = entry.querySelector(".entry-text");

    const newText = prompt("Edit entry:", text.innerText);
    if (newText !== null) {text.innerText = newText;
      saveData();}
}
// search feature
function searchJournal() {
    const term = document.getElementById("journalSearch").value.toLowerCase();
    const entries = document.querySelectorAll("#journalEntries > div");

    entries.forEach(e => {
        e.style.display = e.innerText.toLowerCase().includes(term) ? "block" : "none";
    });
}
// graph
let chart;
let journalCount = 0;

function updateChart() {
    journalCount++;

    const ctx = document.getElementById("growthChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: journalCount}, (_, i) => "Entry " + (i + 1)),
            datasets: [{
                label: "Growth",
                data: Array.from({length: journalCount}, () => Math.floor(Math.random()*10)+1)
            }]
        }
    });
}
// save data
function saveData() {
    localStorage.setItem("plants", JSON.stringify(myPlants));
    localStorage.setItem("journal", document.getElementById("journalEntries").innerHTML);
}
// dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}
// pdf 
function exportPDF() {
    const element = document.getElementById("journalEntries");

    html2pdf().from(element).save("SproutSpace_Journal.pdf");
}

function deleteEntry(btn) {
    // Remove the entry from DOM
    const entryCard = btn.closest(".journal-card");
    entryCard.remove();

    // Update localStorage
    saveJournalData();

    showCustomAlert("✅ Journal entry deleted permanently");
}
// save journal data
function saveJournalData() {
    const container = document.getElementById("journalEntries");
    // Save the entire innerHTML of entries
    localStorage.setItem("journal", container.innerHTML);
}

// fix old entries
function fixOldEntries() {
    const entries = document.querySelectorAll("#journalEntries > div");

    entries.forEach(entry => {

        // If already has buttons, skip
        if (entry.querySelector(".action-buttons")) return;

        // Add class for proper targeting
        entry.classList.add("journal-card");

        // Create buttons
        const actions = document.createElement("div");
        actions.className = "action-buttons absolute top-2 right-2 flex gap-2";

        actions.innerHTML = `
            <button onclick="editEntry(this)" class="text-blue-500 text-xs font-bold">Edit</button>
            <button onclick="deleteEntry(this)" class="text-red-500 text-xs font-bold">Delete</button>
        `;

        entry.appendChild(actions);
    });
}
// water mark
function markWatered() {
    const plantId = localStorage.getItem("currentPlantId");

    let plants = JSON.parse(localStorage.getItem("plants")) || [];
    let plant = plants.find(p => p.id == plantId);

    if (!plant) return;

    // Update next watering (1–3 days random)
    const days = Math.floor(Math.random() * 3) + 1;
    plant.nextWater = days + " Days";

    // Save to localStorage (IMPORTANT)
    localStorage.setItem("plants", JSON.stringify(plants));

    // Update UI
    document.getElementById("nextWaterText").innerText = plant.nextWater;

    showCustomAlert("💧 Plant watered!");
}
// delete curent plant
function confirmDeletePlant() {
    const plantId = localStorage.getItem("currentPlantId");

    let plants = JSON.parse(localStorage.getItem("plants")) || [];

    // Remove plant
    plants = plants.filter(p => p.id != plantId);

    // SAVE (important)
    localStorage.setItem("plants", JSON.stringify(plants));

    showCustomAlert("🗑 Plant deleted successfully!");

    toggleCustomDeleteModal();
    closePlantPage();
    renderPlants(plants);
}
function submitSuggestion() {
    const input = document.getElementById("suggestionInput");
    const msg = document.getElementById("suggestionMsg");

    if (!input.value.trim()) {
        showCustomAlert("⚠️ Please write something!");
        return;
    }

    // Save suggestion in localStorage
    let suggestions = JSON.parse(localStorage.getItem("suggestions")) || [];
    suggestions.push({
        text: input.value,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("suggestions", JSON.stringify(suggestions));

    // Clear input
    input.value = "";

    // Show success message
    msg.classList.remove("hidden");

    setTimeout(() => {
        msg.classList.add("hidden");
    }, 3000);
}