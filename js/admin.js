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

/* ================= PROJECTS CRUD ================= */
const projectForm = document.getElementById('project-form');
const projectList = document.getElementById('project-list');
let isEditingProject = false;

const loadAdminProjects = async () => {
    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            projectList.innerHTML = '<tr><td colspan="4" style="text-align: center;">No projects yet.</td></tr>';
            return;
        }

        let html = '';
        querySnapshot.forEach((document) => {
            const data = document.data();
            html += `
            <tr>
                <td><img src="${data.imageUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${data.title}</td>
                <td><span style="font-size: 0.8rem; background: var(--first-color); padding: 2px 6px; border-radius: 4px;">${data.category.toUpperCase()}</span></td>
                <td>
                    <button class="action-btn btn-edit" onclick="editProject('${document.id}')"><i class='bx bx-edit'></i></button>
                    <button class="action-btn btn-delete" onclick="deleteProject('${document.id}')"><i class='bx bx-trash'></i></button>
                </td>
            </tr>
            `;
        });
        projectList.innerHTML = html;
        window.adminProjects = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (error) {
        projectList.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
};

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
            await updateDoc(doc(db, "projects", id), projectData);
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
    isEditingProject = false;
    document.getElementById('project-form-title').innerText = "Add New Project";
    document.getElementById('btn-project-submit').innerText = "Save Project";
    document.getElementById('btn-project-cancel').style.display = "none";
};

/* ================= EXPERIENCE CRUD ================= */
const expForm = document.getElementById('exp-form');
const expList = document.getElementById('exp-list');
let isEditingExp = false;

const loadAdminExperiences = async () => {
    try {
        const q = query(collection(db, "experiences"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            expList.innerHTML = '<tr><td colspan="4" style="text-align: center;">No experiences yet.</td></tr>';
            return;
        }

        let html = '';
        querySnapshot.forEach((document) => {
            const data = document.data();
            html += `
            <tr>
                <td>${data.role}</td>
                <td>${data.company}</td>
                <td>${data.date}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editExperience('${document.id}')"><i class='bx bx-edit'></i></button>
                    <button class="action-btn btn-delete" onclick="deleteExperience('${document.id}')"><i class='bx bx-trash'></i></button>
                </td>
            </tr>
            `;
        });
        expList.innerHTML = html;
        window.adminExperiences = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (error) {
        expList.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
};

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
            await updateDoc(doc(db, "experiences", id), expData);
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

/* ================= PROFILE SETTINGS ================= */
const profileForm = document.getElementById('profile-form');

const loadAdminProfile = async () => {
    try {
        const docRef = doc(db, "settings", "profile");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('prof-name').value = data.name || "Moch Jaky Alfiyansyah";
            document.getElementById('prof-roles').value = (data.roles || ["IT Consultant", "Web Developer"]).join(', ');
            document.getElementById('prof-desc').value = data.description || "I specialize in creating modern web applications...";
            document.getElementById('prof-img').value = data.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
            document.getElementById('prof-years').value = data.yearsOfExperience || "3";
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
        yearsOfExperience: document.getElementById('prof-years').value
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
