// Dữ liệu mặc định
const defaultSizeChart = [
    { size: 'S', heightRange: [160, 170], weightRange: [55, 65], note: 'Vừa vặn (Fit vừa)' },
    { size: 'M', heightRange: [168, 178], weightRange: [65, 78], note: 'Phù hợp Gymmer' },
    { size: 'L', heightRange: [175, 185], weightRange: [78, 90], note: 'Form Cơ bắp (Muscular)' },
    { size: 'XL', heightRange: [180, 190], weightRange: [90, 105], note: 'Form Rất cơ bắp (Big Muscular)' }
];

// Khởi tạo bảng size từ LocalStorage hoặc dùng mặc định
let sizeChart = JSON.parse(localStorage.getItem('customSizeChart')) || defaultSizeChart;

// DOM Elements
const adminToggle = document.getElementById('admin-toggle');
const adminPanel = document.getElementById('admin-panel');
const closeAdmin = document.getElementById('close-admin');
const uploadZone = document.getElementById('upload-zone');
const chartUpload = document.getElementById('chart-upload');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const previewContainer = document.getElementById('preview-container');
const imagePreview = document.getElementById('image-preview');
const processBtn = document.getElementById('process-image-btn');
const aiStatus = document.getElementById('ai-status');

const calculateBtn = document.getElementById('calculate-btn');
const resultSection = document.getElementById('result-section');
const bestSizeEl = document.getElementById('best-size');
const sizeNoteEl = document.getElementById('size-note');
const tightSizeEl = document.getElementById('tight-size');
const standardSizeEl = document.getElementById('standard-size');
const looseSizeEl = document.getElementById('loose-size');

// Admin Panel Logic
adminToggle.addEventListener('click', () => adminPanel.classList.remove('hidden'));
closeAdmin.addEventListener('click', () => adminPanel.classList.add('hidden'));

// Upload Logic
uploadZone.addEventListener('click', () => chartUpload.click());

chartUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            uploadPlaceholder.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// AI Recognition Simulation (In reality, you would call an AI API like Gemini)
processBtn.addEventListener('click', async () => {
    aiStatus.classList.remove('hidden');
    processBtn.classList.add('hidden');
    
    // Giả lập xử lý AI trong 3 giây
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Đây là nơi bạn sẽ gọi API để nhận diện bảng size.
    // Dưới đây là kết quả mẫu sau khi AI "quét" hình ảnh bạn cung cấp
    const recognizedData = [
        { size: 'S', heightRange: [160, 170], weightRange: [55, 65], note: 'Fit vừa' },
        { size: 'M', heightRange: [168, 178], weightRange: [65, 78], note: 'Phù hợp gymmer' },
        { size: 'L', heightRange: [175, 185], weightRange: [78, 90], note: 'Cơ bắp' },
        { size: 'XL', heightRange: [180, 190], weightRange: [90, 105], note: 'Rất cơ bắp' }
    ];

    // Cập nhật hệ thống
    sizeChart = recognizedData;
    localStorage.setItem('customSizeChart', JSON.stringify(sizeChart));

    aiStatus.innerHTML = '<span style="color: #4facfe">✓ Đã cập nhật bảng size thành công!</span>';
    
    setTimeout(() => {
        adminPanel.classList.add('hidden');
        // Reset Admin UI
        aiStatus.classList.add('hidden');
        processBtn.classList.remove('hidden');
        uploadPlaceholder.classList.remove('hidden');
        previewContainer.classList.add('hidden');
    }, 1500);
});

// Calculation Logic
calculateBtn.addEventListener('click', () => {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);

    if (!height || !weight) {
        alert('Vui lòng nhập đầy đủ chiều cao và cân nặng!');
        return;
    }

    const result = findBestSize(height, weight);
    displayResult(result);
});

function findBestSize(h, w) {
    let bestMatch = null;
    let minDiff = Infinity;

    // Tìm size phù hợp nhất
    const possibleSizes = sizeChart.filter(s => {
        const inHeight = (h >= s.heightRange[0] - 2 && h <= s.heightRange[1] + 2);
        const inWeight = (w >= s.weightRange[0] - 2 && w <= s.weightRange[1] + 2);
        return inHeight && inWeight;
    });

    if (possibleSizes.length === 0) {
        let closest = sizeChart[0];
        let minGlobalDiff = Infinity;
        sizeChart.forEach(s => {
            const hMid = (s.heightRange[0] + s.heightRange[1]) / 2;
            const wMid = (s.weightRange[0] + s.weightRange[1]) / 2;
            const diff = Math.abs(h - hMid) / 10 + Math.abs(w - wMid);
            if (diff < minGlobalDiff) {
                minGlobalDiff = diff;
                closest = s;
            }
        });
        bestMatch = closest;
    } else {
        possibleSizes.forEach(s => {
            const wMid = (s.weightRange[0] + s.weightRange[1]) / 2;
            const diff = Math.abs(w - wMid);
            if (diff < minDiff) {
                minDiff = diff;
                bestMatch = s;
            }
        });
    }

    const index = sizeChart.indexOf(bestMatch);
    
    return {
        standard: bestMatch,
        tight: index > 0 ? sizeChart[index - 1] : null,
        loose: index < sizeChart.length - 1 ? sizeChart[index + 1] : null
    };
}

function displayResult(res) {
    resultSection.classList.remove('hidden');
    setTimeout(() => resultSection.classList.add('show'), 10);

    bestSizeEl.textContent = res.standard.size;
    sizeNoteEl.textContent = res.standard.note;
    standardSizeEl.textContent = res.standard.size;
    
    if (res.tight) {
        tightSizeEl.textContent = res.tight.size;
        document.getElementById('tight-option').style.opacity = '1';
    } else {
        tightSizeEl.textContent = '-';
        document.getElementById('tight-option').style.opacity = '0.3';
    }

    if (res.loose) {
        looseSizeEl.textContent = res.loose.size;
        document.getElementById('loose-option').style.opacity = '1';
    } else {
        looseSizeEl.textContent = '-';
        document.getElementById('loose-option').style.opacity = '0.3';
    }

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
