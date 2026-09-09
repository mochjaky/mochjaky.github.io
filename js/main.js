import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* =============== SHOW MENU =============== */
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');

if(navToggle){
    navToggle.addEventListener('click', () =>{
        navMenu.classList.add('show-menu')
    })
}

if(navClose){
    navClose.addEventListener('click', () =>{
        navMenu.classList.remove('show-menu')
    })
}

/* =============== REMOVE MENU MOBILE =============== */
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () =>{
    const navMenu = document.getElementById('nav-menu')
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/* =============== CHANGE BACKGROUND HEADER =============== */
const scrollHeader = () =>{
    const header = document.getElementById('header')
    this.scrollY >= 50 ? header.classList.add('scroll-header') 
                       : header.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)

/* =============== PORTFOLIO FILTER =============== */
const filterItems = document.querySelectorAll('.portfolio__item');

filterItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all
        filterItems.forEach(fi => fi.classList.remove('active-portfolio'));
        // Add to clicked
        item.classList.add('active-portfolio');
        
        const filterValue = item.getAttribute('data-filter');
        const cards = document.querySelectorAll('.portfolio__card');
        
        cards.forEach(card => {
            if(filterValue === 'all' || card.classList.contains(filterValue.replace('.',''))) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

/* =============== FETCH PROJECTS FROM FIREBASE =============== */
const loadProjects = async () => {
    const portfolioContainer = document.getElementById('portfolio-container');
    
    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            portfolioContainer.innerHTML = '<p style="text-align:center; width:100%;">No projects found. Add some from the Admin Panel.</p>';
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Format technologies
            const techHtml = data.technologies.map(tech => `<span class="portfolio__tech">${tech.trim()}</span>`).join('');
            
            html += `
            <div class="portfolio__card ${data.category}">
                <img src="${data.imageUrl}" alt="${data.title}" class="portfolio__img">
                <div class="portfolio__data">
                    <span class="portfolio__category">${data.category.toUpperCase()}</span>
                    <h3 class="portfolio__title">${data.title}</h3>
                    <p class="portfolio__description">${data.description}</p>
                    <div class="portfolio__stack">
                        ${techHtml}
                    </div>
                    <a href="${data.link}" target="_blank" class="portfolio__link">
                        View Project <i class='bx bx-link-external'></i>
                    </a>
                </div>
            </div>
            `;
        });
        
        portfolioContainer.innerHTML = html;
        
    } catch (error) {
        console.error("Error loading projects:", error);
        // Show demo projects if firebase is not configured yet
        portfolioContainer.innerHTML = `
            <div class="portfolio__card system">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="MetalHasil POS" class="portfolio__img">
                <div class="portfolio__data">
                    <span class="portfolio__category">SYSTEM</span>
                    <h3 class="portfolio__title">MetalHasil POS</h3>
                    <p class="portfolio__description">Web-Based Point of Sale System untuk manajemen transaksi dan laporan penjualan dengan responsive design.</p>
                    <div class="portfolio__stack">
                        <span class="portfolio__tech">PHP Native</span>
                        <span class="portfolio__tech">MySQL</span>
                        <span class="portfolio__tech">Bootstrap</span>
                    </div>
                    <a href="#" class="portfolio__link">View Project <i class='bx bx-link-external'></i></a>
                </div>
            </div>
            <div class="portfolio__card system">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="HRIS System" class="portfolio__img">
                <div class="portfolio__data">
                    <span class="portfolio__category">SYSTEM</span>
                    <h3 class="portfolio__title">HRIS & Employee Management</h3>
                    <p class="portfolio__description">Sistem manajemen pegawai dengan fitur presensi, shift kerja, dan laporan dengan tracking.</p>
                    <div class="portfolio__stack">
                        <span class="portfolio__tech">PHP</span>
                        <span class="portfolio__tech">MySQL</span>
                        <span class="portfolio__tech">RBAC</span>
                    </div>
                    <a href="#" class="portfolio__link">View Project <i class='bx bx-link-external'></i></a>
                </div>
            </div>
            <div class="portfolio__card web">
                <img src="https://images.unsplash.com/photo-1568044852337-9bcc3378fc3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Document Workflow" class="portfolio__img">
                <div class="portfolio__data">
                    <span class="portfolio__category">WEB</span>
                    <h3 class="portfolio__title">Document Workflow & Approval</h3>
                    <p class="portfolio__description">Sistem manajemen dokumen dengan multi-level approval dan digital signing flow.</p>
                    <div class="portfolio__stack">
                        <span class="portfolio__tech">PHP</span>
                        <span class="portfolio__tech">Workflow Logic</span>
                    </div>
                    <a href="#" class="portfolio__link">View Project <i class='bx bx-link-external'></i></a>
                </div>
            </div>
        `;
    }
};

