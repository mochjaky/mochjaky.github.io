import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc, setDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Check authentication
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        document.body.style.visibility = "visible";
        document.getElementById('admin-email').innerText = user.email;
        loadAdminProjects();
        loadAdminExperiences();
        loadAdminProfile();
    }
});

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    });
});

/* ================= TAB SYSTEM ================= */
const tabBtns = document.querySelectorAll('.admin-tab-btn');
const adminSections = document.querySelectorAll('.admin-section');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        adminSections.forEach(s => s.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

/* ================= IMAGE UPLOAD UTILITIES ================= */
const compressImage = (file, maxWidth = 900, maxHeight = 900, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const setupImageUploader = (fileInputId, textInputId, previewContainerId, previewImgId) => {
    const fileInput = document.getElementById(fileInputId);
    const textInput = document.getElementById(textInputId);
    const previewContainer = document.getElementById(previewContainerId);
    const previewImg = document.getElementById(previewImgId);

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedDataUrl = await compressImage(file);
                    textInput.value = compressedDataUrl;
                    previewImg.src = compressedDataUrl;
                    previewContainer.style.display = 'block';
                } catch (err) {
                    console.error(err);
                    alert("Gagal membaca file gambar!");
                }
            }
        });
    }

    if (textInput) {
        textInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val !== '') {
                previewImg.src = val;
                previewContainer.style.display = 'block';
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }
};

// Initialize uploaders
setupImageUploader('project-img-file', 'project-img', 'project-img-preview-container', 'project-img-preview');
setupImageUploader('prof-img-file', 'prof-img', 'prof-img-preview-container', 'prof-img-preview');

/* ================= PROJECTS CRUD ================= */
const projectForm = document.getElementById('project-form');
const projectList = document.getElementById('project-list');
let isEditingProject = false;
let rawProjectsList = [];
let rawExperiencesList = [];

const renderFilteredProjectsTable = () => {
    const search = document.getElementById('project-search')?.value.toLowerCase().trim() || '';
    const cat = document.getElementById('project-filter-cat')?.value || 'all';
    const sort = document.getElementById('project-sort')?.value || 'newest';

    let filtered = [...rawProjectsList].filter(proj => {
        const matchesCat = (cat === 'all') || (proj.category === cat);
        const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(' ') : (proj.technologies || '');
        const matchesSearch = !search || 
            proj.title.toLowerCase().includes(search) || 
            (proj.description && proj.description.toLowerCase().includes(search)) ||
            techStr.toLowerCase().includes(search);
        return matchesCat && matchesSearch;
    });

    if (sort === 'az') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'za') {
        filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === 'oldest') {
        filtered.reverse();
    }

    if (filtered.length === 0) {
        projectList.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-color-light); padding: 1.5rem;">Tidak ada data project yang sesuai.</td></tr>`;
        return;
    }

    let html = '';
    filtered.forEach((data) => {
        html += `
        <tr>
            <td><img src="${data.imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td>${data.title}</td>
            <td><span style="font-size: 0.8rem; background: var(--first-color); padding: 2px 6px; border-radius: 4px;">${(data.category || 'web').toUpperCase()}</span></td>
            <td>
                <button class="action-btn btn-edit" onclick="editProject('${data.id}')"><i class='bx bx-edit'></i></button>
                <button class="action-btn btn-delete" onclick="deleteProject('${data.id}')"><i class='bx bx-trash'></i></button>
            </td>
        </tr>
        `;
    });
    projectList.innerHTML = html;
};

