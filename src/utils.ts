



function regexAll (text: string, array: any[]) {
    for (const i in array) {
        let regex = array[i][0]
        const flags = (typeof regex === 'string') ? 'g' : undefined
        regex = new RegExp (regex, flags)
        text = text.replace (regex, array[i][1])
    }
    return text
}

export {
    regexAll,
}
