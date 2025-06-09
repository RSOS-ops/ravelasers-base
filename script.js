document.addEventListener('DOMContentLoaded', () => {
    const lockButton = document.getElementById('lockButton');
    const userControls = document.getElementById('userControls');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');

    let isLocked = false;

    // Function to toggle the lock state
    function toggleLock() {
        isLocked = !isLocked;
        if (isLocked) {
            userControls.classList.add('locked'); // Apply class to the div
            lockButton.textContent = 'Unlock';
            // Disable form elements
            nameInput.disabled = true;
            emailInput.disabled = true;
            submitBtn.disabled = true;
            resetBtn.disabled = true;
        } else {
            userControls.classList.remove('locked'); // Remove class from the div
            lockButton.textContent = 'Lock';
            // Enable form elements
            nameInput.disabled = false;
            emailInput.disabled = false;
            submitBtn.disabled = false;
            resetBtn.disabled = false;
        }
    }

    // Event listener for the lock button
    lockButton.addEventListener('click', toggleLock);

    // Event listener for the submit button (example)
    submitBtn.addEventListener('click', () => {
        if (!isLocked) {
            alert(`Name: ${nameInput.value}\nEmail: ${emailInput.value}`);
        }
    });

    // Event listener for the reset button
    resetBtn.addEventListener('click', () => {
        if (!isLocked) {
            nameInput.value = '';
            emailInput.value = '';
        }
    });

    // Initial state: lock the controls
    // toggleLock(); // Uncomment to start with controls locked
});
