const API_BASE = 'http://localhost:8080/productlines';
const CUSTOM_API_BASE = 'http://localhost:8080/api/custom';
let currentPage = 0;
const pageSize = 5;
let myChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initRichTextEditors();
    fetchProductLines();
    fetchAnalytics();

    document.getElementById('searchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 0;
        fetchProductLines();
    });

    document.getElementById('clearSearch').addEventListener('click', () => {
        document.getElementById('descSearch').value = '';
        document.getElementById('nameSearch').value = '';
        document.getElementById('imageSearchInput').value = '';
        currentPage = 0;
        fetchProductLines();
    });

    const imageSearchInput = document.getElementById('imageSearchInput');
    if (imageSearchInput) {
        imageSearchInput.addEventListener('change', async function() {
            if (!this.files.length) return;
            await searchByImage(this.files[0]);
        });
    }

    document.getElementById('addForm').addEventListener('submit', handleAdd);
    document.getElementById('updateForm').addEventListener('submit', handleUpdate);

    const addFileInput = document.getElementById('addImageFile');
    if (addFileInput) addFileInput.addEventListener('change', function() { previewImage(this, 'addPreview', 'addUploadLabel'); });

    const updateFileInput = document.getElementById('updateImageFile');
    if (updateFileInput) updateFileInput.addEventListener('change', function() { previewImage(this, 'updatePreview', 'updateUploadLabel'); });
});

function showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.innerHTML = isError ? `❌ ${message}` : `✅ ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px) scale(0.9)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function extractIdFromLink(href) {
    if (!href) return '';
    const cleanLink = href.split('{')[0];
    const parts = cleanLink.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
}

function getBase64FromFileInput(inputId) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(inputId);
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            resolve(null);
            return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function searchByImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${CUSTOM_API_BASE}/search-image`, {
            method: 'POST',
            body: formData
        });

        document.getElementById('clearSearch').style.display = 'inline-block';

        if (response.ok) {
            const item = await response.json();
            renderTable([item], { totalElements: 1, totalPages: 1, number: 0, size: 5 });
            renderPagination({ totalPages: 0 });
            showToast('Exact image match found!');
        } else {
            showToast('No exact image match found.', true);
            renderTable([], { totalElements: 0, totalPages: 0, number: 0 });
            renderPagination({ totalPages: 0 });
        }
    } catch (error) {
        showToast('Error connecting to image search API.', true);
    }
}
async function fetchProductLines() {
    const descKeyword = document.getElementById('descSearch').value.trim();
    const nameKeyword = document.getElementById('nameSearch').value.trim();
    const clearBtn = document.getElementById('clearSearch');

    // Search Validation
    if (nameKeyword && /^\d+$/.test(nameKeyword)) {
        showToast('Product Line name cannot be purely numbers.', true);
        return;
    }

    let url = `${API_BASE}?page=${currentPage}&size=${pageSize}`;

    // NEW LOGIC: Check if BOTH are filled first for the "AND" operation
    if (nameKeyword && descKeyword) {
        url = `${API_BASE}/search/by-name-and-desc?name=${encodeURIComponent(nameKeyword)}&desc=${encodeURIComponent(descKeyword)}&page=${currentPage}&size=${pageSize}`;
        clearBtn.style.display = 'inline-block';
    }
    // If only Name is filled
    else if (nameKeyword) {
        url = `${API_BASE}/${encodeURIComponent(nameKeyword)}`;
        clearBtn.style.display = 'inline-block';
    }
    // If only Description is filled
    else if (descKeyword) {
        url = `${API_BASE}/search/by-description?keyword=${encodeURIComponent(descKeyword)}&page=${currentPage}&size=${pageSize}`;
        clearBtn.style.display = 'inline-block';
    }
    // If both are empty
    else {
        clearBtn.style.display = 'none';
    }

    try {
        const response = await fetch(url);

        if (response.status === 404) {
             renderTable([], { totalElements: 0, totalPages: 0, number: 0 });
             renderPagination({ totalPages: 0 });
             return;
        }

        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();

        let items = [];
        let pageInfo = { totalElements: 0, totalPages: 0, number: 0 };

        // If the response is a single object (exact name search fallback)
        if (nameKeyword && !descKeyword) {
            items = [data];
            pageInfo = { totalElements: 1, totalPages: 1, number: 0 };
        }
        // If the response is a list/page (AND search, Desc search, or full list)
        else if (data._embedded) {
            let allItems = data._embedded.productLines || data._embedded.productlines || [];

            if (data.page) {
                items = allItems;
                pageInfo = data.page;
            } else {
                const totalElements = allItems.length;
                const totalPages = Math.ceil(totalElements / pageSize) || 1;
                if (currentPage >= totalPages) currentPage = Math.max(0, totalPages - 1);

                const startIndex = currentPage * pageSize;
                items = allItems.slice(startIndex, startIndex + pageSize);

                pageInfo = {
                    totalElements: totalElements,
                    totalPages: totalPages,
                    number: currentPage,
                    size: pageSize
                };
            }
        }

        renderTable(items, pageInfo);
        renderPagination(pageInfo);
    } catch (error) {
        showToast('Error loading data from server', true);
    }
}

