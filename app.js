// Firebase configuration from google-services.json
  const firebaseConfig = {
    apiKey: "AIzaSyCN0nOL5v_5E_w4y6QIZzbdEzTLyOFPouU",
    authDomain: "mychild-8ced5.firebaseapp.com",
    databaseURL: "https://mychild-8ced5-default-rtdb.firebaseio.com",
    projectId: "mychild-8ced5",
    storageBucket: "mychild-8ced5.firebasestorage.app",
    messagingSenderId: "684596289061",
    appId: "1:684596289061:web:df66269b7a72d58f8d69cc",
    measurementId: "G-E8PCJHQJ7P"
  };

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');

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
const navArticles = document.getElementById('nav-articles');
const navDoctors = document.getElementById('nav-doctors');
const doctorsSection = document.getElementById('doctors-section');
const doctorsList = document.getElementById('doctors-list');
const doctorModal = document.getElementById('doctor-modal');
const addDoctorBtn = document.getElementById('add-doctor-btn');
const closeDoctorBtn = document.getElementById('close-doctor-modal');
const doctorForm = document.getElementById('doctor-form');
const doctorSearch = document.getElementById('doctor-search');

const milestoneImageInput = document.getElementById('milestone-image');
const milestoneImageBase64 = document.getElementById('milestone-image-base64');
const milestoneImagePreview = document.getElementById('milestone-image-preview');

const articleImageInput = document.getElementById('article-image');
const articleImageBase64 = document.getElementById('article-image-base64');
const articleImagePreview = document.getElementById('article-image-preview');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const ageFilter = document.getElementById('age-filter');
const vaccinationSearch = document.getElementById('vaccination-search');
const articleSearch = document.getElementById('article-search');

let allMilestones = [];
let allVaccinations = [];
let allArticles = [];
let allDoctors = [];

// Image Compression Helper
function compressImage(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * maxHeight / height);
                    height = maxHeight;
                }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            callback(dataUrl);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// تحقق من حالة المصادقة
auth.onAuthStateChanged((user) => {
    if (user) {
        // المستخدم مسجل الدخول
        showDashboard(user);
        loadData();
    } else {
        // المستخدم غير مسجل الدخول
        showLogin();
    }
});

// تسجيل الدخول
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // إخفاء أي رسالة خطأ سابقة
        loginError.style.display = 'none';
        
        // تسجيل الدخول
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // تم تسجيل الدخول بنجاح
                console.log('تم تسجيل الدخول بنجاح');
            })
            .catch((error) => {
                // عرض رسالة الخطأ
                loginError.textContent = getErrorMessage(error.code);
                loginError.style.display = 'block';
            });
    });
}

// تسجيل الخروج
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                console.log('تم تسجيل الخروج');
            })
            .catch((error) => {
                console.error('خطأ في تسجيل الخروج:', error);
            });
    });
}

// دالة لعرض رسائل الخطأ المترجمة
function getErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'البريد الإلكتروني غير صالح',
        'auth/user-disabled': 'هذا الحساب معطل',
        'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/too-many-requests': 'تم تجاوز عدد محاولات تسجيل الدخول. الرجاء المحاولة لاحقاً'
    };
    
    return messages[errorCode] || 'حدث خطأ في تسجيل الدخول. الرجاء المحاولة مرة أخرى';
}

// إظهار لوحة التحكم
function showDashboard(user) {
    if (loginContainer) loginContainer.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'flex';
    if (userEmailSpan) userEmailSpan.textContent = user.email;
}

// إظهار صفحة تسجيل الدخول
function showLogin() {
    if (loginContainer) loginContainer.style.display = 'flex';
    if (dashboardContainer) dashboardContainer.style.display = 'none';
}

// تحميل جميع البيانات
function loadData() {
    loadMilestones();
    loadVaccinations();
    loadArticles();
    loadDoctors();
}

// Navigation Logic
if (navMilestones) {
    navMilestones.onclick = (e) => {
        e.preventDefault();
        showSection('milestones');
    };
}

