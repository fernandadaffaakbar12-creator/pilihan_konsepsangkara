// Tempat menyimpan data asli dari data.json
let semuaData = [];

// Nomor WhatsApp Admin Sangkara (+62 813-9307-031)
const NOMOR_WA_ADMIN = '628139307031';

// Inisialisasi event listener modal saat dokumen siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inisialisasiModal);
} else {
    inisialisasiModal();
}

// 1. Ambil data dari file data.json
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        semuaData = data;
        // Tampilan awal saat web dibuka: Langsung balik urutan agar yang terbaru di atas
        tampilkanGaleri([...semuaData].reverse());
        inisialisasiFilter();
    })
    .catch(error => console.error('Gagal memuat file data.json:', error));

// 2. Fungsi Utama untuk merakit kartu portofolio ke layar
function tampilkanGaleri(daftarKarya) {
    const container = document.getElementById('gallery-container');
    container.innerHTML = ''; // Bersihkan isi galeri lama

    if (daftarKarya.length === 0) {
        container.innerHTML = '<p style="grid-column: span 2; text-align: center; color: #888;">Tidak ada karya ditemukan.</p>';
        return;
    }

    daftarKarya.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        // Membuat elemen gambar dengan Lazy Loading
        const img = document.createElement('img');
        img.src = item.image;
        img.loading = "lazy";
        img.alt = item.title;

        // Membuat elemen judul
        const title = document.createElement('h2');
        title.textContent = item.title;

        // Klik pada kartu/gambar untuk memperbesar gambar & membuka opsi kirim konsep
        card.addEventListener('click', () => {
            bukaModal(item);
        });

        card.appendChild(img);
        card.appendChild(title);

        container.appendChild(card);
    });
}

// 3. Fungsi Logika Penyortiran Kategori
function inisialisasiFilter() {
    const tombolFilter = document.querySelectorAll('.filter-btn');

    tombolFilter.forEach(tombol => {
        tombol.addEventListener('click', () => {
            tombolFilter.forEach(b => b.classList.remove('active'));
            tombol.classList.add('active');

            const kategori = tombol.getAttribute('data-category');

            if (kategori === 'semua' || kategori === 'terbaru') {
                tampilkanGaleri([...semuaData].reverse());
            }
            else {
                const dataDisaring = semuaData.filter(item => item.category === kategori);
                tampilkanGaleri([...dataDisaring].reverse());
            }
        });
    });
}

// Fungsi bantu untuk mereset tampilan bagian QR di dalam modal
function resetBagianQR() {
    const qrSection = document.getElementById('modal-qr-section');
    const qrToggleBtn = document.getElementById('modal-qr-toggle-btn');
    const qrToggleText = document.getElementById('modal-qr-toggle-text');

    if (qrSection) {
        qrSection.hidden = true;
    }
    if (qrToggleBtn) {
        qrToggleBtn.classList.remove('active');
        qrToggleBtn.setAttribute('aria-expanded', 'false');
    }
    if (qrToggleText) {
        qrToggleText.textContent = 'Mau bayar pakai QR';
    }
}

// 4. Fungsi Modal Lightbox & Integrasi WhatsApp
function bukaModal(item) {
    const modal = document.getElementById('image-modal');
    const modalCard = modal ? modal.querySelector('.modal-card') : null;
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalWaBtn = document.getElementById('modal-wa-btn');
    const modalPrice = document.getElementById('modal-price');

    if (!modal) return;

    // Reset bagian QR setiap kali membuka konsep baru
    resetBagianQR();
    if (modalCard) {
        modalCard.scrollTop = 0;
    }

    modalImg.src = item.image;
    modalImg.alt = item.title;
    modalTitle.textContent = item.title;

    // Logika penentuan harga berdasarkan kategori konsep:
    // - Konsep Pasangan: 15K (konsep pasangan)
    // - Konsep Sendiri/1 Orang (wanita, pria, dll): 10K (konsep sendiri)
    const kategori = (item && item.category) ? item.category.toLowerCase().trim() : '';
    const isPasangan = kategori === 'pasangan';
    const teksHargaOrder = isPasangan ? '15K (konsep pasangan)' : '10K (konsep sendiri)';

    // Update info harga pada modal jika elemen tersedia
    if (modalPrice) {
        modalPrice.textContent = `🏷️ ${teksHargaOrder}`;
    }

    // Template formulir order untuk WhatsApp
    const namaKonsep = item && item.title ? item.title : '';
    const templatePesan =

        `*FORMAT ORDER JASDIT BY SANGKARA*

Berikut detail pembayaranya yaa kaa:

- Antrian atas nama :

- Konsep yang dipilih : ${namaKonsep}

- Nominal Transfer: Rp. ${teksHargaOrder}

- Pembayaran : SEABANK, BCA, DANA, QR.
 
Kirim ke: 
-  0895388539119 (DANA / AN FERNANDA DAFFA ).
-  0301318391 ( BCA / AN FERNANDA DAFFA ).
-  901247594147 ( SEA BANK / AN FERNANDA DAFFA ).

*Bukti Transfer, Konsep yang dimau, Foto wajah yang mau diedit.*

[ KIRIM KE NO WA INI ]

ANTRIAN SESUAI URUTAN TRANSFER 
( PEMBAYARAN DI AWAL YA KAKA ).`;

    const urlWA = `https://wa.me/${NOMOR_WA_ADMIN}?text=${encodeURIComponent(templatePesan)}`;
    modalWaBtn.href = urlWA;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function tutupModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    resetBagianQR();
}

function inisialisasiModal() {
    const modal = document.getElementById('image-modal');
    const closeBtn = document.getElementById('modal-close');
    const qrToggleBtn = document.getElementById('modal-qr-toggle-btn');
    const qrToggleText = document.getElementById('modal-qr-toggle-text');
    const qrSection = document.getElementById('modal-qr-section');
    const downloadQrBtn = document.getElementById('download-qr-btn');

    if (!modal || !closeBtn) return;

    // Tombol close (X)
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tutupModal();
    });

    // Tombol toggle "Mau bayar pakai QR"
    if (qrToggleBtn && qrSection) {
        qrToggleBtn.addEventListener('click', () => {
            const sedangTerbuka = !qrSection.hidden;
            if (sedangTerbuka) {
                resetBagianQR();
            } else {
                qrSection.hidden = false;
                qrToggleBtn.classList.add('active');
                qrToggleBtn.setAttribute('aria-expanded', 'true');
                if (qrToggleText) {
                    qrToggleText.textContent = 'Sembunyikan QR';
                }
                // Scroll halus agar gambar QR & langkah-langkah langsung terlihat
                setTimeout(() => {
                    qrSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 60);
            }
        });
    }

    // Fitur Download QR agar langsung mengunduh file gambar
    if (downloadQrBtn) {
        downloadQrBtn.addEventListener('click', async (e) => {
            const qrUrl = downloadQrBtn.getAttribute('href');
            const namaFile = downloadQrBtn.getAttribute('download') || 'QRIS-Sangkara-Digitalstudio.jpg';
            try {
                e.preventDefault();
                const response = await fetch(qrUrl);
                if (!response.ok) throw new Error('Gagal mengunduh gambar QR');
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = namaFile;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            } catch (err) {
                // Fallback jika dibuka langsung lewat file://
                window.open(qrUrl, '_blank');
            }
        });
    }

    // Klik di latar belakang (overlay) untuk menutup
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            tutupModal();
        }
    });

    // Menutup dengan tombol Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            tutupModal();
        }
    });
}
