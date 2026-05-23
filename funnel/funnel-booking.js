/**
 * Booking Funnel - Multi-Step Logic
 * Handles step navigation and data collection
 */

// Store user data
const bookingData = {
  companyName: '',
  callTime: '',
  dataSources: ''
};

// Current step
let currentStep = 1;

/**
 * Navigate to a specific step
 */
function nextStep(stepNumber) {
  // Validation for Step 1
  if (currentStep === 1 && stepNumber === 2) {
    const companyInput = document.getElementById('companyName');
    if (!companyInput.value.trim()) {
      companyInput.style.borderColor = '#FF2D7A';
      companyInput.focus();
      return;
    }
    bookingData.companyName = companyInput.value.trim();
    companyInput.style.borderColor = '#E8E8E0';
  }

  // Hide current step
  const currentStepEl = document.getElementById(`step${currentStep}`);
  if (currentStepEl) {
    currentStepEl.classList.remove('active');
  }

  // Show new step
  const newStepEl = document.getElementById(`step${stepNumber}`);
  if (newStepEl) {
    newStepEl.classList.add('active');
  }

  // Update progress bar
  const progressBar = document.getElementById('bookingProgressBar');
  const progress = (stepNumber / 4) * 100;
  progressBar.style.width = `${progress}%`;

  // Update current step
  currentStep = stepNumber;

  // If step 4, populate summary
  if (stepNumber === 4) {
    populateSummary();
  }

  // Scroll to top of booking section
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Select call time (Step 2)
 */
function selectCallTime(time) {
  bookingData.callTime = time;

  // Visual feedback
  const buttons = document.querySelectorAll('#step2 .booking-option');
  buttons.forEach(btn => {
    btn.style.borderColor = '#E8E8E0';
    btn.style.background = '#FAFAF7';
  });

  event.target.closest('.booking-option').style.borderColor = '#FF2D7A';
  event.target.closest('.booking-option').style.background = '#FFF';

  // Auto-advance after short delay
  setTimeout(() => {
    nextStep(3);
  }, 400);
}

/**
 * Select data sources (Step 3)
 */
function selectDataSources(sources) {
  bookingData.dataSources = sources;

  // Visual feedback
  const buttons = document.querySelectorAll('#step3 .booking-option');
  buttons.forEach(btn => {
    btn.style.borderColor = '#E8E8E0';
    btn.style.background = '#FAFAF7';
  });

  event.target.closest('.booking-option').style.borderColor = '#FF2D7A';
  event.target.closest('.booking-option').style.background = '#FFF';

  // Auto-advance after short delay
  setTimeout(() => {
    nextStep(4);
  }, 400);
}

/**
 * Populate summary in Step 4
 */
function populateSummary() {
  document.getElementById('summaryCompany').textContent = bookingData.companyName;
  document.getElementById('summaryCallTime').textContent = bookingData.callTime;
  document.getElementById('summaryDataSources').textContent = bookingData.dataSources;

  // Optional: Send data to backend or pass to Calendly URL params
  console.log('Booking Data:', bookingData);

  // You can add URL parameters to Calendly here
  // Example: ?name=${encodeURIComponent(bookingData.companyName)}
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Set initial progress
  const progressBar = document.getElementById('bookingProgressBar');
  if (progressBar) {
    progressBar.style.width = '25%';
  }

  // Add Enter key support for Step 1
  const companyInput = document.getElementById('companyName');
  if (companyInput) {
    companyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        nextStep(2);
      }
    });
  }
});
