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

/* =============== REMOVE MENU MOBILE ON CLICK OR OUTSIDE =============== */
const navLinks = document.querySelectorAll('.nav__link');

const closeMenu = () => {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.remove('show-menu');
};

navLinks.forEach(n => n.addEventListener('click', closeMenu));

document.addEventListener('click', (e) => {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    if (navMenu && navMenu.classList.contains('show-menu')) {
        if (!navMenu.contains(e.target) && navToggle && !navToggle.contains(e.target)) {
            closeMenu();
        }
    }
});

/* =============== CHANGE BACKGROUND HEADER =============== */
const scrollHeader = () =>{
    const header = document.getElementById('header');
    window.scrollY >= 50 ? header.classList.add('scroll-header') 
                         : header.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);

/* =============== SCROLL SECTIONS ACTIVE LINK =============== */
const sections = document.querySelectorAll('section[id]');

const scrollActive = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 120,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']');

        if(sectionsClass) {
            if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                sectionsClass.classList.add('active-link');
            } else {
                sectionsClass.classList.remove('active-link');
            }
        }
    });
};
window.addEventListener('scroll', scrollActive);

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

/* =============== FETCH PROJECTS =============== */
const defaultProjects = [
    {
        title: "Sistem Jurnal Pengeluaran Web",
        category: "system",
        description: "Sistem informasi pencatatan jurnal pengeluaran & keuangan berbasis web dengan fitur RBAC, audit log, dan laporan otomatis.",
        technologies: ["PHP Native", "MySQL", "RBAC", "Bootstrap"],
        imageUrl: "assets/img/sistem_jurnal.png",
        link: "#"
    },
    {
        title: "MetalHasil POS & Price Calculator",
        category: "system",
        description: "Point of Sale (POS) dan engine kalkulator estimasi harga acuan logam LME (London Metal Exchange) real-time.",
        technologies: ["PHP", "MySQL", "LME Price Engine", "Bootstrap"],
        imageUrl: "assets/img/metalhasil_pos.png",
        link: "#"
    },
    {
        title: "TMS Fleet & Vehicle Management",
        category: "system",
        description: "Transport Management System (TMS) pengawasan armada kendaraan, integrasi GPS tracking real-time & geofencing.",
        technologies: ["PHP", "MySQL", "GPS API", "Geofencing Engine"],
        imageUrl: "assets/img/tms_fleet.png",
        link: "#"
    },
    {
        title: "TMS Driver Companion App",
        category: "web",
        description: "Aplikasi mobile/web pendamping driver armada untuk pencatatan perjalanan, Proof of Delivery (POD), & rute pengiriman.",
        technologies: ["JavaScript PWA", "REST API", "Geolocation"],
        imageUrl: "assets/img/tms_fleet.png",
        link: "#"
    },
    {
        title: "Smart Agriculture Drone System",
        category: "system",
        description: "Sistem pemantauan & manajemen operasional drone pertanian untuk penjadwalan penerbangan & analitik tanaman.",
        technologies: ["PHP MVC", "MySQL", "Custom Dashboard"],
        imageUrl: "assets/img/drone_agri.png",
        link: "#"
    },
    {
        title: "OpenTrip Seribu Travel & E-Ticket",
        category: "web",
        description: "Platform booking paket wisata Open Trip Pulau Seribu terintegrasi Payment Gateway Midtrans & e-Tiket otomatis.",
        technologies: ["PHP", "MySQL", "Midtrans API", "Cron Reminder"],
        imageUrl: "assets/img/opentrip_seribu.png",
        link: "#"
    },
    {
        title: "Kopieine Coffee UMKM ERP System",
        category: "system",
        description: "Sistem ERP terpadu kedai kopi mencakup penggajian, manajemen gudang, keuangan, kurir, & konsinyasi warung.",
        technologies: ["PHP", "MySQL", "Service Worker PWA", "Chart.js"],
        imageUrl: "assets/img/kopieine_erp.png",
        link: "#"
    },
    {
        title: "Kemenag & PT JSMP Security System",
        category: "system",
        description: "Sistem informasi manajemen personel keamanan, pemantauan presensi harian, SOP pengamanan, & laporan cetak.",
        technologies: ["PHP", "MySQL", "PDF/Print Engine"],
        imageUrl: "assets/img/kemenag_security.png",
        link: "#"
    },
    {
        title: "E-Commerce Marketplace Platform",
        category: "web",
        description: "Platform toko online & marketplace dengan fitur katalog produk, keranjang belanja, kalkulasi checkout, & invoice.",
        technologies: ["PHP Native", "MySQL", "Responsive UI"],
        imageUrl: "assets/img/opentrip_seribu.png",
        link: "#"
    },
    {
        title: "ABK & Recruitment Portal",
        category: "web",
        description: "Portal rekrutmen pegawai & penyerapan tenaga kerja (ABK) dengan seleksi berkas online & dashboard HR.",
        technologies: ["PHP", "MySQL", "Document Uploader"],
        imageUrl: "assets/img/kemenag_security.png",
        link: "#"
    },
    {
        title: "SignalOK Network & PWA Monitoring",
        category: "system",
        description: "Progressive Web App (PWA) untuk pemantauan status jaringan & infrastruktur sinyal secara real-time.",
        technologies: ["PWA", "Service Worker", "JavaScript", "REST API"],
        imageUrl: "assets/img/tms_fleet.png",
        link: "#"
    },
    {
        title: "Titan Quant Scalping Engine",
        category: "system",
        description: "Engine perdagangan kuantitatif otomatis berbasis Smart Money Concepts (SMC) & strategi scalping otomatis.",
        technologies: ["Quant Engine", "MQL / Algorithmic", "Financial Pipeline"],
        imageUrl: "assets/img/titan_quant.png",
        link: "#"
    },
    {
        title: "Logistics & Supply Chain System",
        category: "system",
        description: "Sistem manajemen rantai pasok & pergudangan untuk pemantauan alur pergerakan barang & inventaris.",
        technologies: ["PHP", "MySQL", "Modular Architecture"],
        imageUrl: "assets/img/kopieine_erp.png",
        link: "#"
    },
    {
        title: "Payroll & Salary System",
        category: "system",
        description: "Sistem penggajian karyawan dengan kalkulasi tunjangan, potongan gaji, slip gaji otomatis, & rekap bulanan.",
        technologies: ["PHP", "MySQL", "Session Auth"],
        imageUrl: "assets/img/sistem_jurnal.png",
        link: "#"
    },
    {
        title: "Nuvrion Broadcast Engine",
        category: "system",
        description: "Engine pengiriman pesan & broadcast otomatis menggunakan background worker script & antrean tugas.",
        technologies: ["PHP", "Worker Script", "Database Queue"],
        imageUrl: "assets/img/metalhasil_pos.png",
        link: "#"
    },
    {
        title: "Football Heritage Portal & CMS",
        category: "web",
        description: "Portal web media & informasi sejarah sepak bola lengkap dengan galeri konten, berita, & arsip pertandingan.",
        technologies: ["PHP", "MySQL", "Custom CMS"],
        imageUrl: "assets/img/opentrip_seribu.png",
        link: "#"
    },
    {
        title: "CP Dika Company Profile",
        category: "design",
        description: "Website profil perusahaan interaktif dengan desain UI/UX responsif modern untuk branding korporat.",
        technologies: ["HTML5", "CSS3", "JavaScript", "UI/UX Design"],
        imageUrl: "assets/img/kopieine_erp.png",
        link: "#"
    },
    {
        title: "Online Checkout Integration",
        category: "web",
        description: "Modul checkout dan sistem integrasi payment gateway mandiri untuk kecepatan transaksi online.",
        technologies: ["PHP", "Payment Gateway API", "JavaScript"],
        imageUrl: "assets/img/opentrip_seribu.png",
        link: "#"
    },
    {
        title: "PT JSMP Institutional Website",
        category: "design",
        description: "Portal web branding publik perusahaan jasa keamanan dengan layout elegan & responsif.",
        technologies: ["HTML5", "CSS3", "JavaScript", "UI Design"],
        imageUrl: "assets/img/kemenag_security.png",
        link: "#"
    },
    {
        title: "SRD Data Record & Dynamic Pricing System",
        category: "system",
        description: "Sistem pencatatan rekam data operasional & engine kalkulator penentuan skema harga dinamis.",
        technologies: ["PHP", "MySQL", "Dynamic Pricing", "Bootstrap"],
        imageUrl: "assets/img/sistem_jurnal.png",
        link: "#"
    },
    {
        title: "MKIECO Corporate Platform & Digital Ecosystem",
        category: "web",
        description: "Platform ekosistem digital korporat MKIECO untuk integrasi layanan bisnis & katalog produk.",
        technologies: ["PHP", "MySQL", "REST API", "UI/UX Design"],
        imageUrl: "assets/img/kopieine_erp.png",
        link: "#"
    }
];

