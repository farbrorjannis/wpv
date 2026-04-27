// Configuration
const A4_AREA = 210 * 297; // mm2

async function searchPaper() {
    const brand = document.getElementById('brandSelect').value;
    const material = document.querySelector('input[name="material"]:checked').value;
    const grid = document.getElementById('resultsGrid');
    const header = document.getElementById('resultsHeader');

    try {
        // 1. Fetch data from your JSON file
        const response = await fetch('papers.json');
        const allPapers = await response.json();

        // 2. Filter and Calculate
        let results = allPapers
            .filter(p => p.brand === brand && p.material === material)
            .map(p => {
                const totalArea = p.width * p.height * p.count;
                const a4Equivalents = totalArea / A4_AREA;
                const pricePerA4 = p.price / a4Equivalents;
                return { ...p, pricePerA4 };
            });

        // 3. Sort by price (lowest first) and take Top 5
        results.sort((a, b) => a.pricePerA4 - b.pricePerA4);
        const top5 = results.slice(0, 5);

        // 4. Render to UI
        header.classList.remove('hidden');
        grid.innerHTML = "";

        if (top5.length === 0) {
            grid.innerHTML = `<p class="text-center italic opacity-50 mt-12">No matches found for this selection.</p>`;
            return;
        }

        top5.forEach((item, index) => {
            const isBest = index === 0;
            grid.innerHTML += `
                <div class="card p-8 shadow-sm border-[#E8E3D9] animate-fade-in">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            ${isBest ? `<span class="badge mb-3 inline-block">Best Value</span>` : ''}
                            <h3 class="text-2xl serif">${item.store}</h3>
                            <p class="text-sm opacity-60">${item.brand} ${item.name}</p>
                            <p class="text-[10px] uppercase tracking-widest mt-1">${item.width}x${item.height}mm • ${item.count}pcs</p>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-light">${item.pricePerA4.toFixed(2)} SEK</div>
                            <div class="text-[10px] uppercase opacity-40">Price per A4</div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center pt-4 border-t border-dashed border-[#D9D2C5]">
                        <span class="text-sm italic text-gray-400">Total: ${item.price} SEK</span>
                        <a href="${item.url}" target="_blank" class="shop-link">Shop at ${item.store}</a>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error loading paper data:", error);
        grid.innerHTML = `<p class="text-center text-red-800">Error loading data. Make sure papers.json is in the correct folder.</p>`;
    }
}

// Initial search on load
window.onload = searchPaper;
