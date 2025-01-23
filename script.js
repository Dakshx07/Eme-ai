// Initialize map and geolocation
let map;
let userMarker;
let watchId;

// Contact Management System
let trustedContacts = JSON.parse(localStorage.getItem('trustedContacts')) || [];
const contactForm = document.getElementById('add-contact-form');
const contactsList = document.getElementById('contacts-list');

// Predefined emergency services data
const defaultEmergencyServices = {
    hospitals: [
        {
            name: "City General Hospital",
            location: { lat: 40.7128, lng: -74.0060 }, // You should update these coordinates
            phone: "911",
            type: "hospital",
            address: "123 Healthcare Ave"
        },
        {
            name: "Emergency Medical Center",
            location: { lat: 40.7138, lng: -74.0065 },
            phone: "911",
            type: "hospital",
            address: "456 Medical Blvd"
        }
    ],
    police: [
        {
            name: "Central Police Station",
            location: { lat: 40.7118, lng: -74.0050 },
            phone: "911",
            type: "police",
            address: "789 Law Enforcement St"
        },
        {
            name: "Community Police Department",
            location: { lat: 40.7108, lng: -74.0040 },
            phone: "911",
            type: "police",
            address: "321 Safety Road"
        }
    ],
    fireStations: [
        {
            name: "Main Fire Station",
            location: { lat: 40.7148, lng: -74.0070 },
            phone: "911",
            type: "fire_station",
            address: "159 Fire Fighter Way"
        },
        {
            name: "Community Fire Department",
            location: { lat: 40.7158, lng: -74.0080 },
            phone: "911",
            type: "fire_station",
            address: "753 Emergency Response Rd"
        }
    ]
};

function initMap() {
    // Default center location (you can change these coordinates)
    const center = { lat: 40.7128, lng: -74.0060 };

    // Create map
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: center,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{ "color": "#f5f5f5" }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#e9e9e9" }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#9e9e9e" }]
            }
        ]
    });

    // Add markers for emergency services
    const emergencyServices = [
        {
            position: { lat: 40.7128, lng: -74.0060 },
            title: "City General Hospital",
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
        },
        {
            position: { lat: 40.7138, lng: -74.0065 },
            title: "Emergency Medical Center",
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
        }
    ];

    // Add markers to map
    emergencyServices.forEach(service => {
        const marker = new google.maps.Marker({
            position: service.position,
            map: map,
            title: service.title,
            icon: service.icon,
            animation: google.maps.Animation.DROP
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `<div class="map-info-window">
                        <h3>${service.title}</h3>
                        <p>Emergency Services Available 24/7</p>
                     </div>`
        });

        // Add click listener to marker
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Center map on user location
                map.setCenter(userLocation);

                // Add user marker
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                    icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    },
                    animation: google.maps.Animation.BOUNCE
                });
            },
            () => {
                console.log('Error: The Geolocation service failed.');
            }
        );
    }
}

// SOS Button functionality
const sosButton = document.getElementById('sos-button');
sosButton.addEventListener('click', async () => {
    try {
        const position = await getCurrentPosition();
        sendEmergencyAlert(position);
        startLocationTracking();
        openEmergencyChat();
    } catch (error) {
        console.error('Error during SOS:', error);
        showNotification('Error sending SOS. Please try again.');
    }
});

// Location sharing
function startLocationTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            position => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateUserLocation(pos);
            },
            error => console.error('Error tracking location:', error),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }
}

function updateUserLocation(position) {
    if (userMarker) {
        userMarker.setPosition(position);
    }
    // Send updated location to emergency contacts
    sendLocationUpdate(position);
}

// Emergency Chat
const chatWidget = document.getElementById('chat-widget');
const closeChatBtn = document.getElementById('close-chat');
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input input');
const chatSendBtn = document.querySelector('.chat-input button');

function openEmergencyChat() {
    chatWidget.classList.remove('hidden');
    addChatMessage('System', 'Emergency responder will join shortly. Please describe your situation.');
}

closeChatBtn.addEventListener('click', () => {
    chatWidget.classList.add('hidden');
});

chatSendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        addChatMessage('You', message);
        chatInput.value = '';
        // Simulate automated response
        setTimeout(() => {
            addChatMessage('System', 'Message received. Help is on the way.');
        }, 1000);
    }
});

function addChatMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <strong>${sender}:</strong>
        <span>${message}</span>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Utility functions
function showNotification(message, type = 'info') {
    const alertBanner = document.querySelector('.alert-banner');
    const alertBanner = document.querySelector('.alert-banner');
    
    // Remove existing state classes
    alertBanner.classList.remove('success', 'warning', 'danger');
    
    // Add new state class based on type
    switch(type) {
        case 'success':
            alertBanner.classList.add('success');
            break;
        case 'warning':
            alertBanner.classList.add('warning');
            break;
        case 'danger':
            alertBanner.classList.add('danger');
            break;
    }
    
    const alertMessage = document.getElementById('alert-message');
    alertBanner.style.display = 'flex';
    
    // Optional: Add slide-in animation
    alertBanner.style.animation = 'none';
    alertBanner.offsetHeight; // Trigger reflow
    alertBanner.style.animation = 'alertPulse 2s infinite';
    // Add new state class based on type
    switch(type) {
        case 'success':
            alertBanner.classList.add('success');
            break;
        case 'warning':
            alertBanner.classList.add('warning');
            break;
        case 'danger':
            alertBanner.classList.add('danger');
            break;
    }
    
    alertMessage.textContent = message;
    alertBanner.style.display = 'flex';
    
    // Optional: Add slide-in animation
    alertBanner.style.animation = 'none';
    alertBanner.offsetHeight; // Trigger reflow
    alertBanner.style.animation = 'alertPulse 2s infinite';

    // Vibrate if available
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// Search for nearby emergency services
function searchNearbyServices(location) {
    const service = new google.maps.places.PlacesService(map);
    const emergencyTypes = ['hospital', 'police', 'fire_station'];
    
    emergencyTypes.forEach(type => {
        const request = {
            location: location,
            radius: '5000',
            type: type
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(place => {
                    createServiceMarker(place);
                    addToServicesList(place);
                });
            }
        });
    });
}

// Create markers for emergency services
function createServiceMarker(place) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name,
        icon: {
            url: getServiceIcon(place.types[0]),
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="service-info">
                <h3>${place.name}</h3>
                <p>${place.vicinity}</p>
                <button onclick="sendLocationToService('${place.place_id}')">
                    Send My Location
                </button>
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

// Get appropriate icon for service type
function getServiceIcon(type) {
    const icons = {
        hospital: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        police: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        fire_station: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
    };
    return icons[type] || icons.hospital;
}

// Add service to the services list
function addToServicesList(place) {
    const servicesList = document.getElementById('services-list');
    const serviceItem = document.createElement('div');
    serviceItem.className = 'service-item';
    serviceItem.innerHTML = `
        <h4>${place.name}</h4>
        <p>${place.vicinity}</p>
        <button onclick="sendLocationToService('${place.place_id}')" class="action-btn">
            <i class="fas fa-share-location"></i>
            Share Location
        </button>
    `;
    servicesList.appendChild(serviceItem);
}

// Contact Management Functions
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const phone = document.getElementById('contact-phone').value;
    const email = document.getElementById('contact-email').value;

    addTrustedContact({ name, phone, email });
    contactForm.reset();
});

function addTrustedContact(contact) {
    trustedContacts.push(contact);
    localStorage.setItem('trustedContacts', JSON.stringify(trustedContacts));
    renderContacts();
    showNotification(`${contact.name} added to trusted contacts`);
}

