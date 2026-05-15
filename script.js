// --- Dữ liệu mặc định ---
const defaultProducts = [
    {
        id: 'p1',
        name: 'Áo Tank / T-shirt (Mẫu)',
        chart: [
            { size: 'S', hMin: 160, hMax: 170, wMin: 55, wMax: 65, note: 'Fit vừa' },
            { size: 'M', hMin: 168, hMax: 178, wMin: 65, wMax: 78, note: 'Phù hợp gymmer' },
            { size: 'L', hMin: 175, hMax: 185, wMin: 78, wMax: 90, note: 'Cơ bắp' },
            { size: 'XL', hMin: 180, hMax: 190, wMin: 90, wMax: 105, note: 'Rất cơ bắp' }
        ]
    }
];

// --- Khởi tạo ---
let products = JSON.parse(localStorage.getItem('premium_products')) || defaultProducts;
let activeProductId = null;

// --- DOM Elements ---
const viewToggle = document.getElementById('view-toggle');
const toggleText = document.getElementById('toggle-text');
const userView = document.getElementById('user-view');
const adminView = document.getElementById('admin-view');

const productDropdown = document.getElementById('product-dropdown');
const productList = document.getElementById('product-list');
const productEditor = document.getElementById('product-editor');
const editorEmpty = document.getElementById('editor-empty');
const sizeTableBody = document.getElementById('size-table-body');
const editProductName = document.getElementById('edit-product-name');

// --- Điều hướng ---
viewToggle.addEventListener('click', () => {
    if (userView.classList.contains('active')) {
        userView.classList.remove('active');
        userView.classList.add('hidden');
        adminView.classList.remove('hidden');
        adminView.classList.add('active');
        toggleText.textContent = 'Trang khách hàng';
        renderAdminSidebar();
    } else {
        adminView.classList.remove('active');
        adminView.classList.add('hidden');
        userView.classList.remove('hidden');
        userView.classList.add('active');
        toggleText.textContent = 'Quản lý (Admin)';
        renderUserDropdown();
    }
});

// --- Quản lý Admin ---
function renderAdminSidebar() {
    productList.innerHTML = '';
    products.forEach(p => {
        const item = document.createElement('div');
        item.className = `product-item ${p.id === activeProductId ? 'active' : ''}`;
        item.textContent = p.name;
        item.onclick = () => loadProductToEditor(p.id);
        productList.appendChild(item);
    });
}

document.getElementById('add-new-product-btn').onclick = () => {
    const newId = 'prod_' + Date.now();
    const newProd = { id: newId, name: 'Sản phẩm mới', chart: [] };
    products.push(newProd);
    activeProductId = newId;
    renderAdminSidebar();
    loadProductToEditor(newId);
};

function loadProductToEditor(id) {
    activeProductId = id;
    const product = products.find(p => p.id === id);
    if (!product) return;

    editorEmpty.classList.add('hidden');
    productEditor.classList.remove('hidden');
    editProductName.value = product.name;
    
    renderSizeTable(product.chart);
    renderAdminSidebar();
}

function renderSizeTable(chart) {
    sizeTableBody.innerHTML = '';
    chart.forEach((row, idx) => {
        addTableRow(row);
    });
}

