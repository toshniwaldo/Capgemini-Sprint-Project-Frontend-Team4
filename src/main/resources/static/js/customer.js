// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {

    const fields = [
        "customerName",
        "contactFirstName",
        "contactLastName",
        "phone",
        "addressLine1",
        "addressLine2",
        "city",
        "country",
        "creditLimit"
    ];

    fields.forEach(markDirty);

    const btn = document.querySelector("#updateBtn");

    document.querySelectorAll("[data-original]").forEach(el => {
        el.addEventListener("input", () => {
            btn.disabled = !hasChanges();
        });
    });

    btn.disabled = true; // initially disabled
});


// ===== MAIN UPDATE =====
function updateCustomer() {

    const btn = document.querySelector("button.btn-success");
    btn.disabled = true;
    btn.innerText = "Updating...";

    const id = document.getElementById("customerNumber").value;

    if (!id) {
        showToast("Customer ID missing", true);
        return reset(btn);
    }

    const data = {};

    function checkAndAdd(fieldId, key, options = {}) {

        const el = document.getElementById(fieldId);
        if (!el) return;

        clearError(el);

        let current = el.value.trim();
        let original = (el.dataset.original || "").trim();

        // 🔥 Normalize phone
        if (options.normalize === "phone") {
            current = current.replace(/[^\d]/g, '');
            original = original.replace(/[^\d]/g, '');
        }

        // 🔥 Convert number
        if (options.type === "number" && current !== "") {
            current = Number(current);
            original = Number(original);
        }

        // 🔥 Dirty check
        if (current !== original) {

            if (options.nullable && current === "") {
                data[key] = null;
            } else {
                data[key] = current;
            }
        }
    }

    // ===== DIRTY CHECK =====
    checkAndAdd("customerName", "customerName");
    checkAndAdd("contactFirstName", "contactFirstName");
    checkAndAdd("contactLastName", "contactLastName");

    checkAndAdd("phone", "phone", { normalize: "phone" });

    checkAndAdd("addressLine1", "addressLine1");
    checkAndAdd("addressLine2", "addressLine2", { nullable: true });

    checkAndAdd("city", "city");
    checkAndAdd("country", "country");

    checkAndAdd("creditLimit", "creditLimit", {
        type: "number",
        nullable: true
    });

    // ===== VALIDATION =====
    if (data.customerName !== undefined && data.customerName === "") {
        return handleError("customerName", "Customer name cannot be blank", btn);
    }

    if (data.contactFirstName !== undefined && data.contactFirstName === "") {
        return handleError("contactFirstName", "First name cannot be blank", btn);
    }

    if (data.contactLastName !== undefined && data.contactLastName === "") {
        return handleError("contactLastName", "Last name cannot be blank", btn);
    }

    if (data.phone !== undefined) {
        if (data.phone.length < 8 || data.phone.length > 15) {
            return handleError("phone", "Phone must contain 8–15 digits", btn);
        }
    }

    if (data.creditLimit !== undefined && data.creditLimit < 0) {
        return handleError("creditLimit", "Credit limit cannot be negative", btn);
    }

    // ===== NO CHANGES =====
    if (Object.keys(data).length === 0) {
        showToast("No changes detected");
        return reset(btn);
    }

    // ===== API CALL =====
    fetch(`${BASE_URL}/customer/update/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw res;
        return res.json();
    })
    .then(() => {
        showToast("Customer updated successfully");

        setTimeout(() => {
            window.location.href = "/customers";
        }, 1200);
    })
    .catch(async err => {
        let message = "Something went wrong";

        try {
            const error = await err.json();
            message = error.message;
        } catch {}

        showToast(message, true);
        reset(btn);
    });
}


// ===== HELPERS =====

// 🔥 Toast
function showToast(message, isError = false) {
    const toastEl = document.getElementById("toast");
    const body = document.getElementById("toastBody");

    toastEl.classList.remove("bg-success", "bg-danger");
    toastEl.classList.add(isError ? "bg-danger" : "bg-success");

    body.innerText = message;

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}


// 🔥 Dirty highlight
function markDirty(fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return; // 🔥 THIS FIX

    const original = (el.dataset.original || "").trim();

    el.addEventListener("input", () => {
        const current = el.value.trim();

        if (current !== original) {
            el.classList.add("border-warning", "bg-light");
        } else {
            el.classList.remove("border-warning", "bg-light");
        }
    });
}


// 🔥 Check if any field changed
function hasChanges() {
    return [...document.querySelectorAll("[data-original]")]
        .some(el => el.value.trim() !== (el.dataset.original || "").trim());
}


// 🔥 Inline error
function handleError(fieldId, message, btn) {
    const el = document.getElementById(fieldId);

    setError(el, message);
    showToast(message, true);
    reset(btn);

    return;
}

function setError(el, message) {
    el.classList.add("is-invalid");

    let feedback = el.nextElementSibling;
    if (!feedback || !feedback.classList.contains("invalid-feedback")) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        el.parentNode.appendChild(feedback);
    }

    feedback.innerText = message;
}

function clearError(el) {
    el.classList.remove("is-invalid");
}


// 🔥 Reset button
function reset(btn) {
    btn.disabled = false;
    btn.innerText = "Update";
}