// Firebase configuration from google-services.json
const firebaseConfig = {
    apiKey: "AIzaSyDIWizvGK3AxdRELeCRzk7rJ3ONzjT-0Zk",
    authDomain: "mychild-9a4e9.firebaseapp.com",
    databaseURL: "https://mychild-9a4e9-default-rtdb.firebaseio.com",
    projectId: "mychild-9a4e9",
    storageBucket: "mychild-9a4e9.firebasestorage.app",
    messagingSenderId: "636633882504",
    appId: "1:636633882504:android:eb352e61ce9aa7d32a643d"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const milestonesSection = document.getElementById('milestones-section');
const vaccinationsSection = document.getElementById('vaccinations-section');
const navMilestones = document.getElementById('nav-milestones');
const navVaccinations = document.getElementById('nav-vaccinations');

const milestonesList = document.getElementById('milestones-list');
const milestoneModal = document.getElementById('milestone-modal');
const addMilestoneBtn = document.getElementById('add-milestone-btn');
const closeMilestoneBtn = document.querySelector('#milestone-modal .close');
const milestoneForm = document.getElementById('milestone-form');

const vaccinationsList = document.getElementById('vaccinations-list');
const vaccinationModal = document.getElementById('vaccination-modal');
const addVaccinationBtn = document.getElementById('add-vaccination-btn');
const closeVaccinationBtn = document.getElementById('close-vaccination-modal');
const vaccinationForm = document.getElementById('vaccination-form');

const articlesSection = document.getElementById('articles-section');
const articlesList = document.getElementById('articles-list');
const articleModal = document.getElementById('article-modal');
const addArticleBtn = document.getElementById('add-article-btn');
const closeArticleBtn = document.getElementById('close-article-modal');
const articleForm = document.getElementById('article-form');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const ageFilter = document.getElementById('age-filter');
const vaccinationSearch = document.getElementById('vaccination-search');
const articleSearch = document.getElementById('article-search');

let allMilestones = [];
let allVaccinations = [];
let allArticles = [];

// Navigation Logic
navMilestones.onclick = (e) => {
    e.preventDefault();
    showSection('milestones');
};

navVaccinations.onclick = (e) => {
    e.preventDefault();
    showSection('vaccinations');
};

const navArticles = document.getElementById('nav-articles');
navArticles.onclick = (e) => {
    e.preventDefault();
    showSection('articles');
};

function showSection(section) {
    milestonesSection.style.display = section === 'milestones' ? 'block' : 'none';
    vaccinationsSection.style.display = section === 'vaccinations' ? 'block' : 'none';
    articlesSection.style.display = section === 'articles' ? 'block' : 'none';

    navMilestones.classList.toggle('active', section === 'milestones');
    navVaccinations.classList.toggle('active', section === 'vaccinations');
    navArticles.classList.toggle('active', section === 'articles');
}

// Load Milestones
function loadMilestones() {
    db.ref('milestones').on('value', (snapshot) => {
        const data = snapshot.val();
        allMilestones = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        renderMilestones();
    });
}

// Load Vaccinations
function loadVaccinations() {
    db.ref('vaccinations').on('value', (snapshot) => {
        allVaccinations = [];
        snapshot.forEach((childSnapshot) => {
            allVaccinations.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        renderVaccinations();
    });
}

// Load Articles
function loadArticles() {
    db.ref('articles').on('value', (snapshot) => {
        allArticles = [];
        snapshot.forEach((childSnapshot) => {
            allArticles.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        renderArticles();
    });
}

// Render Articles
function renderArticles() {
    const searchTerm = articleSearch.value.toLowerCase();

    const filtered = allArticles.filter(art => {
        const matchesSearch = art.title.toLowerCase().includes(searchTerm) ||
            art.preview.toLowerCase().includes(searchTerm);
        return matchesSearch;
    });

    articlesList.innerHTML = '';

    if (filtered.length === 0) {
        articlesList.innerHTML = '<div class="loader">لا توجد مقالات تطابق البحث</div>';
        return;
    }

    filtered.forEach(art => {
        const card = document.createElement('div');
        card.className = 'milestone-card';
        card.innerHTML = `
            <span class="category-tag">${art.category}</span>
            <h3>${art.title}</h3>
            <p>${art.preview}</p>
            <div class="age-range">
                <i class="fas fa-calendar-alt"></i>
                <span>${art.monthStart} - ${art.monthEnd} شهر</span>
            </div>
            <div class="card-actions">
                <button class="btn-icon btn-edit" onclick="editArticle('${art.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteArticle('${art.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        articlesList.appendChild(card);
    });
}

function editArticle(id) {
    const art = allArticles.find(a => a.id === id);
    if (!art) return;

    document.getElementById('article-id').value = art.id;
    document.getElementById('article-title').value = art.title;
    document.getElementById('article-category').value = art.category;
    document.getElementById('article-monthStart').value = art.monthStart;
    document.getElementById('article-monthEnd').value = art.monthEnd;
    document.getElementById('article-preview').value = art.preview;
    document.getElementById('article-content').value = art.content;

    document.getElementById('article-modal-title').innerText = 'تعديل مقال';
    articleModal.style.display = 'block';
}

function deleteArticle(id) {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
        db.ref('articles/' + id).remove();
    }
}

// Render Milestones
function renderMilestones() {
    const searchTerm = (searchInput.value || "").toLowerCase();
    const cat = categoryFilter.value;
    const age = ageFilter.value;

    const filtered = allMilestones.filter(m => {
        const matchSearch = (m.title || "").toLowerCase().includes(searchTerm) || (m.description || "").toLowerCase().includes(searchTerm);
        const matchCat = cat === 'all' || m.category === cat;
        const matchAge = age === 'all' || (parseInt(age) >= m.monthStart && parseInt(age) <= m.monthEnd);
        return matchSearch && matchCat && matchAge;
    });

    if (filtered.length === 0) {
        milestonesList.innerHTML = '<div class="loader">لا توجد معالم تطابق بحثك</div>';
        return;
    }

    milestonesList.innerHTML = filtered.map(m => `
        <div class="milestone-card">
            <span class="category-tag tag-${(m.category || "").toLowerCase()}">${getCategoryName(m.category)}</span>
            <h3>${m.title}</h3>
            <p>${m.description}</p>
            <div class="age-range">
                <i class="far fa-calendar-alt"></i>
                <span>العمر: من ${m.monthStart} إلى ${m.monthEnd} شهر</span>
            </div>
            <div class="card-actions">
                <button class="btn-icon btn-edit" onclick="editMilestone('${m.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteMilestone('${m.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Render Vaccinations
function renderVaccinations() {
    const searchTerm = (vaccinationSearch.value || "").toLowerCase();

    const filtered = allVaccinations.filter(v => {
        return (v.title || "").toLowerCase().includes(searchTerm) || (v.description || "").toLowerCase().includes(searchTerm);
    });

    if (filtered.length === 0) {
        vaccinationsList.innerHTML = '<div class="loader">لا توجد تلقيحات تطابق بحثك</div>';
        return;
    }

    vaccinationsList.innerHTML = filtered.map(v => `
        <div class="milestone-card">
            <span class="category-tag tag-motor">تلقيح</span>
            <h3>${v.title}</h3>
            <p>${v.description}</p>
            <div class="age-range">
                <i class="fas fa-syringe"></i>
                <span>الموعد: عند عمر ${v.dueMonth} شهر</span>
            </div>
            <div class="card-actions">
                <button class="btn-icon btn-edit" onclick="editVaccination('${v.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteVaccination('${v.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryName(cat) {
    const map = {
        'MOTOR': 'حركي',
        'LANGUAGE': 'لغوي',
        'COGNITIVE': 'معرفي',
        'SOCIAL': 'اجتماعي'
    };
    return map[cat] || cat;
}

// Global functions for inline JS
window.editMilestone = (id) => {
    const m = allMilestones.find(item => item.id === id);
    if (!m) return;
    document.getElementById('milestone-id').value = m.id;
    document.getElementById('title').value = m.title;
    document.getElementById('description').value = m.description;
    document.getElementById('monthStart').value = m.monthStart;
    document.getElementById('monthEnd').value = m.monthEnd;
    document.getElementById('category').value = m.category;
    document.getElementById('modal-title').innerText = 'تعديل المعلم';
    milestoneModal.style.display = 'block';
};

window.deleteMilestone = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
        db.ref(`milestones/${id}`).remove();
    }
};

window.editVaccination = (id) => {
    const v = allVaccinations.find(item => item.id === id);
    if (!v) return;
    document.getElementById('vaccination-id').value = v.id;
    document.getElementById('v-title').value = v.title;
    document.getElementById('v-description').value = v.description;
    document.getElementById('v-dueMonth').value = v.dueMonth;
    document.getElementById('vaccination-modal-title').innerText = 'تعديل اللقاح';
    vaccinationModal.style.display = 'block';
};

window.deleteVaccination = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا اللقاح؟')) {
        db.ref(`vaccinations/${id}`).remove();
    }
};

window.editArticle = (id) => {
    const art = allArticles.find(item => item.id === id);
    if (!art) return;
    document.getElementById('article-id').value = art.id;
    document.getElementById('article-title').value = art.title;
    document.getElementById('article-category').value = art.category;
    document.getElementById('article-monthStart').value = art.monthStart;
    document.getElementById('article-monthEnd').value = art.monthEnd;
    document.getElementById('article-preview').value = art.preview;
    document.getElementById('article-content').value = art.content;
    document.getElementById('article-modal-title').innerText = 'تعديل المقال';
    articleModal.style.display = 'block';
};

window.deleteArticle = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
        db.ref(`articles/${id}`).remove();
    }
};

// Event Listeners
addMilestoneBtn.onclick = () => {
    milestoneForm.reset();
    document.getElementById('milestone-id').value = '';
    document.getElementById('modal-title').innerText = 'إضافة معلم جديد';
    milestoneModal.style.display = 'block';
};

addVaccinationBtn.onclick = () => {
    vaccinationForm.reset();
    document.getElementById('vaccination-id').value = '';
    document.getElementById('vaccination-modal-title').innerText = 'إضافة لقاح جديد';
    vaccinationModal.style.display = 'block';
};

closeMilestoneBtn.onclick = () => milestoneModal.style.display = 'none';
closeVaccinationBtn.onclick = () => vaccinationModal.style.display = 'none';

window.onclick = (event) => {
    if (event.target == milestoneModal) milestoneModal.style.display = 'none';
    if (event.target == vaccinationModal) vaccinationModal.style.display = 'none';
    if (event.target == articleModal) articleModal.style.display = 'none';
};

if (articleSearch) articleSearch.oninput = renderArticles;

if (addArticleBtn) {
    addArticleBtn.onclick = () => {
        if (articleForm) articleForm.reset();
        const idField = document.getElementById('article-id');
        const titleField = document.getElementById('article-modal-title');
        if (idField) idField.value = '';
        if (titleField) titleField.value = 'إضافة مقال جديد';
        if (articleModal) articleModal.style.display = 'block';
    };
}

if (closeArticleBtn) {
    closeArticleBtn.onclick = () => {
        if (articleModal) articleModal.style.display = 'none';
    };
}

milestoneForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('milestone-id').value;
    const data = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        monthStart: parseInt(document.getElementById('monthStart').value),
        monthEnd: parseInt(document.getElementById('monthEnd').value),
        category: document.getElementById('category').value
    };
    id ? db.ref(`milestones/${id}`).update(data) : db.ref('milestones').push(data);
    milestoneModal.style.display = 'none';
};

vaccinationForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('vaccination-id').value;
    const data = {
        title: document.getElementById('v-title').value,
        description: document.getElementById('v-description').value,
        dueMonth: parseInt(document.getElementById('v-dueMonth').value)
    };
    id ? db.ref(`vaccinations/${id}`).update(data) : db.ref('vaccinations').push(data);
    vaccinationModal.style.display = 'none';
};

articleForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('article-id').value;
    const data = {
        title: document.getElementById('article-title').value,
        category: document.getElementById('article-category').value,
        monthStart: parseInt(document.getElementById('article-monthStart').value),
        monthEnd: parseInt(document.getElementById('article-monthEnd').value),
        preview: document.getElementById('article-preview').value,
        content: document.getElementById('article-content').value
    };
    id ? db.ref(`articles/${id}`).update(data) : db.ref('articles').push(data);
    articleModal.style.display = 'none';
};

searchInput.oninput = renderMilestones;
categoryFilter.onchange = renderMilestones;
ageFilter.onchange = renderMilestones;
vaccinationSearch.oninput = renderVaccinations;
if (articleSearch) articleSearch.oninput = renderArticles;

// Start app
loadMilestones();
loadVaccinations();
loadArticles();
