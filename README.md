# Cr1stalik — Developer Portfolio

Личное портфолио Cr1stalik. Сайт сохраняет фирменную концепцию **Cr1stalik Signature**: тёмный минимализм, синие и фиолетовые оттенки, Inter, Space Grotesk и JetBrains Mono.

## Стек

- HTML5, CSS3, Vanilla JavaScript
- GitHub Pages
- GitHub REST API для публичной статистики и списка репозиториев
- JSON-файлы как источник публичного статуса, changelog и достижений
- GitHub Actions для синхронизации аватара Discord и проверки изменений

## Страницы

| Файл | Назначение |
| --- | --- |
| `index.html` | Главная, проекты, GitHub Dashboard, текущий статус, контакты |
| `fluffy.html` | Кейс Discord-бота Fluffy |
| `paw-art-studio.html` | Кейс клиентского сайта Paw Art Studio |
| `phoenix-rp.html` | Кейс Android-приложения Phoenix RP |
| `songid.html` | Кейс экспериментального SongID |
| `roadmap.html` | Карта развития и проекты |
| `updates.html` | Changelog и подтверждённые достижения |
| `admin/index.html` | Закрытая CMS (активируется после backend deployment) |

## Публичные данные

- `data/site-data.json` — текущий статус и активные направления.
- `data/changelog.json` — история изменений.
- `data/achievements.json` — реальные этапы с описанием и ссылками.

Страницы используют `textContent` при выводе пользовательских данных. Не добавляйте в эти JSON HTML-разметку или секреты.

## Интерактивность

- Терминал: команды `help`, `about`, `stack`, `projects`, `contact`, `roadmap`, `github`, `status`, `updates`, `achievements`, `theme`, `matrix`, `clear`, `exit`.
- GitHub Dashboard: публичные репозитории и статистика языков по байтам в последних обновлённых репозиториях. Это не статистика вклада и не рейтинг навыков.
- Текущий статус: загружается из `data/site-data.json`.
- Настройки оформления: Signature, Violet, Ocean и частицы; выбор хранится локально в браузере посетителя.
- Контактная форма отправляет сообщение через backend после его настройки; до этого готовит Telegram-черновик для ручной отправки.
- Cursor spotlight включается только на устройствах с точным указателем и отключается при `prefers-reduced-motion`.

## Локальный просмотр

Можно открыть `index.html` напрямую, но для корректной загрузки JSON через `fetch` используйте локальный HTTP-сервер:

```bash
python -m http.server 8000
```

Затем откройте `http://localhost:8000`.

## Проверки

GitHub Actions workflow `.github/workflows/portfolio-checks.yml` выполняет:
- проверку синтаксиса JavaScript;
- разбор публичных JSON-файлов;
- проверку HTML-якорей и локальных ресурсов;
- проверку наличия основных страниц.

## Публикация

Изменения разрабатываются в feature-ветках и проходят Pull Request. После проверки и слияния с `main` GitHub Pages публикует статические файлы.

## Админ-панель и форма обратной связи

GitHub Pages — статический хостинг. Он не может безопасно хранить токены, аутентифицировать администратора или доставлять сообщения без backend. Поэтому не используйте клиентскую форму как имитацию отправки.

Серверная часть уже подготовлена в [backend/](backend/): GitHub App OAuth, CMS с PR-публикацией и Telegram-доставка. Инструкции по запуску: [BACKEND_SETUP.md](BACKEND_SETUP.md) и [backend/README.md](backend/README.md). До настройки VPS, домена и серверных секретов админ-панель остаётся отключённой.