const renderProjectCards = (projectsList) => {
    return projectsList.map(data => {
        const techHtml = Array.isArray(data.technologies) 
            ? data.technologies.map(tech => `<span class="portfolio__tech">${tech.trim()}</span>`).join('')
            : '';
            
        const hasLiveLink = data.link && data.link !== '#' && data.link.trim() !== '';
        const titleHtml = hasLiveLink 
            ? `<h3 class="portfolio__title"><a href="${data.link}" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:none;">${data.title} <i class='bx bx-link-external' style="font-size:0.85em; opacity:0.75; color: var(--first-color);"></i></a></h3>`
            : `<h3 class="portfolio__title">${data.title}</h3>`;

        const liveBtnHtml = hasLiveLink 
            ? `<a href="${data.link}" target="_blank" rel="noopener noreferrer" class="btn btn--small" style="padding: 0.4rem 0.9rem; font-size: var(--smaller-font-size); display: inline-flex; align-items: center; gap: 0.3rem;">
                Visit Live Web <i class='bx bx-export'></i>
               </a>`
            : '';

        return `
        <div class="portfolio__card ${data.category || 'system'}">
            <img src="${data.imageUrl}" alt="${data.title}" class="portfolio__img" onclick="openLightbox('${data.imageUrl}', '${data.title}')" title="Click to view screenshot">
            <div class="portfolio__data">
                <span class="portfolio__category">${data.category ? data.category.toUpperCase() : 'PROJECT'}</span>
                ${titleHtml}
                <p class="portfolio__description">${data.description}</p>
                <div class="portfolio__stack">
                    ${techHtml}
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: 1.25rem; flex-wrap: wrap;">
                    <button class="portfolio__link" onclick="openLightbox('${data.imageUrl}', '${data.title}')" style="background:none; border:none; color:var(--first-color); cursor:pointer; padding:0; font-size: var(--small-font-size); display: inline-flex; align-items: center; gap: 0.3rem;">
                        Preview Screenshot <i class='bx bx-search-alt'></i>
                    </button>
                    ${liveBtnHtml}
                </div>
            </div>
        </div>
        `;
    }).join('');
};

