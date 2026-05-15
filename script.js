const sizeChart = [
    {
        size: 'S',
        heightRange: [160, 170],
        weightRange: [55, 65],
        note: 'Vừa vặn (Fit vừa)'
    },
    {
        size: 'M',
        heightRange: [168, 178],
        weightRange: [65, 78],
        note: 'Phù hợp Gymmer'
    },
    {
        size: 'L',
        heightRange: [175, 185],
        weightRange: [78, 90],
        note: 'Form Cơ bắp (Muscular)'
    },
    {
        size: 'XL',
        heightRange: [180, 190],
        weightRange: [90, 105],
        note: 'Form Rất cơ bắp (Big Muscular)'
    }
];

const calculateBtn = document.getElementById('calculate-btn');
const resultSection = document.getElementById('result-section');
const bestSizeEl = document.getElementById('best-size');
const sizeNoteEl = document.getElementById('size-note');

const tightSizeEl = document.getElementById('tight-size');
const standardSizeEl = document.getElementById('standard-size');
const looseSizeEl = document.getElementById('loose-size');

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

    // Logic: Tìm size mà người dùng nằm trong khoảng đó
    // Nếu nằm trong nhiều khoảng (overlap), tính toán độ lệch so với trung tâm
    
    const possibleSizes = sizeChart.filter(s => {
        // Kiểm tra xem có nằm trong hoặc gần khoảng không
        const inHeight = (h >= s.heightRange[0] - 2 && h <= s.heightRange[1] + 2);
        const inWeight = (w >= s.weightRange[0] - 2 && w <= s.weightRange[1] + 2);
        return inHeight && inWeight;
    });

    if (possibleSizes.length === 0) {
        // Nếu không nằm trong bất kỳ khoảng nào, tìm size gần nhất
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
        // Nếu có nhiều lựa chọn, ưu tiên cân nặng vì nó quyết định độ ôm của áo
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
    // Show section
    resultSection.classList.remove('hidden');
    setTimeout(() => {
        resultSection.classList.add('show');
    }, 10);

    // Update main result
    bestSizeEl.textContent = res.standard.size;
    sizeNoteEl.textContent = res.standard.note;

    // Update alternatives
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

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