function renderTable(items, pageInfo) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try clearing your search or add a new product line below.</p>
            </div>
        </td></tr>`;
        return;
    }

    items.forEach((item, index) => {
        let id = item.productLine;
        if (!id && item._links && item._links.self) {
            id = extractIdFromLink(item._links.self.href);
        }
        const escapedId = encodeURIComponent(id).replace(/'/g, "\\'");

        let imageHtml = `<div class="img-placeholder">🖼</div>`;
        if (item.image) {
            imageHtml = `<img src="data:image/jpeg;base64,${item.image}" alt="${id}" class="product-img" />`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="row-num">${(pageInfo.number * (pageInfo.size || 5)) + index + 1}</td>
            <td class="product-name">${id}</td>
            <td><span class="product-desc" title="${item.textDescription || ''}">${item.textDescription || ''}</span></td>
            <td>${imageHtml}</td>
            <td>
                <div class="actions-cell">
                    <button type="button" class="btn btn-primary btn-sm" onclick="editProduct('${escapedId}')">✏️ Edit</button>
                    <a href="/product-lines/products?line=${escapedId}" class="btn btn-analytics btn-sm" style="text-decoration:none;">👁 View Products</a>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPagination(pageInfo) {
    const container = document.getElementById('paginationContainer');
    if (pageInfo.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `<span class="pagination-info">Page <span>${pageInfo.number + 1}</span> of <span>${pageInfo.totalPages}</span></span><div class="pagination-controls">`;
    html += `<button class="page-btn ${pageInfo.number === 0 ? 'disabled' : ''}" onclick="changePage(${pageInfo.number - 1})" ${pageInfo.number === 0 ? 'disabled' : ''}>‹</button>`;

    for (let i = 0; i < pageInfo.totalPages; i++) {
        html += `<button class="page-btn ${i === pageInfo.number ? 'active' : ''}" onclick="changePage(${i})">${i + 1}</button>`;
    }

    html += `<button class="page-btn ${pageInfo.number >= pageInfo.totalPages - 1 ? 'disabled' : ''}" onclick="changePage(${pageInfo.number + 1})" ${pageInfo.number >= pageInfo.totalPages - 1 ? 'disabled' : ''}>›</button>`;
    html += `</div>`;

    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    fetchProductLines();
}

async function fetchAnalytics() {
    try {
        const response = await fetch(`${CUSTOM_API_BASE}/analytics`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.length === 0) return;

        data.sort((a, b) => b.count - a.count);

        const labels = data.map(d => d.productLine);
        const values = data.map(d => d.count);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

        const canvas = document.getElementById('analyticsChart');
        if (myChart) myChart.destroy();

        myChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, data.length),
                    borderColor: 'transparent',
                    borderWidth: 2,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: false,
                cutout: '55%',
                plugins: { legend: { display: false } }
            }
        });

        const legendContainer = document.getElementById('analyticsLegend');
        const topSeller = data[0];

        let legendHtml = `<div style="margin-bottom: 16px; padding: 12px; background: var(--surface2); border-left: 4px solid var(--accent); border-radius: 4px;">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Most Sold Product Line</p>
            <h3 style="font-size: 1.2rem; color: var(--text-primary); font-weight: 700;">${topSeller.productLine} <span style="font-size: 0.9rem; color: var(--success);">(${topSeller.count} items)</span></h3>
        </div>`;

        legendHtml += `<p style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Full Breakdown</p>`;

        data.forEach((item, i) => {
            const color = colors[i % colors.length];
            legendHtml += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 0.9rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
                    <span style="flex: 1; font-weight: 500;">${item.productLine}</span>
                    <span style="font-weight: 700;">${item.count}</span>
                </div>
            `;
        });

        legendContainer.innerHTML = legendHtml;

    } catch (error) {
        console.error("Failed to load analytics", error);
    }
}

async function handleAdd(e) {
    e.preventDefault();

    const productLineInput = document.getElementById('addProductLine').value.trim();
    const textDescInput = document.getElementById('addTextDescription').value.trim();

    if (/^\d+$/.test(productLineInput)) {
        showToast('Product Line name cannot be purely numbers.', true);
        return;
    }
    if (!textDescInput) {
        showToast('Text Description cannot be empty.', true);
        return;
    }

    syncEditors();
    const base64Image = await getBase64FromFileInput('addImageFile');

    const payload = {
        productLine: productLineInput,
        textDescription: textDescInput,
        htmlDescription: document.getElementById('addHtmlDesc').value,
        image: base64Image
    };

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Added successfully!');
            document.getElementById('addForm').reset();
            clearImage('addImageFile', 'addPreview', 'addUploadLabel');
            document.querySelectorAll('#addForm .editor-area').forEach(area => area.innerHTML = '');
            fetchProductLines();
            fetchAnalytics();
        } else {
            let errorMessage = 'Failed to add. Product Line may already exist.';
            try {
                const errorData = await response.json();
                if (errorData.message) errorMessage = errorData.message;
                else if (errorData.cause && errorData.cause.message) errorMessage = errorData.cause.message;
            } catch (jsonError) {}
            showToast(errorMessage, true);
        }
    } catch (error) {
        showToast('Error connecting to server.', true);
    }
}

