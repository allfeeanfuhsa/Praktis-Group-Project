// assets/js/script.js
console.log('Practicum Assistants App Loaded...');

// Contoh: Auto hide alert setelah 3 detik
setTimeout(function() {
    let alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        // alert.style.display = 'none'; // Aktifkan nanti kalau mau
    });
}, 3000);