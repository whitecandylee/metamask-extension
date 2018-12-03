import { connect } from 'react-redux'
import { pipe, partialRight } from 'ramda'
import GasModalPageContainer from './gas-modal-page-container.component'
import {
  hideModal,
  setGasLimit,
  setGasPrice,
} from '../../../actions'
import {
  setCustomGasPrice,
  setCustomGasLimit,
  resetCustomData,
} from '../../../ducks/gas.duck'
import {
  hideGasButtonGroup,
} from '../../../ducks/send.duck'
import {
  updateGasAndCalculate,
} from '../../../ducks/confirm-transaction.duck'
import {
  getCurrentCurrency,
  conversionRateSelector as getConversionRate,
  getSelectedToken,
} from '../../../selectors.js'
import {
  getCustomGasPrice,
  getCustomGasLimit,
  getRenderableBasicEstimateData,
  getBasicGasEstimateLoadingStatus,
  getAveragePriceEstimateInHexWEI,
  getDefaultActiveButtonIndex,
} from '../../../selectors/custom-gas'
import {
  formatCurrency,
} from '../../../helpers/confirm-transaction/util'
import {
  addHexWEIsToDec,
  decEthToConvertedCurrency as ethTotalToConvertedCurrency,
  decGWEIToHexWEI,
  hexWEIToDecGWEI,
} from '../../../helpers/conversions.util'
import {
  formatETHFee,
} from '../../../helpers/formatters'
import {
  calcGasTotal,
} from '../../send/send.utils'
import { addHexPrefix } from 'ethereumjs-util'

const mapStateToProps = state => {
  const buttonDataLoading = getBasicGasEstimateLoadingStatus(state)
  const { gasPrice: currentGasPrice, gas: currentGasLimit, value } = getTxParams(state)
  const gasTotal = calcGasTotal(currentGasLimit, currentGasPrice)

  const customModalGasPriceInHex = getCustomGasPrice(state) || currentGasPrice
  const customModalGasLimitInHex = getCustomGasLimit(state) || currentGasLimit
  const customGasTotal = calcGasTotal(customModalGasLimitInHex, customModalGasPriceInHex)

  const gasButtonInfo = getRenderableBasicEstimateData(state)

  const currentCurrency = getCurrentCurrency(state)
  const conversionRate = getConversionRate(state)

  const newTotalFiat = addHexWEIsToRenderableFiat(value, customGasTotal, currentCurrency, conversionRate)

  const hideBasic = state.appState.modal.modalState.props.hideBasic

  return {
    hideBasic,
    isConfirm: isConfirm(state),
    customModalGasPriceInHex,
    customModalGasLimitInHex,
    customGasPrice: calcCustomGasPrice(customModalGasPriceInHex),
    customGasLimit: calcCustomGasLimit(customModalGasLimitInHex),
    newTotalFiat,
    gasPriceButtonGroupProps: {
      buttonDataLoading,
      defaultActiveButtonIndex: getDefaultActiveButtonIndex(gasButtonInfo, customModalGasPriceInHex),
      gasButtonInfo,
    },
    infoRowProps: {
      originalTotalFiat: addHexWEIsToRenderableFiat(value, gasTotal, currentCurrency, conversionRate),
      originalTotalEth: addHexWEIsToRenderableEth(value, gasTotal),
      newTotalFiat,
      newTotalEth: addHexWEIsToRenderableEth(value, customGasTotal),
      transactionFee: addHexWEIsToRenderableEth('0x0', customGasTotal),
      sendAmount: addHexWEIsToRenderableEth(value, '0x0'),
    },
  }
}

const mapDispatchToProps = dispatch => {
  const updateCustomGasPrice = newPrice => dispatch(setCustomGasPrice(addHexPrefix(newPrice)))

  return {
    cancelAndClose: () => {
      dispatch(resetCustomData())
      dispatch(hideModal())
    },
    updateCustomGasPrice,
    convertThenUpdateCustomGasPrice: newPrice => updateCustomGasPrice(decGWEIToHexWEI(newPrice)),
    convertThenUpdateCustomGasLimit: newLimit => dispatch(setCustomGasLimit(addHexPrefix(newLimit.toString(16)))),
    setGasData: (newLimit, newPrice) => {
      dispatch(setGasLimit(newLimit))
      dispatch(setGasPrice(newPrice))
    },
    updateConfirmTxGasAndCalculate: (gasLimit, gasPrice) => {
      return dispatch(updateGasAndCalculate({ gasLimit, gasPrice }))
    },
    hideGasButtonGroup: () => dispatch(hideGasButtonGroup()),
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { gasPriceButtonGroupProps, isConfirm } = stateProps
  const {
    updateCustomGasPrice: dispatchUpdateCustomGasPrice,
    hideGasButtonGroup: dispatchHideGasButtonGroup,
    setGasData: dispatchSetGasData,
    updateConfirmTxGasAndCalculate: dispatchUpdateConfirmTxGasAndCalculate,
    ...otherDispatchProps
  } = dispatchProps

  return {
    ...stateProps,
    ...otherDispatchProps,
    ...ownProps,
    onSubmit: isConfirm
      ? dispatchUpdateConfirmTxGasAndCalculate
      : (newLimit, newPrice) => {
        dispatchSetGasData(newLimit, newPrice)
        dispatchHideGasButtonGroup()
      },
    gasPriceButtonGroupProps: {
      ...gasPriceButtonGroupProps,
      handleGasPriceSelection: dispatchUpdateCustomGasPrice,
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(GasModalPageContainer)

function isConfirm (state) {
  return Boolean(Object.keys(state.confirmTransaction.txData).length)
}

function calcCustomGasPrice (customGasPriceInHex) {
  return Number(hexWEIToDecGWEI(customGasPriceInHex))
}

function calcCustomGasLimit (customGasLimitInHex) {
  return parseInt(customGasLimitInHex, 16)
}

function getTxParams (state) {
  const { confirmTransaction: { txData }, metamask: { send } } = state
  console.log('txData', txData)
  return txData.txParams || {
    from: send.from,
    gas: send.gasLimit,
    gasPrice: send.gasPrice || getAveragePriceEstimateInHexWEI(state),
    to: send.to,
    value: getSelectedToken(state) ? '0x0' : send.amount,
  }
}

function addHexWEIsToRenderableEth (aHexWEI, bHexWEI) {
  return pipe(
    addHexWEIsToDec,
    formatETHFee
  )(aHexWEI, bHexWEI)
}

function addHexWEIsToRenderableFiat (aHexWEI, bHexWEI, convertedCurrency, conversionRate) {
  return pipe(
    addHexWEIsToDec,
    partialRight(ethTotalToConvertedCurrency, [convertedCurrency, conversionRate]),
    partialRight(formatCurrency, [convertedCurrency]),
  )(aHexWEI, bHexWEI)
}
