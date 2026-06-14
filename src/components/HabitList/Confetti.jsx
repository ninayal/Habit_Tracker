import confetti from "canvas-confetti"

export const celebrateBig = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
    };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }
        const particleCount = 50 * (timeLeft / duration);

        confetti({
            ...defaults,
            particleCount,
            origin: {
                x: randomInRange(0.1, 0.3),
                y: Math.random() - 0.2,
            },
        });

        confetti({
            ...defaults,
            particleCount,
            origin: {
                x: randomInRange(0.7, 0.9),
                y: Math.random() - 0.2,
            },
        });
    }, 250);
};

export const celebrate = (origin = { x: 0.5, y: 0.6 }) => {
    confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 35,
        scalar: 0.9,
        origin,
        colors: ["#F9B2D7", "#CFECF3", "#DAF9DE", "#F6FFDC", "#d97706"],
    });
};