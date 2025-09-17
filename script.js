document.addEventListener('DOMContentLoaded', function() {
    const textElement = document.querySelector('.home-content h3');
    const textToType = "And I am an Adventurous Person";
    let i = 0;
    textElement.textContent = ""; 

    function typeWriter() {
        if (i < textToType.length) {
            textElement.textContent += textToType.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    typeWriter();

    const nameElement = document.querySelector('.typewriter-name');
    const nameText = "Jinky Lucero";
    let nameIdx = 0;

    function typeWriterName() {
        nameElement.textContent = "";
        nameIdx = 0;
        function type() {
            if (nameIdx < nameText.length) {
                nameElement.textContent += nameText.charAt(nameIdx);
                nameIdx++;
                setTimeout(type, 120);
            }
        }
        type();
    }
    typeWriterName();

    nameElement.addEventListener('mouseenter', typeWriterName);

    const mainTypeElement = document.querySelector('.typewriter-main');
    const mainTypeText = "Hello, It's Me \nJinky Lucero";
    let mainTypeIdx = 0;

    function typeWriterMain() {
        if (mainTypeIdx < mainTypeText.length) {
            if (mainTypeText.charAt(mainTypeIdx) === '\n') {
                mainTypeElement.innerHTML += '<br>';
            } else {
                mainTypeElement.innerHTML += mainTypeText.charAt(mainTypeIdx);
            }
            mainTypeIdx++;
            setTimeout(typeWriterMain, 90);
        }
    }
    typeWriterMain();

    const adventurousElement = document.querySelector('.typewriter-adventurous');
    const adventurousText = "And I am Adventurous Person";
    let advIdx = 0;

    function typeWriterAdventurous() {
        if (advIdx < adventurousText.length) {
            adventurousElement.textContent += adventurousText.charAt(advIdx);
            advIdx++;
            setTimeout(typeWriterAdventurous, 60);
        }
    }
    if (adventurousElement) typeWriterAdventurous();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('skills')) {
                    document.querySelectorAll('.progress').forEach(bar => {
                        bar.style.width = bar.getAttribute('style').replace('width:', '').trim();
                    });
                }
            } else {
                entry.target.classList.remove('visible');
                if (entry.target.classList.contains('skills')) {
                    document.querySelectorAll('.progress').forEach(bar => {
                        bar.style.width = '0%';
                    });
                }
            }
        });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
        section.classList.add('hidden');
    });

    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = contactForm.name.value.trim();
            const email = contactForm.email.value.trim();
            const message = contactForm.message.value.trim();
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }
            
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            alert('Thank you for contacting me, ' + name + '!');
            contactForm.reset();
        });
    }
});