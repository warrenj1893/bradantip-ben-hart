/* ============================================================
   BEN HART — BUYER PROFILE · script.js
============================================================ */

(function () {
  'use strict';

  /* ── State ──────────────────────────────────────────────── */
  let currentStep = 1;
  const TOTAL_STEPS = 5;

  /* ── DOM refs ───────────────────────────────────────────── */
  const form        = document.getElementById('buyer-form');
  const nextBtn     = document.getElementById('next-btn');
  const prevBtn     = document.getElementById('prev-btn');
  const submitBtn   = document.getElementById('submit-btn');
  const progressFill= document.getElementById('progress-fill');
  const successState= document.getElementById('success-state');
  const summaryCard = document.getElementById('summary-card');
  const summaryContent = document.getElementById('summary-content');
  const formNav     = document.getElementById('form-nav');

  /* ── Smooth scroll helper ───────────────────────────────── */
  function scrollToForm() {
    const formSection = document.getElementById('form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ── Start button ───────────────────────────────────────── */
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToForm();
    });
  }

  /* ── Progress update ────────────────────────────────────── */
  function updateProgress(step) {
    const pct = Math.round((step / TOTAL_STEPS) * 100);
    progressFill.style.width = pct + '%';

    document.querySelectorAll('.step-item').forEach((el) => {
      const s = parseInt(el.dataset.step, 10);
      el.classList.remove('step-item--active', 'step-item--done');
      el.removeAttribute('aria-current');
      if (s === step) {
        el.classList.add('step-item--active');
        el.setAttribute('aria-current', 'step');
      } else if (s < step) {
        el.classList.add('step-item--done');
        // Checkmark in done circles
        el.querySelector('.step-circle').textContent = '✓';
      } else {
        el.querySelector('.step-circle').textContent = s;
      }
    });
  }

  /* ── Show / hide steps ──────────────────────────────────── */
  function goToStep(step) {
    const current = document.getElementById('step-' + currentStep);
    const next    = document.getElementById('step-' + step);

    if (current) current.hidden = true;
    if (next)    next.hidden    = false;

    currentStep = step;
    updateProgress(step);

    // Button states
    prevBtn.hidden   = step === 1;
    nextBtn.hidden   = step === TOTAL_STEPS;
    submitBtn.hidden = step !== TOTAL_STEPS;

    // Show summary on final step
    if (step === TOTAL_STEPS) buildSummary();

    scrollToForm();
  }

  /* ── Validation ─────────────────────────────────────────── */
  function clearErrors(stepEl) {
    stepEl.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    stepEl.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  function showError(el, msg) {
    el.textContent = msg;
  }

  function validateStep(step) {
    const stepEl = document.getElementById('step-' + step);
    clearErrors(stepEl);
    let valid = true;

    const require = (id, errorId, msg) => {
      const input = document.getElementById(id);
      const errEl = document.getElementById(errorId) ||
                    input?.parentElement?.querySelector('.field-error');
      if (!input || !input.value.trim()) {
        if (input) input.classList.add('error');
        if (errEl) showError(errEl, msg);
        if (!valid) return; // already scrolled
        valid = false;
      }
    };

    const requireRadio = (name, errorId, msg) => {
      const checked = stepEl.querySelector(`input[name="${name}"]:checked`);
      const errEl   = document.getElementById(errorId);
      if (!checked) {
        if (errEl) showError(errEl, msg);
        valid = false;
      }
    };

    const requireCheckboxGroup = (name, errorId, msg) => {
      const checked = stepEl.querySelectorAll(`input[name="${name}"]:checked`);
      const errEl   = document.getElementById(errorId);
      if (checked.length === 0) {
        if (errEl) showError(errEl, msg);
        valid = false;
      }
    };

    switch (step) {
      case 1:
        require('first-name',  null, 'First name is required.');
        require('last-name',   null, 'Last name is required.');
        require('email',       null, 'Email address is required.');
        require('phone',       null, 'Phone number is required.');
        requireRadio('preferredContact', 'contact-method-error', 'Please choose a contact method.');
        requireRadio('timeline',         'timeline-error',        'Please select a timeline.');
        // Email format
        const emailEl = document.getElementById('email');
        if (emailEl && emailEl.value && !emailEl.validity.valid) {
          emailEl.classList.add('error');
          const errEl = emailEl.parentElement.querySelector('.field-error');
          if (errEl) showError(errEl, 'Please enter a valid email address.');
          valid = false;
        }
        break;

      case 2:
        require('current-address', null, 'Current address is required.');
        requireRadio('rentOrOwn', 'rent-own-error', 'Please select rent or own.');
        break;

      case 3:
        requireCheckboxGroup('homeType', 'home-type-error', 'Please select at least one home type.');
        // Location: either a county checked or other filled
        const countyChecked = stepEl.querySelectorAll('input[name="location"]:checked').length > 0;
        const otherLoc = document.getElementById('location-other')?.value.trim();
        if (!countyChecked && !otherLoc) {
          showError(document.getElementById('location-error'), 'Please select at least one location or enter a specific area.');
          valid = false;
        }
        requireRadio('bedrooms',  'bedrooms-error',  'Please select a bedroom minimum.');
        requireRadio('bathrooms', 'bathrooms-error', 'Please select a bathroom minimum.');
        break;

      case 4:
        require('price-range',    null, 'Please enter your ideal price range.');
        require('monthly-budget', null, 'Please enter your monthly budget.');
        requireRadio('preApproved', 'preapproved-error', 'Please indicate if you are pre-approved.');
        break;

      case 5:
        requireRadio('heardAbout', 'heard-about-error', 'Please tell us how you heard about us.');
        // If "other" radio is selected, require the text field
        const otherRadio = document.getElementById('hear-other');
        if (otherRadio?.checked) {
          const otherText = document.getElementById('hear-other-text')?.value.trim();
          if (!otherText) {
            const errEl = document.getElementById('heard-about-error');
            if (errEl) showError(errEl, 'Please specify how you heard about us.');
            valid = false;
          }
        }
        break;
    }

    // Scroll to first error
    if (!valid) {
      const firstErr = stepEl.querySelector('.field-error:not(:empty), .error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  /* ── Conditional fields ─────────────────────────────────── */
  function setupConditionals() {
    // Pre-approved toggle
    document.querySelectorAll('input[name="preApproved"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const lenderGroup     = document.getElementById('lender-group');
        const needLenderGroup = document.getElementById('need-lender-group');
        if (radio.value === 'Yes' && radio.checked) {
          lenderGroup.hidden     = false;
          needLenderGroup.hidden = true;
        } else if (radio.value === 'No' && radio.checked) {
          lenderGroup.hidden     = true;
          needLenderGroup.hidden = false;
        }
      });
    });

    // "Other" for heard-about — focus the text input when selected
    const hearOtherRadio = document.getElementById('hear-other');
    const hearOtherText  = document.getElementById('hear-other-text');
    if (hearOtherRadio && hearOtherText) {
      hearOtherRadio.addEventListener('change', () => {
        if (hearOtherRadio.checked) hearOtherText.focus();
      });
      hearOtherText.addEventListener('click', () => {
        hearOtherRadio.checked = true;
      });
    }
  }

  /* ── Summary builder ────────────────────────────────────── */
  function getVal(name, multi = false) {
    if (multi) {
      const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
      return Array.from(checked).map(c => c.value).join(', ') || '—';
    }
    const el = document.querySelector(`input[name="${name}"]:checked`) ||
               document.querySelector(`[name="${name}"]`);
    return el ? (el.value || '—') : '—';
  }

  function buildSummary() {
    const items = [
      { key: 'Name',            val: [document.getElementById('first-name')?.value, document.getElementById('last-name')?.value].filter(Boolean).join(' ') || '—' },
      { key: 'Email',           val: document.getElementById('email')?.value || '—' },
      { key: 'Phone',           val: document.getElementById('phone')?.value || '—' },
      { key: 'Contact Pref.',   val: getVal('preferredContact') },
      { key: 'Timeline',        val: getVal('timeline') },
      { key: 'Current Address', val: document.getElementById('current-address')?.value || '—' },
      { key: 'Rent / Own',      val: getVal('rentOrOwn') },
      { key: 'Home Type(s)',    val: getVal('homeType', true) },
      { key: 'Location(s)',     val: [getVal('location', true), document.getElementById('location-other')?.value].filter(v => v && v !== '—').join(', ') || '—' },
      { key: 'Bedrooms',        val: getVal('bedrooms') },
      { key: 'Bathrooms',       val: getVal('bathrooms') },
      { key: 'Home Style(s)',   val: getVal('homeStyle', true) },
      { key: 'Price Range',     val: document.getElementById('price-range')?.value || '—' },
      { key: 'Monthly Budget',  val: document.getElementById('monthly-budget')?.value || '—' },
      { key: 'Pre-Approved',    val: getVal('preApproved') },
    ];

    summaryContent.innerHTML = items.map(item => `
      <div class="summary-item">
        <div class="summary-item__key">${item.key}</div>
        <div class="summary-item__val">${item.val}</div>
      </div>
    `).join('');

    summaryCard.hidden = false;
  }

  /* ── Form submission ────────────────────────────────────── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    // Collect all data
    const data = new FormData(form);
    const payload = {};
    for (const [key, value] of data.entries()) {
      if (payload[key]) {
        payload[key] = [].concat(payload[key], value);
      } else {
        payload[key] = value;
      }
    }

    console.log('Buyer Profile Submitted:', payload);

    // Hide form, show success
    form.hidden    = true;
    formNav.hidden = true;
    successState.hidden = false;
    successState.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ── Next / Prev ────────────────────────────────────────── */
  nextBtn.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  /* ── Init ───────────────────────────────────────────────── */
  setupConditionals();
  updateProgress(1);

  // Real-time error clear on input
  form.addEventListener('input', (e) => {
    const target = e.target;
    target.classList.remove('error');
    const err = target.closest('.field-group, .field-fieldset')
                      ?.querySelector('.field-error');
    if (err) err.textContent = '';
  });

})();
