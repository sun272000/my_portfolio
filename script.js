// Matrix background effect
function initMatrix() {
  const canvas = document.getElementById("matrixCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  const characters =
    "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?";
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(0);

  function draw() {
    ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00FF41";
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);
  window.addEventListener("resize", resizeCanvas);
}

// Helper function to load HTML components
async function loadComponent(url, elementId) {
  const placeholder = document.getElementById(elementId);
  if (placeholder) {
      try {
          const response = await fetch(url);
          if (response.ok) {
              const text = await response.text();
              placeholder.outerHTML = text; // Replace placeholder with fetched HTML
          } else {
              placeholder.innerHTML = `<p style="color:var(--error);">Error: Could not load ${elementId}.</p>`;
              console.error(`Failed to load ${url}: ${response.status}`);
          }
      } catch (error) {
          placeholder.innerHTML = `<p style="color:var(--error);">Error: Could not fetch ${elementId}.</p>`;
          console.error(`Error fetching ${url}:`, error);
      }
  }
}

// New function to automatically set the ".active" class on the correct nav link
function setActiveNavLink() {
  // Get the name of the current page file (e.g., "about.html")
  let currentPage = window.location.pathname.split("/").pop();
  
  // Default to index.html if page is "" (root)
  if (currentPage === "") {
      currentPage = "index.html";
  }

  // Find all nav links
  const navLinks = document.querySelectorAll(".nav-links a");
  
  navLinks.forEach(link => {
      const linkPage = link.getAttribute("href");
      
      // Check if the link's href matches the current page
      if (linkPage === currentPage) {
          link.classList.add("active");
      } else {
          link.classList.remove("active"); // Ensure no other links are active
      }
  });
}

// Common Loader function
function showCommonLoader() {
  return new Promise((resolve) => {
    const loader = document.getElementById("commonLoader");
    const progress = document.getElementById("commonLoaderProgress");

    // Show loader
    loader.classList.add("active");
    progress.style.width = "0%";

    // Simulate loading progress - shorter duration
    const progressSteps = [
      { width: "30%", delay: 200 },
      { width: "60%", delay: 300 },
      { width: "90%", delay: 600 },
      { width: "100%", delay: 200 }
    ];

    let totalDelay = 0;
    progressSteps.forEach((step, index) => {
      totalDelay += step.delay;
      setTimeout(() => {
        progress.style.width = step.width;
      }, totalDelay);
    });

    // Hide loader after completion
    setTimeout(() => {
      loader.classList.remove("active");
      setTimeout(resolve, 0); // Shorter fade out
    }, totalDelay + 600);
  });
}

// Terminal Class
class TerminalPortfolio {
  constructor() {
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentInput = document.getElementById("terminalInput");
    this.terminalContent = document.getElementById("terminalContent");
    this.currentInputContainer = document.getElementById("currentInput");
    this.isLoading = false;

    this.commands = {
      "pf -help": () => this.showHelp(),
      "portfolio -help": () => this.showHelp(),
      "pf -about": () => this.showAbout(),
      "portfolio -about": () => this.showAbout(),
      "pf -skills": () => this.showSkills(),
      "portfolio -skills": () => this.showSkills(),
      "pf -projects": () => this.showProjects(),
      "portfolio -projects": () => this.showProjects(),
      "pf -contact": () => this.showContact(),
      "portfolio -contact": () => this.showContact(),
      "pf -gui": () => this.switchToGUI(),
      "portfolio -gui": () => this.switchToGUI(),
      "ls": () => this.listDirectory(),
      "cd": () => this.changeDirectory(),
      "clear": () => this.clearTerminal(),
      "exit": () => this.showViewSelector(),
    };

    this.initEventListeners();
    this.focusInput();
  }

  initEventListeners() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".terminal-window-controls")) {
        this.focusInput();
      }
    });

    if (this.currentInput) {
      this.currentInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.executeCommand();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.navigateHistory(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateHistory(1);
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.autoComplete();
        }
      });
    }

    // Terminal window controls
    const closeBtn = document.getElementById("closeTerminal");
    const minimizeBtn = document.getElementById("minimizeTerminal");
    const maximizeBtn = document.getElementById("maximizeTerminal");

    if (closeBtn) {
      closeBtn.addEventListener("click", async () => {
        await showCommonLoader();
        this.showViewSelector();
      });
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => {
        this.addOutput(
          '[INFO] Terminal minimized. Type "exit" to return to selection screen.'
        );
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", () => {
        this.addOutput("[INFO] Terminal maximized.");
      });
    }
  }

  executeCommand() {
    if (this.isLoading || !this.currentInput) return;

    const command = this.currentInput.value.trim();

    if (command) {
      this.commandHistory.push(command);
      this.historyIndex = this.commandHistory.length;
      this.addOutput(`b1swa@portfolio:~$ ${command}`, "command-line");

      if (this.commands[command]) {
        this.commands[command]();
      } else if (command === "cd" || command.startsWith("cd ")) {
        this.changeDirectory(command);
      } else {
        this.addOutput(
          `bash: ${command}: command not found\nType 'pf -help' for available commands.`,
          "error"
        );
      }
    }

    this.clearInput();
    this.createNewPrompt();
  }

  autoComplete() {
    if (!this.currentInput) return;
    
    const input = this.currentInput.value;
    const commands = Object.keys(this.commands);
    const matches = commands.filter((cmd) =>
      cmd.startsWith(input.toLowerCase())
    );

    if (matches.length === 1) {
      this.currentInput.value = matches[0];
    } else if (matches.length > 1) {
      this.addOutput(matches.join("    "));
    }
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0 || !this.currentInput) return;

    this.historyIndex = Math.max(
      0,
      Math.min(this.commandHistory.length, this.historyIndex + direction)
    );

    if (
      this.historyIndex >= 0 &&
      this.historyIndex < this.commandHistory.length
    ) {
      this.currentInput.value = this.commandHistory[this.historyIndex];
    } else {
      this.currentInput.value = "";
    }
  }

  showHelp() {
    const helpContent = `Available Commands:

You can use pf as a shorthand for the portfolio command
Examples:

pf -help     - Show this help menu
pf -about    - Learn about me
pf -skills   - View my technical skills
pf -projects - See my projects
pf -contact  - Get my contact information
pf -gui      - Switch to GUI mode
ls           - List directory contents
cd           - Change directory
clear        - Clear terminal
exit         - Return to mode selection`;
    this.addOutput(helpContent);
  }

  showAbout() {
    const aboutAscii = ` 
 █████╗ ██████╗  ██████╗ ██╗   ██╗████████╗
██╔══██╗██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝
███████║██████╔╝██║   ██║██║   ██║   ██║   
██╔══██║██╔══██╗██║   ██║██║   ██║   ██║   
██║  ██║██████╔╝╚██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   `;

const aboutContent = `${aboutAscii}

b1swa - Security Specialist

I’m a proud son. My future kids are my greatest assets, and I must protect them.

There are many threats, risks, and vulnerabilities that could affect them.

As a security professional, my duty is to protect the information I’m responsible for from these threats, risks, and vulnerabilities.

In the field of security, issues and incidents (“fires”) will inevitably occur.

It’s important to keep operations running smoothly despite these challenges. When necessary, I must escalate issues —

    either to the appropriate technical team, or

    up the management chain to find a resolution.

Stats:
- 03+ Projects Completed
- 01+ Satisfied Clients
- 06+ Professional Certifications`;
    this.addOutput(aboutContent);
  }

  showSkills() {
    const skillsAscii = `
███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ██╔════╝
███████╗█████╔╝ ██║██║     ██║     ███████╗
╚════██║██╔═██╗ ██║██║     ██║     ╚════██║
███████║██║  ██╗██║███████╗███████╗███████║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝`;

    const skillsContent = `${skillsAscii}

Technical Skills:

Security:
████████████████          63% VAPT
██████████████            54% Web Security
█████████                 36% Network Sec
█                         02% Cryptography

Development:
██████████████████        69% Python
████████████              43% JS/Node.js
███████████████           59% React
████████                  32% Databases

Tools & Technologies:
████████████████████████  83% Kali Linux
██████████                33% Burp Suite
██████████████            54% Metasploit
██████████████            53% Wireshark`;
    this.addOutput(skillsContent);
  }

  showProjects() {
    const projectsAscii = `
██████╗ ██████╗  ██████╗      ██╗███████╗ ██████╗████████╗███████╗
██╔══██╗██╔══██╗██╔═══██╗     ██║██╔════╝██╔════╝╚══██╔══╝██╔════╝
██████╔╝██████╔╝██║   ██║     ██║█████╗  ██║        ██║   ███████╗
██╔═══╝ ██╔══██╗██║   ██║██   ██║██╔══╝  ██║        ██║   ╚════██║
██║     ██║  ██║╚██████╔╝╚█████╔╝███████╗╚██████╗   ██║   ███████║
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚════╝ ╚══════╝ ╚═════╝   ╚═╝   ╚══════╝`;

    const projectsContent = `${projectsAscii}

Recent Projects:

1. Securing Network using Honeypots: A Comparative Study on Honeytrap and T-Pot
- Two honeypot solutions — Honeytrap and T-Pot — were deployed and implemented in a simulated private network.
- The objective was to study and compare the following aspects:
    - Hardware requirements
    - Installation complexities
    - Range of emulated services supported
    - Level of interaction offered by each honeypot
➤ Technologies: Honeypot, Networking, Tesing, Security Research
➤ ResearchGate Link: https://tinyurl.com/yuffkp34

2. Network Intrusion Detection System (NIDS) Rule Creation and Testing Lab 
- A virtualized security lab will be created to simulate a controlled network environment.
- An open-source Network Intrusion Detection System (NIDS) — such as Snort — will be deployed to monitor network traffic in real time.
- The NIDS will be configured with custom detection rules to identify specific malicious activities or suspicious behavior.
- When such activities are detected, the system will generate immediate alerts.
- These alerts will be sent to security analysts for further investigation and response.
➤ Technologies: NIDs, Snort, Log analysis, Terminal Tool
➤ GitHub Link: https://github.com/sun272000/Infotact-Solution-Internship/tree/main/INFOTACT_CS_NIDS_01

3. Threat Intelligence Feed Processor
- Build a Python-based security tool. The tool will run automatically on a schedule.
- It will fetch the latest threat data (malicious IPs, domains, and file hashes). Threat data will come from public feeds like:
    - AbuseIPDB
    - AlienVault OTX
- The tool will store the fetched data locally.
- It will compare these IOCs (Indicators of Compromise) with simulated network or system logs.
- If any matches are found, the tool will generate alerts.
- These alerts will help security analysts investigate suspicious activity quickly.
- The overall goal is to automate threat detection and response in a simulated environment.
➤ Technologies: Python, AbuseIPDB, Network Security
➤ Github Link: https://github.com/sun272000/Infotact-Solution-Internship/tree/main/INFOTACT_CS_TIP_03`;
    this.addOutput(projectsContent);
  }

  showContact() {
    const contactAscii = `
 ██████╗ ██████╗ ███╗   ██╗████████╗ █████╗  ██████╗████████╗
██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝
██║     ██║   ██║██╔██╗ ██║   ██║   ███████║██║        ██║   
██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██║██║        ██║   
╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║╚██████╗   ██║   
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝   ╚═╝   `;

    const contactContent = `${contactAscii}

Contact Information:

Email:        sandipbiswa2000@gmail.com
Phone:        +975 17*******
Address:      192.168.119.12
Availability: Currently available for freelance projects

Social:
- GitHub:     github.com/sun272000
- LinkedIn:   linkedin.com/in/sandip-biswa-636b85142/


Let's work together to secure your digital assets and 
build innovative technology solutions.`;
    this.addOutput(contactContent);
  }

  listDirectory() {
    const listDirectory = `Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos`;
    this.addOutput(listDirectory);
  }

  changeDirectory(command) {
    this.addOutput(
      `bash: ${command}: Permission denied\nType 'pf -help' for available commands.`,
      "error"
    );
  }

  async switchToGUI() {
    this.isLoading = true;
    this.addOutput("[INFO] Switching to GUI mode...");

    // Remove setTimeout and directly switch after loader
    await showCommonLoader();
    document.getElementById("terminalInterface").style.display = "none";
    
    // Check if we are on the index page or another page
    const guiInterface = document.getElementById("guiInterface");
    if (guiInterface) {
        guiInterface.style.display = "block";
        
        // This logic is now handled by the new DOMContentLoaded listener
        // We just need to ensure the GUI components are initialized
        //
        // NOTE: Since initGUI() is now called *after* component loading
        // in the DOMContentLoaded listener, we might need to call it
        // again *if* the user switches from Terminal to GUI *after*
        // the initial page load.
        
        // Let's check if header/footer placeholders are still there.
        // If they are, it means we're switching *back* to GUI and need
        // to re-load components and re-init GUI.
        if (document.getElementById("header-placeholder")) {
           await Promise.all([
                loadComponent("_header.html", "header-placeholder"),
                loadComponent("_footer.html", "footer-placeholder")
           ]);
           setActiveNavLink();
           initGUI();
        } else {
            // Components are already loaded, just re-run initGUI
            // to re-attach listeners that might have been lost.
            initGUI();
        }

    } else {
        // If on a page without GUI (like a dedicated terminal page if you had one), redirect to index
        window.location.href = "index.html"; 
    }
    
    this.isLoading = false;
  }

  async showViewSelector() {
    this.isLoading = true;
    this.addOutput("[INFO] Returning to mode selection...");

    // Remove setTimeout and directly switch after loader
    await showCommonLoader();
    document.getElementById("terminalInterface").style.display = "none";
    
    // This button might be on any page, so we must check if viewSelector exists
    const viewSelector = document.getElementById("viewSelector");
    if (viewSelector) {
         viewSelector.style.display = "flex";
    } else {
        // If not on index.html, redirect to it to show the selector
        window.location.href = "index.html";
    }
    this.isLoading = false;
  }

  clearTerminal() {
    const outputs = this.terminalContent.querySelectorAll(".terminal-output");
    outputs.forEach((output, index) => {
      if (index > 0) output.remove();
    });
  }

  addOutput(content, type = "") {
    const output = document.createElement("div");
    output.className = `terminal-output ${type}`;
    output.style.whiteSpace = "pre-wrap";

    if (
      content.includes("██") ||
      content.includes("➤") ||
      content.includes("████")
    ) {
      output.innerHTML = `<div class="ascii-art">${content}</div>`;
    } else {
      output.textContent = content;
    }

    this.terminalContent.insertBefore(output, this.currentInputContainer);
    this.scrollToBottom();
  }

  clearInput() {
    if (this.currentInput) {
      this.currentInput.value = "";
    }
  }

  createNewPrompt() {
    const newInputContainer = document.createElement("div");
    newInputContainer.className = "terminal-input-container";
    newInputContainer.id = "currentInput";
    newInputContainer.innerHTML = `
      <span class="terminal-prompt">b1swa@portfolio:~$</span>
      <input type="text" class="terminal-input" autocomplete="off" spellcheck="false">
      <span class="terminal-cursor"></span>
    `;

    this.terminalContent.replaceChild(
      newInputContainer,
      this.currentInputContainer
    );
    this.currentInputContainer = newInputContainer;
    this.currentInput = newInputContainer.querySelector(".terminal-input");

    // Reattach event listeners
    if (this.currentInput) {
      this.currentInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.executeCommand();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.navigateHistory(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.navigateHistory(1);
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.autoComplete();
        }
      });
    }

    this.focusInput();
    this.scrollToBottom();
  }

  focusInput() {
    if (this.currentInput) {
      this.currentInput.focus();
    }
  }

  scrollToBottom() {
    this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
  }
}

