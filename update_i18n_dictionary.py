import json
import re

extra_ru = {
    # Cart & Checkout Notifications
    "msg_empty_cart": "Корзина пуста. Добавьте товары из каталога.",
    "msg_order_accepted": "✅ Заказ успешно принят! Менеджер свяжется с вами для подтверждения.",
    "msg_order_saved_offline": "✅ Заказ сохранён! Он будет обработан при следующем подключении к серверу.",
    "msg_checking_total": "Проверяем итог заказа…",
    "msg_total_label": "Итого:",
    "msg_total_by_manager": "Итог уточнит менеджер",
    "msg_specify_address": "Укажите город и адрес доставки.",
    "msg_order_failed": "Не удалось отправить заказ.",
    "msg_order_no_accepted": "Заказ {orderNo} принят. Менеджер подтвердит наличие и условия.",
    "msg_welcome_user": "✅ Добро пожаловать, {userName}! Функция личного кабинета будет доступна в ближайшее время.",
    "msg_invalid_password": "Введите корректный пароль (минимум 4 символа).",
    "msg_products_already_added": "Продукты из списка уже добавлены или недоступны.",
    
    # Form Options & Labels
    "opt_pickup": "Самовывоз со склада",
    "opt_delivery": "Доставка курьером",
    "opt_invoice": "Безналичный счёт",
    "opt_contract": "По договору",
    "label_company_placeholder": "ООО Автобизнес",
    "label_name_placeholder": "Иван Петров",
    "search_placeholder": "Поиск по названию, бренду, артикулу, допускам...",
    
    # Admin form placeholders & options
    "admin_spec_label_ph": "Название (напр. Вязкость)",
    "admin_spec_val_ph": "Значение (напр. 5W-30)",
    "admin_cat_oils": "Автомобильные масла",
    "admin_cat_coolants": "Охлаждающие жидкости",
    "admin_cat_chemistry": "Автохимия и смазки",
    "admin_cat_winter": "Зимняя программа",
    "admin_cat_consumables": "Расходники и аксессуары",
    "admin_cat_industrial": "Промышленный сектор",
    
    # B2B Dashboard
    "b2b_payment_due_warning": "⚠️ Срок оплаты текущего счета: до 15.07.2026",
    "b2b_order_ph": "Например, 151201",
    
    # Contact page placeholders
    "contact_name_ph": "Ваше имя",
    "contact_msg_ph": "Введите текст вашего сообщения...",
    
    # VIN Decoder & Wizard
    "vin_engine": "Двигатель:",
    "vin_diesel": "Дизель",
    "vin_year": "г.в.",
    "unit_litre": "л",
    "unit_ml": "мл",
    "unit_item": "шт.",
    "btn_remove": "Удалить",
    "not_specified": "Не указано"
}

extra_ro = {
    # Cart & Checkout Notifications
    "msg_empty_cart": "Coșul este gol. Adăugați produse din catalog.",
    "msg_order_accepted": "✅ Comanda a fost primită cu succes! Managerul vă va contacta pentru confirmare.",
    "msg_order_saved_offline": "✅ Comanda a fost salvată! Va fi procesată la următoarea conectare la server.",
    "msg_checking_total": "Verificăm totalul comenzii…",
    "msg_total_label": "Total:",
    "msg_total_by_manager": "Totalul va fi confirmat de manager",
    "msg_specify_address": "Indicați orașul și adresa de livrare.",
    "msg_order_failed": "Nu s-a putut trimite comanda.",
    "msg_order_no_accepted": "Comanda {orderNo} a fost primită. Managerul va confirma disponibilitatea și condițiile.",
    "msg_welcome_user": "✅ Bine ați venit, {userName}! Funcția cabinetului personal va fi disponibilă în curând.",
    "msg_invalid_password": "Introduceți o parolă corectă (minim 4 caractere).",
    "msg_products_already_added": "Produsele din listă au fost deja adăugate sau sunt indisponibile.",
    
    # Form Options & Labels
    "opt_pickup": "Ridicare de la depozit",
    "opt_delivery": "Livrare prin curier",
    "opt_invoice": "Cont de decontare",
    "opt_contract": "Prin contract",
    "label_company_placeholder": "SRL Autobusiness",
    "label_name_placeholder": "Ion Popescu",
    "search_placeholder": "Căutare după denumire, brand, cod, aprobări...",
    
    # Admin form placeholders & options
    "admin_spec_label_ph": "Denumire (ex. Vâscozitate)",
    "admin_spec_val_ph": "Valoare (ex. 5W-30)",
    "admin_cat_oils": "Uleiuri auto",
    "admin_cat_coolants": "Lichide de răcire",
    "admin_cat_chemistry": "Chimie auto și vaseline",
    "admin_cat_winter": "Program de iarnă",
    "admin_cat_consumables": "Consumabile și accesorii",
    "admin_cat_industrial": "Sector industrial",
    
    # B2B Dashboard
    "b2b_payment_due_warning": "⚠️ Termenul de plată a facturii curente: până la 15.07.2026",
    "b2b_order_ph": "De exemplu, 151201",
    
    # Contact page placeholders
    "contact_name_ph": "Numele dvs.",
    "contact_msg_ph": "Introduceți textul mesajului dvs....",
    
    # VIN Decoder & Wizard
    "vin_engine": "Motor:",
    "vin_diesel": "Diesel",
    "vin_year": "an fab.",
    "unit_litre": "l",
    "unit_ml": "ml",
    "unit_item": "buc.",
    "btn_remove": "Șterge",
    "not_specified": "Nespecificat"
}

with open('i18n.js', 'r', encoding='utf-8') as f:
    i18n_content = f.read()

ru_extra_str = ",\n        ".join([f'"{k}": {json.dumps(v, ensure_ascii=False)}' for k, v in extra_ru.items()])
ro_extra_str = ",\n        ".join([f'"{k}": {json.dumps(v, ensure_ascii=False)}' for k, v in extra_ro.items()])

i18n_content = re.sub(r'(ru:\s*\{[^\}]*)(\})', r'\1,\n        ' + ru_extra_str + r'\n    \2', i18n_content, count=1)
i18n_content = re.sub(r'(ro:\s*\{[^\}]*)(\})', r'\1,\n        ' + ro_extra_str + r'\n    \2', i18n_content, count=1)

with open('i18n.js', 'w', encoding='utf-8') as f:
    f.write(i18n_content)

print("Updated i18n.js with extra notification and form translations.")
