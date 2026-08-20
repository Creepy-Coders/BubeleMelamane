const wardsData = [
    { name: 'Surgical Ward', mainMetric: 'Occup', categories: [{name: 'RN', mix: 60}, {name: 'EN', mix: 30}, {name: 'ENA', mix: 10}] },
    { name: 'Medical Ward', mainMetric: 'Occup', categories: [{name: 'RN', mix: 50}, {name: 'EN', mix: 30}, {name: 'ENA', mix: 20}] },
    { name: 'Cardiac Ward', mainMetric: 'Occup', categories: [{name: 'RN', mix: 70}, {name: 'EN', mix: 20}, {name: 'ENA', mix: 10}] },
    { name: 'ICU', mainMetric: 'Occup', categories: [{name: 'RN', mix: 80}, {name: 'EN', mix: 20}, {name: 'ENA', mix: 0}] },
    { name: 'High Care', mainMetric: 'Occup', categories: [{name: 'RN', mix: 70}, {name: 'EN', mix: 30}, {name: 'ENA', mix: 0}] },
    { name: 'Day Ward', mainMetric: 'Occup', categories: [{name: 'RN', mix: 50}, {name: 'EN', mix: 30}, {name: 'ENA', mix: 20}] },
    { name: 'EC', mainMetric: 'Occup', categories: [{name: 'RN', mix: 60}, {name: 'EN', mix: 30}, {name: 'ENA', mix: 10}] },
    { name: 'Theatre', mainMetric: 'Cases', categories: [{name: 'RN', mix: 70}, {name: 'EN', mix: 30}, {name: 'ENA', mix: 0}] },
    { name: 'Cath Lab', mainMetric: 'Cases', categories: [{name: 'RN', mix: 80}, {name: 'EN', mix: 20}, {name: 'ENA', mix: 0}] },
    { name: 'Thrive', mainMetric: 'Occup', categories: [{name: 'RN', mix: 50}, {name: 'EN', mix: 30}, {name: 'ENA', mix: 20}] }
];

function init() {
    const container = document.getElementById('wards-container');
    
    wardsData.forEach((ward, index) => {
        const tableHtml = generateWardTable(ward, index);
        const wrapper = document.createElement('div');
        wrapper.className = 'ward-section';
        wrapper.innerHTML = tableHtml;
        container.appendChild(wrapper);
    });

    // Attach event listeners to all inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateWard);
    });
}

function generateWardTable(ward, index) {
    let rowsHtml = '';
    const numRows = ward.categories.length;

    ward.categories.forEach((cat, catIdx) => {
        const isFirst = catIdx === 0;
        rowsHtml += `
            <tr data-ward="${index}" data-cat="${catIdx}">
                ${isFirst ? `<td rowspan="${numRows + 1}" class="ward-name">${ward.name}</td>` : ''}
                ${isFirst ? `<td rowspan="${numRows}"><input type="number" class="ppd-input" placeholder="0"></td>` : ''}
                ${isFirst ? `<td rowspan="${numRows}"><input type="number" class="acuity-input" value="1.0" step="0.1"></td>` : ''}
                ${isFirst ? `<td rowspan="${numRows}" class="input-green"><input type="number" class="occup-input" placeholder="0"></td>` : ''}
                <td>${cat.name}</td>
                <td><input type="number" class="mix-input" value="${cat.mix}" data-default="${cat.mix}">%</td>
                <td class="calc-hours-needed">0.00</td>
                <td><input type="number" class="perm-input" value="0"></td>
                <td><input type="number" class="agency-input" value="0"></td>
                <td><input type="number" class="ovt-input" value="0"></td>
                <td class="calc-total">0.00</td>
                <td class="calc-variance">0.00</td>
                ${isFirst ? `<td rowspan="${numRows + 1}" class="calc-actual-acuity" style="background-color: var(--light-blue)">0.00</td>` : ''}
            </tr>
        `;
    });

    // Total Row
    rowsHtml += `
        <tr class="total-row" data-ward="${index}">
            <!-- PPD, Acuity, Occup, Category, Skills Mix -->
            <td colspan="5" style="background-color: var(--light-blue); border: 1px solid var(--border-color);"></td>
            <td class="total-hours-needed">0.00</td>
            <td class="total-perm">0.00</td>
            <td class="total-agency">0.00</td>
            <td class="total-ovt">0.00</td>
            <td class="total-total">0.00</td>
            <td class="total-variance">0.00</td>
        </tr>
    `;

    return `
        <table class="ward-table" id="table-ward-${index}">
            <thead>
                <tr>
                    <th></th>
                    <th>Available PPD's</th>
                    <th>Standard Acuity</th>
                    <th>${ward.mainMetric}</th>
                    <th>Category</th>
                    <th>Skills Mix</th>
                    <th>Hours needed</th>
                    <th>Perm</th>
                    <th>Agency</th>
                    <th>OVT</th>
                    <th>Total</th>
                    <th>Variance</th>
                    <th>Actual Acuity</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
}

function calculateWard(event) {
    const table = event.target.closest('table');
    
    const acuityInput = table.querySelector('.acuity-input');
    const occupInput = table.querySelector('.occup-input');
    
    const stdAcuity = parseFloat(acuityInput.value) || 0;
    const occup = parseFloat(occupInput.value) || 0;
    const totalRequiredHours = stdAcuity * occup;

    let sumHoursNeeded = 0;
    let sumPerm = 0;
    let sumAgency = 0;
    let sumOvt = 0;
    let sumTotal = 0;
    let sumVariance = 0;

    const categoryRows = table.querySelectorAll('tr[data-cat]');
    
    categoryRows.forEach(row => {
        const mix = (parseFloat(row.querySelector('.mix-input').value) || 0) / 100;
        const perm = parseFloat(row.querySelector('.perm-input').value) || 0;
        const agency = parseFloat(row.querySelector('.agency-input').value) || 0;
        const ovt = parseFloat(row.querySelector('.ovt-input').value) || 0;

        const hoursNeeded = totalRequiredHours * mix;
        const totalStaffHours = perm + agency + ovt;
        const variance = totalStaffHours - hoursNeeded;

        row.querySelector('.calc-hours-needed').textContent = hoursNeeded.toFixed(2);
        row.querySelector('.calc-total').textContent = totalStaffHours.toFixed(2);
        row.querySelector('.calc-variance').textContent = variance.toFixed(2);

        sumHoursNeeded += hoursNeeded;
        sumPerm += perm;
        sumAgency += agency;
        sumOvt += ovt;
        sumTotal += totalStaffHours;
        sumVariance += variance;
    });

    const totalRow = table.querySelector('.total-row');
    totalRow.querySelector('.total-hours-needed').textContent = sumHoursNeeded.toFixed(2);
    totalRow.querySelector('.total-perm').textContent = sumPerm.toFixed(2);
    totalRow.querySelector('.total-agency').textContent = sumAgency.toFixed(2);
    totalRow.querySelector('.total-ovt').textContent = sumOvt.toFixed(2);
    totalRow.querySelector('.total-total').textContent = sumTotal.toFixed(2);
    totalRow.querySelector('.total-variance').textContent = sumVariance.toFixed(2);

    const actualAcuity = occup > 0 ? (sumTotal / occup) : 0;
    table.querySelector('.calc-actual-acuity').textContent = actualAcuity.toFixed(2);
}

document.addEventListener('DOMContentLoaded', init);