// GUI initialization
function initGUI() {
  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.innerHTML = navLinks.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }

  // Close mobile menu when clicking on a link
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks) {
        navLinks.classList.remove("active");
        if (hamburger) {
          hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        }
      }
    });
  });

  // Switch to terminal from GUI
  // We must re-find this button *every time* initGUI runs,
  // because it's part of the dynamically loaded header.
  const switchToTerminalBtn = document.getElementById("switchToTerminal");
  if (switchToTerminalBtn) {
    
    // ===== START OF FIX =====
    // Check if the *full* terminal interface exists on this page
    const terminalInterface = document.getElementById("terminalInterface");
    // We check for .terminal-top-bar to see if it's the *real* one, not an empty placeholder
    const isFullTerminal = terminalInterface && terminalInterface.querySelector(".terminal-top-bar");

    if (isFullTerminal) {
      // We are on index.html. Use the ORIGINAL logic.
      switchToTerminalBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // Stay on this page
        await showCommonLoader();
        
        const guiInterface = document.getElementById("guiInterface");
        if (guiInterface) {
            guiInterface.style.display = "none";
        }
        
        terminalInterface.style.display = "flex";
        
        if (!window.terminal) {
          window.terminal = new TerminalPortfolio();
        }
        window.terminal.focusInput();
      });
    } else {
      // We are on a sub-page (skills, about, etc.)
      // Change the button to a simple link that navigates to index.html#terminal
      switchToTerminalBtn.href = "index.html#terminal";
      // We DON'T add a click listener, so it just acts as a normal link.
    }
    // ===== END OF FIX =====
  }

  // Animate skill bars (if they exist on the current page)
  function animateSkillBars() {
    const skillLevels = document.querySelectorAll(".skill-level");
    if (skillLevels.length > 0) {
      skillLevels.forEach((skill) => {
        const level = skill.getAttribute("data-level");
        skill.style.width = level + "%";
      });
    }
  }

  // Typing animation (if it exists on the current page)
  function initTypingAnimation() {
    const textElement = document.getElementById("typed-text");
    if (!textElement) return;

    const texts = [
      "Passionate Cyber Defender",
      "Specializing in Digital Forensics & Cybersecurity",
      "Devoted to Building Secure Digital Futures",
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      // Check if element still exists (e.g., user navigated away)
      if (!document.getElementById("typed-text")) return; 
      
      const currentText = texts[textIndex];

      if (isDeleting) {
        textElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        textElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 1000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typingSpeed = 500;
      }

      setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
  }

  // Initialize animations
  function initAnimations() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
      });
    }

    animateSkillBars();
    initTypingAnimation();
  }

  // Initialize EmailJS (if the form exists on the current page)
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    (function () {
      emailjs.init("zkaU9kkPParxxwUFQ"); // ✅ Replace with your EmailJS public key
    })();
    
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector(".submit-btn");
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // 1️⃣ Send notification email (to you) using the "Contact Us" template
        emailjs.sendForm("service_vh6c30s", "template_l8huu3j", this)     // for the contact_us form
          .then(() => {
            // 2️⃣ Send auto-reply email (to user) using the "Auto-Reply" template
            return emailjs.sendForm("service_vh6c30s", "template_hv8vo3e", this);     //for the Auto-reply form
          })
          .then(() => {
            alert("✅ Message sent successfully! An auto-reply has been sent to your inbox.");
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          })
          .catch((error) => {
            alert("❌ Failed to send message. Please try again later.");
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          });
      });
  }

  initAnimations();
}

