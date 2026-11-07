# Cr1stalik — Developer Portfolio

Личное портфолио Cr1stalik. Фирменная концепция **Cr1stalik Signature**: тёмный минимализм, синие и фиолетовые оттенки, Inter, Space Grotesk и JetBrains Mono.

## Стек и инфраструктура

- HTML5, CSS3, Vanilla JavaScript
- GitHub Pages — бесплатный статический хостинг
- GitHub Actions — проверки, CMS-публикация через Pull Request
- GitHub REST API — публичная статистика и список репозиториев
- JSON-файлы — публичный статус, changelog и достижения

**Проект рассчитан на GitHub-only: VPS и отдельный backend не требуются.**

## Страницы

| Файл | Назначение |
| --- | --- |
| `index.html` | Главная, проекты, GitHub Dashboard, текущий статус и контакты |
| `fluffy.html` | Кейс Discord-бота Fluffy |
| `paw-art-studio.html` | Кейс клиентского сайта Paw Art Studio |
| `phoenix-rp.html` | Кейс Android-приложения Phoenix RP |
| `songid.html` | Кейс экспериментального SongID |
| `roadmap.html` | Карта развития |
| `updates.html` | Changelog и подтверждённые достижения |
| `admin/index.html` | GitHub-only CMS |

## Публичные данные

- `data/site-data.json` — текущий статус и активные направления.
- `data/changelog.json` — история изменений.
- `data/achievements.json` — реальные этапы с описанием и ссылками.

Пользовательские данные выводятся через безопасные DOM API. Не добавляйте HTML-разметку или секреты в JSON.

## GitHub-only CMS

Открой `/admin/` на опубликованном сайте. Панель загружает публичные JSON-файлы, проверяет их структуру и копирует подготовленное содержимое. Затем она открывает GitHub Actions.

1. В workflow **Portfolio CMS** выбери файл.
2. Вставь скопированный JSON в поле `content`.
3. Нажми **Run workflow**.
4. Workflow проверит, что запуск выполнен аккаунтом `Cr1staloriginal`, проверит структуру JSON и создаст Pull Request.
5. Проверь PR и объедини его в `main`, чтобы опубликовать изменения.

Для workflow используются только встроенный `GITHUB_TOKEN` и права `contents: write` / `pull-requests: write`. Персональные токены и секреты в браузере не нужны. Другие аккаунты не могут успешно выполнить CMS workflow.

## Контактная форма

GitHub Pages не может отправлять сообщения самостоятельно. Контактная форма подготавливает Telegram-черновик для ручной отправки; сайт не сообщает об успешной доставке, пока её фактически нет. Автоматическая доставка требует отдельного сервера или внешнего сервиса и в GitHub-only версии не включена.

## Проверки

GitHub Actions workflow `.github/workflows/portfolio-checks.yml` выполняет:
- проверку синтаксиса JavaScript;
- разбор публичных JSON-файлов;
- проверку HTML-якорей и локальных ресурсов;
- проверку основных страниц.

Workflow `.github/workflows/portfolio-cms.yml` выполняет валидацию данных и создаёт Pull Request.

## Публикация

После проверки и слияния изменений с `main` GitHub Pages публикует статические файлы. В настройках репозитория в **Settings → Pages** должен быть выбран источник **Deploy from a branch → main → / (root)**, либо уже настроенный GitHub Pages workflow.