const loadAdminProjects = async () => {
    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            rawProjectsList = [];
            window.adminProjects = [];
            projectList.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2.5rem 1rem;">
                    <p style="color: var(--text-color-light); margin-bottom: 1rem;">Database Firestore masih kosong.</p>
                    <button class="btn btn--small" onclick="seedDefaultData()"><i class='bx bx-cloud-upload'></i> Import 10 Project & Data Bawaan CV</button>
                </td>
            </tr>`;
            return;
        }

        rawProjectsList = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        window.adminProjects = rawProjectsList;
        renderFilteredProjectsTable();
    } catch (error) {
        projectList.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
};

// Event Listeners for Project Filters
document.getElementById('project-search')?.addEventListener('input', renderFilteredProjectsTable);
document.getElementById('project-filter-cat')?.addEventListener('change', renderFilteredProjectsTable);
document.getElementById('project-sort')?.addEventListener('change', renderFilteredProjectsTable);

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const projectData = {
        title: document.getElementById('project-title').value,
        category: document.getElementById('project-category').value,
        description: document.getElementById('project-desc').value,
        technologies: document.getElementById('project-tech').value.split(',').map(item => item.trim()),
        imageUrl: document.getElementById('project-img').value,
        link: document.getElementById('project-link').value
    };
    
    try {
        if (isEditingProject && id) {
            await setDoc(doc(db, "projects", id), projectData, { merge: true });
            alert("Project updated!");
        } else {
            projectData.createdAt = new Date();
            await addDoc(collection(db, "projects"), projectData);
            alert("Project added!");
        }
        resetProjectForm();
        loadAdminProjects();
    } catch (error) {
        alert("Error saving project: " + error.message);
    }
});

window.editProject = (id) => {
    const project = window.adminProjects.find(p => p.id === id);
    if (project) {
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-category').value = project.category;
        document.getElementById('project-desc').value = project.description;
        document.getElementById('project-tech').value = project.technologies.join(', ');
        document.getElementById('project-img').value = project.imageUrl;
        document.getElementById('project-link').value = project.link;
        
        const previewImg = document.getElementById('project-img-preview');
        const previewContainer = document.getElementById('project-img-preview-container');
        if (previewImg && previewContainer && project.imageUrl) {
            previewImg.src = project.imageUrl;
            previewContainer.style.display = 'block';
        }

        isEditingProject = true;
        document.getElementById('project-form-title').innerText = "Edit Project";
        document.getElementById('btn-project-submit').innerText = "Update Project";
        document.getElementById('btn-project-cancel').style.display = "block";
    }
};

window.deleteProject = async (id) => {
    if (confirm("Delete this project?")) {
        await deleteDoc(doc(db, "projects", id));
        loadAdminProjects();
    }
};

document.getElementById('btn-project-cancel').addEventListener('click', () => resetProjectForm());

const resetProjectForm = () => {
    projectForm.reset();
    document.getElementById('project-id').value = "";
    const fileInput = document.getElementById('project-img-file');
    if (fileInput) fileInput.value = "";
    const previewContainer = document.getElementById('project-img-preview-container');
    if (previewContainer) previewContainer.style.display = "none";
    
    isEditingProject = false;
    document.getElementById('project-form-title').innerText = "Add New Project";
    document.getElementById('btn-project-submit').innerText = "Save Project";
    document.getElementById('btn-project-cancel').style.display = "none";
};

/* ================= EXPERIENCE CRUD ================= */
const expForm = document.getElementById('exp-form');
const expList = document.getElementById('exp-list');
let isEditingExp = false;

const renderFilteredExperiencesTable = () => {
    const search = document.getElementById('exp-search')?.value.toLowerCase().trim() || '';
    const sort = document.getElementById('exp-sort')?.value || 'newest';

    let filtered = [...rawExperiencesList].filter(exp => {
        const matchesSearch = !search || 
            exp.company.toLowerCase().includes(search) || 
            exp.role.toLowerCase().includes(search) ||
            (exp.description && exp.description.toLowerCase().includes(search));
        return matchesSearch;
    });

    if (sort === 'az') {
        filtered.sort((a, b) => a.company.localeCompare(b.company));
    } else if (sort === 'za') {
        filtered.sort((a, b) => b.company.localeCompare(a.company));
    } else if (sort === 'oldest') {
        filtered.reverse();
    }

    if (filtered.length === 0) {
        expList.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-color-light); padding: 1.5rem;">Tidak ada data pengalaman yang sesuai.</td></tr>`;
        return;
    }

    let html = '';
    filtered.forEach((data) => {
        html += `
        <tr>
            <td>${data.role}</td>
            <td>${data.company}</td>
            <td>${data.date}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editExperience('${data.id}')"><i class='bx bx-edit'></i></button>
                <button class="action-btn btn-delete" onclick="deleteExperience('${data.id}')"><i class='bx bx-trash'></i></button>
            </td>
        </tr>
        `;
    });
    expList.innerHTML = html;
};

