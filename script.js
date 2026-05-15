// Dữ liệu mặc định cho các loại trang phục
const defaultCharts = {
    tshirt: [
        { size: 'S', heightRange: [160, 170], weightRange: [55, 65], note: 'Vừa vặn (Fit vừa)' },
        { size: 'M', heightRange: [168, 178], weightRange: [65, 78], note: 'Phù hợp Gymmer' },
        { size: 'L', heightRange: [175, 185], weightRange: [78, 90], note: 'Form Cơ bắp (Muscular)' },
        { size: 'XL', heightRange: [180, 190], weightRange: [90, 105], note: 'Form Rất cơ bắp (Big Muscular)' }
    ],
    pants: [
        { size: '28', heightRange: [160, 170], weightRange: [50, 60], note: 'Slim Fit' },
        { size: '30', heightRange: [165, 175], weightRange: [60, 70], note: 'Regular Fit' },
        { size: '32', heightRange: [170, 180], weightRange: [70, 80], note: 'Comfort Fit' },
        { size: '34', heightRange: [175, 185], weightRange: [80, 95], note: 'Loose Fit' }
    ],
    outerwear: [
        { size: 'M', heightRange: [160, 175], weightRange: [55, 70], note: 'Standard' },
        { size: 'L', heightRange: [170, 185], weightRange: [70, 85], note: 'Oversized' },
        { size: 'XL', heightRange: [180, 195], weightRange: [85, 105], note: 'Very Oversized' }
    ]
};

// Khởi tạo từ LocalStorage
let allCharts = JSON.parse(localStorage.getItem('multiSizeCharts')) || defaultCharts;
let currentType = 'tshirt';

// DOM Elements
const adminToggle = document.getElementById('admin-toggle');
const adminPanel = document.getElementById('admin-panel');
const closeAdmin = document.getElementById('close-admin');
const adminProductType = document.getElementById('admin-product-type');
const chartUpload = document.getElementById('chart-upload');
const uploadZone = document.getElementById('upload-zone');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const processBtn = document.getElementById('process-image-btn');
const aiStatus = document.getElementById('ai-status');

const typeChips = document.querySelectorAll('.chip');
const calculateBtn = document.getElementById('calculate-btn');
const resultSection = document.getElementById('result-section');

// Product Selection Logic
typeChips.forEach(chip => {
    chip.addEventListener('click', () => {
        typeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentType = chip.dataset.type;
        // Hide results if type changes to avoid confusion
        resultSection.classList.add('hidden');
    });
});

// Admin Panel Logic
adminToggle.addEventListener('click', () => adminPanel.classList.remove('hidden'));
closeAdmin.addEventListener('click', () => adminPanel.classList.add('hidden'));

uploadZone.addEventListener('click', () => chartUpload.click());
chartUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            document.getElementById('upload-placeholder').classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Mock AI Logic for multi-type
processBtn.addEventListener('click', async () => {
    aiStatus.classList.remove('hidden');
    processBtn.classList.add('hidden');
    
    await new Promise(resolve => setTimeout(resolve, 2500));

    const selectedAdminType = adminProductType.value;
    
    // Giả lập dữ liệu nhận diện khác nhau cho từng loại
    let newData = [];
    if (selectedAdminType === 'pants') {
        newData = [
            { size: '29', heightRange: [160, 170], weightRange: [55, 65], note: 'Slim' },
            { size: '31', heightRange: [168, 178], weightRange: [65, 78], note: 'Regular' },
            { size: '33', heightRange: [175, 185], weightRange: [78, 90], note: 'Straight' }
        ];
    } else {
        newData = defaultCharts[selectedAdminType]; // Dùng mẫu cho các loại khác
    }

    allCharts[selectedAdminType] = newData;
    localStorage.setItem('multiSizeCharts', JSON.stringify(allCharts));

    aiStatus.innerHTML = `<span style="color: #4facfe">✓ Đã cập nhật bảng size cho ${selectedAdminType}!</span>`;
    
    setTimeout(() => {
        adminPanel.classList.add('hidden');
        aiStatus.classList.add('hidden');
        processBtn.classList.remove('hidden');
        previewContainer.classList.add('hidden');
        document.getElementById('upload-placeholder').classList.remove('hidden');
    }, 1500);
});

// Calculation Logic
calculateBtn.addEventListener('click', () => {
    const h = parseFloat(document.getElementById('height').value);
    const w = parseFloat(document.getElementById('weight').value);
    if (!h || !w) return alert('Vui lòng nhập đủ thông số!');

    const currentChart = allCharts[currentType];
    const result = findBestSize(h, w, currentChart);
    displayResult(result, currentChart);
});

function findBestSize(h, w, chart) {
    let bestMatch = null;
    let minDiff = Infinity;

    const possible = chart.filter(s => 
        (h >= s.heightRange[0] - 2 && h <= s.heightRange[1] + 2) && 
        (w >= s.weightRange[0] - 2 && w <= s.weightRange[1] + 2)
    );

    if (possible.length === 0) {
        let closest = chart[0];
        let minGlobalDiff = Infinity;
        chart.forEach(s => {
            const hMid = (s.heightRange[0] + s.heightRange[1]) / 2;
            const wMid = (s.weightRange[0] + s.weightRange[1]) / 2;
            const diff = Math.abs(h - hMid) / 10 + Math.abs(w - wMid);
            if (diff < minGlobalDiff) {
                minGlobalDiff = diff; closest = s;
            }
        });
        bestMatch = closest;
    } else {
        possible.forEach(s => {
            const wMid = (s.weightRange[0] + s.weightRange[1]) / 2;
            const diff = Math.abs(w - wMid);
            if (diff < minDiff) { minDiff = diff; bestMatch = s; }
        });
    }

    const idx = chart.indexOf(bestMatch);
    return {
        standard: bestMatch,
        tight: idx > 0 ? chart[idx - 1] : null,
        loose: idx < chart.length - 1 ? chart[idx + 1] : null
    };
}

function displayResult(res, chart) {
    resultSection.classList.remove('hidden');
    setTimeout(() => resultSection.classList.add('show'), 10);

    document.getElementById('best-size').textContent = res.standard.size;
    document.getElementById('size-note').textContent = res.standard.note;
    document.getElementById('standard-size').textContent = res.standard.size;
    
    const tEl = document.getElementById('tight-size');
    const lEl = document.getElementById('loose-size');

    if (res.tight) {
        tEl.textContent = res.tight.size;
        document.getElementById('tight-option').style.opacity = '1';
    } else {
        tEl.textContent = '-';
        document.getElementById('tight-option').style.opacity = '0.3';
    }

    if (res.loose) {
        lEl.textContent = res.loose.size;
        document.getElementById('loose-option').style.opacity = '1';
    } else {
        lEl.textContent = '-';
        document.getElementById('loose-option').style.opacity = '0.3';
    }

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
