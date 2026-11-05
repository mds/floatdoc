// ===================================================================
// FloatPrompt Site JavaScript
// ===================================================================

// ===================================================================
// 1. COLOR RANDOMIZATION & ANIMATIONS
// ===================================================================

// Random color assignment for cards
(function() {
    // Card color palette
    const colors = {
        yellow: '#FFF1AD',
        blue: '#C2EBFF',
        pink: '#FFD6DD',
        green: '#E0FFC2'
    };

    // Shuffle array function
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Convert hex to RGB values
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Apply random colors on page load
    function applyRandomColors() {
        const colorNames = Object.keys(colors);
        let shuffledColorNames;
        const root = document.documentElement;
        
        // Check if we're on the code page and should use stored card-4 color
        const isCodePage = window.location.pathname.includes('/code/');
        const storedCard4Color = localStorage.getItem('floatprompt-card4-color');
        
        if (isCodePage && storedCard4Color) {
            // On code page: use stored card-4 color for all cards
            const card4ColorName = storedCard4Color;
            shuffledColorNames = [card4ColorName, card4ColorName, card4ColorName, card4ColorName];
        } else {
            // On main page: randomize normally
            shuffledColorNames = shuffleArray(colorNames);
            // Store card-4's color for the code page
            localStorage.setItem('floatprompt-card4-color', shuffledColorNames[3]);
        }

        // Update CSS custom properties with shuffled colors
        shuffledColorNames.forEach((colorName, index) => {
            const cardNum = index + 1;
            const hexColor = colors[colorName];
            const rgb = hexToRgb(hexColor);
            
            // Set hex color
            root.style.setProperty(`--card-${cardNum}-color`, hexColor);
            
            // Set RGB values for gradients
            if (rgb) {
                root.style.setProperty(`--card-${cardNum}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
            }
        });
    }



    // Apply colors immediately
    applyRandomColors();
})();

// ===================================================================
// 2. CARD INTERACTIONS & FUNCTIONALITY
// ===================================================================

(() => {
  // Dev tool toggle - set to true to enable the developer tool
  const DEV_TOOL_ENABLED = false;
  
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyExpandedBtn = document.getElementById('copyExpandedBtn');
  const downloadExpandedBtn = document.getElementById('downloadExpandedBtn');
  const headerCopyBtn = document.getElementById('headerCopyBtn');
  // ASCII ticker content setup - duplicate content for seamless looping
  function setupAsciiTicker() {
    const symbolEls = document.querySelectorAll('.ascii .symbol, .ascii .ghost');
    symbolEls.forEach((sym) => {
      const originalContent = sym.textContent;
      sym.textContent = originalContent + originalContent; // Duplicate for seamless loop
    });
  }
  setupAsciiTicker();

  // Function to inject dev tool HTML dynamically
  function injectDevTool() {
    if (!DEV_TOOL_ENABLED) return;
    
    const devToolHTML = `
      <div id="devTool" class="dev-tool collapsed">
        <div class="dev-header" id="devHeader">
          <span class="dev-title">Card Positions ▼</span>
          <div class="dev-buttons">
            <button class="copy-all-btn" id="toggleGridBorder">🔲</button>
            <button class="copy-all-btn" id="copyAllPositions">📋</button>
          </div>
        </div>
        <div class="dev-content">
          <div class="rotation-controls" id="rotationControls" style="display: none;">
            <div style="margin-bottom: 0.5rem; text-align: center; font-size: 10px; color: #ccc;">Selected Card Rotation</div>
            <div style="display: flex; gap: 0.25rem; justify-content: center; margin-bottom: 0.5rem;">
              <button class="copy-all-btn" id="rotateLeft">↺ -1°</button>
              <button class="copy-all-btn" id="rotateLeftFast">↺ -10°</button>
              <button class="copy-all-btn" id="rotateRightFast">↻ +10°</button>
              <button class="copy-all-btn" id="rotateRight">↻ +1°</button>
            </div>
          </div>
          <div class="card-position" id="card1-pos">
            <span class="card-label">Card 1:</span>
            <span class="card-coords" id="card1-coords">tx=0px ty=0px rot=0deg z=0</span>
          </div>
          <div class="card-position" id="card2-pos">
            <span class="card-label">Card 2:</span>
            <span class="card-coords" id="card2-coords">tx=0px ty=0px rot=0deg z=0</span>
          </div>
          <div class="card-position" id="card3-pos">
            <span class="card-label">Card 3:</span>
            <span class="card-coords" id="card3-coords">tx=0px ty=0px rot=0deg z=0</span>
          </div>
          <div class="card-position" id="card4-pos">
            <span class="card-label">Card 4:</span>
            <span class="card-coords" id="card4-coords">tx=0px ty=0px rot=0deg z=0</span>
          </div>
        </div>
      </div>
    `;
    
    // Inject the HTML into the document body
    document.body.insertAdjacentHTML('beforeend', devToolHTML);
  }
  
  // Initialize dev tool if enabled
  injectDevTool();

  // Store original positions for reset functionality
  const originalPositions = new Map();
  
  // Initial loading positions for large screens only (before animation)
  const loadingPositions = {
    large: [ // >1200px
      { tx: 583, ty: 113, rotation: '-8deg', zIndex: 50 },
      { tx: 192, ty: 55, rotation: '4deg', zIndex: 12 },
      { tx: -210, ty: 25, rotation: '-17deg', zIndex: 28 },
      { tx: -602, ty: 85, rotation: '-12deg', zIndex: 46 }
    ]
  };

  // Final target positions
  const cardPositions = {
    large: [ // >1200px
      { tx: 16, ty: 132, rotation: '-4deg', zIndex: 50 },
      { tx: 2, ty: 52, rotation: '4deg', zIndex: 12 },
      { tx: -1, ty: 96, rotation: '-4deg', zIndex: 28 },
      { tx: -9, ty: 10, rotation: '4deg', zIndex: 46 }
    ],
    medium: [ // 821px-1200px
      { tx: 7, ty: 137, rotation: '-8deg', zIndex: 72 },
      { tx: -11, ty: 238, rotation: '4deg', zIndex: 70 },
      { tx: 45, ty: 53, rotation: '-10deg', zIndex: 24 },
      { tx: -11, ty: 338, rotation: '9deg', zIndex: 26 }
    ],
    mobile: [ // ≤820px
      { tx: 2, ty: 1, rotation: '-1deg', zIndex: 50 },
      { tx: 2, ty: -2, rotation: '1deg', zIndex: 12 },
      { tx: 4, ty: -6, rotation: '-1deg', zIndex: 28 },
      { tx: 2, ty: -7, rotation: '1deg', zIndex: 46 }
    ]
  };

  function getBreakpoint() {
    const width = window.innerWidth;
    if (width > 1200) return 'large';
    if (width > 820) return 'medium';
    return 'mobile';
  }

  // Initialize subtle floating animations with random timing for each container
  function initFloatingAnimations() {
    // Wait for the loading animation to complete before starting floating
    setTimeout(() => {
      document.querySelectorAll('.floating-container').forEach((container, index) => {
        // Assign each container to a specific float sequence (1-4)
        const floatSequence = (index % 4) + 1;
        
        // Random duration between 3-6 seconds
        const duration = 3 + Math.random() * 3;
        // Random delay between 0-2 seconds to stagger start times
        const delay = Math.random() * 2;
        
        container.style.setProperty('--float-duration', `${duration}s`);
        container.style.setProperty('--float-delay', `${delay}s`);
        container.classList.add('floating');
        container.classList.add(`float-${floatSequence}`);
      });
    }, 1000); // Wait 1 second after the main loading animation
  }

  function applyLoadingPositions() {
    const breakpoint = getBreakpoint();
    const windowWidth = window.innerWidth;
    const positions = loadingPositions[breakpoint];
    

    
    if (!positions) {
      console.error(`No loading positions found for breakpoint: ${breakpoint}`);
      return;
    }

    document.querySelectorAll('.card').forEach((card, index) => {
      if (positions[index]) {
        const pos = positions[index];
        card.style.setProperty('--tx', pos.tx + 'px', 'important');
        card.style.setProperty('--ty', pos.ty + 'px', 'important');
        card.style.setProperty('--rotation', pos.rotation, 'important');
        card.style.zIndex = pos.zIndex;
        

        
        // Verify the values were actually set
        const computedTx = getComputedStyle(card).getPropertyValue('--tx');
        const computedTy = getComputedStyle(card).getPropertyValue('--ty');
        const computedRotation = getComputedStyle(card).getPropertyValue('--rotation');

      }
    });
  }

  function applyBreakpointPositions(updateZIndex = true) {
    const breakpoint = getBreakpoint();
    const positions = cardPositions[breakpoint];
    if (!positions) return;



    document.querySelectorAll('.card').forEach((card, index) => {
      if (positions[index]) {
        const pos = positions[index];
        card.style.setProperty('--tx', pos.tx + 'px', 'important');
        card.style.setProperty('--ty', pos.ty + 'px', 'important');
        card.style.setProperty('--rotation', pos.rotation, 'important');
        
        // Only update z-index if specified
        if (updateZIndex) {
          const container = card.closest('.floating-container');
          if (container) {
            container.style.zIndex = pos.zIndex;
          }
        }
        

      }
    });
  }

  // Apply loading positions for large screens, then animate
  if (getBreakpoint() === 'large') {
    // Temporarily disable transitions to set starting positions instantly
    document.querySelectorAll('.card').forEach(card => {
      card.style.transition = 'none';
    });
    
    applyLoadingPositions();
    
    // Force a reflow to ensure positions are applied
    document.body.offsetHeight;
    
    // Re-enable transitions and animate to final positions
    setTimeout(() => {
      document.querySelectorAll('.card').forEach(card => {
        card.style.transition = '';
      });
      
      // Apply final positions
      setTimeout(() => {
        applyBreakpointPositions();
        initFloatingAnimations();
      }, 50);
    }, 50);
  } else {
    // For non-large screens, apply positions normally
    setTimeout(() => {
      applyBreakpointPositions();
      initFloatingAnimations();
    }, 100);
  }
  
  // Initialize original positions after final positions and z-index are applied
  setTimeout(() => {
    document.querySelectorAll('.card').forEach((card) => {
      const style = getComputedStyle(card);
      const originalTx = parseFloat(style.getPropertyValue('--tx')) || 0;
      const originalTy = parseFloat(style.getPropertyValue('--ty')) || 0;
      const originalRotation = style.getPropertyValue('--rotation') || '0deg';
      const originalZIndex = style.getPropertyValue('z-index') || '0';
      originalPositions.set(card, { tx: originalTx, ty: originalTy, rotation: originalRotation, zIndex: originalZIndex });
    });
  }, 200);

  // Update on window resize
  window.addEventListener('resize', () => {
    applyBreakpointPositions(false); // Don't reset z-index during resize
    
    // Update original positions after resize
    document.querySelectorAll('.card').forEach((card) => {
      const style = getComputedStyle(card);
      const originalTx = parseFloat(style.getPropertyValue('--tx')) || 0;
      const originalTy = parseFloat(style.getPropertyValue('--ty')) || 0;
      const originalRotation = style.getPropertyValue('--rotation') || '0deg';
      const originalZIndex = style.getPropertyValue('z-index') || '0';
      originalPositions.set(card, { tx: originalTx, ty: originalTy, rotation: originalRotation, zIndex: originalZIndex });
    });
  });

  // Draggable cards (desktop)
  function makeDraggable(card) {
    let startX = 0, startY = 0;
    let originX = 0, originY = 0;
    let isDragging = false;

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return; // left click only
      // Ignore drags when starting from an actionable element (links/buttons)
      if (e.target.closest('.actions, a, button, input, textarea, select')) return;
      // Don't allow dragging when card is expanded
      if (card.classList.contains('expanded')) return;
      
      // raise z-index for this card
      bumpZIndex(card);
      isDragging = true;
      card.classList.add('dragging');
      // Pulse the ghost when dragging starts
      pulseGhost();

      // Disable floating on the container during drag
      const container = card.closest('.floating-container');
      if (container) container.classList.remove('floating');
      
      startX = e.clientX;
      startY = e.clientY;
      const style = getComputedStyle(card);
      originX = parseFloat(style.getPropertyValue('--tx')) || 0;
      originY = parseFloat(style.getPropertyValue('--ty')) || 0;
      card.setPointerCapture ? card.setPointerCapture(e.pointerId) : null;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      card.style.setProperty('--tx', originX + dx + 'px');
      card.style.setProperty('--ty', originY + dy + 'px');
    };

          const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove('dragging');
      // Re-enable floating on the container after drag
      const container = card.closest('.floating-container');
      if (container) container.classList.add('floating');
      card.releasePointerCapture ? card.releasePointerCapture(e.pointerId) : null;

      // Elastic snap-back if dragged outside viewport bounds (mobile and desktop)
      {
        // Elastic snap-back if dragged outside viewport bounds (margin = card size)
        // Only applies to left and right edges (NOT top or bottom)
        const rect = card.getBoundingClientRect();
        const marginX = rect.width;
        const marginY = rect.height;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let snapDx = 0;
        let snapDy = 0;
        if (rect.right < marginX) snapDx = marginX - rect.right;
        if (rect.left > vw - marginX) snapDx = (vw - marginX) - rect.left;
        // Remove both top and bottom boundary checks - allow free vertical movement
        // if (rect.bottom < marginY) snapDy = marginY - rect.bottom;
        // if (rect.top > vh - marginY) snapDy = (vh - marginY) - rect.top;
        if (snapDx !== 0 || snapDy !== 0) {
          const currentTx = parseFloat(getComputedStyle(card).getPropertyValue('--tx')) || 0;
          const currentTy = parseFloat(getComputedStyle(card).getPropertyValue('--ty')) || 0;
          card.style.setProperty('--tx', currentTx + snapDx + 'px');
          card.style.setProperty('--ty', currentTy + snapDy + 'px');
        }
      }
      
      // Check if reset button should be shown
      checkLogoButtonVisibility();
    };

    card.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  document.querySelectorAll('.card').forEach(makeDraggable);

  // Bump the z-index of the active card so it appears on top
  let zCounter = 200; // Start higher than any existing z-index
  function bumpZIndex(card) {
    zCounter += 1;
    // Apply z-index to the floating container, not the card
    const container = card.closest('.floating-container');
    if (container) {
      container.style.zIndex = String(zCounter);
    }
  }

  // Also bump z-index on simple click/tap (without drag)
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointerdown', (e) => {
      // Only bump when not clicking an action element; let action links handle their own focus/stack
      if (!e.target.closest('.actions, a, button')) bumpZIndex(card);
    });
  });

  // Expand format card and load full floatprompt.txt into <code>
  const formatCard = document.getElementById('formatCard');
  const fpCode = document.getElementById('fpCode');
  const formatToolbar = document.getElementById('formatCardToolbar');
  const backBtn = document.getElementById('backBtn'); // Updated to use backBtn
  const expandFormat = document.getElementById('expandFormat');
  const originalCodeHTML = fpCode ? fpCode.innerHTML : '';

  // Simple animation using CSS transitions - just add/remove classes and let CSS handle it
  function animateCardExpansion(element, isExpanding) {

    bumpZIndex(element);
    if (isExpanding) {
      document.body.classList.add('expanded-mode');
      element.classList.add('expanded');

    } else {
      element.classList.remove('expanded');
      document.body.classList.remove('expanded-mode');

    }
  }

  // Function to collapse the expanded card
  function collapseExpandedCard() {
    if (formatCard && formatCard.classList.contains('expanded')) {
      animateCardExpansion(formatCard, false);
      if (fpCode) fpCode.innerHTML = originalCodeHTML; // restore original placeholder content
      
      // Send card to the back when collapsed
      const container = formatCard.closest('.floating-container');
      if (container) {
        container.style.zIndex = '0';
      }
    }
  }
  if (formatCard && fpCode && expandFormat) {

    expandFormat.addEventListener('click', async (e) => {
      // On mobile, allow the link to navigate to /code/
      if (getBreakpoint() === 'mobile') {
        return; // Let the default link behavior happen
      }
      
      // On desktop, prevent default and expand the card
      e.preventDefault();
      const isExpanded = formatCard.classList.contains('expanded');
      
      if (isExpanded) {
        // Close the card
        collapseExpandedCard();
      } else {
        // Open the card
        animateCardExpansion(formatCard, true);
        try {
          const text = await ensureFpText();
          fpCode.textContent = text; // replace entirely with the file content
        } catch (error) {
          console.error('Error loading FloatPrompt file:', error);
          fpCode.textContent = 'Error loading file. Please try again.';
        }
      }
    });
  }
  if (backBtn && formatCard) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      collapseExpandedCard();
    });
  }
  // FloatPrompt source - always pull from GitHub
  const CANDIDATE_URLS = [
    'https://raw.githubusercontent.com/mds/floatprompt/main/templates/float-os.md'
  ];
  // Preload and cache the floatprompt content
  let cachedText = null;
  let isLoading = false;
  
  async function loadFloatPromptContent() {
    if (cachedText !== null || isLoading) return cachedText;
    
    isLoading = true;

    
    for (const url of CANDIDATE_URLS) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) continue;
        const text = await res.text();
        if (text && text.trim().length > 0) {
          cachedText = text;
          isLoading = false;

          return cachedText;
        }
      } catch (error) {

      }
    }
    cachedText = 'Oops, failed to load in full text from GitHub.';
    isLoading = false;
    console.error('Failed to load FloatPrompt content from all sources');
    return cachedText;
  }
  
  // Get cached content (for backwards compatibility)
  async function ensureFpText() {
    if (cachedText !== null) return cachedText;
    return await loadFloatPromptContent();
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = await ensureFpText();
      navigator.clipboard.writeText(text);
      const link = copyBtn;
      const labelEl = link.querySelector('.label');
      const symbolEl = link.querySelector('.symbol');
      const leaderEl = link.querySelector('.leader');
      const originalLabel = labelEl ? labelEl.textContent : '';
      const originalSymbol = symbolEl ? symbolEl.textContent : '';
      // Hide leader dots via CSS and show a check in the symbol slot
      link.classList.add('copied');
      if (labelEl) labelEl.textContent = 'Copied';
      if (symbolEl) symbolEl.textContent = '👻';
      setTimeout(() => {
        if (labelEl) labelEl.textContent = originalLabel;
        if (symbolEl) symbolEl.textContent = originalSymbol;
        link.classList.remove('copied');
      }, 1200);
    });
  }

  // Header copy button functionality (same as main copy button)
  if (headerCopyBtn) {
    headerCopyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = await ensureFpText();
      navigator.clipboard.writeText(text);
      const originalText = headerCopyBtn.textContent;
      headerCopyBtn.textContent = 'Copied';
      setTimeout(() => {
        headerCopyBtn.textContent = originalText;
      }, 1200);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = await ensureFpText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'float-os.md';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // Expanded toolbar buttons
  const selectExpandedBtn = document.getElementById('selectExpandedBtn');
  
  if (selectExpandedBtn) {
    selectExpandedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (fpCode) {
        try {
          // First try to select the entire code element
          const range = document.createRange();
          range.selectNodeContents(fpCode);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Alternative: focus the element to make it selectable
          fpCode.focus();
          
  
        } catch (error) {
          console.error('Selection failed:', error);
          // Fallback: try to select all text manually
          if (fpCode.select) {
            fpCode.select();
          }
        }
        
        // Provide visual feedback
        const originalText = selectExpandedBtn.textContent;
        selectExpandedBtn.textContent = 'Selected';
        setTimeout(() => {
          selectExpandedBtn.textContent = originalText;
        }, 1200);
      }
    });
  }

  if (copyExpandedBtn) {
    copyExpandedBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = await ensureFpText();
      navigator.clipboard.writeText(text);
      const originalText = copyExpandedBtn.textContent;
      copyExpandedBtn.textContent = 'Copied';
      setTimeout(() => {
        copyExpandedBtn.textContent = originalText;
      }, 1200);
    });
  }

  if (downloadExpandedBtn) {
    downloadExpandedBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = await ensureFpText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'float-os.md';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // Escape key to collapse expanded card
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      collapseExpandedCard();
    }
  });

  // Click outside expanded card to collapse
  document.addEventListener('click', (e) => {
    if (leftCard && leftCard.classList.contains('expanded')) {
      // Check if click is outside the expanded card
      if (!leftCard.contains(e.target)) {
        collapseExpandedCard();
      }
    }
  });



  // Ghost pulsing animation (without color change)
  function pulseGhost() {
    const ghostSpan = logoButton?.querySelector('.ghost');
    if (ghostSpan) {
      // Ensure ghost is always white
      ghostSpan.style.color = 'white';
      ghostSpan.style.transform = 'scale(1.2)';
      setTimeout(() => {
        ghostSpan.style.transform = 'scale(1)';
      }, 150);
    }
  }

  // Logo button functionality
  const logoButton = document.getElementById('logo');
  
  // Update dev tool (logo button is always visible now)
  function checkLogoButtonVisibility() {
    // Just update the dev tool, button is always visible
    if (DEV_TOOL_ENABLED && window.updateDevTool) {
      window.updateDevTool();
    }
  }
  
  // Reset all cards to original positions
  function resetCardPositions() {
    document.querySelectorAll('.card').forEach((card) => {
      const original = originalPositions.get(card);
      card.style.setProperty('--tx', original.tx + 'px');
      card.style.setProperty('--ty', original.ty + 'px');
      card.style.setProperty('--rotation', original.rotation);
      
      // Reset z-index on the floating container (not the card)
      const container = card.closest('.floating-container');
      if (container) {
        container.style.zIndex = original.zIndex;
      }
    });
    
    // Update dev tool after reset
    if (DEV_TOOL_ENABLED && window.updateDevTool) {
      window.updateDevTool();
    }
  }
  
  // Logo button click handler
  if (logoButton) {
    logoButton.addEventListener('click', (e) => {
      e.preventDefault();
      resetCardPositions();

    });
  }
  
  // Check on window resize
  window.addEventListener('resize', checkLogoButtonVisibility);

  // Development tool for tracking card positions
  function initializeDevTool() {
    if (!DEV_TOOL_ENABLED) return;
    
    const devTool = document.getElementById('devTool');
    
    function updateDevTool() {
      if (!devTool) return;
      
      const cards = document.querySelectorAll('.card');
      cards.forEach((card, index) => {
        const cardNum = index + 1;
        const style = getComputedStyle(card);
        const tx = Math.round(parseFloat(style.getPropertyValue('--tx')) || 0);
        const ty = Math.round(parseFloat(style.getPropertyValue('--ty')) || 0);
        const rotation = style.getPropertyValue('--rotation') || '-5deg';
        const zIndex = style.getPropertyValue('z-index') || '0';
        
        const coordsElement = document.getElementById(`card${cardNum}-coords`);
        if (coordsElement) {
          coordsElement.textContent = `tx=${tx}px ty=${ty}px rot=${rotation} z=${zIndex}`;
        }
      });
    }
    
    // Make updateDevTool available globally
    window.updateDevTool = updateDevTool;
    
    // Copy all positions functionality
    const copyAllBtn = document.getElementById('copyAllPositions');
    if (copyAllBtn) {
      copyAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const cards = document.querySelectorAll('.card');
        const allPositions = [];
        
        cards.forEach((card, index) => {
          const cardNum = index + 1;
          const style = getComputedStyle(card);
          const tx = Math.round(parseFloat(style.getPropertyValue('--tx')) || 0);
          const ty = Math.round(parseFloat(style.getPropertyValue('--ty')) || 0);
          const rotation = style.getPropertyValue('--rotation') || '-5deg';
          const zIndex = style.getPropertyValue('z-index') || '0';
          allPositions.push(`card ${cardNum} tx=${tx}px ty=${ty}px rot=${rotation} z=${zIndex}`);
        });
        
        const copyText = allPositions.join('\n');
        navigator.clipboard.writeText(copyText);
        
        // Visual feedback
        const originalText = copyAllBtn.textContent;
        copyAllBtn.textContent = '✓';
        setTimeout(() => {
          copyAllBtn.textContent = originalText;
        }, 800);
      });
    }

    // Grid border toggle functionality
    const toggleGridBtn = document.getElementById('toggleGridBorder');
    let gridBorderVisible = false; // Start with borders hidden
    
    if (toggleGridBtn) {
      // Set initial button state
      toggleGridBtn.textContent = '⬜';
      
      toggleGridBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const cardsElement = document.querySelector('.cards');
        if (cardsElement) {
          if (gridBorderVisible) {
            // Hide borders
            cardsElement.classList.remove('show-grid-borders');
            toggleGridBtn.textContent = '⬜';
          } else {
            // Show borders
            cardsElement.classList.add('show-grid-borders');
            toggleGridBtn.textContent = '🔲';
          }
          gridBorderVisible = !gridBorderVisible;
        }
      });
    }

    // Dev tool collapse/expand functionality
    const devHeader = document.getElementById('devHeader');
    const devContent = devTool?.querySelector('.dev-content');
    
    if (devHeader && devContent) {
      devHeader.style.cursor = 'pointer';
      devHeader.addEventListener('click', (e) => {
        // Don't collapse if clicking the copy button
        if (e.target.closest('.copy-all-btn')) return;
        
        devTool.classList.toggle('collapsed');
        
        // Update title to show collapse state
        const titleSpan = devHeader.querySelector('.dev-title');
        if (titleSpan) {
          const isCollapsed = devTool.classList.contains('collapsed');
          titleSpan.textContent = isCollapsed ? 'Card Positions ▼' : 'Card Positions';
        }
      });
    }
    
    // Keyboard controls for rotation (only when dev tool is enabled)
    let selectedCard = null;
    
    function showRotationControls() {
      const rotationControls = document.getElementById('rotationControls');
      if (rotationControls) {
        rotationControls.style.display = 'block';
      }
    }
    
    function hideRotationControls() {
      const rotationControls = document.getElementById('rotationControls');
      if (rotationControls) {
        rotationControls.style.display = 'none';
      }
    }
    
    function rotateSelectedCard(degrees) {
      if (!selectedCard) return;
      
      let currentRotation = parseFloat(selectedCard.style.getPropertyValue('--rotation')) || 
                            parseFloat(getComputedStyle(selectedCard).getPropertyValue('--rotation')) || 0;
      
      currentRotation += degrees;
      selectedCard.style.setProperty('--rotation', currentRotation + 'deg');
      
      // Update dev tool and reset button
      if (window.updateDevTool) {
        window.updateDevTool();
      }
      checkLogoButtonVisibility();
    }
    
    // Click to select a card for rotation
    document.querySelectorAll('.card').forEach((card, index) => {
      card.addEventListener('click', (e) => {
        // Don't select if clicking on action elements
        if (e.target.closest('.actions, a, button, .card-toolbar')) return;
        
        // Stop event from bubbling to document
        e.stopPropagation();
        
        // Remove selection from other cards
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        
        // Select this card
        selectedCard = card;
        card.classList.add('selected');
        showRotationControls();
        
        // Check if on mobile/small screen
        const isMobile = window.innerWidth <= 820;
        if (isMobile) {
    
        } else {

        }
      });
    });
    
    // Click outside any card to deselect
    document.addEventListener('click', (e) => {
      // Check if click is outside all cards and not on dev tool
      if (!e.target.closest('.card') && !e.target.closest('.dev-tool')) {
        if (selectedCard) {
          selectedCard.classList.remove('selected');
          selectedCard = null;
          hideRotationControls();
  
        }
      }
    });
    
    // Rotation button event listeners
    setTimeout(() => {
      const rotateLeft = document.getElementById('rotateLeft');
      const rotateLeftFast = document.getElementById('rotateLeftFast');
      const rotateRight = document.getElementById('rotateRight');
      const rotateRightFast = document.getElementById('rotateRightFast');
      
      if (rotateLeft) rotateLeft.addEventListener('click', () => rotateSelectedCard(-1));
      if (rotateLeftFast) rotateLeftFast.addEventListener('click', () => rotateSelectedCard(-10));
      if (rotateRight) rotateRight.addEventListener('click', () => rotateSelectedCard(1));
      if (rotateRightFast) rotateRightFast.addEventListener('click', () => rotateSelectedCard(10));
    }, 200);
    
    // Keyboard rotation controls
    document.addEventListener('keydown', (e) => {
      // Debug logging for mobile
      if (selectedCard) {
    
      }
      
      if (!selectedCard) return;
      
      // Use 10-degree increments when Shift is held, 1-degree otherwise
      const increment = e.shiftKey ? 10 : 1;
      
      if (e.key === 'ArrowLeft') {
        // Rotate counter-clockwise
        e.preventDefault();

        rotateSelectedCard(-increment);
      } else if (e.key === 'ArrowRight') {
        // Rotate clockwise
        e.preventDefault();

        rotateSelectedCard(increment);
      } else if (e.key === 'Escape') {
        // Deselect card
        if (selectedCard) {
          selectedCard.classList.remove('selected');
          selectedCard = null;
          hideRotationControls();

        }
      }
    });

    // Initial update
    updateDevTool();
  }
  
  // Initialize dev tool after DOM is ready
  setTimeout(() => {
    initializeDevTool();
  }, 100);

  // Preload FloatPrompt content when page loads
  loadFloatPromptContent();

})();