/* =============== FETCH PROFILE SETTINGS FROM FIREBASE =============== */
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const loadProfile = async () => {
    try {
        const docRef = doc(db, "settings", "profile");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Update Name
            if(data.name) document.querySelector('.home__name').innerText = data.name;
            
            // Update Roles
            if(data.roles && data.roles.length > 0) {
                // simple typewriter text replace for now
                document.querySelector('.typewriter').innerText = data.roles.join(' | ');
            }
            
            // Update Descriptions
            if(data.description) {
                document.querySelector('.home__description').innerText = data.description;
                document.querySelector('.about__description').innerText = data.description;
            }
            
            // Update Image
            if(data.imageUrl) {
                document.getElementById('profile-img').src = data.imageUrl;
            }
            
            // Update Experience Years (the 2nd stat item)
            if(data.yearsOfExperience) {
                const stats = document.querySelectorAll('.stat__number');
                if(stats.length > 1) {
                    stats[1].innerText = data.yearsOfExperience + '+';
                    // Update about box years too
                    document.querySelector('.about__subtitle').innerText = data.yearsOfExperience + '+ Years Working';
                }
            }
        }
    } catch (error) {
        console.error("Error loading profile", error);
    }
};

/* =============== LOAD EXPERIENCE FROM FIREBASE =============== */
const loadExperience = async () => {
    const experienceContainer = document.getElementById('experience-container');
    
    try {
        const q = query(collection(db, "experiences"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            experienceContainer.innerHTML = '<p style="text-align:center; width:100%;">No experiences found. Add some from the Admin Panel.</p>';
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            const exp = doc.data();
            html += `
            <div class="experience__card">
                <h3 class="experience__company">${exp.company}</h3>
                <span class="experience__role">${exp.role}</span>
                <div class="experience__date">
                    <i class='bx bx-calendar'></i> ${exp.date}
                </div>
                <p class="experience__desc">${exp.description}</p>
            </div>
            `;
        });
        experienceContainer.innerHTML = html;
        
    } catch (error) {
        console.error("Error loading experiences:", error);
        // Fallback demo data
        experienceContainer.innerHTML = `
            <div class="experience__card">
                <h3 class="experience__company">PT Jaka Satria Mandala Putra</h3>
                <span class="experience__role">Direktur Operasional</span>
                <div class="experience__date">
                    <i class='bx bx-calendar'></i> 2025 - Present
                </div>
                <p class="experience__desc">Mengelola sistem operasional perusahaan jasa keamanan, menyusun SOP, dan koordinasi langsung dengan klien.</p>
            </div>
            <div class="experience__card">
                <h3 class="experience__company">Freelance</h3>
                <span class="experience__role">Web Developer</span>
                <div class="experience__date">
                    <i class='bx bx-calendar'></i> 2022 - Present
                </div>
                <p class="experience__desc">Mengembangkan sistem berbasis web (manajemen kos, e-commerce, sistem internal). Mendesain UI responsif dengan PHP Native, MySQL, HTML, CSS, JavaScript, Bootstrap.</p>
            </div>
            <div class="experience__card">
                <h3 class="experience__company">PT Bina Baru Mandiri</h3>
                <span class="experience__role">IT Consultant</span>
                <div class="experience__date">
                    <i class='bx bx-calendar'></i> 2022
                </div>
                <p class="experience__desc">Mengembangkan dan memelihara aplikasi berbasis web internal perusahaan, serta melakukan analisis kebutuhan sistem.</p>
            </div>
        `;
    }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadProjects();
    loadExperience();
});
