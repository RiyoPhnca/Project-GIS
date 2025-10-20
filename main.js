// main.js - Script utama untuk peta
const map = L.map('map').setView([-6.918, 106.926], 10);  // Koordinat default untuk Sukabumi

// Base maps tanpa RBI
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

const esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
});

const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

const baseMaps = {
    "OpenStreetMap": osm,
    "Citra Satelit (Esri)": esriWorldImagery,
    "Google Satellite": googleSat
};

osm.addTo(map);  // Tambahkan base map default

// Fungsi untuk memuat GeoJSON
async function loadGeoJSON(url) {
    const response = await fetch(url);
    const data = await response.json();
    return L.geoJSON(data, {
        style: { color: '#3388ff', weight: 3, fillOpacity: 0.2 },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.shapeName) {
                layer.bindPopup(`<h3>${feature.properties.shapeName}</h3>`);
            }
        }
    });
}

// Muat batas Sukabumi
loadGeoJSON('data/batas_sukabumi.geojson').then(layer => {
    layer.addTo(map);
    addLayersToControl(layer, 'Batas Administrasi');
});

// Muat kota Sukabumi
async function loadKotaSukabumiGeoJSON() {
    const response = await fetch('data/kota_sukabumi.geojson');
    const data = await response.json();
    return L.geoJSON(data, {
        style: { color: '#ff7800', weight: 2, fillOpacity: 0.2 },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.shapeName) {
                layer.bindPopup(`<h3>${feature.properties.shapeName}</h3>`);
            }
        }
    });
}

loadKotaSukabumiGeoJSON().then(kotaLayer => {
    kotaLayer.addTo(map);  // Tambahkan ke peta secara default
    addLayersToControl(kotaLayer, 'Kota Sukabumi');
});

// Muat sekolah dari GeoJSON
async function loadSchoolGeoJSON(url) {
    const response = await fetch(url);
    const data = await response.json();
    return L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng).bindPopup(`<b>${feature.properties.name}</b><br>${feature.properties.description}`);
        }
    });
}

loadSchoolGeoJSON('data/sekolah.geojson').then(schoolLayer => {
    schoolLayer.addTo(map);
    addLayersToControl(schoolLayer, 'Sekolah dari GeoJSON');
}).catch(error => {
    console.error("Gagal memuat sekolah.geojson:", error);
});

// Fungsi untuk menambahkan marker sekolah dari koordinat
function addSchoolMarkers(coordinates) {
    coordinates.forEach(coord => {
        const marker = L.marker([coord.lat, coord.lng]).bindPopup(`<b>${coord.name}</b><br>${coord.description}`);
        marker.addTo(map);
    });
}

