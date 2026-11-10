/** Limitador simples em memória para proteger a busca com IA. */
module.exports = function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
    const hits = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [key, times] of hits) {
            const recent = times.filter((t) => now - t < windowMs);
            if (recent.length) hits.set(key, recent);
            else hits.delete(key);
        }
    }, windowMs).unref();

    return (req, res, next) => {
        const key = req.user?.id ?? req.ip; // por usuário logado; por IP como reserva
        const now = Date.now();
        const times = (hits.get(key) || []).filter((t) => now - t < windowMs);

        if (times.length >= max) {
            res.set("Retry-After", String(Math.ceil((windowMs - (now - times[0])) / 1000)));
            return res.status(429).json({ message: "Muitas buscas seguidas. Aguarde um instante e tente de novo." });
        }

        times.push(now);
        hits.set(key, times);
        next();
    };
};