// Initialize application
document.addEventListener("DOMContentLoaded", async () => { // Make this async
  // Always initialize Matrix background
  initMatrix(); 
  
  // These elements only exist on index.html
  const terminalOption = document.getElementById("terminalOption");
  const guiOption = document.getElementById("guiOption");
  const viewSelector = document.getElementById("viewSelector");

  // Check if we are on a GUI page (not the initial selector)
  const guiInterface = document.getElementById("guiInterface");
  const terminalInterface = document.getElementById("terminalInterface");

  // This handles loading for all sub-pages (about.html, skills.html, etc.)
  if (guiInterface && guiInterface.style.display === 'block') {
      // Load header and footer *before* initializing GUI
      await Promise.all([
          loadComponent("_header.html", "header-placeholder"),
          loadComponent("_footer.html", "footer-placeholder")
      ]);
      
      // Now that header/footer are loaded, set the active link
      setActiveNavLink();
      
      // And *now* initialize all GUI scripts (hamburger, terminal switch, etc.)
      initGUI();

      // Also initialize the terminal logic in the background
      if (terminalInterface && !window.terminal) {
          window.terminal = new TerminalPortfolio();
      }
  }

  // This handles the logic for the *main* index.html selector page
  if (terminalOption && guiOption && viewSelector) {
    
    // Terminal Option
    terminalOption.addEventListener("click", async function () {
      viewSelector.style.display = "none";
      await showCommonLoader();
      
      document.getElementById("terminalInterface").style.display = "flex";
      if (!window.terminal) {
        window.terminal = new TerminalPortfolio();
      }
      window.terminal.focusInput();
    });
    
    // GUI Option
    guiOption.addEventListener("click", async function () {
      viewSelector.style.display = "none";
      await showCommonLoader();
      
      // Load header/footer *after* clicking GUI, before showing it
      await Promise.all([
          loadComponent("_header.html", "header-placeholder"),
          loadComponent("_footer.html", "footer-placeholder")
      ]);
      
      // Set active link (will be index.html)
      setActiveNavLink();

      document.getElementById("guiInterface").style.display = "block";
      
      // Init GUI *after* it's all loaded and displayed
      initGUI();
    });
  }
  
  // ===== NEW CODE: Check for #terminal hash =====
  if (window.location.hash === '#terminal') {
    // This hash is used to auto-launch terminal from other pages
    
    const viewSelector = document.getElementById("viewSelector");
    const terminalInterface = document.getElementById("terminalInterface");
    const guiInterface = document.getElementById("guiInterface");

    // Check that we are on index.html (by checking for viewSelector)
    if (viewSelector && terminalInterface) {
      // Hide selector and GUI, show terminal
      viewSelector.style.display = "none";
      if (guiInterface) {
        guiInterface.style.display = "none";
      }
      
      terminalInterface.style.display = "flex";
      
      if (!window.terminal) {
        window.terminal = new TerminalPortfolio();
      }
      window.terminal.focusInput();
      
      // Optional: clean up the URL bar
      history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }
  // ===== END OF NEW CODE =====
  
});