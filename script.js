// script.js (Bagian Awal yang Diubah)

// Daftar semua akun
const ACCOUNT_LIST = [
    // PENTING: File di sini (larisa_data.html) adalah sumber konten untuk feed
    { file: 'larisa_data.html', profile: 'Larisa Santoso', pic: '#ff69b4', profile_path: 'larisa.html' },
    { file: 'tania_data.html', profile: 'Tania Dewi', pic: '#00ced1', profile_path: 'tania.html' },
    { file: 'dion_data.html', profile: 'Dion Permana', pic: '#ffa500', profile_path: 'dion.html' },
];

// Array untuk melacak file mana yang sudah dimuat untuk mencegah pemuatan ganda
let loadedFiles = [];

// Fungsi untuk membuat elemen HTML untuk setiap postingan
function createPostElement(account, content, timestamp) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post post-item';

    // Ambil style background dari account (untuk foto profil kecil)
    const profilePicStyle = account.pic.startsWith('#') 
        ? `background-color: ${account.pic};` 
        : `background-image: url('${account.pic}'); background-size: cover; background-repeat: no-repeat;`;

    // Ambil style kustom dari larisa.html jika ada (diasumsikan sudah disalin ke script.js jika perlu)
    // Untuk tujuan ini, kita akan menggunakan warna default kecuali jika Anda menambahkan logika kustom.

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
    const loadingMessage = document.getElementById('loading-message');
    let postsToLoadCount = 0;
    
    loadingMessage.style.display = 'block';

    const promises = ACCOUNT_LIST.map(account => {
        if (loadedFiles.includes(account.file)) return Promise.resolve([]);

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
                
                // Cari semua elemen dengan class .post.post-item
                const posts = doc.querySelectorAll('.post.post-item');
                
                const loadedPosts = [];
                posts.forEach(postElement => {
                    const postContent = postElement.innerHTML;
                    const timestamp = postElement.getAttribute('data-time') || 'Waktu tidak diketahui';

                    // Buat elemen postingan dan tambahkan ke array sementara
                    loadedPosts.push(createPostElement(account, postContent, timestamp));
                    postsToLoadCount++;
                });

                // Tandai file sebagai sudah dimuat
                loadedFiles.push(account.file);
                return loadedPosts;
            })
            .catch(error => {
                console.error(`Error loading ${account.file}:`, error);
                return [];
            });
    });

    Promise.all(promises).then(allPostsArrays => {
        const allPosts = allPostsArrays.flat();

        if (allPosts.length > 0) {
            // Gabungkan postingan yang dimuat ke dalam feed
            allPosts.forEach(post => feedArea.appendChild(post));
            // Sembunyikan pesan loading
            loadingMessage.style.display = 'none';

            // Tampilkan tombol "Muat Lebih Banyak" jika perlu (jika ada file yang belum dimuat)
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadedFiles.length < ACCOUNT_LIST.length) {
                 loadMoreBtn.style.display = 'block';
            } else {
                 loadMoreBtn.style.display = 'none';
            }

        } else {
            // Jika tidak ada postingan baru dimuat
            if (loadedFiles.length === ACCOUNT_LIST.length) {
                loadingMessage.textContent = 'Semua postingan sudah dimuat.';
            } else {
                 // Sembunyikan pesan loading jika ada yang dimuat, tetapi tidak ada postingan.
                 loadingMessage.style.display = 'none';
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