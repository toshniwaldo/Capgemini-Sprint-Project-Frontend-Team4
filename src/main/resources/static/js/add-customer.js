async function addCustomer() {

    const btn = document.getElementById("addBtn");
    btn.disabled = true;
    btn.innerText = "Adding...";

    // Collect values
    const customerName = document.getElementById("customerName").value.trim();
    const contactFirstName = document.getElementById("contactFirstName").value.trim();
    const contactLastName = document.getElementById("contactLastName").value.trim();
    let phone = document.getElementById("phone").value.trim();
    const addressLine1 = document.getElementById("addressLine1").value.trim();
    const addressLine2 = document.getElementById("addressLine2").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const postalCode = document.getElementById("postalCode").value.trim();
    const country = document.getElementById("country").value.trim();
    const creditLimit = document.getElementById("creditLimit").value;
    const empId = document.getElementById("salesRepEmployeeNumber").value;

    // 🔥 FRONTEND VALIDATION (aligned with backend)

    if (!customerName) return handleError("Customer name is required");
    if (!contactFirstName) return handleError("First name is required");
    if (!contactLastName) return handleError("Last name is required");
    if (!addressLine1) return handleError("Address Line 1 is required");
    if (!city) return handleError("City is required");
    if (!country) return handleError("Country is required");

    // Normalize phone (same as backend)
    phone = phone.replace(/[^\d]/g, "");

    if (!phone || phone.length < 8 || phone.length > 15) {
        return handleError("Phone must contain 8 to 15 digits");
    }

    if (postalCode && !/^\d{6}$/.test(postalCode)) {
        return handleError("Postal code must be 6 digits");
    }

    if (creditLimit && Number(creditLimit) < 0) {
        return handleError("Credit limit cannot be negative");
    }

    // 🔥 Build request payload
    const data = {
        customerName,
        contactFirstName,
        contactLastName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state: state || null,
        postalCode: postalCode || null,
        country,
        creditLimit: creditLimit || null
    };

    // 🔥 SDR relationship handling
    if (empId) {
        data.salesRepEmployee = `/employees/${empId}`;
    }

    try {
        const res = await fetch(`${BASE_URL}/customer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            let message = "Something went wrong";

            try {
                const error = await res.json();
                message = error.message || message;
            } catch {
                message = res.statusText;
            }

            throw new Error(message);
        }

        // Success
        window.location.href = "/customers?success=created";

    } catch (err) {
        handleError(err.message);
    }

    // 🔥 Helper
    function handleError(message) {
        alert(message);
        btn.disabled = false;
        btn.innerText = "Add";
    }
}