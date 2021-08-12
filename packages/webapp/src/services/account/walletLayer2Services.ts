import { AccountStatus, } from '@loopring-web/common-resources';
import { Subject } from 'rxjs';
import { Commands } from './command';
import { LoopringAPI } from '../../stores/apis/api';
import { myLog } from '../../utils/log_tools';
import store from 'stores';
import { updateAccountStatus } from 'stores/account';
import * as sdk from 'loopring-sdk'
import { unlockAccount } from './unlockAccount';

const subject = new Subject<{ status: keyof typeof Commands, data: any, }>();

export const walletLayer2Services = {
    //INFO: for update Account and unlock account
    sendSign: async () => {
        // const account = store.getState().account;
        // const {exchangeInfo} = store.getState().system;
        subject.next({
            status: Commands.ProcessSign,
            data: undefined,
        })
        // if (exchangeInfo && LoopringAPI.userAPI && account.nonce !== undefined) {
        //     const eddsaKey = await generateKeyPair(
        //         connectProvides.usedWeb3,
        //         account.accAddress,
        //         exchangeInfo.exchangeAddress,
        //         account.nonce - 1,
        //         account.connectName as any,
        //     )
        //     const sk = toHex(toBig(eddsaKey.keyPair.secretKey))
        //     const {apiKey} = (await LoopringAPI.userAPI.getUserApiKey({
        //         accountId: account.accountId
        //     }, sk))
        //
        //     walletLayer2Services.sendAccountSigned(apiKey, eddsaKey)
        //
        // }
    },
    sendErrorUnlock: () => {
        subject.next({
            status: Commands.ErrorSign,
            data: undefined,
        })
    },

    sendUpdateAccStatusAndReset: (readyState: AccountStatus, accountId: number = -1) => {
        store.dispatch(updateAccountStatus({
            accountId,
            readyState,
            apiKey: '',
            eddsaKey: '',
            publicKey: '',
            nonce: undefined,
        }))

        if (readyState === AccountStatus.ERROR_NETWORK) {
            subject.next({
                status: Commands.ErrorNetwork,
                data: undefined,
            })
        } else {
            const { accAddress } = store.getState().account
            walletLayer2Services.sendCheckAccount(accAddress);
        }

    },

    //INFO: for lock account todo clear the private info, user click or provider on wrong network
    sendAccountLock: (accInfo?: sdk.AccountInfo) => {
        const updateInfo = accInfo ? {
            readyState: AccountStatus.LOCKED,
            accountId: accInfo.accountId,
            nonce: accInfo.nonce,
            level: accInfo.tags,
        } : {
            readyState: AccountStatus.LOCKED,
            apiKey: '',
            eddsaKey: '',
            publicKey: '',
            nonce: undefined,
        }
        store.dispatch(updateAccountStatus(updateInfo))
        subject.next({
            status: Commands.LockAccount,
            data: undefined,
        })
    },
    sendActiveAccountDeposit: () => {

    },
    sendAccountSigned: (apiKey?: any, eddsaKey?: any) => {
        const updateInfo = apiKey && eddsaKey ? {
            apiKey,
            eddsaKey,
            publicKey: {
                x: sdk.toHex(sdk.toBig(eddsaKey.keyPair.publicKeyX)),
                y: sdk.toHex(sdk.toBig(eddsaKey.keyPair.publicKeyY)),
            },
            readyState: AccountStatus.ACTIVATED
        } : { readyState: AccountStatus.ACTIVATED }
        store.dispatch(updateAccountStatus(updateInfo));
        subject.next({
            status: Commands.AccountUnlocked,
            data: undefined
        })
    },
    sendNoAccount: () => {
        store.dispatch(updateAccountStatus({ readyState: AccountStatus.NO_ACCOUNT, }))
        subject.next({
            status: Commands.NoAccount,
            data: undefined
        })
    },
    sendNeedUpdateAccount: async (accInfo: sdk.AccountInfo) => {
        myLog('sendNeedUpdateAccount accInfo:', accInfo)
        store.dispatch(updateAccountStatus({ readyState: AccountStatus.DEPOSITING, }))
        subject.next({
            status: Commands.SignAccount,
            data: accInfo
        })
    },

    sendCheckAcc: async () => {
        const self = this;
        if (store) {
            const account = store.getState().account
            if (LoopringAPI.exchangeAPI) {
                const { accInfo } = (await LoopringAPI.exchangeAPI.getAccount({
                    owner: account.accAddress
                }))

                if (accInfo === undefined) {
                    walletLayer2Services.sendNoAccount()
                } else {
                    if (account.accountId) {
                        if (!account.publicKey.x || !account.publicKey.y) {
                            myLog('-------need update account!')
                            walletLayer2Services.sendNeedUpdateAccount(accInfo)
                        } else {
                            myLog('-------need unlockAccount!')
                            unlockAccount()
                        }
                    } else {
                        myLog('unexpected accInfo:', accInfo)
                        throw Error('unexpected accinfo:' + accInfo)
                    }
                }
            }
        }


    },
    sendCheckAccount: async (ethAddress: string) => {
        const self = this;
        myLog('After connect >>,checkAccount: step3 processAccountCheck', ethAddress)
        store.dispatch(updateAccountStatus({ accAddress: ethAddress, readyState: AccountStatus.UN_CONNECT }))
        subject.next({
            status: Commands.ProcessAccountCheck,
            data: undefined
        })
        if (LoopringAPI.exchangeAPI) {
            const { accInfo } = (await LoopringAPI.exchangeAPI.getAccount({
                owner: ethAddress
            }))
            myLog('After connect >>,checkAccount: step3', accInfo)

            //TODO code is notaccount
            if (accInfo === undefined) {
                walletLayer2Services.sendNoAccount()
            } else {
                if (accInfo.accountId) {
                    if (!accInfo.publicKey.x || !accInfo.publicKey.y) {
                        myLog('-------need update account!')
                        walletLayer2Services.sendNeedUpdateAccount(accInfo)
                    } else {
                        walletLayer2Services.sendAccountLock(accInfo)
                    }
                } else {
                    myLog('unexpected accInfo:', accInfo)
                    throw Error('unexpected accinfo:' + accInfo)
                }
            }
        }

        // try {
        //
        //
        //     if (accInfo && accInfo.accountId) {
        //         await unlockAccount({accInfo, shouldShow: shouldShow ?? false})
        //     }
        //     statusAccountUnset();
        // } catch (reason) {
        //     dumpError400(reason)
        //     await activeAccount({reason, shouldShow: shouldShow ?? false});
        //     statusAccountUnset();
        // }


    },

    onSocket: () => subject.asObservable()
    // clearMessages: () => subject.next(),
    // onSocket: () => subject.asObservable()
};