# Backend: админ-панель и сообщения

Серверная часть подготовлена в каталоге backend/. Это Node.js 20+ API для GitHub Pages: защищённая CMS и доставка формы обратной связи через Telegram Bot API.

## Что реализовано

- /admin/ — интерфейс входа и редактирования трёх публичных JSON-файлов.
- GitHub App user authorization: допускается только аккаунт Cr1staloriginal.
- Короткоживущий installation token ограничен одним репозиторием и разрешениями Contents / Pull requests.
- Изменения CMS создают отдельную ветку и Pull Request; напрямую в main ничего не записывается.
- Сессионная cookie HttpOnly, AES-256-GCM, проверка OAuth state.
- Серверная валидация JSON и ограничение размера; rate limit на CMS и форму.
- POST /api/contact отправляет сообщения через Telegram Bot API, если настроены серверные секреты.
- Если API URL не настроен, форма на главной готовит Telegram-черновик и не заявляет, что сообщение отправлено.

## Что требуется для запуска

1. VPS или другой Node.js-хостинг (Node.js 20+).
2. Домен портфолио и HTTPS. Для надёжных сессий рекомендуется проксировать /api/* на backend с того же origin, где размещён сайт.
3. GitHub App, установленный только на Cr1staloriginal/cr1staloriginal.github.io, с правами Contents: read/write и Pull requests: read/write.
4. Переменные GitHub App из backend/.env.example.
5. Отдельный Telegram bot token и chat ID для получения сообщений. Токен Fluffy не требуется и использовать его не нужно.

## Развёртывание на VPS

~~~bash
cd /var/www
git clone https://github.com/Cr1staloriginal/cr1staloriginal.github.io.git portfolio-api
cd portfolio-api/backend
cp .env.example .env
# Заполни .env на сервере; не отправляй его в Git.
npm install
npm run check
npm start
~~~

Сервис слушает 127.0.0.1:8787. Настрой Nginx/Caddy с HTTPS и проксированием /api/ на этот порт. Для Docker в образе задан HOST=0.0.0.0.

Не запускай команды с реальными токенами в публичных сообщениях и не добавляй .env в репозиторий. backend/.gitignore уже исключает секреты и зависимости.

Полные детали: backend/README.md.
