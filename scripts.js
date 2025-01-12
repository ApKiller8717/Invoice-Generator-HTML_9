// Update amount for each item when quantity or rate changes
function updateAmount(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.querySelector('[name="quantity[]"]').value) || 0;
    const rate = parseFloat(row.querySelector('[name="rate[]"]').value) || 0;
    const amount = quantity * rate;
    row.querySelector('[name="amount[]"]').value = amount;

    updateTotals();
}

// Function to add a new row
function addRow() {
    const table = document.getElementById('invoice-items').querySelector('tbody');
    const rowCount = table.rows.length + 1;

    const newRow = document.createElement('tr');
    newRow.classList.add('table-row'); // Add a CSS class to the new row
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" name="description[]" placeholder="Enter description" class="form-control"></td>
        <td><input type="text" name="hsn_code[]" placeholder="Enter HSN code" class="form-control"></td>
        <td><input type="number" name="quantity[]" placeholder="0" class="form-control" onchange="updateAmount(this)"></td>
        <td><input type="number" name="rate[]" placeholder="0.00" class="form-control" onchange="updateAmount(this)"></td>
        <td><input type="text" name="amount[]" placeholder="0.00" class="form-control" readonly></td>
        <td><button class="btn btn-danger remove" onclick="removeRow(this)">Remove</button></td>
    `;
    table.appendChild(newRow);
    updateTotals();
}

// Function to remove a row
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateRowNumbers();
    updateTotals();
}

// Function to recalculate row numbers after removal
function updateRowNumbers() {
    const rows = document.querySelectorAll('#invoice-items tbody tr');
    rows.forEach((row, index) => {
        row.children[0].textContent = index + 1; // Update Item No column
    });
}

// Function to update totals
function updateTotals() {
    const rows = document.querySelectorAll('#invoice-items tbody tr');
    let subTotal = 0;

    rows.forEach(row => {
        const amount = parseFloat(row.querySelector('input[name="amount[]"]').value) || 0;
        subTotal += amount;
    });

    const cgst = subTotal * 0.09; // CGST at 9%
    const sgst = subTotal * 0.09; // SGST at 9%
    const invoiceTotal = subTotal + cgst + sgst;

    document.getElementById('subTotal').textContent = subTotal.toFixed(2);
    document.getElementById('cgst').textContent = cgst.toFixed(2);
    document.getElementById('sgst').textContent = sgst.toFixed(2);
    document.getElementById('invoiceTotal').textContent = invoiceTotal.toFixed(2);

    // Update amount in words (optional)
    document.getElementById('amountInWords').textContent = convertToWords(invoiceTotal);
}

// Function to convert number to words (optional)
function convertToWords(num) {
    if (isNaN(num)) return 'Invalid number';

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

    function numberToWords(n) {
        if (n === 0) return 'Zero';

        let str = '';
        let i = 0;

        while (n > 0) {
            let part = n % 1000;

            if (part !== 0) {
                let partStr = '';
                const hundreds = Math.floor(part / 100);
                const remainder = part % 100;

                if (hundreds > 0) {
                    partStr += `${units[hundreds]} Hundred `;
                }

                if (remainder > 10 && remainder < 20) {
                    partStr += `${teens[remainder - 11]} `;
                } else {
                    const tensPart = Math.floor(remainder / 10);
                    const unitsPart = remainder % 10;
                    if (tensPart > 0) {
                        partStr += `${tens[tensPart]} `;
                    }
                    if (unitsPart > 0) {
                        partStr += `${units[unitsPart]} `;
                    }
                }

                str = `${partStr}${thousands[i]} ${str}`;
            }

            n = Math.floor(n / 1000);
            i++;
        }

        return str.trim();
    }

    const [integerPart, decimalPart] = num.toFixed(2).split('.');
    let result = `${numberToWords(parseInt(integerPart))} Rupees`;

    if (decimalPart && parseInt(decimalPart) > 0) {
        result += ` and ${numberToWords(parseInt(decimalPart))} Paise`;
    }

    return result;
}
