// Estado de la aplicación
const appState = {
    currentPage: 'home',
    user: null,
    users: JSON.parse(localStorage.getItem('transcoope_users')) || [],
    currentUser: JSON.parse(localStorage.getItem('transcoope_current_user')) || null,
    posts: [],
    projects: [],
    trends: [],
    ratings: [],
    recommendations: []
};

// Elementos del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const appContainer = document.getElementById('app-container');
const registerForm = document.getElementById('register-form');
const loginModal = document.getElementById('login-modal');
const showLoginLink = document.getElementById('show-login');
const goToRegisterLink = document.getElementById('go-to-register');
const loginForm = document.getElementById('login-form');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    initializeEventListeners();
    loadSampleData();
    
    // Si ya hay un usuario logueado, mostrar la aplicación
    if (appState.currentUser) {
        showApp();
    }
});

// Inicializar sistema de autenticación
function initializeAuth() {
    // Verificar si hay usuario en localStorage
    const savedUser = localStorage.getItem('transcoope_current_user');
    if (savedUser) {
        appState.currentUser = JSON.parse(savedUser);
        showApp();
    }
}

// Mostrar la aplicación principal
function showApp() {
    welcomeScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
    loadHeader();
    loadFooter();
    loadPage('home');
}

// Mostrar pantalla de bienvenida
function showWelcome() {
    welcomeScreen.classList.remove('hidden');
    appContainer.classList.add('hidden');
    appState.currentUser = null;
    localStorage.removeItem('transcoope_current_user');
}

// Inicializar event listeners
function initializeEventListeners() {
    // Formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
        // Validación en tiempo real
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', updatePasswordStrength);
        }
        
        // Toggle visibilidad de contraseña
        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', togglePasswordVisibility);
        }
    }
    
    // Mostrar modal de login
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }
    
    // Ir a registro desde login
    if (goToRegisterLink) {
        goToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.add('hidden');
        });
    }
    
    // Formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Toggle visibilidad de contraseña en login
    const toggleLoginPassword = document.getElementById('toggle-login-password');
    if (toggleLoginPassword) {
        toggleLoginPassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('login-password');
            togglePasswordVisibilityForInput(passwordInput);
        });
    }
}

// Manejar registro de usuario
function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const acceptTerms = document.getElementById('accept-terms').checked;
    
    // Validaciones
    if (!validateRegistration(name, email, username, password, confirmPassword, acceptTerms)) {
        return;
    }
    
    // Mostrar estado de carga
    const registerBtn = document.getElementById('register-btn');
    registerBtn.classList.add('loading');
    
    // Simular proceso de registro (en una app real sería una llamada API)
    setTimeout(() => {
        // Crear nuevo usuario
        const newUser = {
            id: generateUserId(),
            name: name,
            email: email,
            username: username,
            password: password, // En una app real, esto estaría encriptado
            avatar: getInitials(name),
            joinDate: new Date().toISOString(),
            preferences: {
                genres: [],
                instruments: []
            }
        };
        
        // Guardar usuario
        appState.users.push(newUser);
        localStorage.setItem('transcoope_users', JSON.stringify(appState.users));
        
        // Iniciar sesión automáticamente
        appState.currentUser = newUser;
        localStorage.setItem('transcoope_current_user', JSON.stringify(newUser));
        
        // Mostrar mensaje de éxito
        showNotification(`¡Bienvenido a TransCoope, ${name}!`, 'success');
        
        // Ocultar pantalla de bienvenida y mostrar aplicación
        showApp();
        
        // Quitar estado de carga
        registerBtn.classList.remove('loading');
    }, 2000);
}

