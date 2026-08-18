# Тестовый сервер 1С:Предприятие 8.3 в Docker для проекта Radcor

Данный каталог содержит готовую конфигурацию `docker-compose` для развертывания тестового сервера 1С:Предприятие 8.3 с базой данных PostgreSQL и публикацией OData REST API / веб-клиента через Apache.

---

## Архитектура стека

```
                   ┌──────────────────────────────────────┐
                   │          Radcor Web / API            │
                   └──────────────────┬───────────────────┘
                                      │ HTTP / OData (8080)
                                      ▼
                   ┌──────────────────────────────────────┐
                   │    Apache 2.4 (radcor_1c_web)        │
                   │      Модуль ws22.so / default.vrd    │
                   └──────────────────┬───────────────────┘
                                      │ TCP (1540, 1541, 1560-1591)
                                      ▼
                   ┌──────────────────────────────────────┐
                   │  1C:Enterprise 8.3 (radcor_1c_server)│
                   │   ragent, rmngr, rphost, ras (1545)  │
                   └──────────────────┬───────────────────┘
                                      │ SQL (5432)
                                      ▼
                   ┌──────────────────────────────────────┐
                   │ PostgreSQL 14 (radcor_1c_db)         │
                   │       База данных: radcor_1c         │
                   └──────────────────────────────────────┘
```

---

## Структура файлов

- `docker-compose.yml` — Описание сервисов `db`, `server1c`, `web1c`, томов данных и сети.
- `Dockerfile.server1c` — Образ сервера 1С на базе Ubuntu 22.04 с локалью `ru_RU.UTF-8` и автоустановкой `.deb`.
- `Dockerfile.web1c` — Образ веб-сервера Apache 2.4 для публикации информационных баз.
- `default.vrd` — Дескриптор публикации веб-клиента, OData REST API (`enableStandardOData="true"`) и HTTP-сервисов.
- `init-postgres.sql` — Инициализация и тюнинг PostgreSQL для корректной работы с 1С.
- `entrypoint-server.sh` — Скрипт автоматического запуска кластера 1С и создания инфобазы `radcor` через `rac`.
- `entrypoint-web.sh` — Скрипт автоматической публикации базы в Apache.
- `dist/` — Директория для дистрибутивов 1С (`.deb` пакеты).
- `dumps/` — Директория для выгрузок баз (`.dt`) и конфигураций (`.cf`).

---

## Быстрый старт

### 1. Подготовка дистрибутивов 1С
Скачайте с официального портала 1С (releases.1c.ru) пакеты **Cервер 1С:Предприятия (64-bit) для DEB-based Linux-систем** (версии 8.3.22 / 8.3.23 / 8.3.24 / 8.3.25) и поместите `.deb` файлы в папку `docker-1c/dist/`:
- `1c-enterprise-8.3.*-common_*.deb`
- `1c-enterprise-8.3.*-server_*.deb`
- `1c-enterprise-8.3.*-ws_*.deb`

### 2. Запуск контейнеров
В терминале перейдите в папку `docker-1c`:
```bash
cp .env.example .env
docker compose up --build -d
```

### 3. Проверка статуса
```bash
docker compose ps
docker compose logs -f server1c
```

---

## Точки подключения

| Сервис | Адрес / Строка подключения | Описание |
|---|---|---|
| **Веб-клиент 1С** | `http://localhost:8080/radcor` | Работа с базой через браузер |
| **OData REST API v4** | `http://localhost:8080/radcor/odata/standard.odata/` | REST API для интеграции с сайтом Radcor |
| **Толстый / Тонкий клиент 1С** | Сервер: `localhost`, База: `radcor` | Подключение платформы 1С с ПК разработчика |
| **Сервер администрирования (RAS)** | `localhost:1545` | Администрирование кластера через RAC |
| **PostgreSQL СУБД** | `localhost:5432` (пользователь: `postgres`, пароль: `postgres`) | Прямой доступ к СУБД |

---

## Примеры запросов к OData 1C

### 1. Получить список номенклатуры (JSON)
```http
GET http://localhost:8080/radcor/odata/standard.odata/Catalog_Номенклатура?$format=json
Authorization: Basic <login:password>
```

### 2. Получить актуальные цены номенклатуры
```http
GET http://localhost:8080/radcor/odata/standard.odata/InformationRegister_ЦеныНоменклатуры?$format=json&$filter=Active eq true
```

### 3. Создать новый заказ покупателя из корзины Radcor
```http
POST http://localhost:8080/radcor/odata/standard.odata/Document_ЗаказКлиента?$format=json
Content-Type: application/json

{
  "Date": "2026-08-18T07:30:00",
  "Контрагент_Key": "...",
  "СуммаДокумента": 1450.00,
  "Комментарий": "Заказ с сайта Radcor"
}
```

---

## Загрузка существующей конфигурации или базы (.dt / .cf)

Поместите файл выгрузки (например, `base.dt`) в папку `docker-1c/dumps/`, затем выполните:
```bash
docker compose exec server1c bash -c 'ONEC_DIR=$(find /opt/1cv8/x86_64 /opt/1C/v8.3/x86_64 -maxdepth 1 -name "8.3.*" | tail -n 1) && $ONEC_DIR/1cv8 DESIGNER /IBConnectionString "Srvr=localhost;Ref=radcor;" /RestoreIB /opt/1c-dumps/base.dt'
```
