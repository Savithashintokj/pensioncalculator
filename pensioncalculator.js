// Pension & Savings Calculator
// Save this file next to the HTML file and open pension_calculator.html in a browser.

(function () {
  const $ = id => document.getElementById(id);

  // Format numbers as currency (prefix '£' by default). Adjust prefix if you prefer another symbol.
  function formatCurrency(value) {
    const rounded = Number(value) || 0;
    // No-currency Intl formatting to avoid forcing a specific currency for all users,
    // we prefix with '£' to indicate money — change as needed.
    return '£' + rounded.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  // Future value of a series of end-of-period contributions with discrete compounding:
  // FV = p * ( (1 + r/m)^(n*m) - 1 ) / (r/m)
  // where p = contribution per period = annualContribution / m,
  // r = annualRate (decimal), m = periods per year, n = years.
  function futureValueOfSeries(annualContribution, annualRate, years, periodsPerYear) {
    if (years <= 0 || annualContribution === 0) return 0;
    const m = periodsPerYear;
    const p = annualContribution / m;
    const totalPeriods = Math.round(years * m);
    const ratePerPeriod = annualRate / m;
    if (ratePerPeriod === 0) return p * totalPeriods;
    return p * (Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod;
  }

  function calculate() {
    const currentAge = Number($('currentAge').value);
    const retirementAge = Number($('retirementAge').value);
    const years = retirementAge - currentAge;
    const work = Number($('workPension').value) || 0;
    const isa = Number($('isa').value) || 0;
    const sipp = Number($('sipp').value) || 0;
    const periodsPerYear = Number($('compounding').value) || 1;

    const out = $('output');
    out.innerHTML = '';

    if (!Number.isFinite(currentAge) || !Number.isFinite(retirementAge)) {
      out.textContent = 'Please enter valid ages.';
      return;
    }
    if (years <= 0) {
      out.textContent = 'Retirement age must be greater than current age.';
      return;
    }

    const rates = [0.04, 0.06, 0.08];

    // Create table
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th class="row-left">Rate (annual)</th><th>Work pension</th><th>ISA</th><th>SIPP</th><th>Total</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    let grand = { work: 0, isa: 0, sipp: 0, total: 0 };

    rates.forEach(rate => {
      const fvWork = futureValueOfSeries(work, rate, years, periodsPerYear);
      const fvIsa = futureValueOfSeries(isa, rate, years, periodsPerYear);
      const fvSipp = futureValueOfSeries(sipp, rate, years, periodsPerYear);
      const sum = fvWork + fvIsa + fvSipp;

      grand.work += fvWork;
      grand.isa += fvIsa;
      grand.sipp += fvSipp;
      grand.total += sum;

      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="row-left">' + (rate * 100).toFixed(0) + '% (' + years + ' yrs)</td>' +
        '<td>' + formatCurrency(fvWork) + '</td>' +
        '<td>' + formatCurrency(fvIsa) + '</td>' +
        '<td>' + formatCurrency(fvSipp) + '</td>' +
        '<td>' + formatCurrency(sum) + '</td>';
      tbody.appendChild(tr);
    });

    // Totals row (sum of the three rates)
    const tfootRow = document.createElement('tr');
    tfootRow.innerHTML = '<th class="row-left">Sum of projections (all rates)</th>' +
      '<th>' + formatCurrency(grand.work) + '</th>' +
      '<th>' + formatCurrency(grand.isa) + '</th>' +
      '<th>' + formatCurrency(grand.sipp) + '</th>' +
      '<th>' + formatCurrency(grand.total) + '</th>';
    tbody.appendChild(tfootRow);

    table.appendChild(tbody);
    out.appendChild(table);

    // Summary
    const p = document.createElement('p');
    p.style.marginTop = '12px';
    p.textContent = 'Years until retirement: ' + years + '. Compounding: ' + (periodsPerYear === 12 ? 'monthly' : 'annual') + '.';
    out.appendChild(p);
  }

  function resetInputs() {
    $('currentAge').value = 35;
    $('retirementAge').value = 68;
    $('workPension').value = 3000;
    $('isa').value = 2000;
    $('sipp').value = 1500;
    $('compounding').value = 1;
    $('output').innerHTML = '';
  }

  // Attach listeners
  $('calc').addEventListener('click', calculate);
  $('reset').addEventListener('click', resetInputs);

  // Allow Enter to trigger calculation on inputs
  ['currentAge', 'retirementAge', 'workPension', 'isa', 'sipp'].forEach(id => {
    $(id).addEventListener('keyup', e => { if (e.key === 'Enter') calculate(); });
  });

})();