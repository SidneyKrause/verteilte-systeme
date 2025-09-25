// Checklist

document.addEventListener("DOMContentLoaded", async () => {
    const checklistContainer = document.querySelector(".checkboxes");
    if (!checklistContainer) return;
    
    const checkboxes = checklistContainer.querySelectorAll("input[type='checkbox']");
    const checklistLabels = Array.from(checklistContainer.querySelectorAll("p")).map(el =>
        el.textContent.trim()
    );

    // Load checklist from backend
    try {
        const res = await fetch("/checklist", {
            method: "GET",
            credentials: "include", 
        });

        if (!res.ok) throw new Error("Failed to load checklist");

        const data = await res.json();
        console.log("Loaded checklist:", data);
        const checklistItems = data.checklist?.items || [];

        checklistItems.forEach((item, index) => {
            if (checkboxes[index] )  {
                checkboxes[index].checked = item.checked;
            }
        });
    } catch (err) {
        console.error("[Checklist] Load error:", err.message);
    }

    // Save to backend on change
    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener("change", async () => {
            const updatedItems = checklistLabels.map((label, i) => ({
                label,
                checked: checkboxes[i].checked,
            }));

            try {
                const res = await fetch("/checklist", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ items: updatedItems }),
                });

                if (!res.ok) {
                    throw new Error("Failed to save checklist");
                }
            } catch (err) {
                console.error("[Checklist] Save error:", err.message);
            }
        });
    });
});