const loadAdminExperiences = async () => {
    try {
        const q = query(collection(db, "experiences"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            rawExperiencesList = [];
            window.adminExperiences = [];
            expList.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2.5rem 1rem;">
                    <p style="color: var(--text-color-light); margin-bottom: 1rem;">Database Firestore masih kosong.</p>
                    <button class="btn btn--small" onclick="seedDefaultData()"><i class='bx bx-cloud-upload'></i> Import Data Pengalaman Bawaan CV</button>
                </td>
            </tr>`;
            return;
        }

        rawExperiencesList = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        window.adminExperiences = rawExperiencesList;
        renderFilteredExperiencesTable();
    } catch (error) {
        expList.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
};

// Event Listeners for Experience Filters
document.getElementById('exp-search')?.addEventListener('input', renderFilteredExperiencesTable);
document.getElementById('exp-sort')?.addEventListener('change', renderFilteredExperiencesTable);

expForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('exp-id').value;
    const expData = {
        company: document.getElementById('exp-company').value,
        role: document.getElementById('exp-role').value,
        date: document.getElementById('exp-date').value,
        description: document.getElementById('exp-desc').value
    };
    
    try {
        if (isEditingExp && id) {
            await setDoc(doc(db, "experiences", id), expData, { merge: true });
            alert("Experience updated!");
        } else {
            expData.createdAt = new Date();
            await addDoc(collection(db, "experiences"), expData);
            alert("Experience added!");
        }
        resetExpForm();
        loadAdminExperiences();
    } catch (error) {
        alert("Error saving experience: " + error.message);
    }
});

window.editExperience = (id) => {
    const exp = window.adminExperiences.find(p => p.id === id);
    if (exp) {
        document.getElementById('exp-id').value = exp.id;
        document.getElementById('exp-company').value = exp.company;
        document.getElementById('exp-role').value = exp.role;
        document.getElementById('exp-date').value = exp.date;
        document.getElementById('exp-desc').value = exp.description;
        
        isEditingExp = true;
        document.getElementById('exp-form-title').innerText = "Edit Experience";
        document.getElementById('btn-exp-submit').innerText = "Update Experience";
        document.getElementById('btn-exp-cancel').style.display = "block";
    }
};

window.deleteExperience = async (id) => {
    if (confirm("Delete this experience?")) {
        await deleteDoc(doc(db, "experiences", id));
        loadAdminExperiences();
    }
};

document.getElementById('btn-exp-cancel').addEventListener('click', () => resetExpForm());

const resetExpForm = () => {
    expForm.reset();
    document.getElementById('exp-id').value = "";
    isEditingExp = false;
    document.getElementById('exp-form-title').innerText = "Add Experience";
    document.getElementById('btn-exp-submit').innerText = "Save Experience";
    document.getElementById('btn-exp-cancel').style.display = "none";
};

/* ================= PROFILE SETTINGS & PHOTO ALIGNMENT ================= */
const profileForm = document.getElementById('profile-form');
const profZoomInput = document.getElementById('prof-img-zoom');
const profPosYInput = document.getElementById('prof-img-pos-y');
const profPosXInput = document.getElementById('prof-img-pos-x');
const profCropBox = document.getElementById('prof-img-crop-box');
const btnResetImgPos = document.getElementById('btn-reset-img-pos');

const updateProfilePreviewStyle = () => {
    const previewImg = document.getElementById('prof-img-preview');
    if (!previewImg) return;

    const zoomVal = parseInt(profZoomInput?.value || 100);
    const posYVal = parseInt(profPosYInput?.value || 50);
    const posXVal = parseInt(profPosXInput?.value || 50);

    const zoom = zoomVal / 100;

    const zoomLabel = document.getElementById('prof-zoom-val');
    const posyLabel = document.getElementById('prof-posy-val');
    const posxLabel = document.getElementById('prof-posx-val');

    if (zoomLabel) zoomLabel.innerText = `${zoomVal}%`;
    if (posyLabel) posyLabel.innerText = `${posYVal}%`;
    if (posxLabel) posxLabel.innerText = `${posXVal}%`;

    previewImg.style.objectFit = 'cover';
    previewImg.style.objectPosition = `${posXVal}% ${posYVal}%`;
    previewImg.style.transform = `scale(${zoom})`;
};

// Event Listeners for Sliders
profZoomInput?.addEventListener('input', updateProfilePreviewStyle);
profPosYInput?.addEventListener('input', updateProfilePreviewStyle);
profPosXInput?.addEventListener('input', updateProfilePreviewStyle);

btnResetImgPos?.addEventListener('click', () => {
    if (profZoomInput) profZoomInput.value = 100;
    if (profPosYInput) profPosYInput.value = 50;
    if (profPosXInput) profPosXInput.value = 50;
    updateProfilePreviewStyle();
});

// Interactive Drag on Crop Box
if (profCropBox) {
    let isDragging = false;
    let startX = 0, startY = 0, startPosX = 50, startPosY = 50;

    const onDragStart = (clientX, clientY) => {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        startPosX = parseInt(profPosXInput?.value || 50);
        startPosY = parseInt(profPosYInput?.value || 50);
        profCropBox.style.cursor = 'grabbing';
    };

    const onDragMove = (clientX, clientY) => {
        if (!isDragging) return;
        const deltaX = (clientX - startX) * 0.35;
        const deltaY = (clientY - startY) * 0.35;

        let newPosX = Math.min(100, Math.max(0, Math.round(startPosX - deltaX)));
        let newPosY = Math.min(100, Math.max(0, Math.round(startPosY - deltaY)));

        if (profPosXInput) profPosXInput.value = newPosX;
        if (profPosYInput) profPosYInput.value = newPosY;
        updateProfilePreviewStyle();
    };

    const onDragEnd = () => {
        if (isDragging) {
            isDragging = false;
            profCropBox.style.cursor = 'grab';
        }
    };

    // Mouse Events
    profCropBox.addEventListener('mousedown', (e) => onDragStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onDragMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onDragEnd);

    // Touch Events for Mobile
    profCropBox.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            onDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
    window.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            onDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
    window.addEventListener('touchend', onDragEnd);
}

const loadAdminProfile = async () => {
    try {
        const docRef = doc(db, "settings", "profile");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            let imgUrl = data.imageUrl || "4x6.jpg.jpeg";
            if (imgUrl === "assets/4x6.jpg.jpeg") imgUrl = "4x6.jpg.jpeg";

            document.getElementById('prof-name').value = data.name || "Moch Jaky Alfiyansyah";
            document.getElementById('prof-roles').value = (data.roles || ["IT Consultant", "Web Developer"]).join(', ');
            document.getElementById('prof-desc').value = data.description || "";
            document.getElementById('prof-img').value = imgUrl;
            document.getElementById('prof-years').value = data.yearsOfExperience || "3";

            const badgeTopInput = document.getElementById('prof-badge-top');
            const badgeBottomInput = document.getElementById('prof-badge-bottom');
            if (badgeTopInput) badgeTopInput.value = data.badgeTopText || "Full-Stack Web Dev";
            if (badgeBottomInput) badgeBottomInput.value = data.badgeBottomText || "3+ Years Exp";

            if (profZoomInput) profZoomInput.value = data.imgZoom || 100;
            if (profPosYInput) profPosYInput.value = data.imgPosY !== undefined ? data.imgPosY : 50;
            if (profPosXInput) profPosXInput.value = data.imgPosX !== undefined ? data.imgPosX : 50;

            const profPreviewImg = document.getElementById('prof-img-preview');
            const profPreviewContainer = document.getElementById('prof-img-preview-container');
            if (profPreviewImg && profPreviewContainer) {
                profPreviewImg.src = imgUrl;
                profPreviewContainer.style.display = 'block';
                profPreviewImg.onerror = () => { profPreviewImg.src = '4x6.jpg.jpeg'; };
                updateProfilePreviewStyle();
            }
        }
    } catch (error) {
        console.error("Error loading profile", error);
    }
};

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const profileData = {
        name: document.getElementById('prof-name').value,
        roles: document.getElementById('prof-roles').value.split(',').map(item => item.trim()),
        description: document.getElementById('prof-desc').value,
        imageUrl: document.getElementById('prof-img').value,
        yearsOfExperience: document.getElementById('prof-years').value,
        badgeTopText: document.getElementById('prof-badge-top')?.value.trim() || "Full-Stack Web Dev",
        badgeBottomText: document.getElementById('prof-badge-bottom')?.value.trim() || "3+ Years Exp",
        imgZoom: parseInt(profZoomInput?.value || 100),
        imgPosY: parseInt(profPosYInput?.value || 50),
        imgPosX: parseInt(profPosXInput?.value || 50)
    };
    
    try {
        const btn = document.getElementById('btn-prof-submit');
        btn.innerText = "Saving...";
        
        await setDoc(doc(db, "settings", "profile"), profileData);
        
        btn.innerText = "Save Profile";
        const msg = document.getElementById('prof-msg');
        msg.style.display = "block";
        setTimeout(() => msg.style.display = "none", 3000);
    } catch (error) {
        alert("Error saving profile: " + error.message);
    }
});

/* ================= ONE-CLICK SEED DATA FUNCTION ================= */
window.seedDefaultData = async () => {
    if (!confirm("Impor data CV bawaan? (Data duplikat lama akan dibersihkan otomatis)")) return;
    
    try {
        const btn = event?.target;
        if (btn) {
            btn.innerText = "Memproses Import...";
            btn.disabled = true;
        }

        // Clean any existing duplicates first
        const projSnap = await getDocs(collection(db, "projects"));
        for (let document of projSnap.docs) {
            await deleteDoc(doc(db, "projects", document.id));
        }

        const expSnap = await getDocs(collection(db, "experiences"));
        for (let document of expSnap.docs) {
            await deleteDoc(doc(db, "experiences", document.id));
        }

        // 1. PROFILE
        await setDoc(doc(db, "settings", "profile"), {
            name: "Moch Jaky Alfiyansyah",
            roles: ["Full-Stack Web Developer", "IT Consultant", "UI/UX Designer"],
            description: "Full-Stack Web Application Developer dengan pengalaman ±3 tahun dalam membangun sistem berbasis web untuk kebutuhan bisnis nyata (POS, HRIS, Marketplace, Corporate Website). Berpengalaman dalam merancang arsitektur database relasional, sistem multi-role, serta pengembangan aplikasi end-to-end.",
            imageUrl: "4x6.jpg.jpeg",
            yearsOfExperience: "3"
        });

        // 2. EXPERIENCES (Fixed IDs prevent duplicate creation)
        const experiences = [
            {
                id: "exp-1",
                company: "PT Metal Al-Hasil",
                role: "Full-Stack Web Developer",
                date: "2026",
                description: "Mengembangkan Sistem POS (Point of Sale) & engine kalkulator harga acuan logam LME (London Metal Exchange) real-time, perancangan arsitektur database relasional, refactor UI/UX responsif, serta manajemen data transaksi & stok.",
                createdAt: new Date()
            },
            {
                id: "exp-2",
                company: "PT Jaka Satria Mandala Putra",
                role: "Direktur Operasional",
                date: "2025",
                description: "Mengelola sistem operasional perusahaan jasa keamanan, menyusun SOP & sistem pembagian tugas personel, koordinasi langsung dengan klien (hotel, apartemen, perumahan), serta menangani laporan resmi, invoice, dan dokumen legal.",
                createdAt: new Date()
            },
            {
                id: "exp-3",
                company: "Freelance",
                role: "Web Developer",
                date: "2022 – Present",
                description: "Mengembangkan berbagai aplikasi & sistem berbasis web (manajemen kos, e-commerce, sistem internal), mendesain UI responsif & meningkatkan UX, serta koordinasi langsung dengan klien menggunakan PHP Native, MySQL, HTML, CSS, JavaScript, & Bootstrap.",
                createdAt: new Date()
            },
            {
                id: "exp-4",
                company: "PT Bina Baru Mandiri",
                role: "IT Consultant",
                date: "2022",
                description: "Mengembangkan & memelihara aplikasi berbasis web internal perusahaan, melakukan analisis kebutuhan sistem & efisiensi operasional, troubleshooting infrastruktur digital, serta konsultasi keamanan IT.",
                createdAt: new Date()
            }
        ];

        for (let exp of experiences) {
            const { id, ...expData } = exp;
            await setDoc(doc(db, "experiences", id), expData);
        }

        // 3. PROJECTS (Fixed IDs)
        const defaultProjects = [
            {
                id: "proj-1",
                title: "Sistem Jurnal Pengeluaran Web",
                category: "system",
                description: "Sistem informasi pencatatan jurnal pengeluaran & keuangan berbasis web dengan fitur RBAC, audit log, dan laporan otomatis.",
                technologies: ["PHP Native", "MySQL", "RBAC", "Bootstrap"],
                imageUrl: "assets/img/sistem_jurnal.png",
                link: "#",
                createdAt: new Date()
            },
            {
                id: "proj-2",
                title: "MetalHasil POS & Price Calculator",
                category: "system",
                description: "Point of Sale (POS) dan engine kalkulator estimasi harga acuan logam LME (London Metal Exchange) real-time.",
                technologies: ["PHP", "MySQL", "LME Price Engine", "Bootstrap"],
                imageUrl: "assets/img/metalhasil_pos.png",
                link: "https://metalhasil.my.id/",
                createdAt: new Date()
            },
            {
                id: "proj-3",
                title: "TMS Fleet & Vehicle Management",
                category: "system",
                description: "Transport Management System (TMS) pengawasan armada kendaraan, integrasi GPS tracking real-time & geofencing.",
                technologies: ["PHP", "MySQL", "GPS API", "Geofencing Engine"],
                imageUrl: "assets/img/tms_fleet.png",
                link: "#",
                createdAt: new Date()
            },
            {
                id: "proj-4",
                title: "TMS Driver Companion App",
                category: "web",
                description: "Aplikasi mobile/web pendamping driver armada untuk pencatatan perjalanan, Proof of Delivery (POD), & rute pengiriman.",
                technologies: ["JavaScript PWA", "REST API", "Geolocation"],
                imageUrl: "assets/img/tms_fleet.png",
                link: "#",
                createdAt: new Date()
            },
            {
                id: "proj-5",
                title: "Smart Agriculture Drone System",
                category: "system",
                description: "Sistem pemantauan & manajemen operasional drone pertanian untuk penjadwalan penerbangan & analitik tanaman.",
                technologies: ["PHP MVC", "MySQL", "Custom Dashboard"],
                imageUrl: "assets/img/drone_agri.png",
                link: "#",
                createdAt: new Date()
            },
            {
                id: "proj-6",
                title: "OpenTrip Seribu Travel & E-Ticket",
                category: "web",
                description: "Platform booking paket wisata Open Trip Pulau Seribu terintegrasi Payment Gateway Midtrans & e-Tiket otomatis.",
                technologies: ["PHP", "MySQL", "Midtrans API", "Cron Reminder"],
                imageUrl: "assets/img/opentrip_seribu.png",
                link: "#",
                createdAt: new Date()
            },
            {
                id: "proj-7",
                title: "Kopieine Coffee UMKM ERP System",
                category: "system",
                description: "Sistem ERP terpadu kedai kopi mencakup penggajian, manajemen gudang, keuangan, kurir, & konsinyasi warung.",
                technologies: ["PHP", "MySQL", "Service Worker PWA", "Chart.js"],
                imageUrl: "assets/img/kopieine_erp.png",
                link: "#",
                createdAt: new Date()
            },
            {
                id: "proj-8",
                title: "Kemenag & PT JSMP Security System",
                category: "system",
                description: "Sistem informasi manajemen personel keamanan, pemantauan presensi harian, SOP pengamanan, & laporan cetak.",
                technologies: ["PHP", "MySQL", "PDF/Print Engine"],
                imageUrl: "assets/img/kemenag_security.png",
                link: "#",
                createdAt: new Date()
            },
            {
                id: "proj-9",
                title: "E-Commerce Marketplace Platform",
                category: "web",
                description: "Platform toko online & marketplace dengan fitur katalog produk, keranjang belanja, kalkulasi checkout, & invoice.",
                technologies: ["PHP Native", "MySQL", "Responsive UI"],
                imageUrl: "assets/img/opentrip_seribu.png",
                link: "#",
                createdAt: new Date()
            },
            {
                id: "proj-10",
                title: "Titan Quant Scalping Engine",
                category: "system",
                description: "Engine perdagangan kuantitatif otomatis berbasis Smart Money Concepts (SMC) & strategi scalping otomatis.",
                technologies: ["Quant Engine", "MQL / Algorithmic", "Financial Pipeline"],
                imageUrl: "assets/img/titan_quant.png",
                link: "#",
                createdAt: new Date()
            }
        ];

        for (let proj of defaultProjects) {
            const { id, ...projData } = proj;
            await setDoc(doc(db, "projects", id), projData);
        }

        alert("Sukses! Semua data duplikat lama berhasil dibersihkan dan data CV telah diimpor secara rapi.");
        loadAdminProjects();
        loadAdminExperiences();
        loadAdminProfile();
    } catch (err) {
        alert("Gagal mengimpor data: " + err.message);
    } finally {
        if (event?.target) {
            event.target.innerText = "Import Sample Data";
            event.target.disabled = false;
        }
    }
};

/* ================= CLEAN DUPLICATES ONLY ================= */
window.cleanDuplicateData = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua data yang terduplikasi (nama/judul yang sama)?")) return;
    
    try {
        let deletedCount = 0;

        // 1. Clean Duplicate Projects by Title
        const projSnap = await getDocs(collection(db, "projects"));
        const seenTitles = new Map();
        
        for (let document of projSnap.docs) {
            const data = document.data();
            const titleKey = (data.title || "").trim().toLowerCase();
            
            if (titleKey && seenTitles.has(titleKey)) {
                await deleteDoc(doc(db, "projects", document.id));
                deletedCount++;
            } else if (titleKey) {
                seenTitles.set(titleKey, document.id);
            }
        }

        // 2. Clean Duplicate Experiences by Role + Company
        const expSnap = await getDocs(collection(db, "experiences"));
        const seenExps = new Map();
        
        for (let document of expSnap.docs) {
            const data = document.data();
            const expKey = `${(data.company || "").trim().toLowerCase()}_${(data.role || "").trim().toLowerCase()}`;
            
            if (expKey && seenExps.has(expKey)) {
                await deleteDoc(doc(db, "experiences", document.id));
                deletedCount++;
            } else if (expKey) {
                seenExps.set(expKey, document.id);
            }
        }

        if (deletedCount > 0) {
            alert(`Sukses! ${deletedCount} data duplikat berhasil dibersihkan.`);
        } else {
            alert("Database bersih! Tidak ditemukan data duplikat.");
        }

        loadAdminProjects();
        loadAdminExperiences();
    } catch (err) {
        alert("Gagal membersihkan duplikat: " + err.message);
    }
};
