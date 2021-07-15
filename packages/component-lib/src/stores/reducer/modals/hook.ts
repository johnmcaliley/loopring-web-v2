import { useDispatch, useSelector } from 'react-redux'
import { ModalState, ModalStatePlayLoad } from './interface';
import {
    setShowAccountInfo,
    setShowAmm,
    setShowConnect,
    setShowDeposit,
    setShowResetAccount,
    setShowSwap,
    setShowTransfer,
    setShowWithdraw
} from './reducer';
import {
    AmmInfoProps,
    DepositInfoProps,
    ResetInfoProps,
    SwapInfoProps,
    TransferInfoProps,
    WithdrawInfoProps
} from '../../../index';
import { AmmData, IBData } from 'static-resource';
import React from 'react';

export const useOpenModals = <T extends IBData<any>, I, A = AmmData<IBData<string>>, C = unknown>() => {
    const dispatch = useDispatch();
    return {
        modals: useSelector((state: any) => state.modals) as ModalState<T, I>,
        setShowTransfer: React.useCallback((state: ModalStatePlayLoad & { props?: Partial<TransferInfoProps<T, I>> }) => dispatch(setShowTransfer(state)), [dispatch]),
        setShowDeposit: React.useCallback((state: ModalStatePlayLoad & { props?: Partial<DepositInfoProps<T, I>> }) => dispatch(setShowDeposit(state)), [dispatch]),
        setShowWithdraw: React.useCallback((state: ModalStatePlayLoad & { props?: Partial<WithdrawInfoProps<T, I>> }) => dispatch(setShowWithdraw(state)), [dispatch]),
        setShowResetAccount: React.useCallback((state: ModalStatePlayLoad & { props?: Partial<ResetInfoProps<T, I>> }) => dispatch(setShowResetAccount(state)), [dispatch]),
        setShowAmm: React.useCallback((state: ModalStatePlayLoad & { props?: AmmInfoProps<A, I, C> }) => dispatch(setShowAmm(state)), [dispatch]),
        setShowSwap: React.useCallback((state: ModalStatePlayLoad & { props?: SwapInfoProps<T, I, C> }) => dispatch(setShowSwap(state)), [dispatch]),
        setShowAccountInfo: React.useCallback((state: ModalStatePlayLoad) => dispatch(setShowAccountInfo(state)), [dispatch]),
        setShowConnect: React.useCallback((state: ModalStatePlayLoad) => dispatch(setShowConnect(state)), [dispatch]),
    }

}
