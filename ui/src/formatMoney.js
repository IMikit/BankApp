const formatMoney = (amount) => {
    let formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    })

    let formattedValue = formatter.format(amount)

    return formattedValue
}

export default formatMoney