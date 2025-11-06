// main.js - Script utama untuk peta (Versi Layout Baru + Batas Kecamatan)

// --- INISIALISASI PETA ---
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([-6.918, 106.926], 10);

L.control.zoom({ position: 'bottomright' }).addTo(map);

// Array untuk menyimpan marker sekolah
let schoolMarkers = [];
// Variabel untuk menyimpan data sekolah dari JSON
let allSchoolData = [];

// Buat layer group untuk clustering
const markers = L.markerClusterGroup();

// --- BASE MAPS ---
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' });
const esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' });
const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: 'Map data &copy; Google' });

const baseMaps = {
    "OpenStreetMap": osm,
    "Citra Satelit (Esri)": esriWorldImagery,
    "Google Satellite": googleSat
};
osm.addTo(map);

// --- FUNGSI MEMUAT GEOJSON (BATAS WILAYAH) ---
async function loadGeoJSON(url, styleOptions) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Gagal memuat GeoJSON: ${url} (${response.status})`);
        }
        const data = await response.json();
        return L.geoJSON(data, {
            style: styleOptions, // Terapkan style di sini
            onEachFeature: function (feature, layer) {
                // Tambahkan popup jika ada properti nama (sesuaikan nama properti jika berbeda)
                const popupContent = feature.properties?.NAMOBJ || // Coba properti NAMOBJ dari file kecamatan
                    feature.properties?.shapeName || // Coba properti shapeName dari file lain
                    'Batas Wilayah'; // Default
                layer.bindPopup(`<h3>${popupContent}</h3>`);
            }
        });
    } catch (error) {
        console.error(error);
        alert(`Gagal memuat layer peta dari ${url}. Periksa nama file dan pastikan file ada di folder data.`);
        return null; // Kembalikan null jika gagal
    }
}

// Muat batas Kabupaten Sukabumi
loadGeoJSON('data/batas_sukabumi.geojson', { color: '#3388ff', weight: 3, fillOpacity: 0.1, dashArray: '5, 5' }) // Sedikit transparan dan garis putus
    .then(layer => {
        if (layer) {
            layer.addTo(map);
            addLayersToControl(layer, 'Batas Kabupaten');
            layer.on('click', e => L.DomEvent.stopPropagation(e));
        }
    });

// Muat batas Kota Sukabumi
loadGeoJSON('data/kota_sukabumi.geojson', { color: '#ff7800', weight: 2, fillOpacity: 0.1 }) // Sedikit transparan
    .then(kotaLayer => {
        if (kotaLayer) {
            kotaLayer.addTo(map);
            addLayersToControl(kotaLayer, 'Batas Kota');
            kotaLayer.on('click', e => L.DomEvent.stopPropagation(e));
        }
    });

// ==========================================
// <<<--- PENAMBAHAN KODE BARU DIMULAI --- >>>
// ==========================================
// Muat batas Kecamatan Kabupaten Sukabumi
// Pastikan nama file GeoJSON sesuai dengan yang Anda unggah
loadGeoJSON('data/batas_wilayah_adaminstrasi_kecamatan_di_kab.sukabumi.geojson', {
    color: '#ff9900', // Warna oranye/kuning
    weight: 1.5,      // Ketebalan garis
    opacity: 0.8     // Tingkat transparansi
})
    .then(kecamatanLayer => {
        if (kecamatanLayer) {
            // Jangan langsung tambahkan ke peta agar bisa di-toggle
            // kecamatanLayer.addTo(map);
            addLayersToControl(kecamatanLayer, 'Batas Kecamatan (Kab)'); // Tambahkan ke kontrol layer
            kecamatanLayer.on('click', e => L.DomEvent.stopPropagation(e)); // Agar tidak memicu popup koordinat
        }
    });
// ==========================================
// <<<--- PENAMBAHAN KODE BARU SELESAI --- >>>
// ==========================================


// --- FUNGSI DATA SEKOLAH (DARI JSON LOKAL) ---
async function loadSchoolData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error memuat data sekolah (sekolah.json):', error);
        alert('Gagal memuat data sekolah. Periksa file sekolah_filtered_sma_smk.json Anda.');
        return [];
    }
}

// --- FUNGSI MARKER & FILTER ---
function addSchoolMarkers(schoolDataArray) {
    markers.clearLayers();
    schoolMarkers = [];

    schoolDataArray.forEach(coord => {
        const originalIndex = allSchoolData.findIndex(item => item.name === coord.name);

        const popupContent = `
            <b>${coord.name}</b><br>
            <img src="${coord.image_url}" alt="Foto ${coord.name}" class="school-image"><br>
            <a href="#" onclick="event.preventDefault(); openModal(${originalIndex})">Lihat Selengkapnya...</a>
        `;

        const marker = L.marker([coord.lat, coord.lng])
            .bindPopup(popupContent)
            .bindTooltip(coord.name);

        markers.addLayer(marker);
        schoolMarkers.push({ name: coord.name, marker: marker });
    });
}

function populateDistrictFilter(schools) {
    const filterSelect = document.getElementById('kecamatanFilter');
    const districts = [...new Set(schools.map(school => school.kecamatan))];
    districts.sort();

    districts.forEach(district => {
        if (district) {
            const option = document.createElement('option');
            option.value = district;
            option.innerText = district;
            filterSelect.appendChild(option);
        }
    });
}

function filterSchools() {
    const selectedDistrict = document.getElementById('kecamatanFilter').value;
    let filteredSchools;
    if (selectedDistrict === "semua") {
        filteredSchools = allSchoolData;
    } else {
        filteredSchools = allSchoolData.filter(school => school.kecamatan === selectedDistrict);
    }
    addSchoolMarkers(filteredSchools);
}

// --- INISIALISASI DATA SEKOLAH ---
loadSchoolData('data/sekolah_filtered_sma_smk.json').then(data => {
    allSchoolData = data;
    populateDistrictFilter(allSchoolData);
    addSchoolMarkers(allSchoolData);
    // Tambahkan layer marker sekolah ke kontrol layer JUGA
    addLayersToControl(markers, 'Sekolah (SMA/SMK)');
    map.addLayer(markers); // Aktifkan layer sekolah secara default
}).catch(error => {
    console.error('Gagal inisialisasi peta:', error);
});


// --- FUNGSI KONTROL LAYER ---
function addLayersToControl(layer, name) {
    // Pastikan window.layerControl sudah ada sebelum menambahkan overlay
    if (!window.layerControl) {
        window.layerControl = L.control.layers(baseMaps, {}, {
            position: 'topright',
            collapsed: false // Biarkan terbuka agar mudah terlihat
        }).addTo(map);
    }
    // Tambahkan overlay baru
    window.layerControl.addOverlay(layer, name);
}


// --- FUNGSI KLIK PETA (DEBUG) ---
map.on('click', function (e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    L.popup()
        .setLatLng(e.latlng)
        .setContent(`<b>Koordinat Diklik:</b><br>Lat: ${lat}<br>Lng: ${lng}`)
        .openOn(map);
});

// --- FUNGSI PENCARIAN ---
function searchSchool() {
    const searchText = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchText === "") return;

    let found = false;
    for (const school of schoolMarkers) {
        if (school.name.toLowerCase().includes(searchText)) {
            const marker = school.marker;
            markers.zoomToShowLayer(marker, () => {
                marker.openPopup();
            });
            found = true;
            break;
        }
    }
    if (!found) alert("Sekolah tidak ditemukan.");
}


// === FUNGSI MODAL (Tampilan Baru) ===
function openModal(schoolIndex) {
    const modal = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    const schoolData = allSchoolData[schoolIndex];
    if (!schoolData) return;

    modalTitle.innerText = schoolData.name;

    const newModalContent = `
        <img src="${schoolData.image_url}" alt="Foto ${schoolData.name}">

        <table>
            <tr style="vertical-align: top;">
                <td style="width: 120px;"><strong>Alamat</strong></td>
                <td style="width: 10px;">:</td>
                <td>${schoolData.description}</td>
            </tr>
            <tr>
                <td><strong>Kecamatan</strong></td>
                <td>:</td>
                <td>${schoolData.kecamatan || 'N/A'}</td>
            </tr>
            <tr>
                <td><strong>Jam Sekolah</strong></td>
                <td>:</td>
                <td>${schoolData.jam_sekolah}</td>
            </tr>
            <tr>
                <td><strong>Kontak</strong></td>
                <td>:</td>
                <td>${schoolData.kontak}</td>
            </tr>
            <tr>
                <td><strong>Website</strong></td>
                <td>:</td>
                <td><a href="${schoolData.website}" target="_blank" rel="noopener noreferrer">Kunjungi Website</a></td>
            </tr>
        </table>

        <hr>
        ${schoolData.full_info}
    `;
    modalBody.innerHTML = newModalContent;
    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById('modal-container');
    if (event.target == modal) {
        closeModal();
    }
}