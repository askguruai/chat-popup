const contents = {
    "en-US": {
        clear: "Clear",
        resize: "Resize",
        send: "Send",
        inputPlaceholder: "What's your question?"
    },
    "ru-RU": {
        clear: "Очистить",
        resize: "Изменить размер",
        send: "Отправить",
        inputPlaceholder: "Введите ваш вопрос..."
    }
}

export function localized(language, key) {
    return (contents[language][key] !== null && contents[language][key] !== undefined) ? contents[language][key] : key 
}