function addTableRow(data = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="text" value="${data.size || ''}" placeholder="S"></td>
        <td><input type="number" value="${data.hMin || ''}" placeholder="160"></td>
        <td><input type="number" value="${data.hMax || ''}" placeholder="170"></td>
        <td><input type="number" value="${data.wMin || ''}" placeholder="55"></td>
        <td><input type="number" value="${data.wMax || ''}" placeholder="65"></td>
        <td><input type="text" value="${data.note || ''}" placeholder="Fit vừa"></td>
        <td><button class="delete-row-btn" onclick="this.closest('tr').remove()">&times;</button></td>
    `;
    sizeTableBody.appendChild(tr);
}

document.getElementById('add-row-btn').onclick = () => addTableRow();

document.getElementById('save-product-btn').onclick = () => {
    const product = products.find(p => p.id === activeProductId);
    if (!product) return;

    product.name = editProductName.value;
    const rows = Array.from(sizeTableBody.querySelectorAll('tr'));
    product.chart = rows.map(tr => {
        const inputs = tr.querySelectorAll('input');
        return {
            size: inputs[0].value,
            hMin: parseFloat(inputs[1].value),
            hMax: parseFloat(inputs[2].value),
            wMin: parseFloat(inputs[3].value),
            wMax: parseFloat(inputs[4].value),
            note: inputs[5].value
        };
    });

    localStorage.setItem('premium_products', JSON.stringify(products));
    renderAdminSidebar();
    alert('Đã lưu sản phẩm thành công!');
};

document.getElementById('delete-product-btn').onclick = () => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        products = products.filter(p => p.id !== activeProductId);
        localStorage.setItem('premium_products', JSON.stringify(products));
        activeProductId = null;
        productEditor.classList.add('hidden');
        editorEmpty.classList.remove('hidden');
        renderAdminSidebar();
    }
};

// --- Import Excel ---
const excelInput = document.getElementById('excel-input');
document.getElementById('import-excel-btn').onclick = () => excelInput.click();

excelInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Quy ước: Excel có các cột: Size, HeightMin, HeightMax, WeightMin, WeightMax, Note
        // Chúng ta sẽ map chúng vào bảng
        sizeTableBody.innerHTML = '';
        data.forEach(row => {
            addTableRow({
                size: row.Size || row['Kích cỡ'] || '',
                hMin: row.HeightMin || row['Cao Min'] || '',
                hMax: row.HeightMax || row['Cao Max'] || '',
                wMin: row.WeightMin || row['Nặng Min'] || '',
                wMax: row.WeightMax || row['Nặng Max'] || '',
                note: row.Note || row['Ghi chú'] || ''
            });
        });
    };
    reader.readAsBinaryString(file);
};

// --- Giao diện khách hàng ---
function renderUserDropdown() {
    productDropdown.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        productDropdown.appendChild(opt);
    });
}

document.getElementById('calculate-btn').onclick = () => {
    const pId = productDropdown.value;
    const h = parseFloat(document.getElementById('height').value);
    const w = parseFloat(document.getElementById('weight').value);

    if (!pId) return alert('Vui lòng chọn sản phẩm!');
    if (!h || !w) return alert('Vui lòng nhập chiều cao và cân nặng!');

    const product = products.find(p => p.id === pId);
    const result = calculateSize(h, w, product.chart);
    showResult(result);
};

function calculateSize(h, w, chart) {
    if (!chart || chart.length === 0) return null;

    let bestMatch = null;
    let minDiff = Infinity;

    // Tìm size mà người dùng nằm trong khoảng (có sai số 2cm/2kg)
    const possible = chart.filter(s => 
        (h >= s.hMin - 2 && h <= s.hMax + 2) && (w >= s.wMin - 2 && w <= s.wMax + 2)
    );

    if (possible.length === 0) {
        // Tìm size gần nhất nếu không trúng khoảng nào
        chart.forEach(s => {
            const hMid = (s.hMin + s.hMax) / 2;
            const wMid = (s.wMin + s.wMax) / 2;
            const diff = Math.abs(h - hMid) / 10 + Math.abs(w - wMid);
            if (diff < minDiff) { minDiff = diff; bestMatch = s; }
        });
    } else {
        // Ưu tiên cân nặng
        possible.forEach(s => {
            const wMid = (s.wMin + s.wMax) / 2;
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

function showResult(res) {
    const section = document.getElementById('result-section');
    section.classList.remove('hidden');

    document.getElementById('best-size').textContent = res.standard.size;
    document.getElementById('size-note').textContent = res.standard.note;
    document.getElementById('standard-size').textContent = res.standard.size;
    document.getElementById('tight-size').textContent = res.tight ? res.tight.size : '-';
    document.getElementById('loose-size').textContent = res.loose ? res.loose.size : '-';

    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Chạy lần đầu
renderUserDropdown();
