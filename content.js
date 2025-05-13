
function generateNewLetters() {
  const letters = 'BCDEFGHIJKLMNOPQRSTWXYZ';
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

function createOverlay(previousLetters, newLetters) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: 'Segoe UI', Arial, sans-serif;
    backdrop-filter: blur(8px);
  `;

  const container = document.createElement('div');
  container.style.cssText = `
    background: rgba(255, 255, 255, 0.1);
    padding: 3rem;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    max-width: 90%;
    width: 600px;
  `;

  // Show the new letters
  const lettersDisplay = document.createElement('div');
  lettersDisplay.style.cssText = `
    font-size: 4rem;
    font-weight: 500;
    margin-bottom: 2rem;
    letter-spacing: 0.5rem;
    color: #fff;
  `;
  lettersDisplay.textContent = newLetters.slice(0, 2) + ' ' + newLetters.slice(2, 4);

  const inputContainer = document.createElement('div');
  inputContainer.style.cssText = `
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem;
  `;

  // Create input fields
  for (let i = 0; i < 4; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.style.cssText = `
      width: 4rem;
      height: 4rem;
      text-align: center;
      font-size: 2rem;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.75rem;
      color: white;
      transition: all 0.2s ease;
    `;
    input.className = 'letter-input';
    input.dataset.index = i;
    inputContainer.appendChild(input);
    
    // Add margin after second input
    if (i === 1) {
      input.style.marginRight = '2rem';
    }
  }

  const message = document.createElement('div');
  message.style.cssText = `
    margin-top: 1.5rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.8rem;
  `;

  container.appendChild(lettersDisplay);
  container.appendChild(inputContainer);
  container.appendChild(message);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Focus first input
  const inputs = container.querySelectorAll('.letter-input');
  inputs[0].focus();

  // Handle input
  inputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      const value = e.target.value.toUpperCase();

      // Move to next input if character is entered
      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Check if all inputs are filled
      const allFilled = Array.from(inputs).every(input => input.value);
      if (allFilled) {
        const enteredLetters = Array.from(inputs).map(input => input.value).join('');
        checkLetters(enteredLetters, previousLetters, newLetters);
      }
    });

    // Handle backspace
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  function checkLetters(enteredLetters, previousLetters, newLetters) {
    if (previousLetters === enteredLetters.toUpperCase()) {
      overlay.remove();
    } else {
      // Increment incorrect attempts counter
      if (!window.incorrectAttempts) {
        window.incorrectAttempts = 1;
      } else {
        window.incorrectAttempts++;
      }

      if (window.incorrectAttempts >= 2) {
        message.textContent = `Incorrect: ${previousLetters.substring(0, 2)} ${previousLetters.substring(2, 4)}.`;
        message.style.color = '#ff4444';
        // Clear all inputs
        inputs.forEach(input => input.value = '');
        // Add event listener for space key
        const spaceHandler = function(e) {
          if (e.code === 'Space') {
            overlay.remove();
            document.removeEventListener('keydown', spaceHandler);
          }
        };
        document.addEventListener('keydown', spaceHandler);
      } else {
        message.textContent = 'Incorrect letters. Try again.';
        message.style.color = '#ff4444';
        // Clear all inputs
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
      }
    }
  }
}

chrome.storage.local.get(['prodplus'], function(result) {
    const previousLetters = result.prodplus || 'FDGJ';
    const newLetters = generateNewLetters();
    chrome.storage.local.set({ prodplus: newLetters });
    createOverlay(previousLetters, newLetters);
});