Готово. Вот что сделано:

1. chain/js/util/API.js — из функции set убраны параметр metadata и его передача в args RPC-запроса.
2. chain/js/components/footer/footer.js — удалена константа METADATA и её передача в API.set().
3. chain/js/components/templates/admx-template.js — удалены функция buildAdmxMetadataPath, переменная metadataPath, а также передача metadataPath в API.set() и лог.