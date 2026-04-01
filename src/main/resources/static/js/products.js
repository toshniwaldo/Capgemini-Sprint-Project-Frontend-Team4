document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lineParam = urlParams.get('line');

    if (!lineParam) {
        document.getElementById('lineHeaderTitle').textContent = 'Unknown';
        document.getElementById('productsTableBody').innerHTML = '<tr><td colspan="6" style="text-align:center;">No Product Line specified in URL.</td></tr>';
        return;
    }

    document.getElementById('lineHeaderTitle').textContent = lineParam;

    // Trigger background assembly based on the product line!
    if (typeof AutoAssembly !== 'undefined') {
        AutoAssembly.show(lineParam);
    }

    fetchProducts(lineParam, 0);
});

async function fetchProducts(line, page) {
    // FIX: Appended &size=1000 so the backend returns all items for client-side pagination.
    const API_URL = `http://localhost:8080/products/search/searchByNameOrLineTwo?line=${encodeURIComponent(line)}&size=1000`;

    try {
        const response = await fetch(API_URL);

        if (response.status === 404) {
            renderProductsTable([], { totalElements: 0, totalPages: 0, number: page, size: 5 });
            renderProductsPagination(line, { totalPages: 0 });
            return;
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        let allProducts = [];
        if (data._embedded && data._embedded.products) {
            allProducts = data._embedded.products;
        }

        // FIX: Reverted to 5 items per page as requested!
        const pageSize = 5;
        const totalElements = allProducts.length;
        const totalPages = Math.ceil(totalElements / pageSize) || 1;

        const startIndex = page * pageSize;
        const paginatedProducts = allProducts.slice(startIndex, startIndex + pageSize);

        const pageInfo = {
            totalElements: totalElements,
            totalPages: totalPages,
            number: page,
            size: pageSize
        };

        renderProductsTable(paginatedProducts, pageInfo);
        renderProductsPagination(line, pageInfo);

    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById('productsTableBody').innerHTML = `
            <tr><td colspan="6" style="text-align:center; padding:30px;">
                <span style="color: var(--danger); font-weight: 600;">Error loading products. Make sure the backend is running.</span><br>
                <small style="color:var(--text-secondary); margin-top:8px; display:block; line-height:1.5;">
                   (Developer Note: 1. Ensure <b>ProductRepository.java</b> has <code>@CrossOrigin(origins = "*")</code>.<br>
                   2. Check your Java terminal for any exceptions!)
                </small>
            </td></tr>`;
    }
}

function renderProductsTable(products, pageInfo) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon">📦</div>
                <h3>No products found</h3>
                <p>There are no products assigned to this product line.</p>
            </div>
        </td></tr>`;
        return;
    }

    products.forEach((product, index) => {
        const tr = document.createElement('tr');
        const msrp = product.MSRP || 0;
        const buyPrice = product.buyPrice || 0;

        tr.innerHTML = `
            <td class="row-num">${(pageInfo.number * pageInfo.size) + index + 1}</td>
            <td class="product-name">${product.productName || 'Unknown'}</td>
            <td><span class="product-desc">${product.productVendor || 'N/A'}</span></td>
            <td style="font-weight:600;">$${msrp.toFixed(2)}</td>
            <td style="color:var(--text-secondary);">$${buyPrice.toFixed(2)}</td>
            <td>
                <span style="background:var(--surface2); padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:600;">
                    ${product.quantityInStock || 0}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderProductsPagination(line, pageInfo) {
    const container = document.getElementById('productsPagination');
    if (pageInfo.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `<span class="pagination-info">Page <span>${pageInfo.number + 1}</span> of <span>${pageInfo.totalPages}</span></span><div class="pagination-controls">`;
    html += `<button class="page-btn ${pageInfo.number === 0 ? 'disabled' : ''}" onclick="fetchProducts('${line}', ${pageInfo.number - 1})" ${pageInfo.number === 0 ? 'disabled' : ''}>‹</button>`;

    for (let i = 0; i < pageInfo.totalPages; i++) {
        html += `<button class="page-btn ${i === pageInfo.number ? 'active' : ''}" onclick="fetchProducts('${line}', ${i})">${i + 1}</button>`;
    }

    html += `<button class="page-btn ${pageInfo.number >= pageInfo.totalPages - 1 ? 'disabled' : ''}" onclick="fetchProducts('${line}', ${pageInfo.number + 1})" ${pageInfo.number >= pageInfo.totalPages - 1 ? 'disabled' : ''}>›</button>`;
    html += `</div>`;

    container.innerHTML = html;
}