const loadProjects = async () => {
    const portfolioContainer = document.getElementById('portfolio-container');
    
    try {
        const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            portfolioContainer.innerHTML = renderProjectCards(defaultProjects);
            return;
        }

        let projectsList = [];
        querySnapshot.forEach((doc) => {
            projectsList.push(doc.data());
        });
        
        portfolioContainer.innerHTML = renderProjectCards(projectsList);
        
    } catch (error) {
        console.log("Loading local projects list:", error);
        portfolioContainer.innerHTML = renderProjectCards(defaultProjects);
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
                let imgUrl = data.imageUrl;
                if(imgUrl === 'assets/4x6.jpg.jpeg') imgUrl = '4x6.jpg.jpeg';
                const profileImg = document.getElementById('profile-img');
                if(profileImg) {
                    profileImg.src = imgUrl;
                    profileImg.onerror = () => { profileImg.src = '4x6.jpg.jpeg'; };
                }
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

/* =============== LOAD EXPERIENCE =============== */
const defaultExperiences = [
    {
        company: "PT Metal Al-Hasil",
        role: "Full-Stack Web Developer",
        date: "2026",
        description: "Mengembangkan Sistem POS (Point of Sale) & engine kalkulator harga acuan logam LME (London Metal Exchange) real-time, perancangan arsitektur database relasional, refactor UI/UX responsif, serta manajemen data transaksi & stok."
    },
    {
        company: "PT Jaka Satria Mandala Putra",
        role: "Direktur Operasional",
        date: "2025",
        description: "Mengelola sistem operasional perusahaan jasa keamanan, menyusun SOP & sistem pembagian tugas personel, koordinasi langsung dengan klien (hotel, apartemen, perumahan), serta menangani laporan resmi, invoice, dan dokumen legal."
    },
    {
        company: "Freelance",
        role: "Web Developer",
        date: "2022 – Present",
        description: "Mengembangkan berbagai aplikasi & sistem berbasis web (manajemen kos, e-commerce, sistem internal), mendesain UI responsif & meningkatkan UX, serta koordinasi langsung dengan klien menggunakan PHP Native, MySQL, HTML, CSS, JavaScript, & Bootstrap."
    },
    {
        company: "PT Bina Baru Mandiri",
        role: "IT Consultant",
        date: "2022",
        description: "Mengembangkan & memelihara aplikasi berbasis web internal perusahaan, melakukan analisis kebutuhan sistem & efisiensi operasional, troubleshooting infrastruktur digital, serta konsultasi keamanan IT."
    }
];

const renderExperienceCards = (expList) => {
    return expList.map(exp => `
        <div class="experience__card">
            <h3 class="experience__company">${exp.company}</h3>
            <span class="experience__role">${exp.role}</span>
            <div class="experience__date">
                <i class='bx bx-calendar'></i> ${exp.date}
            </div>
            <p class="experience__desc">${exp.description}</p>
        </div>
    `).join('');
};

const loadExperience = async () => {
    const experienceContainer = document.getElementById('experience-container');
    
    try {
        const q = query(collection(db, "experiences"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            experienceContainer.innerHTML = renderExperienceCards(defaultExperiences);
            return;
        }

        let expList = [];
        querySnapshot.forEach((doc) => {
            expList.push(doc.data());
        });
        experienceContainer.innerHTML = renderExperienceCards(expList);
        
    } catch (error) {
        console.log("Loading local experience data:", error);
        experienceContainer.innerHTML = renderExperienceCards(defaultExperiences);
    }
};

/* =============== LIGHTBOX MODAL HANDLERS =============== */
window.openLightbox = (imgUrl, title) => {
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    
    if (modal && modalImg && caption) {
        modalImg.src = imgUrl;
        caption.innerText = title;
        modal.classList.add('active');
    }
};

const closeLightbox = () => {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
    }
};

/* =============== TYPEWRITER ROLE ANIMATION =============== */
const initTypewriter = () => {
    const typewriterEl = document.querySelector('.typewriter');
    if (!typewriterEl) return;
    
    const roles = [
        "Full-Stack Web Developer",
        "UI/UX Designer",
        "IT Consultant",
        "Database & System Architect"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    const type = () => {
        const currentRole = roles[roleIndex];
        let currentText = "";
        
        if (isDeleting) {
            currentText = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentText = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }
        
        typewriterEl.textContent = currentText || '\u00A0';
        
        let typeSpeed = isDeleting ? 35 : 70;
        
        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2200; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 350;
        }
        
        setTimeout(type, typeSpeed);
    };
    
    type();
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadProjects();
    loadExperience();
    initTypewriter();

    const closeBtn = document.getElementById('lightbox-close');
    const modal = document.getElementById('lightbox-modal');
    
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeLightbox();
        });
    }
});
