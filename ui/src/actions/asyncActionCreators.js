import { browserHistory } from 'react-router'
import {
    requestLogin,
    loginSuccessful,
    loginFailed,
    requestLogout,
    logoutSuccessful,
    invalidCreateAccountRequest,
    hideTransferFunds,
    invalidTransferFundsRequest
} from './actionCreators'

import * as actionTypes from './constants'

import formatMoney from '../formatMoney'
import { CALL_API } from '../middleware/api'

const validateLoginRequest = credentials => {
    let result = {
        isValid: true,
        usernameValidationMessage: null,
        passwordValidationMessage: null
    }

    if (!credentials.username) {
        result.isValid = false
        result.usernameValidationMessage = "Le nom d'utilisateur est obligatoire"
    }

    if (!credentials.password) {
        result.isValid = false
        result.passwordValidationMessage = "Le mot de passe est obligatoire"
    }

    return result
}

export const attemptLogin = credentials => {
    return dispatch => {
        let validationResult = validateLoginRequest(credentials)

        if (!validationResult.isValid) {
            return Promise.resolve(dispatch(loginFailed(validationResult)))
        }

        dispatch(requestLogin(credentials))

        dispatch(loginSuccessful())
        browserHistory.push('/accounts')
        return Promise.resolve()
    }
}

export const attemptLogout = () => {
    return (dispatch) => {
        dispatch(requestLogout())
        dispatch(logoutSuccessful())
        browserHistory.push('/')
    }
}

export const fetchAccounts = () => ({
    [CALL_API]: {
        types: [actionTypes.REQUEST_ACCOUNTS, actionTypes.RECEIVE_ACCOUNTS, actionTypes.REQUEST_ACCOUNTS_FAILURE],
        endpoint: '/accounts'
    }
})

export const fetchTransactions = accountId => ({
    [CALL_API]: {
        types: ['REQUEST_TRANSACTIONS', 'RECEIVE_TRANSACTIONS', 'REQUEST_TRANSACTIONS_FAILURE'],
        endpoint: `/transactions?accountId=${accountId}`
    }
})

const validateCreateAccountRequest = (name, openingBalance, existingAccounts) => {
    let result = {
        isValid: true,
        nameValidationMessage: null,
        openingBalanceValidationMessage: null
    }

    if (!name) {
        result.isValid = false;
        result.nameValidationMessage = 'Le nom du compte est obligatoire'
    }

    if (existingAccounts.find(account => account.name.toLowerCase() === name.toLowerCase())) {
        result.isValid = false;
        result.nameValidationMessage = `Le compte ${name} existe déjà.`
    }

    if (typeof openingBalance === 'string' && openingBalance.trim().length === 0) {
        result.isValid = false;
        result.openingBalanceValidationMessage = 'Le solde de départ est obligatoire.'
    } else {
        openingBalance = parseFloat(openingBalance)
        if (Number.isNaN(openingBalance)) {
            result.isValid = false;
            result.openingBalanceValidationMessage = 'Le solde doit être un nombre.'

        } else if (openingBalance < 0.01) {
            result.isValid = false;
            result.openingBalanceValidationMessage = `Le solde ne peut pas être plus petit que ${formatMoney(0.01)}.`
        } else if (openingBalance > 1000.00) {
            result.isValid = false;
            result.openingBalanceValidationMessage = `C'est une fausse application, mais quand même, pas plus de ${formatMoney(1000.00)}.`
        }
    }

    return result
}

const submitCreateAccountRequest = (name, openingBalance) => ({
    [CALL_API]: {
        types: [actionTypes.CREATE_ACCOUNT_REQUEST, actionTypes.CREATE_ACCOUNT_SUCCESS, actionTypes.CREATE_ACCOUNT_FAILED],
        endpoint: '/accounts',
        method: 'POST',
        data: { name, balance: openingBalance }
    }
})

