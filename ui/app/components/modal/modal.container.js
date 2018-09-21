import { connect } from 'react-redux'
import Modal from './modal.component'
import { hideModal } from '../../actions'

const mapDispatchToProps = dispatch => {
  return {
    hideModal: () => dispatch(hideModal())
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const {
    hideModal: dispatchHideModal,
    ...otherDispatchProps,
  } = dispatchProps
  const {
    onSubmit: ownOnSubmit,
    onCancel: ownOnCancel,
    ...otherOwnProps
  } = ownProps

  return {
    ...stateProps,
    ...otherDispatchProps,
    ...otherOwnProps,
    onSubmit: (...args) => {
      ownOnSubmit && ownOnSubmit(...args)
      dispatchHideModal()
    },
    onCancel: (...args) => {
      ownOnCancel && ownOnCancel(...args)
      dispatchHideModal()
    }
  }
}

export default connect(null, mapDispatchToProps, mergeProps)(Modal)
