// Service Worker — Go Team PWA
// Cuida do cache básico para permitir instalação e uso parcial offline.

const CACHE_NAME = "goteam-cache-v1";

// Ajuste esta lista conforme os arquivos reais do seu repositório.
const ARQUIVOS_PARA_CACHE = [
  "/goteam/",
  "/goteam/index.html",
  "/goteam/login.html",
  "/goteam/area.html",
  "/goteam/pagamento.html",
  "/goteam/manifest.json",
  "/goteam/assets/go-team-logo.png",
  "/goteam/assets/hero-runners.jpg"
];

// Instala o service worker e guarda os arquivos essenciais em cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS_PARA_CACHE).catch((err) => {
        // Não trava a instalação se algum arquivo da lista ainda não existir
        console.warn("Alguns arquivos não puderam ser cacheados:", err);
      });
    })
  );
  self.skipWaiting();
});

// Remove caches antigos quando uma nova versão do service worker assume
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
  self.clients.claim();
});

// Estratégia: tenta a rede primeiro, cai pro cache se estiver offline
self.addEventListener("fetch", (event) => {
  // Ignora requisições que não são GET (ex: chamadas de pagamento)
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        // Atualiza o cache com a versão mais recente
        const respostaClone = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, respostaClone);
        });
        return resposta;
      })
      .catch(() => {
        // Sem internet: tenta responder com o que está em cache
        return caches.match(event.request);
      })
  );
});