// Contoh penggunaan: Ganti dengan data Anda
const schoolCoordinates = [
    // SMA yang ada di cibadak sukabumi
    { lat: -6.89780906951394, lng: 106.82141843950093, name: "SMA DOA BANGSA CIBADAK ", description: "Jl. Raya Karangtengah, KM. 14, Desa Karangtengah, Kp, Jl. Selamanjah, Batununggal, Kec. Cibadak, Kab. Sukabumi, Jawa Barat 43351" },
    { lat: -6.907505571955622, lng: 106.72075233950115, name: "SMA NUR ILMI NEGLASARI", description: "Jl. Kubang Jl. Legok, Neglasari, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat" },
    { lat: -6.896135419975772, lng: 106.78030893950091, name: "SMAN 1 CIBADAK", description: "Jl. Perintis Kemerdekaan No.72, Cibadak, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.9184111208625705, lng: 106.77122605518858, name: "SMAS BAITUL HIKMAH", description: "Tenjojaya, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.899979677250046, lng: 106.78379577323435, name: "SMAS PESANTREN UNGGUL AL BAYAN", description: "3QXM+WGW, Kampung Cikiwul, Desa, Sekarwangi, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.90417887237401, lng: 106.77952735299435, name: "SMAS PGRI CIBADAK", description: "Sekarwangi, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },

    // SMK yang ada di cibadak sukabumi
    { lat: -6.896458322525209, lng: 106.78004005114542, name: "SMK TAMAN SISWA CIBADAK", description: "4Q3J+82W, Cibadak, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.893748159468205, lng: 106.81495646250299, name: "SMKN 1 CIBADAK SUKABUMI", description: "4R48+HF5, Jl. Al-Muwahhiddin, Karangtengah, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.8937349752902986, lng: 106.80166932415868, name: "SMKS KESEHATAN HARAPAN BUNDA", description: "4R42+CMV, Karangtengah, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.89857342564933, lng: 106.8224112376521, name: "SMKS MUHAMMADIYAH 2 CIBADAK", description: "Batununggal, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat" },
    { lat: -6.8702637525427, lng: 106.72856770652261, name: "SMKS PEMBANGUNAN CIBADAK", description: "Sukasirna, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.899343163363581, lng: 106.82053183950097, name: "SMKS YLA CIBADAK", description: "Jl. Karangtengah, Selamanjah RT. 02/03, Batununggal, Cibadak, Sukabumi Regency, West Java 43351" },

    // MA yang ada di cibadak sukabumi
    { lat: -6.887521016306474, lng: 106.78180950881635, name: "MA SOFARINA CHILD HOME", description: "4Q6J+WP8, Kp. Situsaeur, Cibadak, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.872026511026045, lng: 106.77701975680344, name: "MAN 1 SUKABUMI", description: "Jl. Suryakencana No.KM.2, Pamuruyan, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.883601355118923, lng: 106.78319925519855, name: "MAS AL HIDAYAH", description: "Jl. Siliwangi No.63, RW.02, Cibadak, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.906119633673576, lng: 106.77858104261382, name: "MAS AL-MARFUIYAH", description: "3QRH+8RC, Jl. Tenjojaya Bantarmuncang, Sekarwangi, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.893856785459005, lng: 106.81337432415866, name: "MAS AL-MUWAHIDIN", description: "Kp.Kaum Kaler No.001, RT.004, Karangtengah, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },
    { lat: -6.86354947821242, lng: 106.95521096024133, name: "MAS ASSYAMSURIYAH", description: "JL. KH. Syamsuri, No. 39, Cibadak, Sudajaya Girang, Kab. Sukabumi, Kabupaten Sukabumi, Jawa Barat 43151" },

    // SLB yang ada di cibadak sukabumi
    { lat: -6.895309627017136, lng: 106.81627676648762, name: "SLB NEGERI HANDAYANI	", description: "Jl. Raya Karang Tengah No.126, Karangtengah, Kec. Cibadak, Kabupaten Sukabumi, Jawa Barat 43351" },

    // SMA yang ada di kota sukabumi
    { lat: -6.881055869266424, lng: 106.96167716942118, name: "SMA PESANTREN UNGGUL AL BAYAN PUTRI", description: "Jl. Cijeruk, Sukamekar, Kec. Sukaraja, Kabupaten Sukabumi, Jawa Barat 43192" },
    { lat: -6.870132112607378, lng: 106.94593875972714, name: "SMAS AZ ZAINIYYAH", description: "Jalan KHM Zezen ZA Nagrog Sinar Barokah, Perbawati, Kabupaten Sukabumi, Jawa Barat 43151" },
    // BAROS
    { lat: -6.963719046181067, lng: 106.93999507753036, name: " SMA ISLAM TERPADU AL-HUDA", description: "Jl. Garuda, Baros, Kec. Baros, Kota Sukabumi, Jawa Barat 43161" },
    { lat: -6.945672174174654, lng: 106.93558262477241, name: "SMAS PELITA MADANIA", description: "Jagaraksa Permai, Jl. RH. Didi Sukardi, Jayaraksa, Baros, Sukabumi City, West Java 43166" },
    // CITAMIANG
    { lat: -6.939084848931854, lng: 106.93099012476894, name: "SMAN 1 SUKABUMI", description: "Jl. RH. Didi Sukardi No.124, Citamiang, Kec. Citamiang, Kota Sukabumi, Jawa Barat 43143" },
    { lat: -6.937138133521232, lng: 106.93074565851715, name: "SMAS PGRI 1 SUKABUMI	", description: "3W7J+47W, Jl. RH. Didi Sukardi, Jayaraksa, Kec. Baros, Kota Sukabumi, Jawa Barat 43144" },
    // GUNUNG PUYUH
    { lat: -6.907518217235076, lng: 106.91273004079063, name: "SMA ISLAM TERPADU AL FATH", description: "3WV7+53V, Jl. Raya Sukabumi, Karang Tengah, Kec. Gunungpuyuh, Kota Sukabumi, Jawa Barat 43121" },
    { lat: -6.908388849058388, lng: 106.91947534088037, name: "SMA ISLAM TERPADU INSANI", description: "Jl. Karamat No.55, Karamat, Kec. Gunungpuyuh, Kota Sukabumi, Jawa Barat 43122" },
    { lat: 6.905546507738838, lng: 106.9176366953267, name: "SMAN 2 SUKABUMI", description: "Jl. Karamat No.93, Karamat, Kec. Gunungpuyuh, Kota Sukabumi, Jawa Barat 43122" },
    { lat: -6.907486476400336, lng: 106.91729637753589, name: "SMAS NURUL KAROMAH", description: "JL. Keramat No.99 RT 003/04, Karamat, Kec. Gunungpuyuh, Kota Sukabumi, Jawa Barat 43122" },
    { lat: -6.9044310552764685, lng: 106.91786723031582, name: "SMAS PESANTREN TERPADU HAYATAN THAYYIBAH", description: "Jl. Karamat No.123, Karamat, Kec. Gunungpuyuh, Kota Sukabumi, Jawa Barat 43122" },
    // CIKOLE
    { lat: -6.911889945154357, lng: 106.95197302477483, name: "SMA ISLAM AL AZHAR 21 SUKABUMI", description: "3XQ2+6QQ, Jl. Subang Jaya, RT.03/RW.04, Subangjaya, Kec. Cikole, Kota Sukabumi, Jawa Barat 43116" },
    { lat: -6.920821667714929, lng: 106.94449278364716, name: "SMAN 3 SUKABUMI", description: "Jl. Ciaul Baru No.21, RT.1/RW.7, Subangjaya, Kec. Cikole, Kota Sukabumi, Jawa Barat 43116" },
    { lat: -6.919559902033247, lng: 106.93138542416104, name: "SMAN 4 SUKABUMI", description: "Jl. Ir. H. Juanda No.8, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113" },
    { lat: -6.918834847488092, lng: 106.92705053083104, name: "SMAS ADVENT SUKABUMI	", description: "3WJG+FR7, Selabatu, Kec. Cikole, Kota Sukabumi, Jawa Barat 43114" },
    { lat: -6.915121036876659, lng: 106.93234988664639, name: "SMAS KRISTEN BPK PENABUR", description: "Jl. Bhayangkara No.240, Selabatu, Kab. Sukabumi, Kota Sukabumi, Jawa Barat 43114" },
    { lat: -6.920844422165435, lng: 106.93219554211228, name: "SMAS MARDI YUANA", description: "Jl. L. R. E. Martadinata No.54, Kebonjati, Kec. Cikole, Kota Sukabumi, Jawa Barat 43112" },
    { lat: -6.918269575217006, lng: 106.93526683642789, name: "SMAS MUHAMMADIYAH", description: "Jl. Rumah Sakit No.6A, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113" },
    { lat: -6.918618385675862, lng: 106.93521185085415, name: "SMAS TAMAN SISWA", description: "International Professional Institute, Jl. Syamsudin. SH, Cikole, Kec. Cikole, Kota Sukabumi, Jawa Barat 43113" },
    { lat: -6.9196479725619495, lng: 106.92425298245016, name: "SMAS YAYASAN AHMAD DJUWAENI", description: "Jalan Veteran 1, No. 36, Gunungpuyuh, Gunungparang, Kec. Cikole, Kota Sukabumi, Jawa Barat 43111" },
    // CIBEUREUM
    { lat: -6.945201571133801, lng: 106.95167378796961, name: "SMAN 5 SUKABUMI", description: "Jl. Sarasa Blok Loasari No.1, Babakan, Kec. Cibeureum, Kota Sukabumi, Jawa Barat 43165" },


    // SMK yang ada di kota sukabumi
    { lat: -6.9053465806425685, lng: 106.93021203830283, name: "SMKN 1 SUKABUMI", description: "Jl. Kabandungan No.90, Kabandungan, Kec. Gunungpuyuh, Kota Sukabumi, Jawa Barat 43122" },
    { lat: -6.870138282615276, lng: 106.9459365848287, name: "SMKS AZZAINIYAH", description: "Jalan KHM Zezen ZA Nagrog Sinar Barokah, Perbawati, Kabupaten Sukabumi, Jawa Barat 43151" },
    { lat: -6.887646266822046, lng: 106.93605940569043, name: "SMKS PGRI SELABINTANA", description: "4W6P+VCR, Karawang, Kab. Sukabumi, Kabupaten Sukabumi, Jawa Barat 43151" },
    // BAROS
    { lat: -6.954450925149009, lng: 106.92216164466572, name: "SMKS GEMA ISTIQOMAH", description: "2WWC+6V9, Jl. Widyakrama, Sudajaya Hilir, Kec. Baros, Kota Sukabumi, Jawa Barat 43161" },
    { lat: -6.9663108077595455, lng: 106.9440042739209, name: "SMKS IT MADANI", description: "Baros, Kec. Baros, Kota Sukabumi, Jawa Barat 43161" },
    { lat: -6.964060508920336, lng: 106.91820039532409, name: "SMKS PLUS AN-NABA", description: "Jl. Widyakrama, Sudajaya Hilir, Kec. Baros, Kota Sukabumi, Jawa Barat 43161" },
    // CITAMIANG
    { lat: -6.94566822901235, lng: 106.92315690485373, name: "SMK MUTIARA CENDEKIA", description: "Jalan Balandongan-Sirnagalih No. 74, Cikondang, Sukabum, Cikondang, Kab. Sukabumi, Kota Sukabumi, Jawa Barat 43161" },
    { lat: -6.934854616815601, lng: 106.92589158306859, name: "SMKN 2 SUKABUMI", description: "Jl. Pelabuhan II No.1, RT.1/RW.6, Cikondang, Kec. Citamiang, Kota Sukabumi, Jawa Barat 43141" },
    { lat: -6.926807893035619, lng: 106.9356677720135, name: "SMKS PELITA YNH SUKABUMI", description: "3WFP+56R, Jl. Otto Iskandardinata Gang Pelita Sukabumi No.RT. 01, RT.01/RW.2, Nanggeleng, Kec. Citamiang, Kota Sukabumi, Jawa Barat 43145" },
    { lat: -6.9356794279843195, lng: 106.92469405163139, name: "SMKS PGRI 1 SUKABUMI", description: "Jl. Pelabuhan II, Cikondang, Kec. Citamiang, Kota Sukabumi, Jawa Barat 43141" },

    // MA yang ada di kota sukabumi
    { lat: -6.896355405524047, lng: 106.9384683127495, name: "MAS TARBIYATUL FALAH", description: "4W3Q+C9W, Jl. Selabintana, Warnasari, Kab. Sukabumi, Kabupaten Sukabumi, Jawa Barat 43151" },
];
addSchoolMarkers(schoolCoordinates);

// Drawing tools
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
    draw: {
        polygon: true,
        polyline: true,
        rectangle: true,
        circle: true,
        marker: true,
        circlemarker: false
    },
    edit: {
        featureGroup: drawnItems
    }
});
map.addControl(drawControl);

map.on('draw:created', function (e) {
    const layer = e.layer;
    drawnItems.addLayer(layer);
    layer.bindPopup('<b>Detail:</b><br><input type="text" placeholder="Nama"><br><button onclick="exportGeoJSON()">Export</button>');
});

function addLayersToControl(layer, name) {
    const overlayMaps = {
        ...window.overlayMaps,  // Ambil yang ada
        [name]: layer
    };
    if (!window.layerControl) {
        window.layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
    } else {
        window.layerControl.addOverlay(layer, name);
    }
    window.overlayMaps = overlayMaps;  // Simpan untuk referensi
}

// Inisialisasi overlayMaps
window.overlayMaps = {};
