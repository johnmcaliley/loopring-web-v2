import { AccountBasePanel } from './AccountBase';
import { AccountBaseProps } from './Interface';
import { Box, Typography } from '@mui/material';
import { AnimationArrow, Button } from '../../../index';
import { WithTranslation, withTranslation } from 'react-i18next';
import { AccountHashInfo } from '@loopring-web/common-resources';
import { DepositRecorder } from './DepositRecorder';

export const NoAccount = withTranslation('common')(({
                                                      goDeposit,
                                                      t,
                                                      isSupport = true,
                                                      ...props
                                                    }: WithTranslation & AccountBaseProps & {
  goDeposit: () => void,
  chainInfos: AccountHashInfo,
  isSupport: boolean,
  clearDepositHash: () => void
}) => {

  return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}
              alignItems={'center'}>
    <Box display={'flex'} flex={1} marginBottom={5} justifyContent={'center'} alignItems={'center'}>

      <AccountBasePanel {...props} t={t}/>
    </Box>
    {isSupport ? <Box display={'flex'} marginTop={2} alignSelf={'stretch'} paddingX={5} flexDirection={'column'}
                      alignItems={'center'}>
      <Typography variant={'body2'}>
        {t('labelActivatedAccountDeposit')}
      </Typography>
      <AnimationArrow className={'arrowCta'}/>
      <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
        goDeposit()
      }}>{t('depositLabelBtn')} </Button>
    </Box> : <Box display={'flex'} marginTop={2} alignSelf={'stretch'} paddingX={5} flexDirection={'column'}
                  alignItems={'center'}>
      <Typography variant={'body2'}>
        {t('labelActivatedAccountNotSupport')}
      </Typography>
      <AnimationArrow className={'arrowCta'}/>
      <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
        if (props.onDisconnect) {
          props.onDisconnect()
        }
      }}>{t('labelDisconnect')} </Button>
    </Box>}
    <Box display={'flex'} marginX={0}  marginTop={3} marginBottom={-5} alignSelf={'stretch'} paddingX={5} padding={0} >
      <DepositRecorder  {...props} clear={props.clearDepositHash} t={t}/>
    </Box>
  </Box>

})

    