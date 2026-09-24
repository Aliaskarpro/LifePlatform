# Деплой LifePlatform

Проект состоит из Vite/React PWA, Express API и PostgreSQL. Фронтенд и API разворачиваются отдельно. Пользовательские записи принадлежат аккаунту, который определён по JWT; в браузере личный кэш разделён по ID пользователя.

## Переменные окружения

### Фронтенд

Задаются в настройках Vercel/Netlify и используются во время сборки:

| Переменная | Пример | Назначение |
| --- | --- | --- |
| `VITE_API_URL` | `https://life-api.onrender.com` | Origin API без суффикса `/api` |
| `VITE_WS_URL` | `wss://life-api.onrender.com` | WebSocket URL; можно оставить пустым, тогда схема и host берутся из API URL |
| `VITE_APP_NAME` | `LifePlatform` | Название приложения |

Переменные `VITE_*` попадают в браузерный bundle. Не помещайте в них пароли, ключи БД или JWT secret.

### Бэкенд

Хранятся только в секретах backend-сервиса:

| Переменная | Обязательность | Назначение |
| --- | --- | --- |
| `DATABASE_URL` | да | PostgreSQL URI с TLS от провайдера БД |
| `JWT_SECRET` | да | Случайный секрет подписи токенов, минимум 32 случайных байта |
| `CORS_ORIGIN` | да в production | Точные origin фронтенда через запятую, например `https://life.vercel.app,https://life.example.com` |
| `NODE_ENV` | да | `production` |
| `PORT` | платформа задаёт сама | Порт HTTP-сервера |
| `JWT_EXPIRES_IN` | нет | Срок JWT, по умолчанию `7d` |
| `BCRYPT_ROUNDS` | нет | Сложность хеширования, рекомендуется `12` |
| `FRONTEND_URL` | для почты | Публичный URL фронтенда, используется в ссылке сброса пароля |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | нет | SMTP для писем сброса пароля |

`ADMIN_EMAIL` и `ADMIN_PASSWORD` нужны только при запуске `npm run admin:seed`. Не задавайте их во фронтенде и не коммитьте реальные значения.

## 1. Создать PostgreSQL в Supabase

1. Создайте проект в Supabase и сохраните пароль базы.
2. В панели проекта откройте **Connect** и скопируйте URI для PostgreSQL. Для Render используйте доступный pooler URI, если прямое подключение к базе недоступно из выбранной сети. Убедитесь, что в URI включено SSL (`sslmode=require`); используйте строку подключения из панели Supabase, а не собирайте её по памяти.
3. Миграция сама создаёт таблицы, индексированные пользовательские записи, JSONB-хранилище `life_data` и общие справочные уровни. Новая регистрация не получает демо-данные.

