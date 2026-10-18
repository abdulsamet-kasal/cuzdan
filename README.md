# Cüzdan

Kişisel gelir–gider takip uygulaması. Tüm veriler cihazda `localStorage` içinde saklanır;
backend, giriş (login) veya dış servis kullanımı yoktur. Arayüz tamamen Türkçedir.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

APK'ları [Releases](https://github.com/abdulsamet-kasal/cuzdan/releases) sayfasından indirebilirsiniz.

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit + vite production build (dist/)
npm run preview
```

## Yapı

```
src/
  components/   AppShell, TabBar, BalanceCard, TransactionList, TransactionRow,
                AddTransactionSheet, NumericKeypad, CategoryGrid, DonutChart,
                TrendChart, SettingsList, Sheet, ConfirmDialog, ...
  screens/      SummaryScreen (Özet), TransactionsScreen (İşlemler),
                ReportsScreen (Raporlar), SettingsScreen (Ayarlar)
  hooks/        useLocalStorage, useAppData, useTransactions, useSettings,
                useCategories, useHorizontalSwipe, usePrefersReducedMotion
  utils/        format (Intl tr-TR), calc (useMemo seçicileri), icons, cn
  data/         varsayılan kategoriler, varsayılan ayarlar, örnek veriler
  types.ts      Transaction, Category, Settings
  styles/       global.css — tasarım belirteçleri (renk, tipografi, boşluk)
```

## Veri

- Tüm durum tek anahtar altında saklanır: `localStorage["cuzdan-v1"]`
  (`{ version, transactions, categories, settings }`).
- Her okuma/yazma `try/catch` içindedir; kayıt bozuksa veya yoksa varsayılanlara düşülür.
- İlk açılışta varsayılan kategoriler tohumlanır. Örnek işlemler yalnızca
  **Ayarlar → Veri → Örnek verileri ekle** ile eklenir.
- Tutarlar 2 haneye yuvarlanmış sayı olarak tutulur; tüm toplamlar `useMemo`
  seçicileriyle hesaplanır. Birikim oranı = (gelir − gider) / gelir, gelir 0 ise `%0`.
- Dışa aktarma/İçe aktarma JSON dosyası üzerinden çalışır (Ayarlar → Veri).

## Mobil / APK hazırlığı

- `viewport-fit=cover`, `env(safe-area-inset-top|bottom)` desteklenir.
- `overscroll-behavior: none` ile pull-to-refresh kapatılmıştır; uygulama `100dvh`
  içinde kalır, kaydırma yalnızca içerik alanında olur.
- Dokunma hedefleri en az 44px, birincil butonlar 48px yüksekliğindedir.
- Uygulamada dış istek yoktur, uzak yazı tipi kullanılmaz; tamamen çevrimdışı çalışır.

### Android / APK

Proje `android/` klasörüyle Capacitor 8'e hazır yapılandırılmıştır
(`com.abdulsamet.cuzdan`). APK üretimi GitHub Actions'ta otomatiktir:

1. Sürüm etiketi oluşturun ve itin: `git tag v1.0.0 && git push origin v1.0.0`
2. `.github/workflows/release.yml` web üretimi + `cap sync` + Gradle
   `assembleRelease` adımlarını çalıştırır.
3. Oluşan `cuzdan-v1.0.0.apk` otomatik olarak **Releases** sayfasına eklenir.

CI'da release APK imzalamak için repoya şu secret'lar tanımlıdır:
`ANDROID_KEYSTORE_BASE64` (keystore dosyasının base64 hali),
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

Yerelde imzalı APK üretmek için:

```bash
npm run build && npx cap sync android
cp /yol/uzere/release.keystore android/app/release.keystore
set ANDROID_KEYSTORE_PASSWORD=...
set ANDROID_KEY_ALIAS=cuzdan
set ANDROID_KEY_PASSWORD=...
cd android && gradlew assembleRelease
# çıktı: android/app/build/outputs/apk/release/app-release.apk
```

> Keystore kaybolursa uygulama güncellenemez (aynı imza gerekli). Keystore ve
> şifreleri güvenli bir yerde saklayın; secret'lara yalnızca şifreler yüklüdür,
> dosyanın kendisi depoda değildir.

`localStorage` yerleşik WebView'da çalıştığı için ek veri katmanı gerekmez;
istediğinizde `hooks/useLocalStorage.ts` içindeki okuma/yazma fonksiyonlarını
Capacitor Preferences ile değiştirmek yeterlidir (arayüz sözleşmesi değişmez).
