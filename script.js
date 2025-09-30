// script.js 

// Daftar semua akun
const ACCOUNT_LIST = [
    // PENTING: Gunakan string style lengkap untuk 'pic' agar gambar kustom muncul di feed utama
    { file: 'larisa_data.html', 
      profile: 'Larisa Santoso', 
      pic: "background-image: url('https://img.kemono.cr/thumbnail/data/aa/ee/aaee7aacf66f1ad4e9b7d76b5ff813f4b3ed7a195a59195a4768fe8aeb35f5a6.jpg'); background-size: 190%; background-position: 90% center; background-repeat: no-repeat;", 
      profile_path: 'larisa.html' },
      
      
    // Contoh akun lain (gunakan format data_file.html)
    { file: 'tania_data.html', 
      profile: 'Tania', 
      pic: "background-image: url('https://n3.kemono.cr/data/d5/16/d516225bfc11038f6afd4f1fbb00edb9f242970db35a1113519de12614fdff60.jpg?f=33743.jpg'); background-size: 190%; background-position: 90% 90%; background-repeat: no-repeat;",  
      profile_path: 'tania.html' },


    { file: 'dion_data.html', profile: 'Dion Permana', pic: '#ffa500', profile_path: 'dion.html' },
];

// Array untuk melacak file mana yang sudah dimuat (hanya relevan untuk index.html)
let loadedFiles = [];

// Fungsi untuk membuat elemen HTML untuk setiap postingan
function createPostElement(account, content, timestamp) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post post-item';

    // Logika untuk menentukan style foto profil:
    let profilePicStyle = account.pic; 
    if (account.pic.startsWith('#')) {
        profilePicStyle = `background-color: ${account.pic};`;
    } 
    
    const postContent = `
        <div class="post-header">
            <a href="${account.profile_path}" class="username-link">
                <div class="profile-pic" style="${profilePicStyle}"></div>
            </a>
            <div>
                <a href="${account.profile_path}" class="username-link">
                    <span class="username">${account.profile}</span>
                </a>
                <span class="timestamp"> · ${timestamp}</span>
            </div>
        </div>
        ${content}
    `;

    postDiv.innerHTML = postContent;
    return postDiv;
}

// Fungsi utama untuk memuat postingan
function loadPosts() {
    const feedArea = document.getElementById('feed-area');
    // Hentikan jika feed-area tidak ada di halaman saat ini
    if (!feedArea) return; 
    
    const loadingMessage = document.getElementById('loading-message'); 
    
    const currentPath = window.location.pathname;
    const isIndexPage = currentPath.endsWith('/') || currentPath.endsWith('index.html');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Tentukan akun mana yang akan dimuat
    let accountsToLoad = ACCOUNT_LIST; 
    let postsToLoadCount = 0;
    
    if (!isIndexPage) {
        // Logika untuk Halaman Profil
        const profileFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
        
        // Filter array hanya untuk akun yang cocok dengan halaman profil saat ini
        accountsToLoad = ACCOUNT_LIST.filter(account => account.profile_path === profileFile);
        
        // Di halaman profil, sembunyikan tombol load more karena hanya memuat satu set data
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        
        // Kosongkan feed saat beralih profil (jika fungsi ini dipanggil ulang)
        feedArea.innerHTML = ''; 
    } else {
        // Logika untuk Index Page (halaman utama)
        // Lanjutkan dengan accountsToLoad = ACCOUNT_LIST
    }

    if (loadingMessage) loadingMessage.style.display = 'block';

    const promises = accountsToLoad.map(account => {
        // Di halaman utama, kita menghindari pemuatan ganda
        if (isIndexPage && loadedFiles.includes(account.file)) return Promise.resolve([]);

        // Gunakan Fetch API untuk memuat konten file HTML
        return fetch(account.file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Gagal memuat file: ${account.file}`);
                }
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const posts = doc.querySelectorAll('.post.post-item');
                
                const loadedPosts = [];
                posts.forEach(postElement => {
                    const postContent = postElement.innerHTML;
                    const timestamp = postElement.getAttribute('data-time') || 'Waktu tidak diketahui';
                    loadedPosts.push(createPostElement(account, postContent, timestamp));
                    postsToLoadCount++;
                });

                if (isIndexPage) {
                    // Tandai file sebagai sudah dimuat (hanya untuk index.html)
                    loadedFiles.push(account.file);
                }
                return loadedPosts;
            })
            .catch(error => {
                console.error(`Error loading ${account.file}:`, error);
                return [];
            });
    });

    Promise.all(promises).then(allPostsArrays => {
        const allPosts = allPostsArrays.flat();

        // Sortir postingan berdasarkan waktu (asumsi data-time bisa diurutkan, misal, dengan logika waktu sungguhan)
        // Untuk saat ini, kita biarkan urutan sesuai dengan ACCOUNT_LIST.

        if (allPosts.length > 0) {
            allPosts.forEach(post => feedArea.appendChild(post));
            if (loadingMessage) loadingMessage.style.display = 'none';

            if (isIndexPage) {
                // Atur tombol Load More hanya di halaman index
                if (loadedFiles.length < ACCOUNT_LIST.length) {
                     if (loadMoreBtn) loadMoreBtn.style.display = 'block';
                } else {
                     if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                     if (loadingMessage) {
                         loadingMessage.textContent = 'Semua postingan sudah dimuat.';
                         loadingMessage.style.display = 'block';
                     }
                }
            } else {
                // Di halaman profil, tampilkan pesan jika berhasil dimuat.
                if (loadingMessage) loadingMessage.style.display = 'none';
            }

        } else {
            // Jika tidak ada postingan dimuat
            if (loadingMessage) {
                loadingMessage.textContent = 'Tidak ada postingan untuk ditampilkan.';
                loadingMessage.style.display = 'block';
            }
        }
    });
}

// Panggil loadPosts saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadPosts);

// Listener untuk tombol "Muat Lebih Banyak"
const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadPosts);
}