function renderContacts() {
    contactsList.innerHTML = '';
    trustedContacts.forEach((contact, index) => {
        const contactElement = document.createElement('div');
        contactElement.className = 'contact-item';
        contactElement.innerHTML = `
            <div class="contact-info">
                <h4>${contact.name}</h4>
                <p><i class="fas fa-phone"></i>${contact.phone}</p>
                <p><i class="fas fa-envelope"></i>${contact.email}</p>
            </div>
            <div class="contact-actions">
                <button onclick="sendLocationToContact(${index})" class="action-btn" title="Share Location">
                    <i class="fas fa-share-location"></i>
                </button>
                <button onclick="removeContact(${index})" class="action-btn delete" title="Remove Contact">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        contactsList.appendChild(contactElement);
    });
}

function removeContact(index) {
    const contact = trustedContacts[index];
    trustedContacts.splice(index, 1);
    localStorage.setItem('trustedContacts', JSON.stringify(trustedContacts));
    renderContacts();
    showNotification(`${contact.name} removed from trusted contacts`);
}

async function sendLocationToContact(index) {
    try {
        const position = await getCurrentPosition();
        const contact = trustedContacts[index];
        const message = `
            Emergency Alert from ${document.title}
            Location: https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}
        `;
        
        // In a real application, you would send this through your backend
        console.log(`Sending location to ${contact.name}: ${message}`);
        showNotification(`Location sent to ${contact.name}`);
    } catch (error) {
        showNotification('Error sending location. Please try again.');
    }
}

// Initialize contacts list
renderContacts();

// Initialize the map when the page loads
window.initMap = initMap;

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Don't prevent default for profile link
            if (link.getAttribute('href') === '#profile') {
                return;
            }

            // For regular page navigation
            e.preventDefault();
            const targetPage = link.getAttribute('href');
            
            // Simple navigation
            window.location.href = targetPage;
        });
    });

    // Set active state for current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

// Mobile menu functionality
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navToggle && navToggle.classList.contains('active')) {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
});

// Function to add default emergency services
function addDefaultEmergencyServices() {
    const allServices = [
        ...defaultEmergencyServices.hospitals,
        ...defaultEmergencyServices.police,
        ...defaultEmergencyServices.fireStations
    ];

    allServices.forEach(service => {
        createDefaultServiceMarker(service);
        addToServicesList(service);
    });
}

// Create markers for default services
function createDefaultServiceMarker(service) {
    const marker = new google.maps.Marker({
        map: map,
        position: service.location,
        title: service.name,
        icon: {
            url: getServiceIcon(service.type),
            scaledSize: new google.maps.Size(30, 30)
        },
        animation: google.maps.Animation.DROP
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="service-info">
                <h3>${service.name}</h3>
                <p>${service.address}</p>
                <p>Emergency: ${service.phone}</p>
                <div class="service-actions">
                    <button onclick="sendLocationToService('${service.name}')" class="map-action-btn">
                        <i class="fas fa-share-location"></i> Send Location
                    </button>
                    <button onclick="getDirections(${service.location.lat}, ${service.location.lng})" class="map-action-btn">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                </div>
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    return marker;
}

// Function to get directions
function getDirections(lat, lng) {
    if (userMarker) {
        const userPos = userMarker.getPosition();
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat()},${userPos.lng()}&destination=${lat},${lng}`;
        window.open(url, '_blank');
    }
}