У Supabase Free сейчас есть лимит 500 MB на базу; неактивный бесплатный проект может быть приостановлен после недели низкой активности. В Free также нет автоматических резервных копий. Проверяйте актуальные лимиты и политику паузы перед публичным запуском: [тарифы Supabase](https://supabase.com/pricing), [автоматическая пауза проекта](https://supabase.com/docs/guides/platform/free-project-pausing).

## 2. Создать фронтенд в Vercel

Создайте проект из GitHub-репозитория `Aliaskarpro/Life`:

1. Укажите корневую директорию репозитория.
2. Framework Preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Добавьте `VITE_API_URL` с будущим публичным origin backend, например `https://life-api.onrender.com`. Не добавляйте `/api` в конец.
4. При необходимости задайте `VITE_WS_URL`, например `wss://life-api.onrender.com`.
5. Запустите deploy и запишите публичный домен Vercel.

`vercel.json` направляет клиентские маршруты React Router на `index.html`, поэтому можно напрямую открывать `/login`, `/dashboard` и `/admin`. Для Netlify добавлено аналогичное правило `public/_redirects`.

Vercel Hobby бесплатен для личных некоммерческих проектов; ограничения и условия использования могут меняться. Смотрите [условия плана Hobby](https://vercel.com/docs/plans/hobby).

## 3. Создать API в Render

В Render создайте **Blueprint** из этого репозитория. `render.yaml` настраивает:

- корневую папку `backend`;
- сборку `npm install && npm run build`;
- запуск `npm start`;
- health check `/health`.

Установите backend environment variables:

```text
NODE_ENV=production
DATABASE_URL=<URI из Supabase>
JWT_SECRET=<случайная длинная строка>
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://<домен-фронтенда-vercel>
FRONTEND_URL=https://<домен-фронтенда-vercel>
```

Если используете собственный домен или Vercel preview-домен, перечислите разрешённые origin через запятую. Не добавляйте `*`: API работает с авторизационным заголовком и разрешает только явные origin.

Render назначит `PORT` автоматически. Не задавайте его вручную, если платформа уже передаёт это значение.

### Применить миграцию и создать администратора

Миграция и создание admin запускаются вручную из папки `backend` с production `DATABASE_URL`. Так команда выполняется один раз и не сбрасывает пароль admin при каждом деплое.

PowerShell:

```powershell
Set-Location backend
$env:DATABASE_URL = "<URI из Supabase>"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "<уникальный пароль не короче 12 символов>"
$env:ADMIN_FIRST_NAME = "Platform"
$env:ADMIN_LAST_NAME = "Administrator"
npm install
npm run db:migrate
npm run admin:seed
```

Bash:

```bash
cd backend
export DATABASE_URL='<URI из Supabase>'
export ADMIN_EMAIL='admin@example.com'
export ADMIN_PASSWORD='<уникальный пароль не короче 12 символов>'
npm install
npm run db:migrate
npm run admin:seed
```

Скрипт создаёт аккаунт с ролью `admin`. Если email уже есть в базе, он повышает эту запись до admin и меняет её пароль на `ADMIN_PASSWORD`; запускайте его повторно только если действительно хотите заменить пароль. Обычная регистрация всегда создаёт роль `user`.

После успешной миграции откройте `https://<backend-host>/health`: API должен вернуть `{"status":"ok"}`. Войдите во фронтенд под admin-аккаунтом; в навигации появится раздел **Администрирование**.

## 4. Ограничения бесплатного режима и 24/7

Бесплатная связка подходит для демонстраций и личного проекта, но не гарантирует постоянную доступность:

- бесплатный Render Web Service засыпает после 15 минут без запросов и может запускаться около минуты;
- Render указывает, что Free instances не предназначены для production; бесплатная база Render истекает через 30 дней, поэтому для этого проекта используйте отдельный внешний PostgreSQL;
- Supabase Free может приостановить неактивный проект.

Актуальные условия: [Render Free](https://render.com/docs/free), [первый деплой Render](https://render.com/docs/your-first-deploy), [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing). Для настоящего 24/7 выберите постоянно работающий платный API-инстанс и БД с резервным копированием; точные цены и квоты проверьте у провайдера перед включением.

## 5. Альтернатива: Netlify для фронтенда

1. Импортируйте тот же GitHub-репозиторий в Netlify.
2. Base directory оставьте пустой, Build command: `npm run build`, Publish directory: `dist`.
3. Добавьте `VITE_API_URL` и при необходимости `VITE_WS_URL` в environment variables.
4. Deploy site и добавьте выданный домен в `CORS_ORIGIN` backend-сервиса.

Правило `public/_redirects` уже настроено для маршрутов SPA. После изменения переменных фронтенда запускайте новый deploy, так как Vite встраивает `VITE_*` во время сборки.

## Локальный запуск

1. Скопируйте `backend/.env.example` в `backend/.env` и задайте локальный `DATABASE_URL`, `JWT_SECRET` и разрешённые origin.
2. В папке `backend` выполните `npm install`, `npm run db:migrate`, затем `npm run dev`.
3. В корне создайте `.env` из `.env.example`, затем выполните `npm install` и `npm run dev`.
4. Фронтенд откроется на Vite-порту `3000`, API — на `3001`. Локальные origin `http://localhost:3000` и `http://localhost:5173` разрешены backend-конфигурацией разработки.

Не помещайте `.env` в Git. Корневой `.gitignore` исключает реальные `.env` файлы, сохраняя `.env.example`.
