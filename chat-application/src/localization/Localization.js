const contents = {
    "en-US": {
        clear: "Clear",
        resize: "Resize",
        send: "Send",
        inputPlaceholder: "What's your question?",
        errorMessage: "Something went wrong. Please try again later!"
    },
    "ru-RU": {
        clear: "Очистить",
        resize: "Изменить размер",
        send: "Отправить",
        inputPlaceholder: "Введите ваш вопрос...",
        errorMessage: "Что-то пошло не так. Пожалуйста, попробуйте позже!"
    }
}

export function localized(language, key) {
    return (contents[language][key] !== null && contents[language][key] !== undefined) ? contents[language][key] : key 
}