// Function to filter services
function filterServices(type) {
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Update the addToServicesList function
function addToServicesList(service) {
    const servicesList = document.getElementById('services-list');
    const serviceItem = document.createElement('div');
    serviceItem.className = 'service-item';
    serviceItem.dataset.type = service.type;
    serviceItem.innerHTML = `
        <div class="service-content">
            <div class="service-icon">
                <i class="${getServiceTypeIcon(service.type)}"></i>
            </div>
            <div class="service-details">
                <h4>${service.name}</h4>
                <p>${service.address}</p>
                <p class="emergency-phone">
                    <i class="fas fa-phone-alt"></i> ${service.phone}
                </p>
            </div>
        </div>
        <div class="service-actions">
            <button onclick="sendLocationToService('${service.name}')" class="action-btn">
                <i class="fas fa-share-location"></i>
                Share Location
            </button>
            <button onclick="getDirections(${service.location.lat}, ${service.location.lng})" class="action-btn">
                <i class="fas fa-directions"></i>
                Directions
            </button>
        </div>
    `;
    servicesList.appendChild(serviceItem);
}

// Helper function to get service type icon
function getServiceTypeIcon(type) {
    const icons = {
        hospital: 'fas fa-hospital',
        police: 'fas fa-shield-alt',
        fire_station: 'fas fa-fire-extinguisher'
    };
    return icons[type] || 'fas fa-building';
}

// Emergency Alert System
const emergencyAlerts = {
    alerts: [],
    init() {
        this.checkForEmergencies();
        // Check for new emergencies every 30 seconds
        setInterval(() => this.checkForEmergencies(), 30000);
    },

    addEmergencyAlert(emergency) {
        this.alerts.unshift(emergency);
        this.updateAlertDisplay();
        this.notifyUsers(emergency);
    },

    checkForEmergencies() {
        // In a real application, this would fetch from a server
        // For demo, we'll just randomly create emergencies sometimes
        if (Math.random() < 0.1) { // 10% chance of emergency
            this.createRandomEmergency();
        }
    },

    createRandomEmergency() {
        const emergencyTypes = [
            {
                type: 'weather',
                title: 'Severe Weather Alert',
                message: 'Strong thunderstorms expected in your area',
                severity: 'warning'
            },
            {
                type: 'fire',
                title: 'Fire Emergency',
                message: 'Active fire reported in nearby area',
                severity: 'danger'
            },
            {
                type: 'police',
                title: 'Police Activity',
                message: 'Increased police activity in your vicinity',
                severity: 'warning'
            }
        ];

        const emergency = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
        this.addEmergencyAlert({
            ...emergency,
            id: Date.now(),
            timestamp: new Date(),
            location: 'Your Area' // In real app, use actual location
        });
    },

    updateAlertDisplay() {
        const alertBanner = document.querySelector('.alert-banner');
        const alertMessage = document.getElementById('alert-message');
        const alertStatus = document.querySelector('.alert-status span:last-child');

        if (this.alerts.length === 0) {
            showNotification('No current emergencies in your area', 'success');
            alertStatus.textContent = 'System monitoring active';
            return;
        }

        const latestAlert = this.alerts[0];
        alertBanner.className = `alert-banner ${latestAlert.severity}`;
        alertMessage.innerHTML = `
            <strong>${latestAlert.title}</strong><br>
            ${latestAlert.message}
        `;
        alertStatus.textContent = `Active Alert: ${latestAlert.type.toUpperCase()}`;

        // Add alert details button
        if (!document.getElementById('view-alerts-btn')) {
            const alertContent = document.querySelector('.alert-content');
            const viewButton = document.createElement('button');
            viewButton.id = 'view-alerts-btn';
            viewButton.className = 'alert-view-btn';
            viewButton.innerHTML = `
                <i class="fas fa-list-ul"></i>
                View All Alerts
            `;
            viewButton.onclick = () => this.showAlertsList();
            alertContent.appendChild(viewButton);
        }
    },

    notifyUsers(emergency) {
        // Browser notification
        if (Notification.permission === "granted") {
            new Notification("Emergency Alert", {
                body: emergency.message,
                icon: "/path/to/emergency-icon.png"
            });
        }

        // Sound alert
        const alertSound = new Audio('/path/to/alert-sound.mp3');
        alertSound.play().catch(e => console.log('Error playing sound:', e));

        // Show notification banner
        showNotification(emergency.message, emergency.severity);
    },

    showAlertsList() {
        // Create modal for alerts list
        const modal = document.createElement('div');
        modal.className = 'alerts-modal';
        modal.innerHTML = `
            <div class="alerts-modal-content">
                <div class="alerts-modal-header">
                    <h2>Active Emergency Alerts</h2>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="alerts-list">
                    ${this.alerts.map(alert => `
                        <div class="alert-item ${alert.severity}">
                            <div class="alert-icon">
                                <i class="fas ${this.getAlertIcon(alert.type)}"></i>
                            </div>
                            <div class="alert-details">
                                <h3>${alert.title}</h3>
                                <p>${alert.message}</p>
                                <small>${new Date(alert.timestamp).toLocaleString()}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },

    getAlertIcon(type) {
        const icons = {
            weather: 'fa-cloud-bolt',
            fire: 'fa-fire',
            police: 'fa-shield-alt'
        };
        return icons[type] || 'fa-exclamation-triangle';
    }
};

// Initialize emergency alerts system
document.addEventListener('DOMContentLoaded', () => {
    emergencyAlerts.init();
    
    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
});

// Animate emergency contact cards on scroll
function animateContactCards() {
    const cards = document.querySelectorAll('.contact-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'cardFloat 0.5s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach(card => {
        observer.observe(card);
        
        // Add click animation for call buttons
        const callBtn = card.querySelector('.call-btn');
        callBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const phone = card.querySelector('.phone').textContent;
            window.location.href = `tel:${phone.replace(/\D/g, '')}`;
        });
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animateContactCards();
});

// Footer animation with Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
    const footerSections = document.querySelectorAll('.footer-section');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    footerSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        sectionObserver.observe(section);
    });
});