// Validar datos de registro
function validateRegistration(name, email, username, password, confirmPassword, acceptTerms) {
    let isValid = true;
    
    // Limpiar errores anteriores
    clearErrors();
    
    // Validar nombre
    if (name.length < 2) {
        showError('name-error', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    }
    
    // Validar email
    if (!isValidEmail(email)) {
        showError('email-error', 'Por favor ingresa un email válido');
        isValid = false;
    } else if (isEmailTaken(email)) {
        showError('email-error', 'Este email ya está registrado');
        isValid = false;
    }
    
    // Validar username
    if (username.length < 3) {
        showError('username-error', 'El usuario debe tener al menos 3 caracteres');
        isValid = false;
    } else if (isUsernameTaken(username)) {
        showError('username-error', 'Este nombre de usuario ya está en uso');
        isValid = false;
    }
    
    // Validar contraseña
    if (password.length < 6) {
        showError('confirm-error', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }
    
    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
        showError('confirm-error', 'Las contraseñas no coinciden');
        isValid = false;
    }
    
    // Validar términos
    if (!acceptTerms) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Verificar si el email ya está registrado
function isEmailTaken(email) {
    return appState.users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// Verificar si el username ya está registrado
function isUsernameTaken(username) {
    return appState.users.some(user => user.username.toLowerCase() === username.toLowerCase());
}

// Mostrar error en formulario
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Limpiar errores del formulario
function clearErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Actualizar indicador de fuerza de contraseña
function updatePasswordStrength() {
    const password = document.getElementById('register-password').value;
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    const passwordContainer = document.getElementById('register-password').parentElement;
    
    // Remover clases anteriores
    passwordContainer.classList.remove('password-weak', 'password-medium', 'password-strong', 'password-very-strong');
    
    if (password.length === 0) {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Seguridad de contraseña';
        return;
    }
    
    let strength = 0;
    let feedback = '';
    
    // Longitud
    if (password.length >= 8) strength += 25;
    
    // Mayúsculas y minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    
    // Números
    if (/\d/.test(password)) strength += 25;
    
    // Caracteres especiales
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    // Aplicar clases y texto según la fuerza
    if (strength <= 25) {
        passwordContainer.classList.add('password-weak');
        feedback = 'Débil';
    } else if (strength <= 50) {
        passwordContainer.classList.add('password-medium');
        feedback = 'Media';
    } else if (strength <= 75) {
        passwordContainer.classList.add('password-strong');
        feedback = 'Fuerte';
    } else {
        passwordContainer.classList.add('password-very-strong');
        feedback = 'Muy fuerte';
    }
    
    strengthFill.style.width = `${strength}%`;
    strengthText.textContent = feedback;
}

// Alternar visibilidad de contraseña
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('register-password');
    togglePasswordVisibilityForInput(passwordInput);
}

function togglePasswordVisibilityForInput(input) {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    
    // Actualizar icono
    const icon = input.parentElement.querySelector('i');
    if (icon) {
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
}

// Mostrar modal de login
function showLoginModal() {
    loginModal.classList.remove('hidden');
}

// Manejar inicio de sesión
function handleLogin(e) {
    e.preventDefault();
    
    const login = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Buscar usuario por email o username
    const user = appState.users.find(u => 
        u.email === login || u.username === login
    );
    
    if (user && user.password === password) {
        // Login exitoso
        appState.currentUser = user;
        localStorage.setItem('transcoope_current_user', JSON.stringify(user));
        
        showNotification(`¡Bienvenido de nuevo, ${user.name}!`, 'success');
        loginModal.classList.add('hidden');
        showApp();
    } else {
        // Credenciales incorrectas
        showNotification('Email/usuario o contraseña incorrectos', 'error');
    }
}

// Cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        showNotification('Sesión cerrada correctamente', 'info');
        showWelcome();
    }
}

// Generar ID único para usuario
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Obtener iniciales para avatar
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// ... (mantener todas las demás funciones existentes: loadHeader, loadFooter, loadPage, showNotification, etc.)

// Cargar header actualizado
function loadHeader() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) return;
    
    headerContainer.innerHTML = `
        <header>
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo" onclick="loadPage('home')">
                        <i class="fas fa-music"></i>
                        <span>TransCoope</span>
                    </div>
                    <ul class="nav-menu">
                        <li class="nav-item"><a href="#" class="nav-link" onclick="loadPage('home')">Inicio</a></li>
                        <li class="nav-item"><a href="#" class="nav-link" onclick="loadPage('transcripcion')">Transcribir</a></li>
                        <li class="nav-item"><a href="#" class="nav-link" onclick="loadPage('comunidad')">Comunidad</a></li>
                        <li class="nav-item"><a href="#" class="nav-link" onclick="loadPage('proyectos')">Proyectos</a></li>
                        <li class="nav-item"><a href="#" class="nav-link" onclick="loadPage('tendencias')">Tendencias</a></li>
                        <li class="nav-item"><a href="#" class="nav-link" onclick="loadPage('recomendaciones')">Recomendaciones</a></li>
                        ${appState.currentUser ? 
                            `<li class="nav-item user-menu">
                                <a href="#" class="nav-link user-link">
                                    <div class="user-avatar-small">${appState.currentUser.avatar}</div>
                                    ${appState.currentUser.name}
                                </a>
                                <div class="user-dropdown">
                                    <a href="#" onclick="loadPage('perfil')"><i class="fas fa-user"></i> Mi Perfil</a>
                                    <a href="#" onclick="loadPage('configuracion')"><i class="fas fa-cog"></i> Configuración</a>
                                    <div class="dropdown-divider"></div>
                                    <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                                </div>
                            </li>` :
                            `<li class="nav-item"><a href="#" class="nav-link" onclick="showLoginModal()">Iniciar Sesión</a></li>
                             <li class="nav-item"><a href="#" class="nav-link register-btn">Registrarse</a></li>`
                        }
                    </ul>
                    <div class="hamburger">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
            </nav>
        </header>
    `;
    
    // Inicializar menú hamburguesa y dropdown de usuario
    initializeHeaderInteractions();
}

// Inicializar interacciones del header
function initializeHeaderInteractions() {
    // Menú hamburguesa
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Dropdown de usuario
    const userLink = document.querySelector('.user-link');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userLink && userDropdown) {
        userLink.addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.toggle('show');
        });
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
        if (userDropdown) userDropdown.classList.remove('show');
    }));
}

// Estilos adicionales para el dropdown de usuario
const userMenuStyles = `
    .user-menu {
        position: relative;
    }
    
    .user-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .user-avatar-small {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        padding: 0.5rem 0;
        min-width: 200px;
        z-index: 1000;
        display: none;
    }
    
    .user-dropdown.show {
        display: block;
        animation: fadeIn 0.3s ease;
    }
    
    .user-dropdown a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.7rem 1.5rem;
        color: var(--text-color);
        text-decoration: none;
        transition: background-color 0.2s ease;
    }
    
    .user-dropdown a:hover {
        background-color: var(--gray-light);
    }
    
    .user-dropdown i {
        width: 16px;
        text-align: center;
    }
    
    .dropdown-divider {
        height: 1px;
        background-color: var(--gray);
        margin: 0.5rem 0;
    }
`;

// Agregar estilos del dropdown de usuario
const styleSheet = document.createElement('style');
styleSheet.textContent = userMenuStyles;
document.head.appendChild(styleSheet);

// ... (mantener el resto de funciones como loadHomePage, loadTranscriptionPage, etc.)