export const createAccount = (name, openingBalance) => {
    return (dispatch, getState) => {
        const { accounts } = getState()

        let validationResult = validateCreateAccountRequest(name, openingBalance, accounts.items || [])

        if (!validationResult.isValid) {
            return Promise.resolve(dispatch(invalidCreateAccountRequest(validationResult)))
        }

        name = name.trim()

        if (typeof openingBalance === 'string') {
            openingBalance = parseFloat(openingBalance.trim())
        }

        dispatch(submitCreateAccountRequest(name, openingBalance))
    }
}

const postTransaction = (description, debit, credit, accountId) => ({
    [CALL_API]: {
        types: [actionTypes.CREATE_TRANSACTION_REQUEST, actionTypes.CREATE_TRANSACTION_SUCCESS, actionTypes.CREATE_TRANSACTION_FAILED],
        endpoint: '/transactions',
        method: 'POST',
        data: { date: new Date(), description, debit, credit, accountId }
    }
})

const updateAccountBalance = (accountId, newBalance) => ({
    [CALL_API]: {
        types: [actionTypes.UPDATE_ACCOUNT_BALANCE_REQUEST, actionTypes.UPDATE_ACCOUNT_BALANCE_SUCCESS, actionTypes.UPDATE_ACCOUNT_BALANCE_FAILED],
        endpoint: `/accounts/${accountId}`,
        method: 'PATCH',
        data: { balance: newBalance }
    }
})

const creditAccount = (account, amount) => {
    const newBalance = (account.balance + amount);
    return updateAccountBalance(account.id, newBalance);
}

const debitAccount = (account, amount) => {
    const newBalance = account.balance - amount;
    return updateAccountBalance(account.id, newBalance);
}

const validateTransferFundsRequest = (fromAccount, toAccount, transferAmount) => {
    let result = {
        isValid: true,
        fromAccountValidationMessage: null,
        toAccountValidationMessage: null,
        transferAmountValidationMessage: null
    }

    if (!fromAccount) {
        result.isValid = false;
        result.fromAccountValidationMessage = 'Le compte source est obligatoire.'
    }

    if (!toAccount) {
        result.isValid = false;
        result.toAccountValidationMessage = 'Le compte destination est obligatoire.'
    }

    if (typeof transferAmount === 'string' && transferAmount.trim().length === 0) {
        result.isValid = false;
        result.transferAmountValidationMessage = 'Le montant est obligatoire.'
    } else {
        transferAmount = parseFloat(transferAmount)
        if (Number.isNaN(transferAmount)) {
            result.isValid = false;
            result.transferAmountValidationMessage = 'Le montant doit être un nombre.'
        } else if (transferAmount < 0.01) {
            result.isValid = false;
            result.transferAmountValidationMessage = `Le montant ne peut pas être inférieur à ${formatMoney(0.01)}.`
        } else if (fromAccount && transferAmount > fromAccount.balance) {
            result.isValid = false;
            result.transferAmountValidationMessage = `Solde insuffisant dans le compte ${fromAccount.name}. Le montant maximum est ${formatMoney(fromAccount.balance)}.`
        }
    }

    if (result.isValid) {
        if (toAccount.id === fromAccount.id) {
            result.isValid = false
            result.toAccountValidationMessage = 'Vous ne pouvez pas faire un transfert vers le même compte.'
        }
    }

    return result
}

export const transferFunds = (fromAccount, toAccount, transferAmount) => {
    return dispatch => {
        let validationResult = validateTransferFundsRequest(fromAccount, toAccount, transferAmount)

        if (!validationResult.isValid) {
            return Promise.resolve(dispatch(invalidTransferFundsRequest(validationResult)))
        }
        transferAmount = parseFloat(transferAmount)

        dispatch(postTransaction(`Transfer to ${toAccount.name}`, transferAmount, null, fromAccount.id))

        dispatch(debitAccount(fromAccount, transferAmount))

        dispatch(postTransaction(`Transfer from ${fromAccount.name}`, null, transferAmount, toAccount.id))

        dispatch(creditAccount(toAccount, transferAmount))

        dispatch(hideTransferFunds())
    }
}