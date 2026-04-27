// Configuration: Normalization based on a standard A4 sheet
const A4_AREA = 210 * 297; // mm2

async function searchPaper() {
    const brandSelect = document.getElementById('brandSelect');
    if (!brandSelect) return;
    
    const brand = brandSelect.value;
    const grid = document.getElementById('resultsGrid');
    
    // Show loading state
    grid.innerHTML = `<p class="text-center opacity-30 italic py-10">Analyzing store prices for ${brand}...</p>`;

    try {
        // Fetch data with a cache-buster to ensure we get the latest prices
        const response = await fetch('papers.json?v=' + new Date().getTime());
        const allPapers = await response.json();

        // 1. Filter and Calculate (Smart Matching)
        let results = allPapers
            .filter(p => {
                const brandInput = brand.toLowerCase();
                const paperBrand = p.brand.toLowerCase();
                // Matches if "Canson Heritage" contains "Canson" or vice versa
                return brandInput.includes(paperBrand) || paperBrand.includes(brandInput);
            })
            .map(p => {
                const totalArea = p.width * p.height * p.count;
                const a4Equivalents = totalArea / A4_AREA;
                const pricePerA4 = p.price / a4Equivalents;
                return { ...p, pricePerA4 };
            });

        // 2. Sort by price (lowest per A4 first) and take Top 5
        results.sort((a, b) => a.pricePerA4 - b.pricePerA4);
        const top5 = results.slice(0, 5);

        // 3. Render to UI
        grid.innerHTML = "";

        if (top5.length === 0) {
            grid.innerHTML = `<p class="text-center italic opacity-40 py-12 text-sm">No specific deals found for ${brand} right now.</p>`;
            return;
        }

        top5.forEach((item) => {
            // Determine icon based on format name
            let icon = "📄"; // Default: Sheet
            const name = item.name.toLowerCase();
            if (name.includes("roll")) icon = "📜";
            else if (name.includes("block") || name.includes("pad") || name.includes("spiral")) icon = "📒";

            grid.innerHTML += `
                <a href="${item.url}" target="_blank" class="result-item animate-in" style="display: flex; background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; text-decoration: none; color: inherit; box-shadow: 0 4px 15px rgba(0,0,0,0.03); align-items: center; border: 1px solid transparent; transition: all 0.2s;">
                    <div style="width: 50px; height: 50px; background: #F9F7F4; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 20px; font-size: 1.2rem;">${icon}</div>
                    <div style="flex: 1;">
                        <h3 style="font-weight: 600; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 0.02em;">${item.store}</h3>
                        <p style="font-size: 13px; opacity: 0.5; margin: 0; font-style: italic;">${item.brand} ${item.name}</p>
                    </div>
                    <div style="text-right; margin-left: 20px;">
                        <div style="background: #F3EFE9; padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; white-space: nowrap;">${item.pricePerA4.toFixed(2)} SEK</div>
                        <p style="font-size: 9px; opacity: 0.3; margin-top: 4px; text-transform: uppercase; font-weight: bold; text-align: right;">Total: ${item.price} SEK</p>
                    </div>
                </a>
            `;
        });

    } catch (error) {
        console.error("Error loading paper data:", error);
        grid.innerHTML = `<p class="text-center opacity-50 py-10 italic">Connection error. Please ensure papers.json is in the same folder.</p>`;
    }
}

// Start the engine when the page is ready
document.addEventListener('DOMContentLoaded', searchPaper);
