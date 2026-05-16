const text = [
    'Web Developer',
    'Python Programmer'
];

let count = 0;
let index = 0;
let currentText = '';
let letter = '';

(function type() {

    if (count === text.length) {
        count = 0;
    }

    currentText = text[count];
    letter = currentText.slice(0, ++index);

    document.getElementById('typing').textContent = letter;

    if (letter.length === currentText.length) {

        count++;
        index = 0;

        setTimeout(type, 1500);

    } else {

        setTimeout(type, 100);

    }

})();

particlesJS('particles-js', {
    particles: {
        number: {
            value: 65
        },

        color: {
            value: '#8b5cf6'
        },

        shape: {
            type: 'circle'
        },

        opacity: {
            value: .3
        },

        size: {
            value: 3
        },

        line_linked: {
            enable: true,
            distance: 150,
            color: '#8b5cf6',
            opacity: .15,
            width: 1
        },

        move: {
            enable: true,
            speed: 1.3
        }
    }
});