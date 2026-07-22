# NoteKeeper

یک اپلیکیشن تحت وب برای ساخت، دسته‌بندی و جست‌وجوی یادداشت‌ها. این مخزن نسخه یکپارچه‌ی پروژه‌های `NoteKeeperFront` و `NoteKeeperBack` است و تاریخچه Git هر دو پروژه را حفظ می‌کند.

[![CI](https://github.com/AmirTahan80/NoteKeeperFullStack/actions/workflows/ci.yml/badge.svg)](https://github.com/AmirTahan80/NoteKeeperFullStack/actions/workflows/ci.yml)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AmirTahan80/NoteKeeperFullStack)

## امکانات

- ثبت‌نام و ورود با JWT و password hashing استاندارد ASP.NET Core
- ساخت موضوع و یادداشت با جست‌وجو، صفحه‌بندی و فایل پیوست
- کنترل دسترسی کامل؛ هر کاربر فقط یادداشت‌ها و فایل‌های خودش را می‌بیند
- Angular 22 و ASP.NET Core روی .NET 10 در یک سرویس وب
- PostgreSQL و migration خودکار EF Core
- Docker، Docker Compose، Render Blueprint و GitHub Actions

## اجرای سریع با Docker

پیش‌نیاز: Docker Desktop

```powershell
docker compose up --build
```

سپس [http://localhost:8080](http://localhost:8080) را باز کنید. برای توقف:

```powershell
docker compose down
```

داده‌ها در volume محلی `notekeeper-data` باقی می‌مانند. برای حذف داده‌های محلی نیز می‌توانید آگاهانه `docker compose down -v` را اجرا کنید.

## اجرای توسعه‌ای

ابتدا PostgreSQL را بالا بیاورید:

```powershell
docker compose up database -d
dotnet run --project NoteBookKeeper.Api
```

در ترمینال دوم:

```powershell
cd ClientApp
npm ci
npm start
```

Angular در [http://localhost:4200](http://localhost:4200) اجرا می‌شود و درخواست‌های `/api` را به ASP.NET Core می‌فرستد.

## تست و بررسی build

```powershell
dotnet build NoteBookKeeper.sln -c Release
cd ClientApp
npm ci
npm run build
npm test -- --browsers=ChromeHeadless
cd ..
./scripts/e2e.ps1
docker build -t notekeeper:local .
```

پس از اجرای برنامه، health check در `/api/health` باید `Healthy` برگرداند. یک حساب آزمایشی بسازید، وارد شوید، یک موضوع و یک یادداشت دارای تصویر ایجاد کنید و در مرورگر دیگری مطمئن شوید فایل بدون توکن قابل دریافت نیست.

## استقرار روی Render

فایل `render.yaml` یک web service و PostgreSQL می‌سازد. دکمه **Deploy to Render** را بزنید، وارد Render شوید و Blueprint را تأیید کنید. مقدار JWT به‌صورت خودکار و امن تولید می‌شود.

> پلن رایگان Render برای دمو مناسب است، اما دیتابیس رایگان آن دائمی نیست. برای نمونه‌کار بلندمدت، دیتابیس را به پلن پولی ارتقا دهید یا `DATABASE_URL` را به یک PostgreSQL پایدار متصل کنید.

## ساختار پروژه

```text
ClientApp/             Angular frontend
NoteBookKeeper.Api/    ASP.NET Core API and EF Core
Dockerfile             Production image for both apps
docker-compose.yml     Local web app + PostgreSQL
render.yaml            One-click cloud blueprint
```

## نکته امنیتی

در مخازن قدیمی اطلاعات نمونه‌ای داخل history ثبت شده بود. نسخه جدید هیچ secret واقعی را commit نمی‌کند، اما اگر هر کدام از مقادیر قدیمی در محیط واقعی استفاده شده‌اند باید آن‌ها را rotate کنید؛ پاک‌کردن فایل فعلی، history قبلی Git را پاک نمی‌کند.
