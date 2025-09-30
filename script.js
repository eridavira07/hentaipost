// script.js

// Daftar semua akun, path file HTML kini berada di root
const ACCOUNT_LIST = [
    { file: 'larisa.html', profile: 'Larisa Santoso', pic: '#ff69b4', profile_path: 'larisa.html' },
    { file: 'tania.html', profile: 'Tania Dewi', pic: '#00ced1', profile_path: 'tania.html' },
    { file: 'dion.html', profile: 'Dion Permana', pic: '#ffa500', profile_path: 'dion.html' },
    // Tambahkan lebih banyak akun di sini
];

const POSTS_PER_LOAD = 10;
const LOAD_INCREMENT = 5;
let allPosts = []; 
let currentVisiblePosts = 0;


// =====================================
// 1. Memuat Postingan & Menambahkan Tautan Profil
// =====================================
async function fetchAccountPosts() {
    const promises = ACCOUNT_LIST.map(async account => {
        try {
            // Mengambil file dari root folder
            const response = await fetch(account.file);
            if (!response.ok) throw new Error(`Gagal memuat ${account.file}`);
            
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const posts = doc.querySelectorAll('.post-item');
            
            posts.forEach(post => {
                const time = post.getAttribute('data-time') || 'Baru saja';
                
                // Menambahkan Tautan Profil pada Nama Pengguna
                const headerHTML = `
                    <div class="post-header">
                        <div class="profile-pic" style="background-color: ${account.pic};"></div>
                        <div>
                            <a href="${account.profile_path}" class="username-link">
                                <span class="username">${account.profile}</span>
                            </a>
                            <span class="timestamp"> · ${time}</span>
                        </div>
                    </div>
                `;
                post.insertAdjacentHTML('afterbegin', headerHTML);
                allPosts.push(post);
            });
        } catch (error) {
            console.error(error);
        }
    });

    await Promise.all(promises);
    
    allPosts.sort(() => Math.random() - 0.5); 
    
    // Sembunyikan pesan loading
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) loadingMsg.style.display = 'none';

    // Tampilkan tombol "Muat Lebih Banyak" setelah loading
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) loadMoreBtn.style.display = 'block';

    displayNextPosts(POSTS_PER_LOAD);
    setupLoadMoreButton();
}

// =====================================
// 2. Logika Lazy Loading (Tidak Berubah Signifikan)
// =====================================
function displayNextPosts(count) {
    const feedArea = document.getElementById('feed-area');
    const postsToDisplay = allPosts.slice(currentVisiblePosts, currentVisiblePosts + count);

    postsToDisplay.forEach(post => {
        feedArea.appendChild(post.cloneNode(true));
    });

    currentVisiblePosts += postsToDisplay.length;
    updateLoadMoreButton();
}

function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayNextPosts(LOAD_INCREMENT);
        });
    }
    updateLoadMoreButton();
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (currentVisiblePosts >= allPosts.length) {
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        if (loadMoreContainer) {
            loadMoreContainer.innerHTML = '<p style="text-align: center; color: #a0a0a0;">Semua postingan sudah dimuat.</p>';
        }
    } else if (loadMoreBtn) {
        loadMoreBtn.textContent = `Muat Lebih Banyak Postingan (${Math.min(LOAD_INCREMENT, allPosts.length - currentVisiblePosts)})`;
    }
}


// =====================================
// 3. Inisialisasi
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    // Mode Gelap dihapus.
    fetchAccountPosts();
});