async function editProduct(encodedId) {
    const id = decodeURIComponent(encodedId);
    try {
        const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error('Item not found');

        const item = await response.json();
        const updateCard = document.getElementById('updateCard');
        updateCard.style.opacity = '1';
        updateCard.style.pointerEvents = 'auto';

        document.getElementById('updateId').value = id;
        document.getElementById('updateProductLine').value = id;
        document.getElementById('updateTextDescription').value = item.textDescription || '';
        document.getElementById('updateHtmlDesc').value = item.htmlDescription || '';

        const updateEditorArea = document.querySelector('.editor-area[data-textarea="updateHtmlDesc"]');
        if (updateEditorArea) updateEditorArea.innerHTML = item.htmlDescription || '';

        const currentImageDiv = document.getElementById('currentImagePreview');
        const currentImgElement = document.getElementById('currentUpdateImg');
        if (item.image) {
            currentImgElement.src = `data:image/jpeg;base64,${item.image}`;
            currentImageDiv.style.display = 'flex';
        } else {
            currentImgElement.src = '';
            currentImageDiv.style.display = 'none';
        }

        clearImage('updateImageFile', 'updatePreview', 'updateUploadLabel');
        updateCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
        showToast('Error loading item details', true);
    }
}

async function handleUpdate(e) {
    e.preventDefault();

    const textDescInput = document.getElementById('updateTextDescription').value.trim();
    if (!textDescInput) {
        showToast('Text Description cannot be empty.', true);
        return;
    }

    syncEditors();

    const id = document.getElementById('updateId').value;
    const payload = {
        textDescription: textDescInput,
        htmlDescription: document.getElementById('updateHtmlDesc').value
    };

    const base64Image = await getBase64FromFileInput('updateImageFile');
    if (base64Image) {
        payload.image = base64Image;
    }

    try {
        const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Updated successfully!');
            cancelEdit();
            fetchProductLines();
        } else {
            showToast('Failed to update.', true);
        }
    } catch (error) {
        showToast('Error connecting to server.', true);
    }
}

function cancelEdit() {
    const updateCard = document.getElementById('updateCard');
    updateCard.style.opacity = '0.5';
    updateCard.style.pointerEvents = 'none';
    document.getElementById('updateForm').reset();
    document.querySelectorAll('#updateForm .editor-area').forEach(area => area.innerHTML = '');
    clearImage('updateImageFile', 'updatePreview', 'updateUploadLabel');
    document.getElementById('currentImagePreview').style.display = 'none';
}

function initRichTextEditors() {
    document.querySelectorAll('.editor-toolbar').forEach(toolbar => {
        const targetId = toolbar.getAttribute('data-target');
        const textarea = document.getElementById(targetId);
        const editorArea = toolbar.nextElementSibling;

        editorArea.addEventListener('input', () => {
            if (textarea) textarea.value = editorArea.innerHTML;
        });

        toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('mousedown', e => {
                e.preventDefault();
                const cmd = btn.getAttribute('data-cmd');
                const val = btn.getAttribute('data-val') || null;
                document.execCommand(cmd, false, val);
                editorArea.focus();
                if (textarea) textarea.value = editorArea.innerHTML;
            });
        });
    });
}

function syncEditors() {
    document.querySelectorAll('.editor-area').forEach(area => {
        const targetId = area.getAttribute('data-textarea');
        if (targetId) {
            const ta = document.getElementById(targetId);
            if (ta) ta.value = area.innerHTML;
        }
    });
}

function previewImage(input, previewId, labelId) {
    const file = input.files[0];
    if (!file) return;
    const preview = document.getElementById(previewId);
    const label = document.getElementById(labelId);
    const img = document.getElementById(previewId + 'Img');
    const name = document.getElementById(previewId + 'Name');

    const reader = new FileReader();
    reader.onload = e => {
        if(img) img.src = e.target.result;
        if (name) name.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
        if(preview) preview.style.display = 'flex';
        if(label) label.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function clearImage(inputId, previewId, labelId) {
    const input = document.getElementById(inputId);
    if(input) input.value = '';
    const preview = document.getElementById(previewId);
    if(preview) preview.style.display = 'none';
    const label = document.getElementById(labelId);
    if(label) label.style.display = 'block';
}
