// Service Worker — Go Team PWA
// v2 — corrige o problema de cache "preso" em versões antigas.

const CACHE_NAME = "goteam-cache-v2";

const ARQUIVOS_PARA_CACHE = [
  "/goteam/",
  "/goteam/index.html",
  "/goteam/login.html",
  "/goteam/app.html",
  "/goteam/area.html",
  "/goteam/pagamento.html",
  "/goteam/manifest.json",
  "/goteam/assets/go-team-logo.png",
  "/goteam/assets/hero-runners.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS_PARA_CACHE).catch((err) => {
        console.warn("Alguns arquivos não puderam ser cacheados:", err);
      });
    })
  );
  // Ativa a nova versão imediatamente, sem esperar todas as abas fecharem
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  // Assume o controle das abas já abertas imediatamente
  self.clients.claim();
});

// Estratégia: sempre busca a versão mais nova na rede primeiro.
// Só usa o cache se estiver sem internet.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then((resposta) => {
        const respostaClone = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, respostaClone);
        });
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});