if (navVaccinations) {
    navVaccinations.onclick = (e) => {
        e.preventDefault();
        showSection('vaccinations');
    };
}

if (navArticles) {
    navArticles.onclick = (e) => {
        e.preventDefault();
        showSection('articles');
    };
}

if (navDoctors) {
    navDoctors.onclick = (e) => {
        e.preventDefault();
        showSection('doctors');
    };
}

function showSection(section) {
    if (milestonesSection) milestonesSection.style.display = section === 'milestones' ? 'block' : 'none';
    if (vaccinationsSection) vaccinationsSection.style.display = section === 'vaccinations' ? 'block' : 'none';
    if (articlesSection) articlesSection.style.display = section === 'articles' ? 'block' : 'none';
    if (doctorsSection) doctorsSection.style.display = section === 'doctors' ? 'block' : 'none';

    if (navMilestones) navMilestones.classList.toggle('active', section === 'milestones');
    if (navVaccinations) navVaccinations.classList.toggle('active', section === 'vaccinations');
    if (navArticles) navArticles.classList.toggle('active', section === 'articles');
    if (navDoctors) navDoctors.classList.toggle('active', section === 'doctors');
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

// Load Doctors
function loadDoctors() {
    db.ref('pediatricians').on('value', (snapshot) => {
        allDoctors = [];
        snapshot.forEach((childSnapshot) => {
            allDoctors.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        renderDoctors();
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
            ${art.imageUrl ? `<img src="${art.imageUrl}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
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

    if (art.imageUrl) {
        if (articleImageBase64) articleImageBase64.value = art.imageUrl;
        if (articleImagePreview) {
            articleImagePreview.src = art.imageUrl;
            articleImagePreview.style.display = 'block';
        }
    } else {
        if (articleImageBase64) articleImageBase64.value = '';
        if (articleImagePreview) {
            articleImagePreview.src = '';
            articleImagePreview.style.display = 'none';
        }
    }

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
            ${m.imageUrl ? `<img src="${m.imageUrl}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">` : ''}
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
    const videoField = document.getElementById('milestone-video-url');
    if (videoField) videoField.value = m.videoUrl || '';
    
    if (m.imageUrl) {
        if (milestoneImageBase64) milestoneImageBase64.value = m.imageUrl;
        if (milestoneImagePreview) {
            milestoneImagePreview.src = m.imageUrl;
            milestoneImagePreview.style.display = 'block';
        }
    } else {
        if (milestoneImageBase64) milestoneImageBase64.value = '';
        if (milestoneImagePreview) {
            milestoneImagePreview.src = '';
            milestoneImagePreview.style.display = 'none';
        }
    }

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
if (addMilestoneBtn) {
    addMilestoneBtn.onclick = () => {
        if (milestoneForm) milestoneForm.reset();
        const idField = document.getElementById('milestone-id');
        const titleField = document.getElementById('modal-title');
        if (idField) idField.value = '';
        if (titleField) titleField.innerText = 'إضافة معلم جديد';
        
        if (milestoneImageInput) milestoneImageInput.value = '';
        if (milestoneImageBase64) milestoneImageBase64.value = '';
        if (milestoneImagePreview) {
            milestoneImagePreview.src = '';
            milestoneImagePreview.style.display = 'none';
        }
        
        const videoField = document.getElementById('milestone-video-url');
        if (videoField) videoField.value = '';
        
        if (milestoneModal) milestoneModal.style.display = 'block';
    };
}

if (addVaccinationBtn) {
    addVaccinationBtn.onclick = () => {
        if (vaccinationForm) vaccinationForm.reset();
        const idField = document.getElementById('vaccination-id');
        const titleField = document.getElementById('vaccination-modal-title');
        if (idField) idField.value = '';
        if (titleField) titleField.innerText = 'إضافة لقاح جديد';
        if (vaccinationModal) vaccinationModal.style.display = 'block';
    };
}

if (closeMilestoneBtn) closeMilestoneBtn.onclick = () => { if (milestoneModal) milestoneModal.style.display = 'none'; };
if (closeVaccinationBtn) closeVaccinationBtn.onclick = () => { if (vaccinationModal) vaccinationModal.style.display = 'none'; };

window.onclick = (event) => {
    if (milestoneModal && event.target == milestoneModal) milestoneModal.style.display = 'none';
    if (vaccinationModal && event.target == vaccinationModal) vaccinationModal.style.display = 'none';
    if (articleModal && event.target == articleModal) articleModal.style.display = 'none';
    if (doctorModal && event.target == doctorModal) doctorModal.style.display = 'none';
};

if (articleSearch) articleSearch.oninput = renderArticles;

if (addArticleBtn) {
    addArticleBtn.onclick = () => {
        if (articleForm) articleForm.reset();
        const idField = document.getElementById('article-id');
        const titleField = document.getElementById('article-modal-title');
        if (idField) idField.value = '';
        if (titleField) titleField.innerText = 'إضافة مقال جديد';
        
        if (articleImageInput) articleImageInput.value = '';
        if (articleImageBase64) articleImageBase64.value = '';
        if (articleImagePreview) {
            articleImagePreview.src = '';
            articleImagePreview.style.display = 'none';
        }
        
        if (articleModal) articleModal.style.display = 'block';
    };
}

if (closeArticleBtn) {
    closeArticleBtn.onclick = () => {
        if (articleModal) articleModal.style.display = 'none';
    };
}

if (milestoneForm) {
    milestoneForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('milestone-id').value;
        const data = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            monthStart: parseInt(document.getElementById('monthStart').value),
            monthEnd: parseInt(document.getElementById('monthEnd').value),
            category: document.getElementById('category').value,
            imageUrl: typeof milestoneImageBase64 !== 'undefined' && milestoneImageBase64 ? milestoneImageBase64.value || null : null,
            videoUrl: document.getElementById('milestone-video-url') ? document.getElementById('milestone-video-url').value || null : null
        };
        id ? db.ref(`milestones/${id}`).update(data) : db.ref('milestones').push(data);
        if (milestoneModal) milestoneModal.style.display = 'none';
    };
}

if (vaccinationForm) {
    vaccinationForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('vaccination-id').value;
        const data = {
            title: document.getElementById('v-title').value,
            description: document.getElementById('v-description').value,
            dueMonth: parseInt(document.getElementById('v-dueMonth').value)
        };
        id ? db.ref(`vaccinations/${id}`).update(data) : db.ref('vaccinations').push(data);
        if (vaccinationModal) vaccinationModal.style.display = 'none';
    };
}

if (articleForm) {
    articleForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('article-id').value;
        const data = {
            title: document.getElementById('article-title').value,
            category: document.getElementById('article-category').value,
            monthStart: parseInt(document.getElementById('article-monthStart').value),
            monthEnd: parseInt(document.getElementById('article-monthEnd').value),
            preview: document.getElementById('article-preview').value,
            content: document.getElementById('article-content').value,
            imageUrl: typeof articleImageBase64 !== 'undefined' && articleImageBase64 ? articleImageBase64.value || null : null
        };
        id ? db.ref(`articles/${id}`).update(data) : db.ref('articles').push(data);
        if (articleModal) articleModal.style.display = 'none';
    };
}

if (searchInput) searchInput.oninput = renderMilestones;
if (categoryFilter) categoryFilter.onchange = renderMilestones;
if (ageFilter) ageFilter.onchange = renderMilestones;
if (vaccinationSearch) vaccinationSearch.oninput = renderVaccinations;
if (articleSearch) articleSearch.oninput = renderArticles;

if (articleImageInput) {
    articleImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            compressImage(file, 800, 800, 0.7, function(base64String) {
                if (articleImageBase64) articleImageBase64.value = base64String;
                if (articleImagePreview) {
                    articleImagePreview.src = base64String;
                    articleImagePreview.style.display = 'block';
                }
            });
        } else {
            if (articleImageBase64) articleImageBase64.value = '';
            if (articleImagePreview) {
                articleImagePreview.src = '';
                articleImagePreview.style.display = 'none';
            }
        }
    });
}
if (milestoneImageInput) {
    milestoneImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            compressImage(file, 800, 800, 0.7, function(base64String) {
                if (milestoneImageBase64) milestoneImageBase64.value = base64String;
                if (milestoneImagePreview) {
                    milestoneImagePreview.src = base64String;
                    milestoneImagePreview.style.display = 'block';
                }
            });
        } else {
            if (milestoneImageBase64) milestoneImageBase64.value = '';
            if (milestoneImagePreview) {
                milestoneImagePreview.src = '';
                milestoneImagePreview.style.display = 'none';
            }
        }
    });
}



if (addDoctorBtn) {
    addDoctorBtn.onclick = () => {
        if (doctorForm) doctorForm.reset();
        document.getElementById('doctor-id').value = '';
        document.getElementById('doctor-modal-title').innerText = 'إضافة طبيب جديد';
        doctorModal.style.display = 'block';
    };
}

if (closeDoctorBtn) closeDoctorBtn.onclick = () => { doctorModal.style.display = 'none'; };

if (doctorForm) {
    doctorForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('doctor-id').value;
        const data = {
            name: document.getElementById('d-name').value,
            address: document.getElementById('d-address').value,
            latitude: parseFloat(document.getElementById('d-lat').value),
            longitude: parseFloat(document.getElementById('d-lon').value),
            rating: parseFloat(document.getElementById('d-rating').value),
            phoneNumber: document.getElementById('d-phone').value,
            specialty: "Pediatrician"
        };
        id ? db.ref(`pediatricians/${id}`).update(data) : db.ref('pediatricians').push(data);
        doctorModal.style.display = 'none';
    };
}

if (doctorSearch) doctorSearch.oninput = renderDoctors;

function renderDoctors() {
    const searchTerm = (doctorSearch.value || "").toLowerCase();
    const filtered = allDoctors.filter(d => 
        (d.name || "").toLowerCase().includes(searchTerm) || 
        (d.address || "").toLowerCase().includes(searchTerm)
    );

    doctorsList.innerHTML = '';

    if (filtered.length === 0) {
        doctorsList.innerHTML = '<div class="loader">لا توجد نتائج مطابقة</div>';
        return;
    }

    filtered.forEach(d => {
        const card = document.createElement('div');
        card.className = 'milestone-card';
        card.innerHTML = `
            <span class="category-tag tag-motor">طبيب أطفال</span>
            <h3>${d.name}</h3>
            <p>${d.address}</p>
            <div class="age-range">
                <i class="fas fa-star" style="color: #ffc107;"></i>
                <span>التقييم: ${d.rating} | الهاتف: ${d.phoneNumber}</span>
            </div>
            <div class="card-actions">
                <button class="btn-icon btn-edit" onclick="editDoctor('${d.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteDoctor('${d.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        doctorsList.appendChild(card);
    });
}

window.editDoctor = (id) => {
    const d = allDoctors.find(item => item.id === id);
    if (!d) return;
    document.getElementById('doctor-id').value = d.id;
    document.getElementById('d-name').value = d.name;
    document.getElementById('d-address').value = d.address;
    document.getElementById('d-lat').value = d.latitude;
    document.getElementById('d-lon').value = d.longitude;
    document.getElementById('d-rating').value = d.rating;
    document.getElementById('d-phone').value = d.phoneNumber;
    document.getElementById('doctor-modal-title').innerText = 'تعديل بيانات الطبيب';
    doctorModal.style.display = 'block';
};

window.deleteDoctor = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
        db.ref(`pediatricians/${id}`).remove();
    }
};

