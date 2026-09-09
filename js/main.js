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

/* =============== FETCH PROJECTS =============== */
const defaultProjects = [
    {
        title: "Sistem Jurnal Pengeluaran Web",
        category: "system",
        description: "Sistem informasi pencatatan jurnal pengeluaran & keuangan berbasis web dengan fitur RBAC, audit log, dan laporan otomatis.",
        technologies: ["PHP Native", "MySQL", "RBAC", "Bootstrap"],
        imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "MetalHasil POS & Price Calculator",
        category: "system",
        description: "Point of Sale (POS) dan engine kalkulator estimasi harga acuan logam LME (London Metal Exchange) real-time.",
        technologies: ["PHP", "MySQL", "LME Price Engine", "Bootstrap"],
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "TMS Fleet & Vehicle Management",
        category: "system",
        description: "Transport Management System (TMS) pengawasan armada kendaraan, integrasi GPS tracking real-time & geofencing.",
        technologies: ["PHP", "MySQL", "GPS API", "Geofencing Engine"],
        imageUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "TMS Driver Companion App",
        category: "web",
        description: "Aplikasi mobile/web pendamping driver armada untuk pencatatan perjalanan, Proof of Delivery (POD), & rute pengiriman.",
        technologies: ["JavaScript PWA", "REST API", "Geolocation"],
        imageUrl: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Smart Agriculture Drone System",
        category: "system",
        description: "Sistem pemantauan & manajemen operasional drone pertanian untuk penjadwalan penerbangan & analitik tanaman.",
        technologies: ["PHP MVC", "MySQL", "Custom Dashboard"],
        imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "OpenTrip Seribu Travel & E-Ticket",
        category: "web",
        description: "Platform booking paket wisata Open Trip Pulau Seribu terintegrasi Payment Gateway Midtrans & e-Tiket otomatis.",
        technologies: ["PHP", "MySQL", "Midtrans API", "Cron Reminder"],
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Kopieine Coffee UMKM ERP System",
        category: "system",
        description: "Sistem ERP terpadu kedai kopi mencakup penggajian, manajemen gudang, keuangan, kurir, & konsinyasi warung.",
        technologies: ["PHP", "MySQL", "Service Worker PWA", "Chart.js"],
        imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Kemenag & PT JSMP Security System",
        category: "system",
        description: "Sistem informasi manajemen personel keamanan, pemantauan presensi harian, SOP pengamanan, & laporan cetak.",
        technologies: ["PHP", "MySQL", "PDF/Print Engine"],
        imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "E-Commerce Marketplace Platform",
        category: "web",
        description: "Platform toko online & marketplace dengan fitur katalog produk, keranjang belanja, kalkulasi checkout, & invoice.",
        technologies: ["PHP Native", "MySQL", "Responsive UI"],
        imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "ABK & Recruitment Portal",
        category: "web",
        description: "Portal rekrutmen pegawai & penyerapan tenaga kerja (ABK) dengan seleksi berkas online & dashboard HR.",
        technologies: ["PHP", "MySQL", "Document Uploader"],
        imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "SignalOK Network & PWA Monitoring",
        category: "system",
        description: "Progressive Web App (PWA) untuk pemantauan status jaringan & infrastruktur sinyal secara real-time.",
        technologies: ["PWA", "Service Worker", "JavaScript", "REST API"],
        imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Titan Quant Scalping Engine",
        category: "system",
        description: "Engine perdagangan kuantitatif otomatis berbasis Smart Money Concepts (SMC) & strategi scalping otomatis.",
        technologies: ["Quant Engine", "MQL / Algorithmic", "Financial Pipeline"],
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Logistics & Supply Chain System",
        category: "system",
        description: "Sistem manajemen rantai pasok & pergudangan untuk pemantauan alur pergerakan barang & inventaris.",
        technologies: ["PHP", "MySQL", "Modular Architecture"],
        imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Payroll & Salary System",
        category: "system",
        description: "Sistem penggajian karyawan dengan kalkulasi tunjangan, potongan gaji, slip gaji otomatis, & rekap bulanan.",
        technologies: ["PHP", "MySQL", "Session Auth"],
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Nuvrion Broadcast Engine",
        category: "system",
        description: "Engine pengiriman pesan & broadcast otomatis menggunakan background worker script & antrean tugas.",
        technologies: ["PHP", "Worker Script", "Database Queue"],
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Football Heritage Portal & CMS",
        category: "web",
        description: "Portal web media & informasi sejarah sepak bola lengkap dengan galeri konten, berita, & arsip pertandingan.",
        technologies: ["PHP", "MySQL", "Custom CMS"],
        imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "CP Dika Company Profile",
        category: "design",
        description: "Website profil perusahaan interaktif dengan desain UI/UX responsif modern untuk branding korporat.",
        technologies: ["HTML5", "CSS3", "JavaScript", "UI/UX Design"],
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "Online Checkout Integration",
        category: "web",
        description: "Modul checkout dan sistem integrasi payment gateway mandiri untuk kecepatan transaksi online.",
        technologies: ["PHP", "Payment Gateway API", "JavaScript"],
        imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "PT JSMP Institutional Website",
        category: "design",
        description: "Portal web branding publik perusahaan jasa keamanan dengan layout elegan & responsif.",
        technologies: ["HTML5", "CSS3", "JavaScript", "UI Design"],
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "SRD Data Record & Dynamic Pricing System",
        category: "system",
        description: "Sistem pencatatan rekam data operasional & engine kalkulator penentuan skema harga dinamis.",
        technologies: ["PHP", "MySQL", "Dynamic Pricing", "Bootstrap"],
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    },
    {
        title: "MKIECO Corporate Platform & Digital Ecosystem",
        category: "web",
        description: "Platform ekosistem digital korporat MKIECO untuk integrasi layanan bisnis & katalog produk.",
        technologies: ["PHP", "MySQL", "REST API", "UI/UX Design"],
        imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        link: "#"
    }
];

const renderProjectCards = (projectsList) => {
    return projectsList.map(data => {
        const techHtml = data.technologies.map(tech => `<span class="portfolio__tech">${tech.trim()}</span>`).join('');
        return `
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

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadProjects();
    loadExperience();
});
